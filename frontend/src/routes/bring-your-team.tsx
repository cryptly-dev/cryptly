import { BringYourTeamPlayground } from "@/components/redesign/BringYourTeamPlayground";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/bring-your-team")({
  component: BringYourTeamPlayground,
});
