<script lang="ts" module>
  import type { ProjectRole } from "$lib/projects/projects.api";

  export const ROLES = [
    {
      value: "read",
      label: "Read",
      description: "View secrets, the project name and integrations.",
    },
    {
      value: "write",
      label: "Write",
      description: "Read, plus create, edit and delete secrets.",
    },
    {
      value: "admin",
      label: "Admin",
      description: "Full control: members, integrations and settings.",
    },
  ] as const satisfies readonly {
    value: ProjectRole;
    label: string;
    description: string;
  }[];

  export function roleLabel(role: ProjectRole) {
    return ROLES.find((r) => r.value === role)?.label ?? "Read";
  }

  export function shortDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }
</script>

<script lang="ts">
  import { untrack } from "svelte";
  import { Check, ChevronDown, Copy, Plus, Trash } from "lucide-svelte";
  import { toast } from "svelte-sonner";
  import {
    InvitationsApi,
    type Invitation,
    type PersonalInvitation,
  } from "$lib/invitations/invitations.api";
  import {
    ProjectsApi,
    type Project,
    type ProjectMember,
  } from "$lib/projects/projects.api";
  import { publicEnv } from "$lib/shared/env/public-env";
  import { upsertProject } from "$lib/shell/shell.svelte";
  import { auth } from "$lib/stores/auth.svelte";
  import Avatar from "$lib/ui/Avatar.svelte";
  import Button from "$lib/ui/Button.svelte";
  import IconButton from "$lib/ui/IconButton.svelte";
  import SettingsItem from "$lib/ui/SettingsItem.svelte";
  import Well from "$lib/ui/Well.svelte";
  import AddPeopleDialog from "./AddPeopleDialog.svelte";
  import ConfirmDialog from "./ConfirmDialog.svelte";

  let { project, isAdmin }: { project: Project; isAdmin: boolean } = $props();

  type Invite =
    | { type: "link"; data: Invitation }
    | { type: "personal"; data: PersonalInvitation };

  let invites = $state<Invite[]>([]);
  let addOpen = $state(false);
  let removing = $state<ProjectMember | null>(null);
  let removeOpen = $state(false);
  let revokingId = $state<string | null>(null);
  let copiedInviteId = $state<string | null>(null);

  const me = $derived(auth.userData?.id);
  const members = $derived(
    [...project.members].sort(
      (a, b) => Number(b.id === me) - Number(a.id === me),
    ),
  );
  // Hover-only actions stay in the layout (no shift) and stay reachable by keyboard.
  const hoverOnly =
    "opacity-0 group-hover/item:opacity-100 group-focus-within/item:opacity-100";

  let loadSeq = 0;
  async function loadInvites() {
    const seq = ++loadSeq;
    const jwt = auth.jwtToken;
    if (!jwt || !isAdmin) {
      invites = [];
      return;
    }
    try {
      const [links, personal] = await Promise.all([
        InvitationsApi.getProjectInvitations(jwt, project.id),
        InvitationsApi.getProjectPersonalInvitations(jwt, project.id),
      ]);
      if (seq !== loadSeq) return;
      invites = [
        ...links.map((data) => ({ type: "link" as const, data })),
        ...personal.map((data) => ({ type: "personal" as const, data })),
      ].sort((a, b) => b.data.createdAt.localeCompare(a.data.createdAt));
    } catch {
      if (seq === loadSeq) invites = [];
    }
  }

  // People join or leave from elsewhere (accepted invites); refresh the members on open.
  async function refreshMembers() {
    const jwt = auth.jwtToken;
    if (!jwt) return;
    const fresh = await ProjectsApi.getProject(jwt, project.id).catch(
      () => null,
    );
    const key = (members: ProjectMember[]) =>
      members
        .map((m) => `${m.id}:${m.role}`)
        .sort()
        .join();
    if (fresh?.id === project.id && key(fresh.members) !== key(project.members))
      upsertProject({ ...project, members: fresh.members });
  }

  const inviteKey = $derived(`${project.id}:${isAdmin}`);
  $effect(() => {
    void inviteKey;
    untrack(() => {
      void loadInvites();
      void refreshMembers();
    });
  });

  function memberName(member: ProjectMember) {
    return member.displayName || member.email || "Unknown";
  }

  async function changeRole(
    member: ProjectMember,
    role: ProjectRole,
    select: HTMLSelectElement,
  ) {
    const jwt = auth.jwtToken;
    if (!jwt) return;
    try {
      await ProjectsApi.updateMemberRole(jwt, {
        projectId: project.id,
        memberId: member.id,
        role,
      });
      upsertProject({
        ...project,
        members: project.members.map((m) =>
          m.id === member.id ? { ...m, role } : m,
        ),
      });
    } catch {
      select.value = member.role;
      toast.error("Failed to update member role");
    }
  }

  async function removeMember() {
    const jwt = auth.jwtToken;
    const member = removing;
    if (!jwt || !member) return;
    await ProjectsApi.removeMember(jwt, {
      projectId: project.id,
      memberId: member.id,
    });
    upsertProject({
      ...project,
      members: project.members.filter((m) => m.id !== member.id),
    });
  }

  async function revoke(invite: Invite) {
    const jwt = auth.jwtToken;
    if (!jwt || revokingId) return;
    revokingId = invite.data.id;
    try {
      if (invite.type === "link") {
        await InvitationsApi.deleteInvitation(jwt, invite.data.id);
      } else {
        await InvitationsApi.deletePersonalInvitation(jwt, invite.data.id);
      }
      invites = invites.filter((i) => i.data.id !== invite.data.id);
    } catch {
      toast.error("Failed to revoke invitation");
    } finally {
      revokingId = null;
    }
  }

  async function copyInviteLink(invitationId: string) {
    try {
      await navigator.clipboard.writeText(
        `${publicEnv.appUrl.replace(/\/$/, "")}/invite/${invitationId}`,
      );
      copiedInviteId = invitationId;
      setTimeout(() => {
        if (copiedInviteId === invitationId) copiedInviteId = null;
      }, 1500);
    } catch {
      toast.error("Could not copy to the clipboard");
    }
  }
