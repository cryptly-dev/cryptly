<script lang="ts" module>
  import type { ProjectRevealOn } from "$lib/auth/domain/project-settings";

  /** The project "Values" setting: how secret values show in the app (`settings.revealOn`). */
  export const REVEAL_ON_OPTIONS = [
    {
      key: "hover",
      label: "Peek",
      description: "First and last 4 characters. Never the length.",
    },
    {
      key: "never",
      label: "Hidden",
      description: "Always masked. Copy still works.",
    },
    {
      key: "always",
      label: "Visible",
      description: "Full values on screen.",
    },
  ] as const satisfies readonly {
    key: ProjectRevealOn;
    label: string;
    description: string;
  }[];

  export function revealOnOption(value: ProjectRevealOn) {
    return (
      REVEAL_ON_OPTIONS.find((option) => option.key === value) ??
      REVEAL_ON_OPTIONS[0]
    );
  }
</script>

<script lang="ts">
  import Segmented from "$lib/ui/Segmented.svelte";

  let {
    value = $bindable(),
    disabled = false,
    onchange,
  }: {
    value: ProjectRevealOn;
    disabled?: boolean;
    onchange?: (value: ProjectRevealOn) => void;
  } = $props();

  const options = REVEAL_ON_OPTIONS.map((option) => ({
    value: option.key,
    label: option.label,
  }));
</script>

<Segmented label="Values" {options} bind:value {disabled} {onchange} />
