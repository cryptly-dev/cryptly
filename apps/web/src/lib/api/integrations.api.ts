import { backend, bearer, unwrap, type Schemas } from "$lib/api/backend";
import { publicEnv } from "$lib/shared/env/public-env";
import { SodiumCrypto } from "$lib/auth/sodium-crypto";
import {
  lineColToOffset,
  parseValueRangesFromString,
} from "$lib/secrets/monaco/parser";

export type Repository = Schemas["GithubRepositorySerialized"];
export type Integration = Schemas["GithubIntegrationSerialized"];
export type Installation = Schemas["GithubInstallationSerialized"];
export type CreateIntegrationDto = Schemas["CreateGithubIntegrationBody"];
export type CreateInstallationDto = Schemas["CreateGithubInstallationBody"];

export class IntegrationsApi {
  static bootstrapLocalGithubMock(jwtToken: string) {
    return unwrap(
      backend.GET(
        "/users/me/external-connections/github/local-mock/bootstrap",
        { headers: bearer(jwtToken) },
      ),
      "Failed to bootstrap GitHub local mock",
    );
  }

  static getInstallationAvailableForUser(jwtToken: string) {
    return unwrap(
      backend.GET("/users/me/external-connections/github/installations", {
        headers: bearer(jwtToken),
      }),
      "Failed to load GitHub installations",
    );
  }

  static getRepositories(jwtToken: string, installationEntityId: string) {
    return unwrap(
      backend.GET(
        "/external-connections/github/installations/{installationEntityId}/repositories",
        {
          params: { path: { installationEntityId } },
          headers: bearer(jwtToken),
        },
      ),
      "Failed to load GitHub repositories",
    );
  }

  static createIntegration(jwtToken: string, dto: CreateIntegrationDto) {
    return unwrap(
      backend.POST("/external-connections/github/integrations", {
        headers: bearer(jwtToken),
        body: dto,
      }),
      "Failed to create GitHub integration",
    );
  }

  static deleteIntegration(jwtToken: string, integrationId: string) {
    return unwrap(
      backend.DELETE(
        "/external-connections/github/integrations/{integrationId}",
        {
          params: { path: { integrationId } },
          headers: bearer(jwtToken),
        },
      ),
      "Failed to remove GitHub integration",
    );
  }

  static getIntegrationsForProject(jwtToken: string, projectId: string) {
    return unwrap(
      backend.GET(
        "/projects/{projectId}/external-connections/github/integrations",
        { params: { path: { projectId } }, headers: bearer(jwtToken) },
      ),
      "Failed to load GitHub integrations",
    );
  }

  static createInstallation(jwtToken: string, dto: CreateInstallationDto) {
    return unwrap(
      backend.POST("/users/me/external-connections/github/installations", {
        headers: bearer(jwtToken),
        body: dto,
      }),
      "Failed to create GitHub installation",
    );
  }

  static async getAccessToken(
    jwtToken: string,
    projectId: string,
    integrationId: string,
  ): Promise<string> {
    const { token } = await unwrap(
      backend.GET(
        "/projects/{projectId}/external-connections/github/integrations/{integrationId}/access-token",
        {
          params: { path: { projectId, integrationId } },
          headers: bearer(jwtToken),
        },
      ),
      "Failed to get GitHub access token",
    );
    return token;
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

  static acknowledgeSecretsPushed(jwtToken: string, projectId: string) {
    return unwrap(
      backend.POST("/projects/{projectId}/analytics/secrets-pushed", {
        params: { path: { projectId } },
        headers: bearer(jwtToken),
      }),
      "Failed to acknowledge secrets push",
    );
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
