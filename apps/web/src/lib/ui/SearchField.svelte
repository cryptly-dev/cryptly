<script lang="ts">
  import { Search, X } from "lucide-svelte";
  import { cn } from "$lib/utils";
  import Kbd from "./Kbd.svelte";

  let {
    value = $bindable(""),
    placeholder,
    slashFocus = true,
    input = $bindable(),
    onkeydown,
    class: className,
  }: {
    value?: string;
    placeholder: string;
    /** Focus on "/" anywhere outside a text field, while this field is visible. */
    slashFocus?: boolean;
    input?: HTMLInputElement;
    onkeydown?: (event: KeyboardEvent) => void;
    class?: string;
  } = $props();

  function isTyping(target: EventTarget | null) {
    const el = target as HTMLElement | null;
    return Boolean(
      el &&
      (el.tagName === "INPUT" ||
        el.tagName === "TEXTAREA" ||
        el.tagName === "SELECT" ||
        el.isContentEditable),
    );
  }

  function onWindowKeydown(event: KeyboardEvent) {
    if (!slashFocus || event.key !== "/" || event.metaKey || event.ctrlKey)
      return;
    if (isTyping(event.target) || !input || input.offsetParent === null) return;
    if (document.querySelector("dialog[open]")) return;
    event.preventDefault();
    input.focus();
    input.select();
  }
</script>

<svelte:window onkeydown={onWindowKeydown} />

<label
  class={cn(
    "flex h-[30px] w-60 min-w-0 items-center gap-2 rounded-[10px] bg-field pr-1.5 pl-2 text-fg shadow-field focus-within:shadow-[inset_0_0_0_1px_var(--fg3)]",
    className,
  )}
>
  <Search class="size-3.5 shrink-0 text-fg3" />
  <input
    bind:this={input}
    bind:value
    type="text"
    aria-label={placeholder}
    {placeholder}
    autocomplete="off"
    spellcheck="false"
    data-1p-ignore
    data-lpignore="true"
    class="h-full min-w-0 flex-1 bg-transparent outline-none placeholder:text-ph"
    onkeydown={(event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        value = "";
        input?.blur();
      }
      onkeydown?.(event);
    }}
  />
  {#if value}
    <button
      type="button"
      aria-label="Clear"
      class="grid size-[18px] shrink-0 place-items-center rounded-[4px] text-fg3 hover:text-fg"
      onclick={() => {
        value = "";
        input?.focus();
      }}
    >
      <X class="size-3" />
    </button>
  {:else if slashFocus}
    <Kbd>/</Kbd>
  {/if}
</label>
