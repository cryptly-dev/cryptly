import { unwrap, type Schemas } from "@packages/backend-sdk";
import { createPublicClient } from "./client.js";

export type CliSessionStatus = PollResult["status"];
export type StartSessionResult = Schemas["StartCliSessionResponse"];
export type PollResult = Schemas["PollCliSessionResponse"];

export class CliFlowApi {
  public static startSession(
    body: Schemas["StartCliSessionBody"],
  ): Promise<StartSessionResult> {
    return unwrap(
      createPublicClient().POST("/auth/cli-flow/sessions", { body }),
      "Failed to start a login session",
    );
  }

  public static poll(sessionId: string): Promise<PollResult> {
    return unwrap(
      createPublicClient().GET("/auth/cli-flow/sessions/{sessionId}/poll", {
        params: { path: { sessionId } },
      }),
      "Failed to check the login session",
    );
  }
}
