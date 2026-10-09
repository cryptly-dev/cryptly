import { backend, unwrap, type Schemas } from "$lib/api/backend";

export type Stats = Schemas["StatsResponse"];

export class StatsApi {
  public static get() {
    return unwrap(backend.GET("/stats"), "Failed to load stats");
  }
}
