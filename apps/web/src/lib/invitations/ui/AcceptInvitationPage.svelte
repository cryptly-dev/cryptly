<script lang="ts">
  import { goto } from '$app/navigation';
  import { IconArrowRight, IconExclamationCircle, IconKey, IconUsers } from '@tabler/icons-svelte';
  import { toast } from 'svelte-sonner';
  import { AsymmetricCrypto } from '$lib/auth/asymmetric-crypto';
  import { persistInviteIdForAfterLogin } from '$lib/auth/after-login';
  import { SymmetricCrypto } from '$lib/auth/symmetric-crypto';
  import { InvitationsApi, type Invitation } from '$lib/invitations/invitations.api';
  import { auth, loadUserData } from '$lib/stores/auth.svelte';

  let { inviteId }: { inviteId: string } = $props();

  let invitation = $state<Invitation | null>(null);
  let passphrase = $state('');
  let loadingInvitation = $state(false);
  let accepting = $state(false);
  let isError = $state(false);
  let loadError = $state<string | null>(null);

  const isLoggedIn = $derived(Boolean(auth.jwtToken));

  async function loadInvitation() {
    const jwt = auth.jwtToken;
    if (!jwt || invitation || loadingInvitation) return;
    loadingInvitation = true;
    loadError = null;
    try {
      await loadUserData();
      invitation = await InvitationsApi.getInvitation(jwt, inviteId);
    } catch {
      loadError = 'Could not load this invitation.';
    } finally {
      loadingInvitation = false;
    }
  }

  $effect(() => {
    if (isLoggedIn) void loadInvitation();
  });

  async function acceptInvitation() {
    const jwt = auth.jwtToken;
    const user = auth.userData;
    if (!jwt || !user?.publicKey || !invitation || !passphrase.trim() || accepting) return;

    accepting = true;
    isError = false;
    try {
      const passphraseKey = await SymmetricCrypto.deriveBase64KeyFromPassphrase(passphrase);
      const temporaryPrivateKey = await SymmetricCrypto.decrypt(
        invitation.temporaryPrivateKey,
        passphraseKey
      );
      const projectKey = await AsymmetricCrypto.decrypt(
        invitation.temporarySecretsKey,
        temporaryPrivateKey
      );
      const reEncryptedProjectKey = await AsymmetricCrypto.encrypt(projectKey, user.publicKey);
      await InvitationsApi.acceptInvitation(jwt, invitation.id, {
        newSecretsKey: reEncryptedProjectKey
      });
      toast.success('Invitation accepted');
      await goto(`/app/project/${invitation.projectId}`);
    } catch {
      isError = true;
    } finally {
      accepting = false;
    }
  }
</script>

<div class="flex min-h-screen items-center justify-center p-4">
  <div class="max-w-md">
    {#if !isLoggedIn}
      <div class="rounded-xl border bg-card p-6 text-center">
        <div class="mb-4">
          <IconUsers class="mx-auto size-8 text-muted-foreground" />
        </div>

        <h1 class="mb-3 text-xl font-bold">Project Invitation</h1>

        <p class="mb-4 text-muted-foreground">
          You've been invited to collaborate on a project! Please log in to accept this invitation.
        </p>

        <a
          href="/app/login"
          class="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          onclick={() => persistInviteIdForAfterLogin(inviteId)}
        >
          Sign In to Continue
          <IconArrowRight class="size-4" />
        </a>

        <p class="mt-3 text-xs text-muted-foreground">
          Don't have an account? Signing in will create one for you.
        </p>
      </div>
    {:else}
      <div class="w-full rounded-xl border bg-card p-6">
        <div class="mb-6 text-center">
          <IconUsers class="mx-auto mb-3 size-8 text-primary" />
          <h1 class="mb-2 text-xl font-bold">Join Project</h1>
          <p class="text-sm text-muted-foreground">Enter the invitation code to accept the invitation.</p>
        </div>

        {#if loadingInvitation}
          <div class="rounded-lg border bg-muted/50 p-3 text-sm text-muted-foreground">Loading invitation...</div>
        {:else if loadError}
          <div class="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
            {loadError}
          </div>
        {:else}
          <form
            class="space-y-4"
            onsubmit={(event) => {
              event.preventDefault();
              void acceptInvitation();
            }}
          >
            <div class="rounded-lg border bg-muted/50 p-3">
              <div class="flex items-center gap-3">
                {#if auth.userData?.avatarUrl}
                  <img src={auth.userData.avatarUrl} alt="Your avatar" class="size-6 rounded-full" />
                {/if}
                <div>
                  <div class="text-sm font-medium">Joining as</div>
                  <div class="text-sm text-muted-foreground">{auth.userData?.displayName}</div>
                </div>
              </div>
            </div>

            <div class="space-y-2">
              <label for="invitation-code" class="flex items-center gap-2 text-sm font-medium">
                <IconKey class="size-4" />
                Invitation code
              </label>
              <input
                id="invitation-code"
                type="password"
                bind:value={passphrase}
                class="w-full rounded-lg border px-3 py-2 text-base focus:border-primary focus:ring-2 focus:ring-primary sm:text-sm"
                placeholder="Enter invitation code"
                autocomplete="new-password"
                oninput={() => {
                  if (isError) isError = false;
                }}
              />
              {#if isError}
                <div class="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-2 text-sm text-destructive">
                  <IconExclamationCircle class="size-4" />
                  <span>Incorrect passphrase. Please try again.</span>
                </div>
              {/if}
            </div>

            <button
              type="submit"
              disabled={!passphrase.trim() || accepting}
              class="inline-flex w-full items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {accepting ? 'Accepting...' : 'Accept Invitation'}
            </button>

            <p class="text-center text-xs text-muted-foreground">Invitation ID: {inviteId.slice(-8)}</p>
          </form>
        {/if}
      </div>
    {/if}
  </div>
</div>
