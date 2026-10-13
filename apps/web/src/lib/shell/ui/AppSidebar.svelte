<script lang="ts">
  import { browser } from "$app/environment";
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { page } from "$app/state";
  import {
    Github,
    Inbox,
    Plus,
    Search,
    SlidersHorizontal,
    Terminal,
    X,
  } from "lucide-svelte";
  import { toast } from "svelte-sonner";
  import { dndzone, type DndEvent } from "svelte-dnd-action";
  import { IntegrationsApi, type Repository } from "$lib/api/integrations.api";
  import { normalizeProjectSettings } from "$lib/auth/domain/project-settings";
  import { UserApi } from "$lib/auth/user.api";
  import { projectPath, settingsPath } from "$lib/paths";
  import { createEncryptedProject } from "$lib/projects/create-project";
  import type { ProjectTab } from "$lib/projects/project-tab";
  import type { Project } from "$lib/projects/projects.api";
  import { loadInvitations, loadShell, shell } from "$lib/shell/shell.svelte";
  import { auth } from "$lib/stores/auth.svelte";
  import Avatar from "$lib/ui/Avatar.svelte";
  import Button from "$lib/ui/Button.svelte";
  import Kbd from "$lib/ui/Kbd.svelte";
  import { cn, getCompactRelativeTime } from "$lib/utils";
  import AccountMenu from "./AccountMenu.svelte";
  import CreateProjectDialog from "./CreateProjectDialog.svelte";
  import InvitationsDialog from "./InvitationsDialog.svelte";
  import SearchPalette from "./SearchPalette.svelte";

  /** Sidebar (mockup v4): account, search, invitations, projects, GitHub suggestions, settings. */
  let {
    drawerOpen = $bindable(false),
    searchOpen = $bindable(false),
  }: {
    /** Below 768px the sidebar is a drawer over the panel. */
    drawerOpen?: boolean;
    /** The ⌘K palette. */
    searchOpen?: boolean;
  } = $props();

  type Suggestion = Repository & { installationEntityId: string };

  const DISMISSED_KEY = "cryptly.github.dismissed";
  const row =
    "flex h-[30px] shrink-0 items-center gap-2 rounded-lg px-2 text-[13.5px] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-fg3 [&>svg]:size-[15px] [&>svg]:shrink-0";
  const idle = "text-fg2 hover:bg-root-hover hover:text-fg";
  const on = "bg-root-sel text-fg";
  const header =
    "mt-3 flex h-7 shrink-0 items-center justify-between pr-1 pl-2 text-[12px] font-medium text-fg3";

  let invitationsOpen = $state(false);
  let createOpen = $state(false);
  /** The list while a drag is in progress, so the shared store never sees the drag placeholder. */
  let dragItems = $state<Project[] | null>(null);
  let repos = $state<Suggestion[]>([]);
  let dismissed = $state<number[]>(readDismissed());
  let acceptingRepoId = $state<number | null>(null);
  let minute = $state(0);

  const tab = $derived(
    (page.params.tab as ProjectTab | undefined) ?? "secrets",
  );
  const onSettings = $derived(page.url.pathname.startsWith("/app/settings"));
  const projects = $derived(dragItems ?? shell.projects ?? []);

  const suggestions = $derived.by(() => {
    const names = new Set((shell.projects ?? []).map((p) => normalize(p.name)));
    return repos
      .filter((r) => !dismissed.includes(r.id) && !names.has(normalize(r.name)))
      .sort((a, b) => b.id - a.id)
      .slice(0, 2);
  });

  // Relative times ("now", "2m") stay current.
  $effect(() => {
    const timer = setInterval(() => minute++, 60_000);
    return () => clearInterval(timer);
  });

  $effect(() => {
    const jwt = auth.jwtToken;
    if (jwt) void loadSuggestions(jwt);
  });

  function ago(iso: string) {
    void minute;
    return getCompactRelativeTime(iso);
  }

  function normalize(name: string) {
    return name
      .toLowerCase()
      .split(/[.\-_\s]+/)
      .filter(Boolean)
      .join(" ");
  }

  function readDismissed(): number[] {
    if (!browser) return [];
    try {
      const value: unknown = JSON.parse(
        localStorage.getItem(DISMISSED_KEY) ?? "[]",
      );
      return Array.isArray(value) ? value.filter(Number.isInteger) : [];
    } catch {
      return [];
    }
  }

  function dismiss(repoId: number) {
    dismissed = [...dismissed, repoId];
    localStorage.setItem(DISMISSED_KEY, JSON.stringify(dismissed));
  }

  async function loadSuggestions(jwt: string) {
    try {
      const installations =
        await IntegrationsApi.getInstallationAvailableForUser(jwt);
      const lists = await Promise.all(
        installations.map(async (installation) =>
          (await IntegrationsApi.getRepositories(jwt, installation.id)).map(
            (repo) => ({ ...repo, installationEntityId: installation.id }),
          ),
        ),
      );
      if (auth.jwtToken === jwt) repos = lists.flat();
    } catch {
      repos = [];
    }
  }

  async function createFromRepo(repo: Suggestion) {
    if (acceptingRepoId !== null) return;
    acceptingRepoId = repo.id;
    try {
      await createEncryptedProject({
        name: repo.name,
        settings: normalizeProjectSettings(
          auth.userData?.projectCreationDefaults,
        ),
        repo,
      });
    } catch {
      toast.error(`Could not create ${repo.name}`);
    } finally {
      acceptingRepoId = null;
    }
  }

  /** The row under the cursor while dragging: a raised copy of the row. */
  function liftDragged(element?: HTMLElement) {
    if (!element) return;
    element.style.borderRadius = "8px";
    element.style.background = "var(--root-sel)";
    element.style.boxShadow = "var(--elev-shadow)";
    element.style.outline = "none";
  }

  function onConsider(event: CustomEvent<DndEvent<Project>>) {
    dragItems = event.detail.items;
  }

  function onFinalize(event: CustomEvent<DndEvent<Project>>) {
    dragItems = null;
    void saveOrder(event.detail.items);
  }

  // Chrome/Firefox option; keeps the focus ring on a row moved with the keyboard.
  const keyboardFocus = { preventScroll: false, focusVisible: true };

  /** Alt+↑/↓ moves the focused project, the keyboard path for drag-to-reorder. */
  function onProjectKeydown(event: KeyboardEvent, index: number) {
    if (!event.altKey || (event.key !== "ArrowUp" && event.key !== "ArrowDown"))
      return;
    const list = [...(shell.projects ?? [])];
    const target = index + (event.key === "ArrowUp" ? -1 : 1);
    if (target < 0 || target >= list.length) return;
    event.preventDefault();
    [list[index], list[target]] = [list[target]!, list[index]!];
    void saveOrder(list);
    const zone = (event.currentTarget as HTMLElement).closest(
      "[data-projects]",
    );
    requestAnimationFrame(() => {
      const links = zone?.querySelectorAll<HTMLElement>("a");
      links?.[target]?.focus(keyboardFocus);
    });
  }

  async function saveOrder(list: Project[]) {
    const previous = shell.projects;
    const jwt = auth.jwtToken;
    shell.projects = list;
    const applied = shell.projects; // the store's proxy, for the identity check below
    if (!jwt) return;
    try {
      await UserApi.updateMe(jwt, { projectsOrder: list.map((p) => p.id) });
    } catch {
      if (shell.projects === applied) shell.projects = previous;
      toast.error("Failed to save project order");
    }
  }

  // Global shortcuts. Capture phase so they work from inside the editor too; never while a
  // dialog is open, so they can't stack on top of another modal.
  function onWindowKeydown(event: KeyboardEvent) {
    if (!(event.metaKey || event.ctrlKey) || event.altKey || event.shiftKey)
      return;
    if (document.querySelector("dialog[open]")) return;
    if (event.key.toLowerCase() === "k") {
      event.preventDefault();
      event.stopPropagation();
      searchOpen = true;
    } else if (event.key === ",") {
      event.preventDefault();
      event.stopPropagation();
      if (!onSettings) void goto(resolve(settingsPath()));
    }
  }

  function onDrawerKeydown(event: KeyboardEvent) {
    if (event.key !== "Escape" || !drawerOpen) return;
    // Esc belongs to whatever is on top of the drawer (a dialog, the account menu).
    if (document.querySelector("dialog[open], :popover-open")) return;
    drawerOpen = false;
  }
