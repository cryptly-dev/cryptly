import { publicEnv } from "$lib/shared/env/public-env";

const baseUrl = () => publicEnv.apiUrl.replace(/\/$/, "");

function authHeaders(jwt: string) {
  return {
    Authorization: `Bearer ${jwt}`,
    "Content-Type": "application/json",
  };
}

export class IntegrationsApi {
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
}
