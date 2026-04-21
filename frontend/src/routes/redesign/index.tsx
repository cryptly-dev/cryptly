import { createFileRoute } from "@tanstack/react-router";
import { RedesignPage } from "@/components/redesign/RedesignPage";

export const Route = createFileRoute("/redesign/")({
  component: RedesignTanstackPage,
});

function RedesignTanstackPage() {
  return <RedesignPage />;
}
