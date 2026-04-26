<script lang="ts">
  import type { Action } from 'svelte/action';
  import { onMount } from 'svelte';
  import { animate } from 'motion';
  import { ArrowRight, Newspaper, Plus } from 'lucide-svelte';
  import { BlogApi, type BlogPost } from '$lib/api/blog.api';
  import SiteFooter from '$lib/shared/ui/SiteFooter.svelte';
  import { auth } from '$lib/stores/auth.svelte';

  let posts = $state<BlogPost[] | null>(null);
  let error = $state<string | null>(null);

  const isAdmin = $derived(Boolean(auth.userData?.isAdmin));

  function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  const animateIntro: Action<HTMLElement> = (node) => {
    void animate(node, { opacity: [0, 1], y: [20, 0] }, { duration: 0.6, ease: [0, 0.55, 0.45, 1] });
  };

  const staggerIn: Action<HTMLElement, number> = (node, i) => {
    void animate(node, { opacity: [0, 1], y: [12, 0] }, { duration: 0.5, ease: [0, 0.55, 0.45, 1], delay: 0.08 + i * 0.04 });
    return {
      update(next: number) {
        void animate(node, { opacity: [0, 1], y: [12, 0] }, { duration: 0.5, ease: [0, 0.55, 0.45, 1], delay: 0.08 + next * 0.04 });
      }
    };
  };

  onMount(() => {
    let cancelled = false;
    BlogApi.list()
      .then((data) => {
        if (!cancelled) posts = data;
      })
      .catch((err: Error) => {
        if (!cancelled) {
          error = err?.message || 'Failed to load posts';
        }
      });
    return () => {
      cancelled = true;
    };
  });
</script>

<div class="min-h-screen bg-black text-foreground">
  <main class="mx-auto max-w-5xl px-6 py-16 md:py-24">
    <div
      class="mb-16 flex items-end justify-between gap-6"
      style="opacity:0;transform:translateY(20px)"
      use:animateIntro
    >
      <div>
        <h1 class="text-5xl font-semibold tracking-tight md:text-6xl">
          Writing on secrets,
          <br />
          <span class="text-neutral-400">security, and shipping.</span>
        </h1>
        <p class="mt-6 max-w-2xl text-lg text-neutral-400">
          Notes from the Cryptly team. Engineering deep dives, product thinking, and UX insights.
        </p>
      </div>
      {#if isAdmin}
        <a
          href="/blog/new"
          class="hidden shrink-0 items-center gap-1.5 rounded-full border border-neutral-800 bg-neutral-950 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-neutral-700 hover:bg-neutral-900 md:inline-flex"
        >
          <Plus class="h-4 w-4" />
          New post
        </a>
      {/if}
    </div>

    {#if isAdmin}
      <a
        href="/blog/new"
        class="mb-8 inline-flex items-center gap-1.5 rounded-full border border-neutral-800 bg-neutral-950 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-neutral-700 hover:bg-neutral-900 md:hidden"
      >
        <Plus class="h-4 w-4" />
        New post
      </a>
    {/if}

    {#if error}
      <div class="rounded-lg border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-300">{error}</div>
    {/if}

    {#if !posts && !error}
      <div aria-hidden="true" class="h-[70vh]"></div>
    {/if}

    {#if posts && posts.length === 0}
      <div class="rounded-2xl border border-neutral-900 bg-neutral-950/50 p-16 text-center">
        <Newspaper class="mx-auto h-8 w-8 text-neutral-700" />
        <p class="mt-4 text-neutral-400">No posts yet. Check back soon.</p>
      </div>
    {/if}

    {#if posts && posts.length > 0}
      <div class="divide-y divide-neutral-900">
        {#each posts as post, i}
          <div style="opacity:0;transform:translateY(12px)" use:staggerIn={i}>
            <a href="/blog/{post.slug}" class="group block py-8">
              <div class="flex flex-col md:flex-row md:items-start md:gap-10">
                <div class="mb-3 flex-shrink-0 text-sm text-neutral-500 md:mb-0 md:w-40 md:pt-1">
                  {formatDate(post.createdAt)}
                </div>
                <div class="min-w-0 flex-1">
                  <h2
                    class="text-2xl font-semibold tracking-tight text-foreground transition-colors group-hover:text-neutral-300 md:text-3xl"
                  >
                    {post.title}
                  </h2>
                  {#if post.excerpt}
                    <p class="mt-3 line-clamp-2 leading-relaxed text-neutral-400">{post.excerpt}</p>
                  {/if}
                  <div class="mt-5 flex items-center gap-3 text-sm text-neutral-500">
                    <div class="flex items-center gap-2">
                      {#if post.author.avatarUrl}
                        <img src={post.author.avatarUrl} alt={post.author.displayName} class="h-5 w-5 rounded-full" />
                      {:else}
                        <div class="h-5 w-5 rounded-full bg-neutral-800"></div>
                      {/if}
                      <span>{post.author.displayName}</span>
                    </div>
                    <span
                      class="inline-flex items-center gap-1.5 text-neutral-600 transition-colors group-hover:text-neutral-400"
                    >
                      Read
                      <ArrowRight class="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </div>
              </div>
            </a>
          </div>
        {/each}
      </div>
    {/if}
  </main>
  <SiteFooter />
</div>
