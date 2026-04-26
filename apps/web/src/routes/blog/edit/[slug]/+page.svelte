<script lang="ts">
  import BlogEditorPage from '$lib/blog/ui/BlogEditorPage.svelte';

  let { data } = $props();
</script>

<BlogEditorPage mode="edit" slug={data.slug} />
