<script lang="ts">
  import { auth, loadUserData } from '$lib/stores/auth.svelte';
  import { hydrateMasterKey, reset as resetKeyStore, keyAuth } from '$lib/stores/key.svelte';
  import { UserApi } from '$lib/auth/user.api';
  import { keystore } from '$lib/auth/keystore';

  let showNewAccountDialog = $state(false);
  let hideNewAccountButton = $state(false);

  async function copyToClipboard(value?: string | null) {
    if (!value) {
      return;
    }
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // ignore
    }
  }

  const areKeysSet = $derived(
    Boolean(auth.userData?.publicKey && auth.userData?.privateKeyEncrypted)
  );

  async function simulateNewAccount() {
    if (!auth.jwtToken) {
      return;
    }
    await UserApi.deleteKeys(auth.jwtToken);
    await resetKeyStore();
    await loadUserData();
    showNewAccountDialog = false;
    hideNewAccountButton = true;
  }

  async function simulateNewBrowser() {
    await keystore.wipeAll();
    await hydrateMasterKey();
  }
</script>

<div class="flex h-full w-full items-center justify-center p-4">
  <div class="w-full max-w-2xl space-y-6 rounded-2xl border border-border bg-card/60 p-6 shadow-sm backdrop-blur">
    <h1 class="text-xl font-semibold">Developer</h1>

    <div class="space-y-2">
      <div class="flex items-center gap-3 text-sm">
        <div class="w-56 shrink-0 text-muted-foreground">Are keys set?</div>
        <div class="min-w-0 flex-1">
          <button
            type="button"
            class="w-full truncate rounded-md bg-muted px-3 py-2 text-left text-xs select-none"
            onclick={() => copyToClipboard(areKeysSet ? 'Yes' : 'No')}
          >
            {areKeysSet ? 'Yes' : 'No'}
          </button>
        </div>
      </div>
      <div class="flex items-center gap-3 text-sm">
        <div class="w-56 shrink-0 text-muted-foreground">Is this browser unlocked?</div>
        <div class="min-w-0 flex-1">
          <button
            type="button"
            class="w-full truncate rounded-md bg-muted px-3 py-2 text-left text-xs select-none"
            onclick={() => copyToClipboard(keyAuth.hasMasterKey ? 'Yes' : 'No')}
          >
            {keyAuth.hasMasterKey ? 'Yes' : 'No'}
          </button>
        </div>
      </div>
      <div class="flex items-center gap-3 text-sm">
        <div class="w-56 shrink-0 text-muted-foreground">Public key</div>
        <div class="min-w-0 flex-1">
          <button
            type="button"
            class="w-full truncate rounded-md bg-muted px-3 py-2 text-left text-xs select-none"
            title={auth.userData?.publicKey ?? ''}
            onclick={() => copyToClipboard(auth.userData?.publicKey)}
          >
            {auth.userData?.publicKey ?? '—'}
          </button>
        </div>
      </div>
      <div class="flex items-center gap-3 text-sm">
        <div class="w-56 shrink-0 text-muted-foreground">Encrypted private key</div>
        <div class="min-w-0 flex-1">
          <button
            type="button"
            class="w-full truncate rounded-md bg-muted px-3 py-2 text-left text-xs select-none"
            title={auth.userData?.privateKeyEncrypted ?? ''}
            onclick={() => copyToClipboard(auth.userData?.privateKeyEncrypted)}
          >
            {auth.userData?.privateKeyEncrypted ?? '—'}
          </button>
        </div>
      </div>
      <div class="flex items-center gap-3 text-sm">
        <div class="w-56 shrink-0 text-muted-foreground">Master key</div>
        <div class="min-w-0 flex-1">
          <div class="truncate rounded-md bg-muted px-3 py-2 text-xs">
            {keyAuth.hasMasterKey
              ? 'Held as non-extractable CryptoKey in IndexedDB'
              : '—'}
          </div>
        </div>
      </div>
    </div>

    <div class="flex gap-3 pt-2">
      {#if !hideNewAccountButton}
        <button
          type="button"
          class="inline-flex h-10 items-center justify-center rounded-md border border-border bg-secondary px-4 text-sm font-medium hover:bg-secondary/80"
          onclick={() => {
            showNewAccountDialog = true;
          }}
        >
          Simulate new account
        </button>
      {/if}
      <button
        type="button"
        class="inline-flex h-10 items-center justify-center rounded-md border border-border bg-secondary px-4 text-sm font-medium hover:bg-secondary/80"
        onclick={() => {
          void simulateNewBrowser();
        }}
      >
        Simulate new browser
      </button>
    </div>
  </div>
</div>

{#if showNewAccountDialog}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    role="presentation"
    onclick={(e) => {
      if (e.target === e.currentTarget) {
        showNewAccountDialog = false;
      }
    }}
  >
    <div
      class="max-w-lg rounded-lg border border-border bg-card p-6 shadow-lg"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dev-dialog-title"
    >
      <h2 id="dev-dialog-title" class="text-lg font-semibold">Simulate New Account</h2>
      <p class="mt-2 text-sm text-muted-foreground">
        Are you sure you want to simulate a new account?
      </p>
      <div class="mt-4 rounded-md border border-destructive/20 bg-destructive/10 p-4">
        <div class="text-sm font-medium text-destructive">Warning: Destructive Action</div>
        <p class="mt-2 text-sm text-muted-foreground">
          This action will regenerate your encryption keys and make
          <strong>all your current projects completely unusable</strong>. You will lose access to all
          encrypted data. This action cannot be undone.
        </p>
      </div>
      <div class="mt-6 flex justify-end gap-2">
        <button
          type="button"
          class="inline-flex h-10 items-center justify-center rounded-md px-4 text-sm hover:bg-muted"
          onclick={() => {
            showNewAccountDialog = false;
          }}
        >
          Cancel
        </button>
        <button
          type="button"
          class="inline-flex h-10 items-center justify-center rounded-md bg-destructive px-4 text-sm font-medium text-destructive-foreground hover:bg-destructive/90"
          onclick={() => {
            void simulateNewAccount();
          }}
        >
          Confirm - Regenerate Keys
        </button>
      </div>
    </div>
  </div>
{/if}
