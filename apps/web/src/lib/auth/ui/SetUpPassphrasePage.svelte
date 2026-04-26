<script lang="ts">
  import { goto } from '$app/navigation';
  import { IconEye, IconEyeOff } from '@tabler/icons-svelte';
  import { AlertTriangle, CornerDownLeft } from 'lucide-svelte';
  import { onMount, tick } from 'svelte';
  import { animate } from 'motion';
  import { auth, logout } from '$lib/stores/auth.svelte';
  import { setUpPassphrase } from '$lib/stores/key.svelte';

  let pass1 = $state('');
  let pass2 = $state('');
  let showPass1 = $state(false);
  let showPass2 = $state(false);
  let submitting = $state(false);
  let showMismatch = $state(false);
  let rootEl = $state<HTMLElement | null>(null);

  let input1 = $state<HTMLInputElement | null>(null);

  const shouldSetUpPassphrase = $derived(
    auth.userData !== null &&
      Boolean(auth.userData) &&
      (!auth.userData.publicKey || !auth.userData.privateKeyEncrypted)
  );

  onMount(() => {
    void tick().then(() => input1?.focus());
    if (rootEl) {
      void animate(rootEl, { opacity: [0, 1], y: [14, 0] }, { duration: 0.55, ease: [0, 0.55, 0.45, 1] });
    }
  });

  $effect(() => {
    if (!auth.jwtToken) {
      void goto('/app/login', { replaceState: true });
      return;
    }
    if (!shouldSetUpPassphrase) {
      void goto('/app/project', { replaceState: true });
    }
  });

  const passwordsMatch = $derived(pass1.length > 0 && pass1 === pass2);

  async function onSubmit(e: Event) {
    e.preventDefault();
    if (submitting || pass1.length === 0) return;
    if (!passwordsMatch) {
      showMismatch = true;
      return;
    }
    submitting = true;
    try {
      await setUpPassphrase(pass1);
    } catch {
      submitting = false;
    }
  }
</script>

<div class="flex min-h-screen items-center justify-center bg-background p-8">
  <div bind:this={rootEl} class="w-full max-w-md" style="opacity:0;transform:translateY(14px)">
    <div class="mb-10">
      <div class="mb-5 text-[11px] uppercase tracking-[0.22em] text-muted-foreground/60">New account</div>
      <h1 class="text-[34px] font-semibold leading-[1.05] tracking-tight text-foreground md:text-[40px]">
        Set your{' '}
        <span class="text-muted-foreground">passphrase.</span>
      </h1>
      <p class="mt-5 text-[15px] leading-[1.7] text-muted-foreground">
        Used to encrypt your account. You'll be asked for it on any new device.
      </p>
    </div>

    <form class="space-y-3" onsubmit={onSubmit}>
      <div class="relative">
        <input
          bind:this={input1}
          type={showPass1 ? 'text' : 'password'}
          bind:value={pass1}
          oninput={() => (showMismatch = false)}
          placeholder="Passphrase"
          disabled={submitting}
          autocomplete="new-password"
          required
          class="h-12 w-full rounded-lg border border-border/60 bg-neutral-900/40 pl-4 pr-12 text-base text-foreground placeholder:text-muted-foreground/50 transition-colors focus:border-primary/60 focus:bg-neutral-900/60 focus:outline-none disabled:opacity-60 md:text-[15px]"
        />
        <button
          type="button"
          tabindex="-1"
          class="absolute inset-y-0 right-0 flex cursor-pointer items-center justify-center px-3 text-muted-foreground hover:text-foreground"
          aria-label={showPass1 ? 'Hide passphrase' : 'Show passphrase'}
          onclick={() => (showPass1 = !showPass1)}
        >
          {#if showPass1}
            <IconEyeOff class="size-4" />
          {:else}
            <IconEye class="size-4" />
          {/if}
        </button>
      </div>

      <div class="relative">
        <input
          type={showPass2 ? 'text' : 'password'}
          bind:value={pass2}
          oninput={() => (showMismatch = false)}
          placeholder="Confirm passphrase"
          disabled={submitting}
          autocomplete="new-password"
          required
          class="h-12 w-full rounded-lg border border-border/60 bg-neutral-900/40 pl-4 pr-12 text-base text-foreground placeholder:text-muted-foreground/50 transition-colors focus:border-primary/60 focus:bg-neutral-900/60 focus:outline-none disabled:opacity-60 md:text-[15px]"
        />
        <button
          type="button"
          tabindex="-1"
          class="absolute inset-y-0 right-0 flex cursor-pointer items-center justify-center px-3 text-muted-foreground hover:text-foreground"
          aria-label={showPass2 ? 'Hide passphrase' : 'Show passphrase'}
          onclick={() => (showPass2 = !showPass2)}
        >
          {#if showPass2}
            <IconEyeOff class="size-4" />
          {:else}
            <IconEye class="size-4" />
          {/if}
        </button>
      </div>

      {#if showMismatch && !passwordsMatch}
        <div class="pl-1 text-xs text-destructive">Passphrases don't match.</div>
      {/if}

      <div class="flex items-start gap-2 pl-1 pt-2 text-[12px] leading-relaxed text-amber-500/90">
        <AlertTriangle class="mt-0.5 size-3.5 flex-shrink-0" />
        <span>Can't be recovered. If you forget it, the account has to be reset.</span>
      </div>

      <div class="flex items-center justify-between gap-2 pt-5">
        <button
          type="button"
          disabled={submitting}
          class="cursor-pointer text-sm text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
          onclick={() => void logout()}
        >
          Log out
        </button>
        <button
          type="submit"
          disabled={submitting || pass1.length === 0}
          class="inline-flex h-11 cursor-pointer items-center gap-2 rounded-lg bg-primary px-5 text-primary-foreground transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {#if submitting}
            <span class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"
            ></span>
            Setting up
          {:else}
            Set passphrase
            <CornerDownLeft class="hidden h-4 w-4 md:inline" />
          {/if}
        </button>
      </div>
    </form>
  </div>
</div>
