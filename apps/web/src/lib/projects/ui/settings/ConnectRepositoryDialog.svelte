<script lang="ts">
  import { untrack } from "svelte";
  import { ArrowLeft, ChevronRight, Github, Plus } from "lucide-svelte";
  import { toast } from "svelte-sonner";
  import {
    IntegrationsApi,
    type Installation,
    type Integration,
    type Repository,
  } from "$lib/api/integrations.api";
  import { createGitHubAppInstallState } from "$lib/auth/browser-state";
  import type { Project } from "$lib/projects/projects.api";
  import { publicEnv } from "$lib/shared/env/public-env";
  import { auth } from "$lib/stores/auth.svelte";
  import Avatar from "$lib/ui/Avatar.svelte";
  import Button from "$lib/ui/Button.svelte";
  import Dialog from "$lib/ui/Dialog.svelte";
  import SearchField from "$lib/ui/SearchField.svelte";

  let {
    open = $bindable(false),
    project,
    connected,
    onconnected,
  }: {
    open?: boolean;
    project: Project;
    connected: Integration[];
    onconnected: () => void;
  } = $props();

  type Repo = Repository & { installationEntityId: string };

  let installations = $state<Installation[] | null>(null);
  let repos = $state<Repo[]>([]);
  let installationId = $state<string | null>(null);
  let query = $state("");
  let connectingId = $state<number | null>(null);
  let installing = $state(false);

  const connectedIds = $derived(
    new Set(connected.map((integration) => integration.githubRepositoryId)),
  );
  const projectTokens = $derived(tokenize(project.name));

  // Repositories named like the project come first (same ranking as the old suggestions).
  const suggested = $derived(
    repos
      .filter((repo) => !connectedIds.has(repo.id) && score(repo) > 0)
      .sort((a, b) => score(b) - score(a))
      .slice(0, 3),
  );
  const installationRepos = $derived.by(() => {
    const q = query.trim().toLowerCase();
    return repos
      .filter(
        (repo) =>
          repo.installationEntityId === installationId &&
          !connectedIds.has(repo.id) &&
          `${repo.owner}/${repo.name}`.toLowerCase().includes(q),
      )
      .sort((a, b) => score(b) - score(a) || a.name.localeCompare(b.name));
  });
  const installation = $derived(
    installations?.find((i) => i.id === installationId) ?? null,
  );

  function tokenize(name: string): string[] {
    return name
      .toLowerCase()
      .split(/[.\-_\s]+/)
      .filter((token) => token.length > 0);
  }

  function score(repo: Repository): number {
    const repoTokens = tokenize(repo.name);
    return projectTokens.filter((token) =>
      repoTokens.some((r) => r.includes(token) || token.includes(r)),
    ).length;
  }

  function ownerName(i: Installation) {
    return i.liveData?.owner ?? `Installation ${i.githubInstallationId}`;
  }

  async function load() {
    const jwt = auth.jwtToken;
    if (!jwt) return;
    try {
      const available =
        await IntegrationsApi.getInstallationAvailableForUser(jwt);
      const lists = await Promise.all(
        available.map(async (i) =>
          (await IntegrationsApi.getRepositories(jwt, i.id)).map((repo) => ({
            ...repo,
            installationEntityId: i.id,
          })),
        ),
      );
      repos = lists.flat();
      installations = available;
      if (available.length === 1) installationId = available[0]!.id;
    } catch {
      installations = [];
      toast.error("Failed to load GitHub repositories");
    }
  }

  $effect(() => {
    if (open) untrack(() => void load());
  });

  function reset() {
    installations = null;
    repos = [];
    installationId = null;
    query = "";
  }

  async function connectRepository(repo: Repo) {
    const jwt = auth.jwtToken;
    if (!jwt || connectingId !== null) return;
    connectingId = repo.id;
    try {
      await IntegrationsApi.createIntegration(jwt, {
        projectId: project.id,
        repositoryId: repo.id,
        installationEntityId: repo.installationEntityId,
      });
      onconnected();
      open = false;
    } catch {
      toast.error("Failed to connect repository");
    } finally {
      connectingId = null;
    }
  }

  async function installGithubApp() {
    if (installing) return;
    installing = true;
    try {
      const state = createGitHubAppInstallState(project.id);
      if (!state) throw new Error("No install state");
      const appUrl = publicEnv.appUrl.replace(/\/$/, "");
      const jwt = auth.jwtToken;
      if (publicEnv.githubLocalMock && jwt) {
        const { githubInstallationId } =
          await IntegrationsApi.bootstrapLocalGithubMock(jwt);
        window.location.href = `${appUrl}/app/callbacks/integrations/github?installation_id=${githubInstallationId}&state=${encodeURIComponent(state)}`;
        return;
      }
      window.location.href = `https://github.com/apps/cryptly-dev/installations/new?state=${encodeURIComponent(state)}`;
    } catch {
      installing = false;
      toast.error("Failed to start GitHub installation");
    }
  }
