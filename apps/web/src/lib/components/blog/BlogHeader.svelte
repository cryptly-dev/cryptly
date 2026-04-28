<script lang="ts">
  import { page } from '$app/state';
  import { ArrowRight } from 'lucide-svelte';
  import { tick } from 'svelte';
  import GitHubIcon from '$lib/shared/ui/GitHubIcon.svelte';
  import { cn } from '$lib/utils';

  const ACCENT = '#DDA15E';

  let navHome = $state<HTMLAnchorElement | null>(null);
  let navBlog = $state<HTMLAnchorElement | null>(null);
  let navRow = $state<HTMLDivElement | null>(null);
  let underline = $state({ left: 0, width: 0, visible: false });

  const pathname = $derived(page.url.pathname);

  const isAppShell = $derived(pathname.startsWith('/app') || pathname.startsWith('/invite/'));

  const isBlog = $derived(pathname === '/blog' || pathname.startsWith('/blog/'));
  const isHome = $derived(!isBlog);

  $effect(() => {
    if (isAppShell) return;
    const path = pathname;
    const el = path.startsWith('/blog') ? navBlog : navHome;
    void tick().then(() => {
      if (!el || !navRow) {
        underline = { ...underline, visible: false };
        return;
      }
      const r = el.getBoundingClientRect();
      const nr = navRow.getBoundingClientRect();
      const pad = 12;
      underline = { left: r.left - nr.left + pad, width: r.width - pad * 2, visible: true };
    });
  });
</script>

{#if !isAppShell}
  <header class="fixed left-0 right-0 top-4 z-30 px-4">
    <div class="mx-auto max-w-6xl">
      <div
        class="flex h-14 items-center justify-between rounded-full border border-border/50 bg-card/60 px-5 shadow-xl shadow-black/30 backdrop-blur-md"
      >
        <a href="/" class="inline-flex items-center text-foreground transition-opacity hover:opacity-80">
          <span class="font-semibold tracking-tight">Cryptly</span>
        </a>

        <nav class="hidden items-center gap-1 text-sm md:flex">
          <div class="relative flex items-center gap-1" bind:this={navRow}>
            <a
              bind:this={navHome}
              href="/"
              class={cn(
                'relative rounded-md px-3 py-1.5 transition-colors',
                isHome ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Home
            </a>
            <a
              bind:this={navBlog}
              href="/blog"
              class={cn(
                'relative rounded-md px-3 py-1.5 transition-colors',
                isBlog ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Blog
            </a>
            {#if underline.visible}
              <span
                aria-hidden="true"
                class="pointer-events-none absolute -bottom-0.5 left-0 h-[2px] rounded-full transition-[left,width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
                style:left="{underline.left}px"
                style:width="{underline.width}px"
                style:background-color={ACCENT}
              ></span>
            {/if}
          </div>
          <a
            href="https://github.com/cryptly-dev/cryptly"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-muted-foreground transition-colors hover:text-foreground"
          >
            <GitHubIcon class="h-3.5 w-3.5" />
            Source
          </a>
        </nav>

        <a
          href="/app/project"
          class="group relative inline-flex items-center gap-1.5 overflow-hidden rounded-full bg-white px-3.5 py-1.5 text-sm font-medium text-black shadow-md shadow-black/30 transition-all duration-300 hover:bg-neutral-100 hover:shadow-lg [&_svg]:transition-transform [&_svg]:duration-300 hover:[&_svg]:translate-x-0.5"
        >
          <span
            aria-hidden="true"
            class="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-black/10 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full"
          ></span>
          <span class="relative z-10 inline-flex items-center gap-1.5">
            Open app
            <ArrowRight class="h-3.5 w-3.5" />
          </span>
        </a>
      </div>
    </div>
  </header>
{/if}
