<script lang="ts">
  import { untrack } from "svelte";
  import { toast } from "svelte-sonner";
  import {
    DEFAULT_PROJECT_SETTINGS,
    normalizeProjectSettings,
    type ProjectRevealOn,
  } from "$lib/auth/domain/project-settings";
  import { createEncryptedProject } from "$lib/projects/create-project";
  import { auth } from "$lib/stores/auth.svelte";
  import Button from "$lib/ui/Button.svelte";
  import Dialog from "$lib/ui/Dialog.svelte";
  import Segmented from "$lib/ui/Segmented.svelte";

  let { open = $bindable(false) }: { open?: boolean } = $props();

  const VALUES = [
    {
      value: "hover",
      label: "Peek",
      note: "First and last 4 characters. Never the length.",
    },
    { value: "never", label: "Hidden", note: "Always fully masked." },
    { value: "always", label: "Visible", note: "The full value." },
  ] as const satisfies readonly {
    value: ProjectRevealOn;
    label: string;
    note: string;
  }[];

  let name = $state("");
  let revealOn = $state<ProjectRevealOn>(DEFAULT_PROJECT_SETTINGS.revealOn);
  let creating = $state(false);

  const note = $derived(VALUES.find((v) => v.value === revealOn)?.note);

  // Every open starts from the user's last choice.
  $effect(() => {
    if (!open) return;
    untrack(() => {
      name = "";
      revealOn = normalizeProjectSettings(
        auth.userData?.projectCreationDefaults,
      ).revealOn;
    });
  });

  async function create(event: SubmitEvent) {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || creating) return;
    creating = true;
    try {
      await createEncryptedProject({
        name: trimmed,
        settings: normalizeProjectSettings({ revealOn }),
      });
      open = false;
    } catch {
      toast.error("Could not create project");
    } finally {
      creating = false;
    }
  }
</script>

<Dialog bind:open title="New project" dismissible={!creating}>
  <form class="flex flex-col gap-4" onsubmit={create}>
    <label class="flex flex-col gap-1.5">
      <span class="text-[12.5px] font-[550]">Name</span>
      <!-- svelte-ignore a11y_autofocus -->
      <input
        bind:value={name}
        autofocus
        required
        maxlength="200"
        placeholder="checkout-api"
        autocomplete="off"
        spellcheck="false"
        data-1p-ignore
        disabled={creating}
        class="h-[30px] rounded-[10px] bg-field px-2.5 text-[16px] shadow-field outline-none placeholder:text-ph focus:shadow-[inset_0_0_0_1px_var(--fg3)] disabled:opacity-60 md:text-[13px]"
      />
    </label>
    <div class="flex flex-col gap-1.5">
      <span class="text-[12.5px] font-[550]">Values</span>
      <div class="flex flex-col items-start gap-1.5">
        <Segmented
          options={VALUES}
          bind:value={revealOn}
          label="Values"
          disabled={creating}
        />
        <span class="text-[12.5px] text-fg3">{note}</span>
      </div>
    </div>
    <div class="flex justify-end gap-2 pt-1">
      <Button variant="ghost" disabled={creating} onclick={() => (open = false)}
        >Cancel</Button
      >
      <Button
        type="submit"
        variant="primary"
        disabled={!name.trim() || creating}
        >{creating ? "Creating…" : "Create project"}</Button
      >
    </div>
  </form>
</Dialog>
