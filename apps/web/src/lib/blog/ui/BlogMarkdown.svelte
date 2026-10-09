<script lang="ts">
  import { renderBlogMarkdown } from "$lib/blog/blog-markdown";

  let { content, class: className = "" }: { content: string; class?: string } =
    $props();

  const html = $derived(renderBlogMarkdown(content));
</script>

<div class="blog-prose {className}">
  <!-- eslint-disable-next-line svelte/no-at-html-tags -- renderBlogMarkdown output is DOMPurify-sanitized (client-only) -->
  {@html html}
</div>
