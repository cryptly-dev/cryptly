import { publicEnv } from "$lib/shared/env/public-env";
import { SodiumCrypto } from "$lib/auth/sodium-crypto";
import {
  lineColToOffset,
  parseValueRangesFromString,
} from "$lib/secrets/monaco/parser";

const baseUrl = () => publicEnv.apiUrl.replace(/\/$/, "");

function authHeaders(jwt: string) {
  return {
    Authorization: `Bearer ${jwt}`,
    "Content-Type": "application/json",
  };
}

export class IntegrationsApi {
  static async bootstrapLocalGithubMock(
    jwtToken: string,
  ): Promise<{ githubInstallationId: number }> {
    const res = await fetch(
      `${baseUrl()}/users/me/external-connections/github/local-mock/bootstrap`,
      {
        headers: authHeaders(jwtToken),
      },
    );
    if (!res.ok) {
      throw new Error("Failed to bootstrap GitHub local mock");
    }
    return res.json() as Promise<{ githubInstallationId: number }>;
  }

  static async getInstallationAvailableForUser(
    jwtToken: string,
  ): Promise<Installation[]> {
    const res = await fetch(
      `${baseUrl()}/users/me/external-connections/github/installations`,
      {
        headers: authHeaders(jwtToken),
      },
    );
    if (!res.ok) {
      throw new Error("Failed to load GitHub installations");
    }
    return res.json() as Promise<Installation[]>;
  }

  static async getRepositories(
    jwtToken: string,
    installationEntityId: string,
  ): Promise<Repository[]> {
    const res = await fetch(
      `${baseUrl()}/external-connections/github/installations/${installationEntityId}/repositories`,
      { headers: authHeaders(jwtToken) },
    );
    if (!res.ok) {
      throw new Error("Failed to load GitHub repositories");
    }
    return res.json() as Promise<Repository[]>;
  }

  static async createIntegration(
    jwtToken: string,
    dto: {
      projectId: string;
      repositoryId: number;
      installationEntityId: string;
    },
  ): Promise<Integration> {
    const res = await fetch(
      `${baseUrl()}/external-connections/github/integrations`,
      {
        method: "POST",
        headers: authHeaders(jwtToken),
        body: JSON.stringify(dto),
      },
    );
    if (!res.ok) {
      throw new Error("Failed to create GitHub integration");
    }
    return res.json() as Promise<Integration>;
  }

  static async deleteIntegration(
    jwtToken: string,
    integrationId: string,
  ): Promise<void> {
    const res = await fetch(
      `${baseUrl()}/external-connections/github/integrations/${integrationId}`,
      {
        method: "DELETE",
        headers: authHeaders(jwtToken),
      },
    );
    if (!res.ok) {
      throw new Error("Failed to remove GitHub integration");
    }
  }

  static async getIntegrationsForProject(
    jwtToken: string,
    projectId: string,
  ): Promise<Integration[]> {
    const res = await fetch(
      `${baseUrl()}/projects/${projectId}/external-connections/github/integrations`,
      { headers: authHeaders(jwtToken) },
    );
    if (!res.ok) {
      throw new Error("Failed to load GitHub integrations");
    }
    return res.json() as Promise<Integration[]>;
  }

  static async createInstallation(
    jwtToken: string,
    dto: { githubInstallationId: number },
  ): Promise<void> {
    const res = await fetch(
      `${baseUrl()}/users/me/external-connections/github/installations`,
      {
        method: "POST",
        headers: authHeaders(jwtToken),
        body: JSON.stringify(dto),
      },
    );
    if (!res.ok) {
      throw new Error("Failed to create GitHub installation");
    }
  }

  static async getAccessToken(
    jwtToken: string,
    projectId: string,
    integrationId: string,
  ): Promise<string> {
    const res = await fetch(
      `${baseUrl()}/projects/${projectId}/external-connections/github/integrations/${integrationId}/access-token`,
      { headers: authHeaders(jwtToken) },
    );
    if (!res.ok) {
      throw new Error("Failed to get GitHub access token");
    }
    const body = (await res.json()) as { token: string };
    return body.token;
  }

