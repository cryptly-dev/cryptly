<script lang="ts">
  import type {
    Component,
    ComponentType,
    Snippet,
    SvelteComponent,
  } from "svelte";
  import { replaceState } from "$app/navigation";
  import { page } from "$app/state";
  import { cn } from "$lib/utils";

  /**
   * Logdash settings layout: a 672px column with a sticky section menu 48px to its left.
   * Sections are elements with ids inside `children` (usually <Well id=…>). The URL hash
   * follows the section in view, so a reload returns to the same section.
   */
  let {
    sections,
    children,
  }: {
    sections: readonly {
      id: string;
      title: string;
      /** Svelte 5 component, or a lucide-svelte icon (typed as a legacy class component). */
      icon:
        | Component<{ class?: string }>
        | ComponentType<SvelteComponent<{ class?: string }>>;
    }[];
    children: Snippet;
  } = $props();

  let scroller: HTMLDivElement | undefined = $state();
  let active = $state("");
  /** Section picked from the menu or the URL; stays active at the end of the page. */
  let picked: string | null = null;

  function sectionEl(id: string) {
    return scroller?.querySelector<HTMLElement>(`#${CSS.escape(id)}`) ?? null;
  }

  function syncHash(id: string) {
    const hash = id === sections[0]?.id ? "" : `#${id}`;
    // location, not page.url: shallow replaceState does not update page.url.
    if (location.hash === hash) return;
    // The current page's own URL with a new hash; page.url.pathname already carries the base.
    // eslint-disable-next-line svelte/no-navigation-without-resolve
    replaceState(`${page.url.pathname}${page.url.search}${hash}`, page.state);
  }

  function onScroll() {
    if (!scroller) return;
    const top = scroller.getBoundingClientRect().top + 48;
    let current = sections[0]?.id ?? "";
    for (const section of sections) {
      const el = sectionEl(section.id);
      if (el && el.getBoundingClientRect().top <= top) current = section.id;
    }
    // Scrolled to the end: the last short sections can never reach the top, so the last one
    // wins, unless a section was just picked from the menu or the URL.
    if (
      scroller.scrollTop + scroller.clientHeight >=
      scroller.scrollHeight - 2
    ) {
      current = picked ?? sections.at(-1)?.id ?? current;
    } else {
      picked = null;
    }
    if (current !== active) {
      active = current;
      syncHash(current);
    }
  }

  function go(event: MouseEvent, id: string) {
    event.preventDefault();
    picked = id;
    sectionEl(id)?.scrollIntoView({ block: "start" });
    active = id;
    syncHash(id);
  }

  $effect(() => {
    if (!scroller) return;
    const id = page.url.hash.slice(1);
    const target = id ? sectionEl(id) : null;
    if (target) {
      picked = id;
      target.scrollIntoView({ block: "start" });
      active = id;
    } else {
      active = sections[0]?.id ?? "";
    }
  });
</script>

<div
  bind:this={scroller}
  class="@container min-h-0 flex-1 overflow-y-auto"
  onscroll={onScroll}
>
  <div
    class="relative mx-auto flex max-w-[672px] flex-col gap-1.5 px-1.5 pt-1.5 pb-12 [&>section]:scroll-mt-1.5"
  >
    <nav
      aria-label="Sections"
      class="sticky top-1.5 z-[1] -mb-1.5 hidden h-0 @[1124px]:block"
    >
      <ul class="absolute right-full mr-12 flex w-44 flex-col gap-px">
        {#each sections as section (section.id)}
          {@const Icon = section.icon}
          <li>
            <a
              href={`#${section.id}`}
              aria-current={active === section.id ? "location" : undefined}
              class={cn(
                "flex h-[30px] items-center gap-2 rounded-lg px-2 font-medium",
                active === section.id
                  ? "bg-s50-sel text-fg"
                  : "text-fg3 hover:bg-s50-hover hover:text-fg",
              )}
              onclick={(event) => go(event, section.id)}
            >
              <Icon class="size-3.5 shrink-0" />
              {section.title}
            </a>
          </li>
        {/each}
      </ul>
    </nav>
    {@render children()}
  </div>
</div>
