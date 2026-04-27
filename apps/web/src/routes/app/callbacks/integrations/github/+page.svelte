<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { IntegrationsApi } from '$lib/api/integrations.api';
  import { publicEnv } from '$lib/shared/env/public-env';
  import { auth } from '$lib/stores/auth.svelte';

  onMount(() => {
    void (async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const installationId = urlParams.get('installation_id');
      const state = urlParams.get('state');

      if (!installationId || !state || !auth.jwtToken) {
        await goto('/app/project');
        return;
      }

      const decodedState = decodeURIComponent(state);
      const cleanState = decodedState.replace(/^"/, '').replace(/"$/, '');
      const projectIdMatch = cleanState.match(/projectId=(.+)/);

      if (!projectIdMatch) {
        await goto('/app/project');
        return;
      }

      const projectId = projectIdMatch[1];

      try {
        if (!publicEnv.githubLocalMock) {
          await IntegrationsApi.createInstallation(auth.jwtToken, {
            githubInstallationId: parseInt(installationId, 10)
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
