<script lang="ts">
  import { page } from '$app/state';
  import { goto } from '$app/navigation';
  import { Check, X } from 'lucide-svelte';
  import { toast } from 'svelte-sonner';
  import {
    InvitationsApi,
    type PersonalInvitationListItem
  } from '$lib/invitations/invitations.api';
  import { auth } from '$lib/stores/auth.svelte';

  let invitations = $state<PersonalInvitationListItem[]>([]);
  let loading = $state(false);
  let actingId = $state<string | null>(null);

  const shouldShow = $derived(
    Boolean(auth.jwtToken && page.url.pathname.startsWith('/app') && !page.url.pathname.startsWith('/app/login'))
  );

  async function loadInvitations() {
    const jwt = auth.jwtToken;
    if (!jwt || loading) return;
    loading = true;
    try {
      invitations = await InvitationsApi.getMyPersonalInvitations(jwt);
    } catch {
      invitations = [];
    } finally {
      loading = false;
    }
  }

  $effect(() => {
    if (shouldShow) void loadInvitations();
    else invitations = [];
  });

  async function accept(invitation: PersonalInvitationListItem) {
    const jwt = auth.jwtToken;
    if (!jwt || actingId) return;
    actingId = invitation.id;
    try {
      await InvitationsApi.acceptPersonalInvitation(jwt, invitation.id);
      invitations = invitations.filter((item) => item.id !== invitation.id);
      toast.success('Invitation accepted');
      await goto(`/app/project/${invitation.projectId}`);
    } catch {
      toast.error('Failed to accept invitation');
    } finally {
      actingId = null;
    }
  }

  async function reject(invitation: PersonalInvitationListItem) {
    const jwt = auth.jwtToken;
    if (!jwt || actingId) return;
    actingId = invitation.id;
    try {
      await InvitationsApi.rejectPersonalInvitation(jwt, invitation.id);
      invitations = invitations.filter((item) => item.id !== invitation.id);
      toast.success('Invitation declined');
    } catch {
      toast.error('Failed to decline invitation');
    } finally {
      actingId = null;
    }
  }
</script>

{#if shouldShow && invitations.length > 0}
  <div class="fixed bottom-4 left-4 z-40 w-[calc(100vw-2rem)] max-w-sm rounded-lg border border-border bg-background p-4 shadow-2xl">
    <div class="mb-3">
      <h2 class="text-sm font-semibold">Project invitations</h2>
      <p class="text-xs text-muted-foreground">You have pending direct invitations.</p>
    </div>
    <div class="space-y-2">
      {#each invitations as invitation (invitation.id)}
        <div class="rounded-md border border-border/60 bg-muted/30 p-3">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <p class="truncate text-sm font-medium">{invitation.projectName}</p>
              <p class="text-xs text-muted-foreground">
                Invited by {invitation.author.displayName || invitation.author.email || 'a teammate'} as {invitation.role}
              </p>
            </div>
          </div>
          <div class="mt-3 flex justify-end gap-2">
            <button
              type="button"
              class="inline-flex h-8 items-center rounded-md border border-border px-3 text-xs font-medium hover:bg-secondary disabled:opacity-50"
              disabled={actingId === invitation.id}
              onclick={() => void reject(invitation)}
            >
              <X class="mr-1 size-3" />
              Decline
            </button>
            <button
              type="button"
              class="inline-flex h-8 items-center rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground disabled:opacity-50"
              disabled={actingId === invitation.id}
              onclick={() => void accept(invitation)}
            >
              <Check class="mr-1 size-3" />
              Accept
            </button>
          </div>
        </div>
      {/each}
    </div>
  </div>
{/if}
