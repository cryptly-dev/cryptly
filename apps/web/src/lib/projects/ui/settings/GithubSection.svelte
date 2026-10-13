<script lang="ts" module>
  /** Set by the GitHub App callback so Settings reopens the connect dialog after installing. */
  export const CONNECT_AFTER_INSTALL_KEY = "cryptly.github.connectAfterInstall";
</script>

<script lang="ts">
  import { onMount, untrack } from "svelte";
  import { CircleCheck, CircleDashed, Clock, Plus, Trash } from "lucide-svelte";
  import { IntegrationsApi, type Integration } from "$lib/api/integrations.api";
  import { history } from "$lib/history/history.svelte";
  import type { Project } from "$lib/projects/projects.api";
  import { auth } from "$lib/stores/auth.svelte";
  import Button from "$lib/ui/Button.svelte";
  import IconButton from "$lib/ui/IconButton.svelte";
  import SettingsItem from "$lib/ui/SettingsItem.svelte";
  import Well from "$lib/ui/Well.svelte";
  import { getCompactRelativeTime } from "$lib/utils";
  import ConfirmDialog from "./ConfirmDialog.svelte";
  import ConnectRepositoryDialog from "./ConnectRepositoryDialog.svelte";

  let { project, isAdmin }: { project: Project; isAdmin: boolean } = $props();

  let integrations = $state<Integration[] | null>(null);
  let connectOpen = $state(false);
  let removing = $state<Integration | null>(null);
  let removeOpen = $state(false);

  const projectId = $derived(project.id);

  // Ticks the relative push times while the page stays open.
  let now = $state(Date.now());
  $effect(() => {
    const timer = setInterval(() => (now = Date.now()), 30_000);
    return () => clearInterval(timer);
  });

  // Only a complete, decrypted history of this project can back a sync claim; while the browser
  // is locked, loading or failed, the store is empty and every push would look "Synced".
  const historyReady = $derived(
    history.projectId === project.id &&
      !history.loading &&
      !history.locked &&
      !history.message &&
      history.versions.length > 0,
  );

  let loadSeq = 0;
  async function loadIntegrations() {
    const seq = ++loadSeq;
    const jwt = auth.jwtToken;
    if (!jwt) return;
    try {
      const list = await IntegrationsApi.getIntegrationsForProject(
        jwt,
        projectId,
      );
      if (seq === loadSeq) integrations = list;
    } catch {
      if (seq === loadSeq) integrations = [];
    }
  }

  // Pushes happen on the Secrets tab, so (re)load whenever Settings opens or the project changes.
  $effect(() => {
    void projectId;
    untrack(() => {
      integrations = null;
      void loadIntegrations();
    });
  });

  onMount(() => {
    if (sessionStorage.getItem(CONNECT_AFTER_INSTALL_KEY) !== projectId) return;
    sessionStorage.removeItem(CONNECT_AFTER_INSTALL_KEY);
    if (isAdmin) connectOpen = true;
  });

  function repoName(integration: Integration) {
    const repo = integration.repositoryData;
    return repo ? `${repo.owner}/${repo.name}` : "Unknown repository";
  }

  function repoUrl(integration: Integration) {
    const repo = integration.repositoryData;
    return repo
      ? repo.url || `https://github.com/${repo.owner}/${repo.name}`
      : null;
  }

  /** Compares the last push with the project's version timestamps (no decrypted content). */
  function syncStatus(integration: Integration) {
    if (!integration.lastPushedAt) {
      return { tone: "var(--fg3)", icon: CircleDashed, text: "Never pushed" };
    }
    const rel = getCompactRelativeTime(integration.lastPushedAt, now);
    const ago = rel === "now" ? "just now" : `${rel} ago`;
    if (!historyReady) {
      return { tone: "var(--fg3)", icon: CircleCheck, text: `Pushed ${ago}` };
    }
    const pushedAt = Date.parse(integration.lastPushedAt);
    const behind = history.versions.filter(
      (version) => Date.parse(version.createdAt) > pushedAt,
    ).length;
    return behind > 0
      ? {
          tone: "var(--warning)",
          icon: Clock,
          text: `${behind} version${behind === 1 ? "" : "s"} behind`,
        }
      : { tone: "var(--success)", icon: CircleCheck, text: `Synced ${ago}` };
  }

  async function disconnect() {
    const jwt = auth.jwtToken;
    const integration = removing;
    if (!jwt || !integration) return;
    await IntegrationsApi.deleteIntegration(jwt, integration.id);
    integrations = (integrations ?? []).filter((i) => i.id !== integration.id);
  }
</script>

{#snippet connect()}
  <Button size="sm" onclick={() => (connectOpen = true)}>
    <Plus strokeWidth={1.75} />Connect repository
  </Button>
{/snippet}

<Well id="github" title="GitHub sync" trail={isAdmin ? connect : undefined}>
  {#each integrations ?? [] as integration (integration.id)}
    {@const url = repoUrl(integration)}
    {@const status = syncStatus(integration)}
    {@const StatusIcon = status.icon}
    <SettingsItem label="Repo">
      {#if url}
        <!-- eslint-disable svelte/no-navigation-without-resolve -- external GitHub URL -->
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          class="truncate mono text-[12.5px] hover:underline"
          >{repoName(integration)}</a
        >
        <!-- eslint-enable svelte/no-navigation-without-resolve -->
      {:else}
        <span class="truncate mono text-[12.5px] text-fg3"
          >{repoName(integration)}</span
        >
      {/if}
      {#snippet actions()}
        {#if isAdmin}
          <IconButton
            label={`Disconnect ${repoName(integration)}`}
            class="opacity-0 group-focus-within/item:opacity-100 group-hover/item:opacity-100"
            onclick={() => {
              removing = integration;
              removeOpen = true;
            }}
          >
            <Trash strokeWidth={1.75} />
          </IconButton>
        {/if}
        <span
          class="inline-flex items-center gap-1.5 text-[12.5px] whitespace-nowrap text-[color-mix(in_oklab,var(--tone)_55%,var(--fg3))]"
          style:--tone={status.tone}
          title={integration.lastPushedAt
            ? `Last pushed ${new Date(integration.lastPushedAt).toLocaleString()}`
            : undefined}
        >
          <StatusIcon class="size-3.5" strokeWidth={1.75} />{status.text}
        </span>
      {/snippet}
    </SettingsItem>
  {:else}
    <div class="flex min-h-11 items-center px-1 py-2 text-fg3">
      {integrations === null ? "Loading…" : "No repositories connected"}
    </div>
  {/each}
</Well>

{#if isAdmin}
  <ConnectRepositoryDialog
    bind:open={connectOpen}
    {project}
    connected={integrations ?? []}
    onconnected={() => void loadIntegrations()}
  />
{/if}

<ConfirmDialog
  bind:open={removeOpen}
  title={`Disconnect ${removing ? repoName(removing) : "repository"}?`}
  description="Cryptly stops pushing to this repository. Secrets already in GitHub stay there."
  confirmLabel="Disconnect"
  error="Failed to disconnect repository"
  onconfirm={disconnect}
/>