  static async pushSecret(
    githubJwtToken: string,
    dto: PushSecretDto,
  ): Promise<void> {
    const res = await fetch(
      `https://api.github.com/repos/${dto.owner}/${dto.repo}/actions/secrets/${dto.secretName}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${githubJwtToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          encrypted_value: dto.encryptedValue,
          key_id: dto.keyId,
        }),
      },
    );
    if (!res.ok) {
      throw new Error("Failed to push GitHub secret");
    }
  }

  static async acknowledgeSecretsPushed(
    jwtToken: string,
    projectId: string,
  ): Promise<void> {
    const res = await fetch(
      `${baseUrl()}/projects/${projectId}/analytics/secrets-pushed`,
      {
        method: "POST",
        headers: authHeaders(jwtToken),
      },
    );
    if (!res.ok) {
      throw new Error("Failed to acknowledge secrets push");
    }
  }

  static async pushSecrets(
    jwtToken: string,
    integrations: Integration[],
    content: string,
  ): Promise<void> {
    if (publicEnv.githubLocalMock) return;

    const secrets = parseDotenv(content);
    await Promise.all(
      integrations.map(async (integration) => {
        const owner = integration.repositoryData?.owner;
        const repo = integration.repositoryData?.name;
        if (!owner || !repo) return;

        const githubToken = await this.getAccessToken(
          jwtToken,
          integration.projectId,
          integration.id,
        );
        await Promise.all(
          Object.entries(secrets).map(async ([key, value]) => {
            const encryptedValue = await SodiumCrypto.encrypt(
              value,
              integration.githubRepositoryPublicKey,
            );
            await this.pushSecret(githubToken, {
              owner,
              repo,
              secretName: key,
              encryptedValue,
              keyId: integration.githubRepositoryPublicKeyId,
            });
          }),
        );
      }),
    );
    const pid = integrations[0]?.projectId;
    if (pid) {
      try {
        await this.acknowledgeSecretsPushed(jwtToken, pid);
      } catch {
        // analytics must not fail the push flow
      }
    }
  }
}

export interface PushSecretDto {
  owner: string;
  repo: string;
  secretName: string;
  encryptedValue: string;
  keyId: string;
}

function parseDotenv(content: string): Record<string, string> {
  const values: Record<string, string> = {};
  const parsed = parseValueRangesFromString(content);
  const lines = content.split("\n");
  const lineLengths = lines.map((line) => line.length);

  for (const secret of parsed) {
    const start = lineColToOffset(
      lineLengths,
      secret.range.startLine,
      secret.range.startCol,
    );
    const end = lineColToOffset(
      lineLengths,
      secret.range.endLine,
      secret.range.endCol,
    );
    const rawValue = content.slice(start, end);
    values[secret.key] = parseSecretValue(rawValue);
  }

  return values;
}

function parseSecretValue(rawValue: string): string {
  if (rawValue.startsWith('"') && rawValue.endsWith('"')) {
    return rawValue
      .slice(1, -1)
      .replace(/\\n/g, "\n")
      .replace(/\\r/g, "\r")
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, "\\");
  }
  if (rawValue.startsWith("'") && rawValue.endsWith("'")) {
    return rawValue.slice(1, -1);
  }
  return rawValue.replace(/\s+#.*$/, "").trim();
}

export interface Repository {
  id: number;
  name: string;
  owner: string;
  url: string;
  isPrivate: boolean;
  avatarUrl: string;
}

export interface Integration {
  id: string;
  projectId: string;
  githubRepositoryId: number;
  githubRepositoryPublicKey: string;
  githubRepositoryPublicKeyId: string;
  installationEntityId: string;
  repositoryData?: Repository;
  createdAt: string;
  updatedAt: string;
}

export interface Installation {
  id: string;
  userId: string;
  githubInstallationId: number;
  liveData?: {
    owner: string;
    avatar: string;
  };
  createdAt: string;
  updatedAt: string;
}
