<script lang="ts">
  import { page } from '$app/state';
  import { ArrowLeft, Pencil } from 'lucide-svelte';
  import { BlogApi, type BlogPost } from '$lib/api/blog.api';
  import SiteFooter from '$lib/shared/ui/SiteFooter.svelte';
  import { auth } from '$lib/stores/auth.svelte';
  import BlogMarkdown from './BlogMarkdown.svelte';

  const slug = $derived(page.params.slug as string);

  let post = $state<BlogPost | null>(null);
  let error = $state<string | null>(null);

  const isAdmin = $derived(Boolean(auth.userData?.isAdmin));

  function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  $effect(() => {
    const s = slug;
    post = null;
    error = null;
    let cancelled = false;
    BlogApi.getBySlug(s)
      .then((data) => {
        if (!cancelled) post = data;
      })
      .catch((err: Error) => {
        if (!cancelled) {
          error = err?.message || 'Failed to load post';
        }
      });
    return () => {
      cancelled = true;
    };
  });
</script>

<div class="min-h-screen bg-black text-foreground">
  <main class="mx-auto max-w-3xl px-6 pb-12 pt-28 md:pb-16 md:pt-32">
    <a href="/blog" class="mb-10 inline-flex items-center gap-2 text-sm text-neutral-500 transition-colors hover:text-neutral-300">
      <ArrowLeft class="h-4 w-4" />
      Back to blog
    </a>

    {#if error}
      <div class="rounded-lg border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-300">{error}</div>
    {/if}

    {#if post}
      <article>
        <header class="mb-10">
          <div class="mb-4 text-sm text-neutral-500">{formatDate(post.createdAt)}</div>
          <h1 class="text-4xl font-semibold tracking-tight text-foreground md:text-5xl">{post.title}</h1>
          {#if post.excerpt}
            <p class="mt-5 text-lg leading-relaxed text-neutral-400">{post.excerpt}</p>
          {/if}
          <div class="mt-7 flex items-center justify-between">
            <div class="flex items-center gap-3">
              {#if post.author.avatarUrl}
                <img src={post.author.avatarUrl} alt={post.author.displayName} class="h-8 w-8 rounded-full" />
              {:else}
                <div class="h-8 w-8 rounded-full bg-neutral-800"></div>
              {/if}
              <div class="text-sm">
                <div class="font-medium text-foreground">{post.author.displayName}</div>
                <div class="text-neutral-500">Author</div>
              </div>
            </div>

            {#if isAdmin}
              <a
                href="/blog/edit/{post.slug}"
                class="inline-flex items-center gap-1.5 rounded-full border border-neutral-800 bg-neutral-900/60 px-3 py-1.5 text-xs text-neutral-300 transition-colors hover:border-neutral-700 hover:bg-neutral-900"
              >
                <Pencil class="h-3 w-3" />
                Edit
              </a>
            {/if}
          </div>
        </header>

        {#if post.coverImageUrl}
          <img src={post.coverImageUrl} alt={post.title} class="mb-10 w-full rounded-xl border border-neutral-900" />
        {/if}

        <BlogMarkdown content={post.content} />
      </article>
    {/if}
  </main>

  <div class="mt-20">
    <SiteFooter />
  </div>
</div>
