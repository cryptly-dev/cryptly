<script lang="ts">
  import { page } from '$app/state';
  import { ArrowRight, Eye, EyeOff, Laptop, LogOut } from 'lucide-svelte';
  import { logout } from '$lib/stores/auth.svelte';
  import { hydrateMasterKey, keyAuth, unlock } from '$lib/stores/key.svelte';
  import { auth } from '$lib/stores/auth.svelte';

  let passphrase = $state('');
  let showPassphrase = $state(false);
  let submitting = $state(false);
  let isError = $state(false);
  let inputEl: HTMLInputElement | undefined = $state();

  const keysAreSetUp = $derived(Boolean(auth.userData?.publicKey && auth.userData?.privateKeyEncrypted));
  const isAppUnlockRoute = $derived(
    page.url.pathname.startsWith('/app') &&
      !page.url.pathname.startsWith('/app/login') &&
      !page.url.pathname.startsWith('/app/callbacks/')
  );
  const open = $derived(
    Boolean(
      isAppUnlockRoute &&
        auth.jwtToken &&
        keysAreSetUp &&
        keyAuth.masterKeyHydrated &&
        !keyAuth.hasMasterKey
    )
  );

  $effect(() => {
    if (!open) {
      passphrase = '';
      submitting = false;
      isError = false;
      return;
    }
    requestAnimationFrame(() => inputEl?.focus());
  });

  $effect(() => {
    if (isAppUnlockRoute && auth.jwtToken && keysAreSetUp && !keyAuth.masterKeyHydrated) {
      void hydrateMasterKey();
    }
  });

  async function handleUnlock() {
    if (!passphrase || submitting) return;
    submitting = true;
    isError = false;
    try {
      await unlock(passphrase);
      passphrase = '';
    } catch {
      isError = true;
      requestAnimationFrame(() => {
        inputEl?.focus();
        inputEl?.select();
      });
    } finally {
      submitting = false;
    }
  }
</script>

{#if open}
  <div class="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4 backdrop-blur-sm">
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="unlock-title"
      class="w-full max-w-md rounded-lg border border-border bg-background p-6 shadow-2xl"
    >
      <header class="relative mb-6">
        <h2 id="unlock-title" class="text-lg font-semibold tracking-tight">Unlock this browser</h2>
        <p class="mt-1 text-sm text-muted-foreground">Enter your account passphrase.</p>
        <button
          type="button"
          class="absolute right-0 top-0 rounded-md px-3 py-1.5 text-sm font-medium text-foreground transition hover:bg-secondary"
          onclick={() => void logout()}
        >
          Log out
        </button>
      </header>

      <form
        class="grid gap-2"
        onsubmit={(event) => {
          event.preventDefault();
          void handleUnlock();
        }}
      >
        <label for="unlock-pass" class="text-sm font-medium">Passphrase</label>
        <div class="flex h-11 items-center rounded-lg border border-input bg-background ring-offset-background focus-within:border-primary/60">
          <input
            bind:this={inputEl}
            id="unlock-pass"
            type={showPassphrase ? 'text' : 'password'}
            bind:value={passphrase}
            placeholder="Enter your passphrase"
            autocomplete="current-password"
            class="min-w-0 flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground"
            oninput={() => {
              if (isError) isError = false;
            }}
          />
          <button
            type="button"
            aria-label={showPassphrase ? 'Hide passphrase' : 'Show passphrase'}
            class="mr-1 inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground"
            onclick={() => {
              showPassphrase = !showPassphrase;
            }}
          >
            {#if showPassphrase}
              <EyeOff class="size-4" />
            {:else}
              <Eye class="size-4" />
            {/if}
          </button>
          <button
            type="submit"
            disabled={!passphrase || submitting}
            aria-label="Unlock"
            class="mr-1 inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {#if submitting}
              <span
                class="inline-block size-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"
              ></span>
            {:else}
              <ArrowRight class="size-4" />
            {/if}
          </button>
        </div>

        {#if isError}
          <div class="mt-1 rounded-lg border border-destructive/20 bg-destructive/10 p-2 text-sm text-destructive">
            Incorrect passphrase
          </div>
        {/if}
      </form>

      <div class="relative my-6">
        <div class="absolute inset-0 flex items-center">
          <div class="w-full border-t border-border"></div>
        </div>
        <div class="relative flex justify-center">
          <span class="bg-background px-3 text-xs uppercase tracking-wider text-muted-foreground">OR</span>
        </div>
      </div>

      <section>
        <div class="mb-3 flex items-center gap-2">
          <Laptop class="size-4 text-muted-foreground" />
          <span class="text-sm font-medium">Connected Devices</span>
        </div>

        <div
          class="relative overflow-hidden rounded-lg border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 p-4"
        >
          <div class="animate-shimmer absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent"></div>
          <div class="relative flex items-start gap-3">
            <div class="mt-0.5 rounded-full bg-primary/20 p-2">
              <Laptop class="size-4 text-primary" />
            </div>
            <div class="flex-1">
              <p class="mb-1 text-sm font-medium text-foreground">Searching for devices...</p>
              <p class="text-xs leading-relaxed text-muted-foreground">
                Open Cryptly on an already authenticated device and approve the unlock request from
                there. No passphrase typing needed.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
{/if}