</script>

{#snippet roleText(role: ProjectRole)}
  <span
    class="flex h-[26px] w-[84px] shrink-0 items-center px-2.5 text-[12.5px] font-medium text-fg3"
    >{roleLabel(role)}</span
  >
{/snippet}

{#snippet addPeople()}
  <Button size="sm" onclick={() => (addOpen = true)}>
    <Plus strokeWidth={1.75} />Add people
  </Button>
{/snippet}

<Well id="members" title="Members" trail={isAdmin ? addPeople : undefined}>
  {#each members as member (member.id)}
    {@const isMe = member.id === me}
    {@const name = memberName(member)}
    <SettingsItem label={isMe ? "You" : "Member"}>
      <Avatar {name} src={member.avatarUrl} seed={member.id} />
      <span class="truncate">{name}</span>
      {#if member.email && member.email !== name}
        <span class="truncate text-[12.5px] text-fg3">{member.email}</span>
      {/if}
      {#snippet actions()}
        {#if isAdmin && !isMe}
          <IconButton
            label={`Remove ${name}`}
            class={hoverOnly}
            onclick={() => {
              removing = member;
              removeOpen = true;
            }}
          >
            <Trash strokeWidth={1.75} />
          </IconButton>
          <label class="relative flex shrink-0">
            <span class="sr-only">Role of {name}</span>
            <select
              value={member.role}
              class="peer h-[26px] w-[84px] cursor-pointer appearance-none rounded-full bg-transparent pr-6 pl-2.5 text-[12.5px] font-medium text-fg3 outline-none hover:bg-[color-mix(in_oklab,var(--fg)_6%,transparent)] hover:text-fg focus-visible:shadow-[inset_0_0_0_1px_var(--fg3)]"
              onchange={(event) =>
                void changeRole(
                  member,
                  event.currentTarget.value as ProjectRole,
                  event.currentTarget,
                )}
            >
              {#each ROLES as role (role.value)}
                <option value={role.value}>{role.label}</option>
              {/each}
            </select>
            <ChevronDown
              class="pointer-events-none absolute top-1/2 right-2.5 size-[13px] -translate-y-1/2 text-fg3 peer-hover:text-fg"
              strokeWidth={1.75}
            />
          </label>
        {:else}
          {@render roleText(member.role)}
        {/if}
      {/snippet}
    </SettingsItem>
  {/each}
  {#each invites as invite (invite.data.id)}
    <SettingsItem label="Invited">
      <span
        aria-hidden="true"
        class="size-5 shrink-0 rounded-full opacity-60 shadow-[inset_0_0_0_1px_var(--fg3)]"
      ></span>
      <span class="truncate"
        >{invite.type === "link"
          ? "Invite link"
          : invite.data.invitedUser.displayName}</span
      >
      <span class="shrink-0 text-[12.5px] text-fg3"
        >{shortDate(invite.data.createdAt)}</span
      >
      {#snippet actions()}
        {#if invite.type === "link"}
          {@const inviteId = invite.data.id}
          <IconButton
            label="Copy invite link"
            class={hoverOnly}
            onclick={() => void copyInviteLink(inviteId)}
          >
            {#if copiedInviteId === inviteId}
              <Check class="text-success" strokeWidth={1.75} />
            {:else}
              <Copy strokeWidth={1.75} />
            {/if}
          </IconButton>
        {/if}
        <IconButton
          label={invite.type === "link" ? "Revoke link" : "Revoke invitation"}
          class={hoverOnly}
          disabled={revokingId === invite.data.id}
          onclick={() => void revoke(invite)}
        >
          <Trash strokeWidth={1.75} />
        </IconButton>
        {@render roleText(invite.data.role)}
      {/snippet}
    </SettingsItem>
  {/each}
</Well>

{#if isAdmin}
  <AddPeopleDialog
    bind:open={addOpen}
    {project}
    oncreated={() => void loadInvites()}
  />
{/if}

<ConfirmDialog
  bind:open={removeOpen}
  title={`Remove ${removing ? memberName(removing) : "member"}?`}
  description={`They lose access to ${project.name} and its secrets, and need a new invitation to rejoin.`}
  confirmLabel="Remove"
  error="Failed to remove member"
  onconfirm={removeMember}
/>
