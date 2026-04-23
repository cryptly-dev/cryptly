import { SetUpPassphrasePage } from "@/components/app/passphrase/SetUpPassphrasePage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/app/set-passphrase")({
  component: SetPassphraseTanstackPage,
});

function SetPassphraseTanstackPage() {
  return <SetUpPassphrasePage />;
}
