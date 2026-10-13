<script lang="ts">
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { toast } from "svelte-sonner";
  import { track } from "$lib/analytics/logdash";
  import {
    InvitationsApi,
    type PersonalInvitation,
  } from "$lib/invitations/invitations.api";
  import { projectPath } from "$lib/paths";
  import { refreshProjects, shell } from "$lib/shell/shell.svelte";
  import { auth } from "$lib/stores/auth.svelte";
  import Avatar from "$lib/ui/Avatar.svelte";
  import Button from "$lib/ui/Button.svelte";
  import Dialog from "$lib/ui/Dialog.svelte";

  let { open = $bindable(false) }: { open?: boolean } = $props();

  let actingId = $state<string | null>(null);

  const ROLE_LABEL = { read: "Read", write: "Write", admin: "Admin" } as const;

  function forget(invitation: PersonalInvitation) {
    shell.invitations = shell.invitations.filter(
      (item) => item.id !== invitation.id,
    );
  }

  async function accept(invitation: PersonalInvitation) {
    const jwt = auth.jwtToken;
    if (!jwt || actingId) return;
    actingId = invitation.id;
    try {
      await InvitationsApi.acceptPersonalInvitation(jwt, invitation.id);
      track("invitation_accepted", { kind: "direct" });
      forget(invitation);
      await refreshProjects().catch(() => undefined);
      open = false;
      toast.success(`Joined ${invitation.projectName}`);
      await goto(resolve(projectPath(invitation.projectId)));
    } catch {
      toast.error("Failed to accept invitation");
    } finally {
      actingId = null;
    }
  }

  async function decline(invitation: PersonalInvitation) {
    const jwt = auth.jwtToken;
    if (!jwt || actingId) return;
    actingId = invitation.id;
    try {
      await InvitationsApi.rejectPersonalInvitation(jwt, invitation.id);
      forget(invitation);
      toast.success("Invitation declined");
    } catch {
      toast.error("Failed to decline invitation");
    } finally {
      actingId = null;
    }
  }
</script>

<Dialog
  bind:open
  title="Invitations"
  description={shell.invitations.length > 0
    ? "Projects people invited you to."
    : "No pending invitations."}
  dismissible={actingId === null}
  class="w-[min(480px,calc(100%-2rem))]"
>
  {#if shell.invitations.length > 0}
    <div class="-mx-1 flex flex-col">
      {#each shell.invitations as invitation (invitation.id)}
        {@const author =
          invitation.author.displayName ||
          invitation.author.email ||
          "A teammate"}
        <div
          class="flex min-h-12 items-center gap-3 px-1 py-2 [&:not(:first-child)]:shadow-[inset_0_0.5px_0_var(--elev-border)]"
        >
          <Avatar
            name={invitation.projectName}
            seed={invitation.projectId}
            size={20}
            square
            class="rounded-[6px]"
          />
          <div class="min-w-0 flex-1">
            <p class="truncate font-[550]">{invitation.projectName}</p>
            <p class="truncate text-[12.5px] text-fg3">
              {author} · {ROLE_LABEL[invitation.role]}
            </p>
          </div>
          <Button
            size="sm"
            variant="ghost"
            disabled={actingId !== null}
            onclick={() => void decline(invitation)}>Decline</Button
          >
          <Button
            size="sm"
            variant="primary"
            disabled={actingId !== null}
            onclick={() => void accept(invitation)}>Accept</Button
          >
        </div>
      {/each}
    </div>
  {/if}
</Dialog>
