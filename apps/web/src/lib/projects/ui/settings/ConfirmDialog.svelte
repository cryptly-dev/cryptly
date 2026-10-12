<script lang="ts">
  import { tick } from "svelte";
  import { toast } from "svelte-sonner";
  import Button from "$lib/ui/Button.svelte";
  import Dialog from "$lib/ui/Dialog.svelte";

  /**
   * Destructive confirmation. Closes when `onconfirm` resolves; toasts `error` when it throws.
   * The typed-confirmation field is focused after the flush, once showModal() has run.
   */
  let {
    open = $bindable(false),
    title,
    description,
    confirmLabel,
    error,
    confirmText,
    onconfirm,
  }: {
    open?: boolean;
    title: string;
    description: string;
    confirmLabel: string;
    error: string;
    /** When set, the button stays disabled until this exact text is typed. */
    confirmText?: string;
    onconfirm: () => Promise<unknown>;
  } = $props();

  let busy = $state(false);
  let typed = $state("");
  const ready = $derived(!confirmText || typed === confirmText);

  async function confirm(event: SubmitEvent) {
    event.preventDefault();
    if (busy || !ready) return;
    busy = true;
    try {
      await onconfirm();
      open = false;
    } catch {
      toast.error(error);
    } finally {
      busy = false;
    }
  }
</script>

<Dialog
  bind:open
  {title}
  {description}
  dismissible={!busy}
  onclose={() => (typed = "")}
>
  <form class="flex flex-col gap-4" onsubmit={confirm}>
    {#if confirmText}
      <label class="flex flex-col gap-1.5">
        <span class="text-fg3"
          >Type <span class="font-medium text-fg">{confirmText}</span> to confirm</span
        >
        <input
          bind:value={typed}
          {@attach (input) => void tick().then(() => input.focus())}
          autocomplete="off"
          spellcheck="false"
          data-1p-ignore
          class="h-[34px] rounded-[10px] bg-field px-2.5 shadow-field outline-none placeholder:text-ph focus:shadow-[inset_0_0_0_1px_var(--fg3)]"
        />
      </label>
    {/if}
    <div class="flex justify-end gap-2">
      <Button variant="ghost" disabled={busy} onclick={() => (open = false)}
        >Cancel</Button
      >
      <Button type="submit" variant="danger" disabled={busy || !ready}
        >{confirmLabel}</Button
      >
    </div>
  </form>
</Dialog>
