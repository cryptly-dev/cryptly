<script lang="ts">
  import { goto } from '$app/navigation';
  import { IconEye, IconEyeOff } from '@tabler/icons-svelte';
  import { Check, CornerDownLeft, Terminal } from 'lucide-svelte';
  import { onMount, tick } from 'svelte';
  import { animate } from 'motion';
  import { AsymmetricCrypto } from '$lib/auth/asymmetric-crypto';
  import {
    isValidCliSessionPublicId,
    persistCliAuthorizeReturn
  } from '$lib/auth/cli-authorize-return';
  import {
    CliFlowRequestError,
    approveCliSession,
    getCliSessionInfo,
    type CliSessionInfo
  } from '$lib/auth/cli-flow.api';
  import { randomBytes, u8ToBase64 } from '$lib/auth/crypto.utils';
  import { SymmetricCrypto } from '$lib/auth/symmetric-crypto';
  import { auth, loadUserData } from '$lib/stores/auth.svelte';

  let { sessionId }: { sessionId: string } = $props();

  type LoadState =
    | { kind: 'loading' }
    | { kind: 'ready'; session: CliSessionInfo }
    | { kind: 'already-approved' }
    | { kind: 'error'; message: string };

  let load = $state<LoadState>({ kind: 'loading' });
  let passphrase = $state('');
  let showPassphrase = $state(false);
  let approveState = $state<'idle' | 'submitting' | 'done'>('idle');
  let error = $state<string | null>(null);
  let passphraseInput = $state<HTMLInputElement | null>(null);
  let rootEl = $state<HTMLElement | null>(null);

  let redirectedToLogin = $state(false);

  const keysAreSetUp = $derived(
    Boolean(
      auth.userData?.publicKey &&
        auth.userData?.privateKeyEncrypted
    )
  );

  onMount(() => {
    if (rootEl) {
      void animate(
        rootEl,
        { opacity: [0, 1], y: [14, 0] },
        { duration: 0.55, ease: [0, 0.55, 0.45, 1] }
      );
    }
  });

  $effect(() => {
    if (auth.jwtToken || redirectedToLogin) {
      return;
    }
    const path =
      sessionId && isValidCliSessionPublicId(sessionId)
        ? `/app/cli-authorize?session=${sessionId}`
        : '';
    if (path) {
      persistCliAuthorizeReturn(path);
    }
    redirectedToLogin = true;
    void goto('/app/login', { replaceState: true });
  });

  $effect(() => {
    if (!auth.jwtToken) {
      return;
    }
    void (async () => {
      if (!sessionId) {
        load = { kind: 'error', message: 'Missing session id.' };
        return;
      }
      if (!isValidCliSessionPublicId(sessionId)) {
        load = { kind: 'error', message: 'Invalid session id.' };
        return;
      }
      const token = auth.jwtToken;
      if (!token) {
        return;
      }
      load = { kind: 'loading' };
      try {
        await loadUserData();
        const jwt = auth.jwtToken;
        if (!jwt) {
          return;
        }
        const session = await getCliSessionInfo(jwt, sessionId);
        if (session.status !== 'pending') {
          load = { kind: 'already-approved' };
        } else {
          load = { kind: 'ready', session };
        }
      } catch (e: unknown) {
        const status =
          e instanceof CliFlowRequestError ? e.status : undefined;
        const message =
          status === 404
            ? 'Session not found or expired.'
            : 'Could not load session.';
        load = { kind: 'error', message };
      }
    })();
  });

  $effect(() => {
    if (load.kind !== 'ready' || approveState === 'done') {
      return;
    }
    void tick().then(() => {
      passphraseInput?.focus();
    });
  });

  async function onApprove(e: Event) {
    e.preventDefault();
    if (load.kind !== 'ready' || approveState !== 'idle') {
      return;
    }
    if (
      !passphrase ||
      !auth.jwtToken ||
      !auth.userData?.privateKeyEncrypted
    ) {
      return;
    }

    approveState = 'submitting';
    error = null;

    let rawPrivateKey: string | null = null;
    let ephemeralKey: string | null = null;

    try {
      const base64Key =
        await SymmetricCrypto.deriveBase64KeyFromPassphrase(passphrase);
      try {
        rawPrivateKey = await SymmetricCrypto.decrypt(
          auth.userData.privateKeyEncrypted,
          base64Key
        );
      } catch {
        throw new Error('Incorrect passphrase');
      }

      ephemeralKey = u8ToBase64(randomBytes(32));
      const wrappedKey = await AsymmetricCrypto.encrypt(
        ephemeralKey,
        load.session.tempPublicKey
      );
      const encryptedPrivateKey = await SymmetricCrypto.encrypt(
        rawPrivateKey,
        ephemeralKey
      );

      await approveCliSession(auth.jwtToken, load.session.sessionId, {
        wrappedKey,
        encryptedPrivateKey
      });

      approveState = 'done';
    } catch (e: unknown) {
      error = e instanceof Error ? e.message : 'Failed to authorize';
      approveState = 'idle';
      requestAnimationFrame(() => {
        passphraseInput?.focus();
        passphraseInput?.select();
      });
    } finally {
      rawPrivateKey = null;
      ephemeralKey = null;
    }
  }
