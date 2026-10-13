<script lang="ts">
  import { page } from "$app/state";
  import {
    IconArrowRight,
    IconDevices,
    IconExclamationCircle,
    IconEye,
    IconEyeOff,
    IconSend,
  } from "@tabler/icons-svelte";
  import { fade } from "svelte/transition";
  import {
    attachDeviceFlowRequester,
    detachDeviceFlowRequester,
    deviceFlowRequester,
    requestUnlockFromDevice,
  } from "$lib/device-flow/device-flow-requester.svelte";
  import { auth, logout } from "$lib/stores/auth.svelte";
  import { hydrateMasterKey, keyAuth, unlock } from "$lib/stores/key.svelte";

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

{#if open}
  <div
    class="fixed inset-0 z-50 bg-black/80 backdrop-blur-[2px]"
    transition:fade={{ duration: 200 }}
  ></div>
  <div
    role="dialog"
    aria-modal="true"
    aria-labelledby="unlock-title"
    aria-describedby="unlock-description"
    class="fixed top-[15vh] left-1/2 z-50 grid max-h-[85vh] w-full max-w-[calc(100%-2rem)] -translate-x-1/2 gap-4 overflow-y-auto rounded-lg border bg-background p-6 shadow-lg sm:max-w-md"
    transition:fade={{ duration: 200 }}
  >
    <div class="relative flex flex-col gap-2 text-left">
      <h2 id="unlock-title" class="text-lg leading-none font-semibold">
        Unlock this browser
      </h2>
      <p id="unlock-description" class="text-sm text-muted-foreground">
        Enter your account passphrase.
      </p>
      <button
        type="button"
        class="absolute top-0 right-0 inline-flex h-8 cursor-pointer items-center justify-center gap-1.5 rounded-md px-3 text-sm font-medium transition-all hover:bg-neutral-800"
        onclick={() => void logout()}
      >
        Log out
      </button>
    </div>

    <form
      class="grid gap-2"
      onsubmit={(event) => {
        event.preventDefault();
        void handleUnlock();
      }}
    >
      <label for="unlock-pass" class="text-sm font-medium">Passphrase</label>
      <div
        class="flex items-stretch rounded-lg border border-border bg-background transition-colors focus-within:border-neutral-500"
      >
        <!-- svelte-ignore a11y_autofocus -->
        <input
          bind:this={inputEl}
          id="unlock-pass"
          autofocus
          type={showPassphrase ? "text" : "password"}
          bind:value={passphrase}
          placeholder="Enter your passphrase"
          autocomplete="current-password"
          class="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-base outline-none placeholder:text-muted-foreground/50 md:text-sm"
          oninput={() => {
            if (isError) isError = false;
          }}
        />
        <div class="flex items-center gap-0.5 pr-1">
          <button
            type="button"
            aria-label={showPassphrase ? "Hide passphrase" : "Show passphrase"}
            class="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            onclick={() => {
              showPassphrase = !showPassphrase;
            }}
          >
            {#if showPassphrase}
              <IconEyeOff class="size-4" />
            {:else}
              <IconEye class="size-4" />
            {/if}
          </button>
          <button
            type="submit"
            disabled={!passphrase || submitting}
            aria-label="Unlock"
            class="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <IconArrowRight class="size-4" />
          </button>
        </div>
      </div>

      {#if isError}
        <div
          class="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-2 text-sm text-destructive"
        >
          <IconExclamationCircle />
          <span>Incorrect passphrase</span>
        </div>
      {/if}
    </form>

    <div class="relative my-6">
      <div class="absolute inset-0 flex items-center">
        <div class="w-full border-t border-border"></div>
      </div>
      <div class="relative flex justify-center">
        <span
          class="bg-background px-3 text-xs tracking-wider text-muted-foreground uppercase"
          >OR</span
        >
      </div>
    </div>

    <section>
      <div class="mb-3 flex items-center gap-2">
        <IconDevices class="size-4 text-muted-foreground" />
        <span class="text-sm font-medium">Connected Devices</span>
      </div>

      {#if deviceFlowRequester.approvers.length === 0}
        <div
          class="relative overflow-hidden rounded-lg border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 p-4"
        >
          <div
            class="animate-shimmer absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent"
          ></div>
          <div class="relative flex items-start gap-3">
            <div class="mt-0.5 rounded-full bg-primary/20 p-2">
              <IconDevices class="size-4 text-primary" />
            </div>
            <div class="flex-1">
              <p class="mb-1 text-sm font-medium text-foreground">
                Searching for devices...
              </p>
              <p class="text-xs leading-relaxed text-muted-foreground">
                Open Cryptly on an already authenticated device and approve the
                unlock request from there. No passphrase typing needed.
              </p>
            </div>
          </div>
        </div>
      {:else}
        <div class="max-h-32 space-y-2 overflow-y-auto">
          {#each deviceFlowRequester.approvers as approver (approver.deviceId)}
            <div
              class="flex items-center justify-between rounded-lg border border-border/50 bg-gradient-to-br from-muted/50 to-muted/30 p-3 transition-all hover:from-muted/70 hover:to-muted/50"
            >
              <div class="flex items-center gap-3">
                <div class="rounded-full bg-primary/10 p-2">
                  <IconDevices class="size-3.5 text-primary" />
                </div>
                <span class="text-sm font-medium text-foreground"
                  >{approver.deviceName || "Unknown Device"}</span
                >
              </div>
              <button
                type="button"
                class="inline-flex h-8 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-md border border-neutral-700 bg-neutral-800 px-3 text-sm font-medium shadow-xs transition-all hover:bg-neutral-700 disabled:pointer-events-none disabled:opacity-50"
                onclick={() => void onRequestUnlock(approver.deviceId)}
                disabled={sendingUnlockRequest}
              >
                <IconSend class="mr-1.5 size-3" />
                Request
              </button>
            </div>
          {/each}
        </div>
        {#if deviceFlowRequester.unlockRequestPin}
          <div
            class="mt-3 rounded-lg border border-primary/20 bg-primary/10 p-3"
          >
            <p
              class="text-center font-mono text-2xl font-bold tracking-wider text-primary"
            >
              {deviceFlowRequester.unlockRequestPin}
            </p>
            <p class="mt-1 text-center text-xs text-muted-foreground">
              Verify this PIN matches on your other device
            </p>
          </div>
        {/if}
      {/if}
    </section>
  </div>
{/if}
