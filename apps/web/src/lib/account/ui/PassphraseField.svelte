<script lang="ts">
  import { Eye, EyeOff } from "lucide-svelte";
  import type { HTMLInputAttributes } from "svelte/elements";
  import IconButton from "$lib/ui/IconButton.svelte";
  import { cn } from "$lib/utils";

  /** Labelled password input with a show/hide toggle. */
  let {
    label,
    value = $bindable(""),
    input = $bindable(),
    invalid = false,
    ...rest
  }: {
    label: string;
    value?: string;
    input?: HTMLInputElement;
    invalid?: boolean;
  } & Omit<HTMLInputAttributes, "value" | "type" | "class" | "id"> = $props();

  const id = $props.id();
  let shown = $state(false);
</script>

<div class="flex flex-col gap-1.5">
  <label for={id} class="text-[12.5px] font-medium text-fg2">{label}</label>
  <div
    class={cn(
      "flex h-[30px] items-center gap-1 rounded-[10px] bg-field pr-1 pl-2.5",
      invalid
        ? "shadow-[inset_0_0_0_1px_var(--danger)]"
        : "shadow-field focus-within:shadow-[inset_0_0_0_1px_var(--fg3)]",
    )}
  >
    <input
      {id}
      bind:this={input}
      bind:value
      type={shown ? "text" : "password"}
      spellcheck="false"
      autocapitalize="off"
      aria-invalid={invalid}
      class="h-full min-w-0 flex-1 bg-transparent outline-none placeholder:text-ph"
      {...rest}
    />
    <IconButton
      size="sm"
      label={shown ? "Hide passphrase" : "Show passphrase"}
      onclick={() => (shown = !shown)}
    >
      {#if shown}
        <EyeOff strokeWidth={1.75} />
      {:else}
        <Eye strokeWidth={1.75} />
      {/if}
    </IconButton>
  </div>
</div>
