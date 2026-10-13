<script lang="ts">
  import { TriangleAlert } from "lucide-svelte";
  import { tick } from "svelte";
  import { toast } from "svelte-sonner";
  import {
    changePassphrase,
    IncorrectPassphraseError,
  } from "$lib/auth/change-passphrase";
  import { auth, loadUserData } from "$lib/stores/auth.svelte";
  import Button from "$lib/ui/Button.svelte";
  import Dialog from "$lib/ui/Dialog.svelte";
  import PassphraseField from "./PassphraseField.svelte";

  let { open = $bindable(false) }: { open?: boolean } = $props();

  let current = $state("");
  let next = $state("");
  let confirm = $state("");
  let error = $state<"incorrect" | "mismatch" | "same" | "failed" | null>(null);
  let submitting = $state(false);
  let currentInput: HTMLInputElement | undefined = $state();
  let confirmInput: HTMLInputElement | undefined = $state();

  /** Drop the passphrases as soon as the dialog closes. */
  function reset() {
    current = "";
    next = "";
    confirm = "";
    error = null;
    submitting = false;
  }

  async function focusSelect(input: HTMLInputElement | undefined) {
    await tick();
    input?.focus();
    input?.select();
  }

  async function onsubmit(event: SubmitEvent) {
    event.preventDefault();
    const jwt = auth.jwtToken;
    if (submitting || !jwt || !current || !next) return;
    if (next !== confirm) {
      error = "mismatch";
      void focusSelect(confirmInput);
      return;
    }
    if (next === current) {
      error = "same";
      return;
    }
    submitting = true;
    error = null;
    try {
      await changePassphrase(jwt, current, next);
    } catch (e) {
      submitting = false;
      if (e instanceof IncorrectPassphraseError) {
        error = "incorrect";
        void focusSelect(currentInput);
      } else {
        error = "failed";
      }
      return;
    }
    open = false;
    toast.success("Passphrase changed");
    void loadUserData();
  }
</script>

<Dialog
  bind:open
  title="Change passphrase"
  dismissible={!submitting}
  onclose={reset}
>
  <form class="flex flex-col gap-3" {onsubmit}>
    <p class="-mt-3 mb-1 text-fg3">
      Other browsers and <span class="mono text-fg2">cryptly login</span> will ask
      for the new passphrase next time. This browser stays unlocked.
    </p>
    <!-- Lets password managers file the new passphrase under this account. -->
    <input
      type="text"
      name="username"
      autocomplete="username"
      value={auth.userData?.email ?? ""}
      readonly
      hidden
    />
    <PassphraseField
      label="Current passphrase"
      bind:value={current}
      bind:input={currentInput}
      autocomplete="current-password"
      autofocus
      required
      disabled={submitting}
      invalid={error === "incorrect"}
      oninput={() => (error = null)}
    />
    {#if error === "incorrect"}
      <p class="-mt-1.5 text-[12.5px] text-danger">Incorrect passphrase.</p>
    {/if}
    <PassphraseField
      label="New passphrase"
      bind:value={next}
      autocomplete="new-password"
      required
      disabled={submitting}
      oninput={() => (error = null)}
    />
    <PassphraseField
      label="Confirm new passphrase"
      bind:value={confirm}
      bind:input={confirmInput}
      autocomplete="new-password"
      required
      disabled={submitting}
      invalid={error === "mismatch"}
      oninput={() => (error = null)}
    />
    {#if error === "mismatch"}
      <p class="-mt-1.5 text-[12.5px] text-danger">Passphrases don't match.</p>
    {:else if error === "same"}
      <p class="-mt-1.5 text-[12.5px] text-danger">
        The new passphrase is the same as the current one.
      </p>
    {:else if error === "failed"}
      <p class="-mt-1.5 text-[12.5px] text-danger">
        Couldn't change the passphrase. Try again.
      </p>
    {/if}
    <p
      class="flex items-start gap-2 text-[12.5px] text-[color-mix(in_oklab,var(--warning)_70%,var(--fg3))]"
    >
      <TriangleAlert class="mt-[3px] size-3.5 shrink-0" strokeWidth={1.75} />
      If you forget it, the account has to be reset.
    </p>
    <div class="mt-1 flex justify-end gap-1.5">
      <Button disabled={submitting} onclick={() => (open = false)}>
        Cancel
      </Button>
      <Button
        type="submit"
        variant="primary"
        disabled={submitting || !current || !next || !confirm}
      >
        {submitting ? "Changing…" : "Change passphrase"}
      </Button>
    </div>
  </form>
</Dialog>
