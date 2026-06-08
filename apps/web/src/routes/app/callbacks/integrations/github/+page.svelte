<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { consumeGitHubAppInstallState } from '$lib/auth/browser-state';
  import { IntegrationsApi } from '$lib/api/integrations.api';
  import { publicEnv } from '$lib/shared/env/public-env';
  import { auth } from '$lib/stores/auth.svelte';

  function parseInstallationId(value: string | null): number | null {
    if (!value || !/^[1-9]\d*$/.test(value)) return null;
    const id = Number(value);
    if (!Number.isSafeInteger(id)) return null;
    return id;
  }

  onMount(() => {
    void (async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const installationId = parseInstallationId(urlParams.get('installation_id'));
      const state = urlParams.get('state');
      const projectId = consumeGitHubAppInstallState(state);

      if (!installationId || !projectId || !auth.jwtToken) {
        await goto('/app/project');
        return;
      }

      try {
        if (!publicEnv.githubLocalMock) {
          await IntegrationsApi.createInstallation(auth.jwtToken, {
            githubInstallationId: installationId
          });
        }
        await goto(`/app/project/${projectId}`);
      } catch {
        await goto('/app/project');
      }
    })();
  });
</script>

<div class="flex h-screen w-screen items-center justify-center">
  <span class="text-center text-xl font-semibold">Processing GitHub integration…</span>
</div>