</script>

{#snippet repoRow(repo: Repo)}
  <button
    type="button"
    disabled={connectingId !== null}
    class="group flex w-full items-center gap-2.5 rounded-[10px] p-2 text-left hover:bg-elev-hover disabled:pointer-events-none disabled:opacity-50"
    onclick={() => void connectRepository(repo)}
  >
    <Avatar name={repo.owner} src={repo.avatarUrl} size={20} />
    <span class="min-w-0 flex-1 truncate mono text-[12.5px]"
      ><span class="text-fg3">{repo.owner}/</span>{repo.name}</span
    >
    {#if repo.isPrivate}
      <span class="text-[12px] text-fg3">Private</span>
    {/if}
    <span class="text-[12.5px] font-medium text-fg3 group-hover:text-fg"
      >{connectingId === repo.id ? "Connecting…" : "Connect"}</span
    >
  </button>
{/snippet}

<Dialog
  bind:open
  title="Connect repository"
  description="Pushes go to the repository's GitHub Actions secrets."
  dismissible={connectingId === null}
  onclose={reset}
>
  {#if installations === null}
    <p class="py-6 text-center text-fg3">Loading repositories…</p>
  {:else if installation}
    <SearchField
      bind:value={query}
      placeholder="Search repositories"
      slashFocus={false}
      class="w-full"
    />
    <div class="-mx-2 -mt-2 flex max-h-72 flex-col gap-0.5 overflow-y-auto">
      {#each installationRepos as repo (repo.id)}
        {@render repoRow(repo)}
      {:else}
        <p class="px-2 py-6 text-center text-fg3">
          {query.trim()
            ? "No repositories match."
            : "Every repository here is already connected."}
        </p>
      {/each}
    </div>
    <div class="-mx-2 -mb-2 flex justify-between">
      {#if installations.length > 1}
        <Button variant="ghost" onclick={() => (installationId = null)}>
          <ArrowLeft strokeWidth={1.75} />Back
        </Button>
      {/if}
      <Button
        variant="ghost"
        class="ml-auto"
        disabled={installing}
        onclick={() => void installGithubApp()}
      >
        <Plus strokeWidth={1.75} />{installing
          ? "Opening GitHub…"
          : "Add repositories"}
      </Button>
    </div>
  {:else if installations.length === 0}
    <div class="flex flex-col items-center gap-3 py-4 text-center">
      <p class="text-fg3">
        Install the Cryptly GitHub App on the account or organization that owns
        the repository.
      </p>
      <Button
        variant="primary"
        disabled={installing}
        onclick={() => void installGithubApp()}
      >
        <Github strokeWidth={1.75} />{installing
          ? "Opening GitHub…"
          : "Install GitHub App"}
      </Button>
    </div>
  {:else}
    {#if suggested.length > 0}
      <div class="flex flex-col gap-1">
        <h3 class="text-[12.5px] font-[550] text-fg3">Suggested</h3>
        <div class="-mx-2 flex flex-col gap-0.5">
          {#each suggested as repo (repo.id)}
            {@render repoRow(repo)}
          {/each}
        </div>
      </div>
    {/if}
    <div class="flex flex-col gap-1">
      <h3 class="text-[12.5px] font-[550] text-fg3">Installations</h3>
      <div class="-mx-2 flex flex-col gap-0.5">
        {#each installations as i (i.id)}
          <button
            type="button"
            class="group flex w-full items-center gap-2.5 rounded-[10px] p-2 text-left hover:bg-elev-hover"
            onclick={() => {
              installationId = i.id;
              query = "";
            }}
          >
            <Avatar name={ownerName(i)} src={i.liveData?.avatar} size={20} />
            <span class="min-w-0 flex-1 truncate">{ownerName(i)}</span>
            <ChevronRight
              class="size-4 shrink-0 text-faint group-hover:text-fg3"
              strokeWidth={1.75}
            />
          </button>
        {/each}
        <button
          type="button"
          disabled={installing}
          class="flex w-full items-center gap-2.5 rounded-[10px] p-2 text-left text-fg3 hover:bg-elev-hover hover:text-fg disabled:pointer-events-none disabled:opacity-50"
          onclick={() => void installGithubApp()}
        >
          <span class="grid size-5 place-items-center"
            ><Plus class="size-4" strokeWidth={1.75} /></span
          >
          {installing ? "Opening GitHub…" : "Add installation"}
        </button>
      </div>
    </div>
  {/if}
</Dialog>
