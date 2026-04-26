import { publicEnv } from "$lib/shared/env/public-env";

import type { ProjectSettings } from "./domain/project-settings";
import { normalizeProjectSettings } from "./domain/project-settings";

const baseUrl = () => publicEnv.apiUrl.replace(/\/$/, "");

function authHeaders(jwt: string) {
  return { Authorization: `Bearer ${jwt}` };
}

export interface User {
  id: string;
  email?: string;
  authMethod: string;
  avatarUrl: string;
  displayName: string;
  publicKey?: string;
  privateKeyEncrypted?: string;
  projectCreationDefaults: ProjectSettings;
  isAdmin: boolean;
}

export interface UpdateUserDto {
  displayName?: string;
  publicKey?: string;
  privateKeyEncrypted?: string;
  projectsOrder?: string[];
  projectCreationDefaults?: ProjectSettings;
}

function parseUser(raw: User): User {
  return {
    ...raw,
    projectCreationDefaults: normalizeProjectSettings(
      raw.projectCreationDefaults,
    ),
  };
}

export class UserApi {
  static async getMe(jwtToken: string): Promise<User> {
    const res = await fetch(`${baseUrl()}/users/me`, {
      headers: {
        ...authHeaders(jwtToken),
      },
    });
    if (!res.ok) {
      throw new Error("Failed to load user");
    }
    const data = (await res.json()) as User;
    return parseUser(data);
  }

  static async deleteKeys(jwtToken: string): Promise<void> {
    const res = await fetch(`${baseUrl()}/users/keys`, {
      method: "DELETE",
      headers: {
        ...authHeaders(jwtToken),
      },
    });
    if (!res.ok) {
      throw new Error("Failed to delete keys");
    }
  }

  static async updateMe(
    jwtToken: string,
    updateUserDto: UpdateUserDto,
  ): Promise<User> {
    const res = await fetch(`${baseUrl()}/users/me`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(jwtToken),
      },
      body: JSON.stringify(updateUserDto),
    });
    if (!res.ok) {
      throw new Error("Failed to update user");
    }
    const data = (await res.json()) as User;
    return parseUser(data);
  }
}
