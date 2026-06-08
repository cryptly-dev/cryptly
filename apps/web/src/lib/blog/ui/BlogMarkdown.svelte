<script lang="ts">
  import { renderBlogMarkdown } from '$lib/blog/blog-markdown';

  let { content, class: className = '' }: { content: string; class?: string } = $props();

  const html = $derived(renderBlogMarkdown(content));
</script>

<div class="blog-prose {className}">
  {@html html}
</div>
