<script lang="ts">
  import type { Snippet } from "svelte";
  import { resolve } from "$app/paths";
  import { projectPath } from "$lib/paths";
  import { PROJECT_TABS, type ProjectTab } from "$lib/projects/project-tab";
  import { cn } from "$lib/utils";

  /** One 48px bar per project page: breadcrumb, tab switch, then the page's own controls. */
  let {
    projectId,
    projectName,
    tab,
    children,
  }: {
    projectId: string;
    projectName: string;
    tab: ProjectTab;
    children?: Snippet;
  } = $props();
</script>

<div class="flex h-12 shrink-0 items-center gap-2 px-3">
  <div class="flex min-w-0 items-center gap-2 font-medium whitespace-nowrap">
    <span class="text-fg3 max-md:hidden">Projects</span>
    <span class="text-faint max-md:hidden">/</span>
    <span class="truncate">{projectName}</span>
  </div>
  <nav
    aria-label="Project"
    class="mx-1 inline-flex shrink-0 gap-0.5 rounded-[10px] bg-root p-0.5"
  >
    {#each PROJECT_TABS as item (item.id)}
      <a
        href={resolve(projectPath(projectId, item.id))}
        aria-current={item.id === tab ? "page" : undefined}
        data-sveltekit-noscroll
        class={cn(
          "flex h-[26px] items-center rounded-lg px-2.5 font-medium",
          item.id === tab
            ? "bg-s100 text-fg shadow-card"
            : "text-fg3 hover:text-fg",
        )}
      >
        {item.label}
      </a>
    {/each}
  </nav>
  {@render children?.()}
</div>
