import { SavePushLabPage } from "@/components/app/save-push-lab/SavePushLabPage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/app/save-push-lab")({
  component: SavePushLabRoute,
});

function SavePushLabRoute() {
  return <SavePushLabPage />;
}
