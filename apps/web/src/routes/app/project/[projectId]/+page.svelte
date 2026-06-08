<script lang="ts">
  import ProjectPage from '$lib/projects/ui/ProjectPage.svelte';

  let { data } = $props();
</script>

<ProjectPage projectId={data.projectId} />
