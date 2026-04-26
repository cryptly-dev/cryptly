<script lang="ts">
  import BlogPostPage from '$lib/blog/ui/BlogPostPage.svelte';

  let { data } = $props();
</script>

<BlogPostPage slug={data.slug} />
