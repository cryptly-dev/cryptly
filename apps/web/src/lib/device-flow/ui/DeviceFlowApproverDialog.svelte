<script lang="ts">
  import { Check, Eye, EyeOff, Smartphone, X } from 'lucide-svelte';
  import { AsymmetricCrypto } from '$lib/auth/asymmetric-crypto';
  import { SymmetricCrypto } from '$lib/auth/symmetric-crypto';
  import {
    clearApproverMessage,
    deviceFlowApprover,
    sendApproverResponse
  } from '$lib/device-flow/device-flow-approver.svelte';
  import { auth } from '$lib/stores/auth.svelte';

  let passphrase = $state('');
  let showPassphrase = $state(false);
  let processing = $state(false);
  let passphraseError = $state(false);

  const msg = $derived(deviceFlowApprover.lastMessage);

  $effect(() => {
    if (!msg) {
      passphrase = '';
      showPassphrase = false;
      passphraseError = false;
      processing = false;
    }
  });

  async function verifyPassphrase(candidate: string): Promise<boolean> {
    const enc = auth.userData?.privateKeyEncrypted;
    if (!enc) return false;
    try {
      const base64Key = await SymmetricCrypto.deriveBase64KeyFromPassphrase(candidate);
      await SymmetricCrypto.decrypt(enc, base64Key);
      return true;
    } catch {
      return false;
    }
  }

  async function handleApprove() {
    const requesterId = msg?.requesterDeviceId;
    const pub = msg?.publicKey;
    if (!requesterId || typeof pub !== 'string' || !passphrase || processing) return;
    processing = true;
    passphraseError = false;
    try {
      const ok = await verifyPassphrase(passphrase);
      if (!ok) {
        passphraseError = true;
        return;
      }
      const encryptedPassphrase = await AsymmetricCrypto.encrypt(passphrase, pub);
      await sendApproverResponse(String(requesterId), {
        type: 'approve',
        approved: true,
        encryptedPassphrase,
        timestamp: new Date().toISOString()
      });
      clearApproverMessage();
    } finally {
      processing = false;
    }
  }

  async function handleReject() {
    const requesterId = msg?.requesterDeviceId;
    if (!requesterId || processing) return;
    processing = true;
    try {
      await sendApproverResponse(String(requesterId), {
        type: 'approve',
        approved: false,
        timestamp: new Date().toISOString()
      });
      clearApproverMessage();
    } finally {
      processing = false;
    }
  }
</script>

{#if msg?.type === 'request'}
  <div class="fixed inset-0 z-[60] grid place-items-center bg-black/80 p-4 backdrop-blur-sm">
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="device-flow-title"
      class="w-full max-w-md rounded-lg border border-border bg-background p-6 shadow-2xl"
    >
      <div class="mb-6 flex items-start gap-3">
        <div class="rounded-full bg-primary/10 p-2">
          <Smartphone class="size-6 text-primary" />
        </div>
        <div>
          <h2 id="device-flow-title" class="text-lg font-semibold tracking-tight">Device sign in request</h2>
          <p class="mt-1 text-sm text-muted-foreground">Another device is trying to sign in</p>
        </div>
      </div>

      {#if typeof msg.pin === 'string'}
        <div class="mb-4 rounded-lg border border-primary/20 bg-primary/10 p-4">
          <p class="text-center font-mono text-3xl font-bold tracking-wider text-primary">{msg.pin}</p>
          <p class="mt-2 text-center text-sm text-muted-foreground">
            Verify this PIN matches on your other device
          </p>
        </div>
      {/if}

      <div class="mb-4 rounded-lg border border-amber-500/20 bg-amber-500/10 p-4">
        <p class="text-sm text-amber-900 dark:text-amber-100">
          Enter your passphrase to share it with the requesting device. It is encrypted under that device's
          one-time key before it leaves this browser.
        </p>
      </div>

      <div class="grid gap-2">
        <label for="approver-pass" class="text-sm font-medium">Your passphrase</label>
        <div
          class="flex h-11 items-center rounded-lg border border-input bg-background ring-offset-background focus-within:border-primary/60"
        >
          <input
            id="approver-pass"
            type={showPassphrase ? 'text' : 'password'}
            bind:value={passphrase}
            placeholder="Enter your passphrase"
            autocomplete="current-password"
            class="min-w-0 flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground"
            onkeydown={(e) => {
              if (e.key === 'Enter' && passphrase && !processing) void handleApprove();
            }}
          />
          <button
            type="button"
            aria-label={showPassphrase ? 'Hide passphrase' : 'Show passphrase'}
            class="mr-2 inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground"
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
        </div>
        {#if passphraseError}
          <div class="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-2 text-sm text-destructive">
            Incorrect passphrase
          </div>
        {/if}
      </div>

      <div class="mt-6 flex gap-2">
        <button
          type="button"
          class="inline-flex flex-1 items-center justify-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium transition hover:bg-secondary"
          onclick={() => void handleReject()}
          disabled={processing}
        >
          <X class="size-4" />
          Reject
        </button>
        <button
          type="button"
          class="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
          onclick={() => void handleApprove()}
          disabled={processing || !passphrase}
        >
          <Check class="size-4" />
          Approve
        </button>
      </div>
    </div>
  </div>
{/if}
