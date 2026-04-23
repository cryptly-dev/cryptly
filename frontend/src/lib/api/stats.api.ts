import axios from "axios";

export interface Stats {
  users: number;
  projects: number;
  diffs: number;
  stars: number;
}

export class StatsApi {
  public static async get(): Promise<Stats> {
    const response = await axios.get<Stats>("/stats");
    return response.data;
  }
}
