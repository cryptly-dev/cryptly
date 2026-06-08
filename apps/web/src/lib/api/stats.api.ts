import { publicEnv } from "$lib/shared/env/public-env";

export interface Stats {
  users: number;
  projects: number;
  diffs: number;
  stars: number;
}

export class StatsApi {
  public static async get(): Promise<Stats> {
    const response = await fetch(
      `${publicEnv.apiUrl.replace(/\/$/, "")}/stats`,
    );
    if (!response.ok) {
      throw new Error(`stats ${response.status}`);
    }
    return response.json() as Promise<Stats>;
  }
}
