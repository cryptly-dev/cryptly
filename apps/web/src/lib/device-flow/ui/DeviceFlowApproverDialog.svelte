<script lang="ts">
  import { Eye, EyeOff } from "lucide-svelte";
  import { AsymmetricCrypto } from "$lib/auth/asymmetric-crypto";
  import { decryptPrivateKey } from "$lib/auth/private-key";
  import {
    clearApproverMessage,
    deviceFlowApprover,
    sendApproverResponse,
  } from "$lib/device-flow/device-flow-approver.svelte";
  import Button from "$lib/ui/Button.svelte";
  import Dialog from "$lib/ui/Dialog.svelte";
  import IconButton from "$lib/ui/IconButton.svelte";

  let passphrase = $state("");
  let showPassphrase = $state(false);
  let processing = $state(false);
  let passphraseError = $state(false);

  const msg = $derived(deviceFlowApprover.lastMessage);

  $effect(() => {
    if (!msg) {
      passphrase = "";
      showPassphrase = false;
      passphraseError = false;
      processing = false;
    }
  });

  /** Checked against the server's current key, so a passphrase changed elsewhere counts. */
  async function verifyPassphrase(candidate: string): Promise<boolean> {
    try {
      await decryptPrivateKey(candidate);
      return true;
    } catch {
      return false;
    }
  }

  async function handleApprove() {
    const requesterId = msg?.requesterDeviceId;
    const pub = msg?.publicKey;
    if (!requesterId || typeof pub !== "string" || !passphrase || processing)
      return;
    processing = true;
    passphraseError = false;
    try {
      const ok = await verifyPassphrase(passphrase);
      if (!ok) {
        passphraseError = true;
        return;
      }
      const encryptedPassphrase = await AsymmetricCrypto.encrypt(
        passphrase,
        pub,
      );
      await sendApproverResponse(String(requesterId), {
        type: "approve",
        approved: true,
        encryptedPassphrase,
        timestamp: new Date().toISOString(),
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
        type: "approve",
        approved: false,
        timestamp: new Date().toISOString(),
      });
      clearApproverMessage();
    } finally {
      processing = false;
    }
  }
</script>

<Dialog
  open={msg?.type === "request"}
  title="Sign in request from another device"
  description="Share your passphrase with it to unlock it. It is encrypted for that device's one-time key before it leaves this browser."
  dismissible={false}
>
  {#if typeof msg?.pin === "string"}
    <div
      class="flex flex-col items-center gap-1 rounded-card bg-root px-2 py-3"
    >
      <p
        class="indent-[0.2em] mono text-[24px] leading-8 font-semibold tracking-[0.2em]"
      >
        {msg.pin}
      </p>
      <p class="text-[12.5px] text-fg3">
        Check that this PIN matches on your other device.
      </p>
    </div>
  {/if}

  <div class="flex flex-col gap-2">
    <div
      class="flex h-9 items-center gap-1 rounded-[10px] bg-field pr-1 pl-2.5 shadow-field focus-within:shadow-[inset_0_0_0_1px_var(--fg3)]"
    >
      <!-- svelte-ignore a11y_autofocus -->
      <input
        id="approver-pass"
        aria-label="Your passphrase"
        autofocus
        type={showPassphrase ? "text" : "password"}
        bind:value={passphrase}
        placeholder="Your passphrase"
        autocomplete="current-password"
        class="h-full min-w-0 flex-1 bg-transparent text-[16px] outline-none placeholder:text-ph md:text-[13px]"
        oninput={() => {
          if (passphraseError) passphraseError = false;
        }}
        onkeydown={(e) => {
          if (e.key === "Enter" && passphrase && !processing)
            void handleApprove();
        }}
      />
      <IconButton
        label={showPassphrase ? "Hide passphrase" : "Show passphrase"}
        onclick={() => {
          showPassphrase = !showPassphrase;
        }}
      >
        {#if showPassphrase}
          <EyeOff strokeWidth={1.75} />
        {:else}
          <Eye strokeWidth={1.75} />
        {/if}
      </IconButton>
    </div>
    {#if passphraseError}
      <p class="text-[12.5px] text-danger">Incorrect passphrase</p>
    {/if}
  </div>

  <div class="flex justify-end gap-2 pt-1">
    <Button onclick={() => void handleReject()} disabled={processing}
      >Reject</Button
    >
    <Button
      variant="primary"
      onclick={() => void handleApprove()}
      disabled={processing || !passphrase}>Approve</Button
    >
  </div>
</Dialog>
