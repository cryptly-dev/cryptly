import { CliAuthorizePage } from "@/components/app/cli-authorize/CliAuthorizePage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/app/cli-authorize")({
  component: CliAuthorizeTanstackPage,
  validateSearch: (search): { session?: string } => ({
    session: typeof search.session === "string" ? search.session : undefined,
  }),
});

function CliAuthorizeTanstackPage() {
  return <CliAuthorizePage />;
}