</script>

{#if auth.jwtToken}
  <div class="flex min-h-screen items-center justify-center bg-background p-8">
    <div
      bind:this={rootEl}
      class="w-full max-w-md"
      style="opacity:0;transform:translateY(14px)"
    >
      <div class="mb-10">
        <div
          class="mb-5 flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-muted-foreground/60"
        >
          <Terminal class="size-3.5" />
          <span>Authorize CLI</span>
        </div>
        <h1
          class="text-[34px] font-semibold leading-[1.05] tracking-tight text-foreground md:text-[40px]"
        >
          {#if load.kind === 'ready'}
            Authorize this device?
          {:else if approveState === 'done'}
            Authorized.
            <span class="text-muted-foreground">You can close this tab.</span>
          {:else if load.kind === 'already-approved'}
            Already used.
            <span class="text-muted-foreground"
              >Start a new session from your CLI.</span
            >
          {:else if load.kind === 'error'}
            Something went wrong.
            <span class="text-muted-foreground">{load.message}</span>
          {:else}
            <span class="text-muted-foreground">Loading…</span>
          {/if}
        </h1>
        {#if load.kind === 'ready' && approveState !== 'done'}
          <div class="mt-5">
            <code
              class="inline-block max-w-full break-all rounded-md border border-border/60 bg-neutral-900/40 px-2.5 py-1 font-mono text-[13px] text-foreground"
            >
              {load.session.deviceName}
            </code>
          </div>
          <p class="mt-4 text-[15px] leading-[1.7] text-muted-foreground">
            The CLI on this device will get a long-lived access to your account,
            and a copy of your private key so it can decrypt project secrets
            locally.
          </p>
        {/if}
      </div>

      {#if load.kind === 'ready' && approveState !== 'done'}
        {#if !keysAreSetUp}
          <div class="pl-1 text-sm leading-relaxed text-amber-500/90">
            You haven't set up a passphrase on this account yet — finish
            onboarding before authorizing a CLI.
          </div>
        {:else}
          <form class="space-y-3" onsubmit={onApprove}>
            <div class="relative">
              <input
                bind:this={passphraseInput}
                type={showPassphrase ? 'text' : 'password'}
                bind:value={passphrase}
                oninput={() => (error = null)}
                placeholder="Your passphrase"
                disabled={approveState === 'submitting'}
                autocomplete="current-password"
                required
                class="h-12 w-full rounded-lg border border-border/60 bg-neutral-900/40 pl-4 pr-12 text-base text-foreground placeholder:text-muted-foreground/50 transition-colors focus:border-primary/60 focus:bg-neutral-900/60 focus:outline-none disabled:opacity-60 md:text-[15px]"
              />
              <button
                type="button"
                tabindex="-1"
                class="absolute inset-y-0 right-0 flex cursor-pointer items-center justify-center px-3 text-muted-foreground hover:text-foreground"
                aria-label={showPassphrase ? 'Hide passphrase' : 'Show passphrase'}
                onclick={() => (showPassphrase = !showPassphrase)}
              >
                {#if showPassphrase}
                  <IconEyeOff class="size-4" />
                {:else}
                  <IconEye class="size-4" />
                {/if}
              </button>
            </div>

            {#if error}
              <div class="pl-1 text-xs text-destructive">{error}</div>
            {/if}

            <div class="flex items-center justify-between gap-2 pt-5">
              <button
                type="button"
                onclick={() => goto('/app/project')}
                disabled={approveState === 'submitting'}
                class="cursor-pointer text-sm text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={approveState === 'submitting' ||
                  passphrase.length === 0}
                class="inline-flex h-11 cursor-pointer items-center gap-2 rounded-lg bg-primary px-5 text-primary-foreground transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {#if approveState === 'submitting'}
                  <span
                    class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"
                  ></span>
                  Authorizing
                {:else}
                  Authorize
                  <CornerDownLeft class="hidden h-4 w-4 md:inline" />
                {/if}
              </button>
            </div>
          </form>
        {/if}
      {/if}

      {#if approveState === 'done'}
        <div class="mt-2 flex items-center gap-2 text-sm text-emerald-500/90">
          <Check class="size-4" />
          <span>Your CLI should report success in a moment.</span>
        </div>
      {/if}
    </div>
  </div>
{/if}
