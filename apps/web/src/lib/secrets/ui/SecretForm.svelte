<script lang="ts">
  import { onMount, untrack } from "svelte";
  import { KEY_PATTERN, parseEnv } from "$lib/secrets/env-doc";
  import Button from "$lib/ui/Button.svelte";

  /** Inline add / edit form for one secret. Enter saves, Shift+Enter adds a line, Esc cancels. */
  let {
    initialKey = "",
    initialValue = "",
    taken,
    onsubmit,
    oncancel,
  }: {
    initialKey?: string;
    initialValue?: string;
    /** Keys already used elsewhere in the document, for the duplicate warning. */
    taken: ReadonlySet<string>;
    onsubmit: (key: string, value: string) => void;
    oncancel: () => void;
  } = $props();

  // The form edits a copy: later prop changes must not overwrite what the user typed.
  const initial = untrack(() => ({ key: initialKey, value: initialValue }));
  const editing = initial.key !== "";
  let key = $state(initial.key);
  let value = $state(initial.value);
  let tried = $state(false);
  let keyEl: HTMLInputElement | undefined = $state();
  let valueEl: HTMLTextAreaElement | undefined = $state();

  const name = $derived(key.trim());
  const error = $derived(
    name && !KEY_PATTERN.test(name)
      ? "Letters, digits, _ . - only, not starting with a digit"
      : tried && !name
        ? "Key is required"
        : null,
  );
  const duplicate = $derived(name !== initial.key && taken.has(name));

  onMount(() => {
    if (!editing || !valueEl) return keyEl?.focus();
    valueEl.focus();
    valueEl.setSelectionRange(value.length, value.length);
  });

  function submit() {
    tried = true;
    if (!name || error) return keyEl?.focus();
    onsubmit(name, value);
  }

  function onkeydown(event: KeyboardEvent, field: "key" | "value") {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      oncancel();
    } else if (event.key === "Enter" && !event.shiftKey && !event.isComposing) {
      event.preventDefault();
      if (field === "key" && !editing && !value) valueEl?.focus();
      else submit();
    }
  }

  /** Pasting a whole `KEY=value` line into the key field fills both fields. */
  function onKeyPaste(event: ClipboardEvent) {
    if (key || value) return;
    const [secret, ...more] = parseEnv(
      event.clipboardData?.getData("text/plain") ?? "",
    ).secrets;
    if (!secret || more.length) return;
    event.preventDefault();
    key = secret.key;
    value = secret.value;
    valueEl?.focus();
  }

  const field =
    "mono w-full rounded-row bg-field px-1 text-[12.5px] text-fg shadow-field outline-none placeholder:text-ph focus:shadow-[inset_0_0_0_1px_var(--fg3)]";
</script>

<div
  class="flex flex-col gap-1.5 py-1"
  role="group"
  aria-label={editing ? `Edit ${initialKey}` : "New secret"}
>
  <input
    bind:this={keyEl}
    bind:value={key}
    class="{field} h-[26px]"
    placeholder="KEY"
    aria-label="Key"
    aria-invalid={Boolean(error)}
    autocomplete="off"
    autocapitalize="off"
    spellcheck="false"
    data-1p-ignore
    data-lpignore="true"
    onkeydown={(event) => onkeydown(event, "key")}
    onpaste={onKeyPaste}
  />
  <!-- Never spellchecked or autofilled: browsers may send that text to a remote service. -->
  <textarea
    bind:this={valueEl}
    bind:value
    class="{field} [field-sizing:content] max-h-60 min-h-[26px] resize-none py-[3px] leading-5 break-all"
    rows="1"
    placeholder="Value"
    aria-label="Value"
    autocomplete="off"
    autocapitalize="off"
    spellcheck="false"
    data-1p-ignore
    data-lpignore="true"
    onkeydown={(event) => onkeydown(event, "value")}
  ></textarea>
  <div class="flex min-h-[26px] items-center gap-1.5">
    {#if error}
      <span class="min-w-0 truncate text-[12px] text-danger">{error}</span>
    {:else if duplicate}
      <span class="min-w-0 truncate text-[12px] text-warning"
        >{name} already exists</span
      >
    {/if}
    <Button variant="ghost" size="sm" class="ml-auto" onclick={oncancel}>
      Cancel <kbd class="mono text-[11px] text-faint">esc</kbd>
    </Button>
    <Button size="sm" onclick={submit}>
      Done <kbd class="mono text-[11px] text-fg3">↵</kbd>
    </Button>
  </div>
</div>
