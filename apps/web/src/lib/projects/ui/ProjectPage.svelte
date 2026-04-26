<script lang="ts">
  import SecretsEditorPage from '$lib/secrets/ui/SecretsEditorPage.svelte';

  let { projectId }: { projectId: string } = $props();
</script>

<SecretsEditorPage {projectId} />
