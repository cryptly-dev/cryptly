<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { toast } from "svelte-sonner";
  import { consumeGitHubAppInstallState } from "$lib/auth/browser-state";
  import { ApiResponseError } from "$lib/api/backend";
  import { IntegrationsApi } from "$lib/api/integrations.api";
  import { projectPath } from "$lib/paths";
  import { CONNECT_AFTER_INSTALL_KEY } from "$lib/projects/ui/settings/GithubSection.svelte";
  import { publicEnv } from "$lib/shared/env/public-env";
  import { auth } from "$lib/stores/auth.svelte";

  function parseInstallationId(value: string | null): number | null {
    if (!value || !/^[1-9]\d*$/.test(value)) return null;
    const id = Number(value);
    if (!Number.isSafeInteger(id)) return null;
    return id;
  }

  onMount(() => {
    void (async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const installationId = parseInstallationId(
        urlParams.get("installation_id"),
      );
      const state = urlParams.get("state");
      const projectId = consumeGitHubAppInstallState(state);

      if (!installationId || !projectId || !auth.jwtToken) {
        await goto(resolve("/app/project"));
        if (installationId) {
          // The one-time state only lives in the tab that started the install (CSRF guard).
          toast.error(
            "Could not finish connecting GitHub. Start the installation again from your project.",
          );
        }
        return;
      }

      try {
        if (!publicEnv.githubLocalMock) {
          // 409: already registered (the app was re-configured to share more repositories).
          await IntegrationsApi.createInstallation(auth.jwtToken, {
            githubInstallationId: installationId,
          }).catch((error: unknown) => {
            if (!(error instanceof ApiResponseError && error.status === 409))
              throw error;
          });
        }
        // Back to GitHub sync with the connect dialog open, to pick the repository.
        sessionStorage.setItem(CONNECT_AFTER_INSTALL_KEY, projectId);
        await goto(resolve(projectPath(projectId, "settings", "github")), {
          replaceState: true,
        });
      } catch {
        await goto(resolve("/app/project"));
        toast.error("Failed to connect GitHub");
      }
    })();
  });
</script>

<div class="flex h-screen w-screen items-center justify-center">
  <span class="text-center text-xl font-semibold"
    >Processing GitHub integration…</span
  >
</div>