</script>

<svelte:window onkeydowncapture={onWindowKeydown} onkeydown={onDrawerKeydown} />

<nav
  aria-label="Sidebar"
  class={cn(
    "min-h-0 flex-col gap-px bg-root px-2.5 pt-2 pb-3 md:flex",
    drawerOpen
      ? "fixed inset-y-0 left-0 z-50 flex w-[min(280px,85vw)] shadow-elev md:static md:z-auto md:w-auto md:shadow-none"
      : "hidden",
  )}
>
  <AccountMenu />

  <button
    type="button"
    class={cn(row, idle)}
    aria-keyshortcuts="Meta+K"
    onclick={() => (searchOpen = true)}
  >
    <Search strokeWidth={1.75} />Search<Kbd class="ml-auto">⌘K</Kbd>
  </button>
  <button
    type="button"
    class={cn(row, idle)}
    onclick={() => {
      invitationsOpen = true;
      void loadInvitations();
    }}
  >
    <Inbox strokeWidth={1.75} />Invitations
    {#if shell.invitations.length > 0}
      <span class="ml-auto text-[12px] text-faint"
        >{shell.invitations.length}</span
      >
    {/if}
  </button>

  <div
    class="flex min-h-0 flex-1 flex-col gap-px overflow-y-auto [mask-image:linear-gradient(to_bottom,transparent,#000_8px,#000_calc(100%-16px),transparent)] pb-4 [scrollbar-width:none]"
  >
    <div class={header}>
      Projects
      <button
        type="button"
        aria-label="New project"
        title="New project"
        class="grid size-[22px] place-items-center rounded-row text-fg3 hover:bg-root-hover hover:text-fg focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-fg3"
        onclick={() => (createOpen = true)}
      >
        <Plus class="size-[13px]" strokeWidth={1.75} />
      </button>
    </div>

    {#if shell.projects === null && shell.loadError}
      <div class="flex flex-col items-start gap-2 px-2 py-1">
        <p class="text-[12.5px] text-fg3">Couldn't load projects.</p>
        <Button size="sm" onclick={() => void loadShell()}>Retry</Button>
      </div>
    {:else if shell.projects === null}
      <div
        role="status"
        aria-label="Loading projects"
        class="flex flex-col gap-px"
      >
        {#each [72, 112, 88, 128, 96] as width (width)}
          <div class="flex h-[30px] items-center gap-2 px-2">
            <span class="size-4 rounded-[5px] bg-root-sel"></span>
            <span class="h-2 rounded-full bg-root-sel" style:width="{width}px"
            ></span>
          </div>
        {/each}
      </div>
    {:else}
      <div
        data-projects
        class="flex flex-col gap-px"
        use:dndzone={{
          items: projects,
          type: "projects",
          flipDurationMs: 0,
          dropTargetStyle: {},
          zoneTabIndex: -1,
          zoneItemTabIndex: -1,
          delayTouchStart: true,
          dropAnimationDisabled: true,
          morphDisabled: true,
          transformDraggedElement: liftDragged,
          dragDisabled: projects.length < 2,
        }}
        onconsider={onConsider}
        onfinalize={onFinalize}
      >
        {#each projects as project, index (project.id)}
          {@const current = page.params.projectId === project.id}
          {@const shadow = (project as Project & { isDndShadowItem?: boolean })
            .isDndShadowItem}
          <div class="flex flex-col">
            <a
              href={resolve(projectPath(project.id, tab))}
              draggable="false"
              aria-current={current ? "page" : undefined}
              class={cn(row, current ? on : idle, shadow && "invisible")}
              onkeydown={(event) => onProjectKeydown(event, index)}
            >
              <Avatar
                name={project.name}
                seed={project.id}
                size={16}
                square
                class="text-[9.5px]!"
              />
              <span class="min-w-0 flex-1 truncate">{project.name}</span>
              <span class="text-[12px] text-faint"
                >{ago(project.updatedAt)}</span
              >
            </a>
          </div>
        {/each}
      </div>
    {/if}

    {#if suggestions.length > 0}
      <div class={header}>
        From GitHub
        <span class="pr-1.5 text-faint">{suggestions.length}</span>
      </div>
      {#each suggestions as repo (repo.id)}
        <div class="group relative flex">
          <button
            type="button"
            title={`Create a project from ${repo.owner}/${repo.name}`}
            disabled={acceptingRepoId !== null}
            class={cn(row, idle, "flex-1 pr-8 text-left disabled:opacity-60")}
            onclick={() => void createFromRepo(repo)}
          >
            <Github strokeWidth={1.75} class="text-fg3" />
            <span class="min-w-0 flex-1 truncate">
              {acceptingRepoId === repo.id ? "Creating…" : repo.name}
            </span>
          </button>
          <button
            type="button"
            aria-label={`Dismiss ${repo.name}`}
            title="Dismiss"
            class="invisible absolute top-1 right-1 grid size-[22px] place-items-center rounded-row text-fg3 group-hover:visible hover:bg-root-sel hover:text-fg focus-visible:visible focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-fg3"
            onclick={() => dismiss(repo.id)}
          >
            <X class="size-[13px]" strokeWidth={1.75} />
          </button>
        </div>
      {/each}
    {/if}
  </div>

  <a href={resolve(settingsPath("devices"))} class={cn(row, idle)}>
    <Terminal strokeWidth={1.75} />Install the CLI
  </a>
  <a
    href={resolve(settingsPath())}
    aria-current={onSettings ? "page" : undefined}
    aria-keyshortcuts="Meta+Comma"
    class={cn(row, onSettings ? on : idle)}
  >
    <SlidersHorizontal strokeWidth={1.75} />Settings<Kbd class="ml-auto">⌘,</Kbd
    >
  </a>
</nav>

{#if drawerOpen}
  <button
    type="button"
    aria-label="Close menu"
    tabindex="-1"
    class="fixed inset-0 z-40 cursor-default bg-black/50 md:hidden"
    onclick={() => (drawerOpen = false)}
  ></button>
{/if}

<SearchPalette bind:open={searchOpen} {tab} />
<InvitationsDialog bind:open={invitationsOpen} />
<CreateProjectDialog bind:open={createOpen} />
