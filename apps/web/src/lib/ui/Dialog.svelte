<script lang="ts">
  import type { Snippet } from "svelte";
  import { X } from "lucide-svelte";
  import { cn } from "$lib/utils";

  /** Modal on the native <dialog>: focus trap, Esc and inert background come from the browser. */
  let {
    open = $bindable(false),
    title,
    description,
    dismissible = true,
    bare = false,
    onclose,
    class: className,
    children,
  }: {
    open?: boolean;
    title: string;
    description?: string;
    /** False blocks Esc, backdrop clicks and the close button (e.g. while saving). */
    dismissible?: boolean;
    /** Render children without the title header and padding (the title stays the accessible name). */
    bare?: boolean;
    onclose?: () => void;
    class?: string;
    children: Snippet;
  } = $props();

  let dialog: HTMLDialogElement | undefined = $state();

  $effect(() => {
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  });

  function close() {
    if (dismissible) open = false;
  }

  // A press that starts inside (e.g. selecting text) and ends on the backdrop is not a backdrop click.
  let pressedBackdrop = false;
</script>

<dialog
  bind:this={dialog}
  aria-label={title}
  class={cn(
    "m-auto w-[min(440px,calc(100%-2rem))] max-w-none rounded-[18px] bg-elev p-0 font-ui text-[13px] leading-5 font-[450] text-fg shadow-elev backdrop:bg-black/50",
    className,
  )}
  oncancel={(event) => {
    event.preventDefault();
    close();
  }}
  onclose={() => {
    open = false;
    onclose?.();
  }}
  onpointerdown={(event) => (pressedBackdrop = event.target === dialog)}
  onclick={(event) => {
    if (event.target === dialog && pressedBackdrop) close();
  }}
>
  {#if open && bare}
    {@render children()}
  {:else if open}
    <div class="flex flex-col gap-4 p-5">
      <header class="flex items-start gap-3">
        <div class="min-w-0 flex-1">
          <h2 class="text-[15px] font-semibold">{title}</h2>
          {#if description}
            <p class="mt-1 text-fg3">{description}</p>
          {/if}
        </div>
        {#if dismissible}
          <button
            type="button"
            aria-label="Close"
            class="-mt-1 -mr-1 grid size-7 shrink-0 place-items-center rounded-lg text-fg3 hover:bg-elev-hover hover:text-fg"
            onclick={close}
          >
            <X class="size-4" />
          </button>
        {/if}
      </header>
      {@render children()}
    </div>
  {/if}
</dialog>
