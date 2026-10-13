<script lang="ts">
  import { page } from "$app/state";
  import { Eye, EyeOff, Laptop, Send } from "lucide-svelte";
  import {
    attachDeviceFlowRequester,
    detachDeviceFlowRequester,
    deviceFlowRequester,
    requestUnlockFromDevice,
  } from "$lib/device-flow/device-flow-requester.svelte";
  import { auth, logout } from "$lib/stores/auth.svelte";
  import { hydrateMasterKey, keyAuth, unlock } from "$lib/stores/key.svelte";
  import Button from "$lib/ui/Button.svelte";
  import Dialog from "$lib/ui/Dialog.svelte";
  import IconButton from "$lib/ui/IconButton.svelte";

  let passphrase = $state("");
  let showPassphrase = $state(false);
  let submitting = $state(false);
  let isError = $state(false);
  let sendingUnlockRequest = $state(false);
  let inputEl: HTMLInputElement | undefined = $state();

  const keysAreSetUp = $derived(
    Boolean(auth.userData?.publicKey && auth.userData?.privateKeyEncrypted),
  );
  const isAppUnlockRoute = $derived(
    page.url.pathname.startsWith("/app") &&
      !page.url.pathname.startsWith("/app/login") &&
      !page.url.pathname.startsWith("/app/callbacks/"),
  );
  const open = $derived(
    Boolean(
      isAppUnlockRoute &&
      auth.jwtToken &&
      keysAreSetUp &&
      keyAuth.masterKeyHydrated &&
      !keyAuth.hasMasterKey,
    ),
  );

  $effect(() => {
    if (open) return;
    passphrase = "";
    showPassphrase = false;
    submitting = false;
    isError = false;
  });

  $effect(() => {
    if (
      isAppUnlockRoute &&
      auth.jwtToken &&
      keysAreSetUp &&
      !keyAuth.masterKeyHydrated
    ) {
      void hydrateMasterKey();
    }
  });

  $effect(() => {
    if (!open) {
      detachDeviceFlowRequester();
      return;
    }
    attachDeviceFlowRequester();
  });

  async function handleUnlock() {
    if (!passphrase || submitting) return;
    submitting = true;
    isError = false;
    try {
      await unlock(passphrase);
      passphrase = "";
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

  async function onRequestUnlock(deviceId: string) {
    if (sendingUnlockRequest) return;
    sendingUnlockRequest = true;
    try {
      await requestUnlockFromDevice(deviceId);
    } finally {
      setTimeout(() => {
        sendingUnlockRequest = false;
      }, 1000);
    }
  }
</script>

<Dialog
  {open}
  title="Unlock this browser"
  description="Enter your account passphrase."
  dismissible={false}
>
  <form
    class="flex flex-col gap-2"
    onsubmit={(event) => {
      event.preventDefault();
      void handleUnlock();
    }}
  >
    <div
      class="flex h-9 items-center gap-1 rounded-[10px] bg-field pr-1 pl-2.5 shadow-field focus-within:shadow-[inset_0_0_0_1px_var(--fg3)]"
    >
      <!-- svelte-ignore a11y_autofocus -->
      <input
        bind:this={inputEl}
        id="unlock-pass"
        aria-label="Passphrase"
        autofocus
        type={showPassphrase ? "text" : "password"}
        bind:value={passphrase}
        placeholder="Passphrase"
        autocomplete="current-password"
        class="h-full min-w-0 flex-1 bg-transparent text-[16px] outline-none placeholder:text-ph md:text-[13px]"
        oninput={() => {
          if (isError) isError = false;
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
    {#if isError}
      <p class="text-[12.5px] text-danger">Incorrect passphrase</p>
    {/if}
    <div class="mt-2 flex items-center justify-between gap-2">
      <Button variant="ghost" class="-ml-0.5" onclick={() => void logout()}
        >Log out</Button
      >
      <Button
        type="submit"
        variant="primary"
        disabled={!passphrase || submitting}
        >{submitting ? "Unlocking…" : "Unlock"}</Button
      >
    </div>
  </form>

  <section
    class="flex flex-col gap-1.5 rounded-well bg-root p-1.5"
    aria-labelledby="unlock-devices"
  >
    <header class="flex h-7 items-center gap-2 pl-2.5">
      <Laptop class="size-3.5 text-fg3" strokeWidth={1.75} />
      <h3 id="unlock-devices" class="text-[12.5px] font-[550]">
        Or approve from another device
      </h3>
    </header>
    <div class="rounded-card bg-s100 p-1.5 shadow-card">
      {#if deviceFlowRequester.approvers.length === 0}
        <p class="px-1 py-1 text-[12.5px] text-fg3">
          Looking for your signed-in devices. Open Cryptly on one of them and
          approve the request there, no passphrase typing needed.
        </p>
      {:else}
        <div class="flex max-h-32 flex-col overflow-y-auto">
          {#each deviceFlowRequester.approvers as approver (approver.deviceId)}
            <div class="flex h-9 items-center gap-2 px-1">
              <Laptop class="size-3.5 shrink-0 text-fg3" strokeWidth={1.75} />
              <span class="min-w-0 flex-1 truncate"
                >{approver.deviceName || "Unknown device"}</span
              >
              <Button
                size="sm"
                onclick={() => void onRequestUnlock(approver.deviceId)}
                disabled={sendingUnlockRequest}
              >
                <Send strokeWidth={1.75} />Request
              </Button>
            </div>
          {/each}
        </div>
        {#if deviceFlowRequester.unlockRequestPin}
          <div
            class="mt-1.5 flex flex-col items-center gap-1 rounded-row bg-s150 px-2 py-3 shadow-[inset_0_0_0_0.5px_var(--s150-border)]"
          >
            <p
              class="indent-[0.2em] mono text-[24px] leading-8 font-semibold tracking-[0.2em]"
            >
              {deviceFlowRequester.unlockRequestPin}
            </p>
            <p class="text-[12.5px] text-fg3">
              Check that this PIN matches on your other device.
            </p>
          </div>
        {/if}
      {/if}
    </div>
  </section>
</Dialog>
