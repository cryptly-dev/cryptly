<script lang="ts">
  import { CircleCheck, CircleX } from "lucide-svelte";
  import GitHubIcon from "$lib/shared/ui/GitHubIcon.svelte";

  let { ok, closeToast }: { ok: boolean; closeToast?: () => void } = $props();
</script>

<div class="w-fit rounded-lg border border-border bg-popover p-4 shadow-lg">
  <div class="flex items-center gap-4">
    {#if ok}
      <CircleCheck class="size-5 shrink-0 text-green-600 dark:text-green-400" />
    {:else}
      <CircleX class="size-5 shrink-0 text-red-600 dark:text-red-400" />
    {/if}
    <div class="flex items-center gap-2 whitespace-nowrap text-foreground">
      <span>{ok ? "Synced with" : "Failed to sync with"}</span>
      <span
        class="inline-flex items-center gap-1.5 rounded bg-secondary/50 px-2 py-0.5 text-sm"
      >
        <GitHubIcon class="size-4" />
        GitHub
      </span>
    </div>
    <button
      type="button"
      class="shrink-0 text-foreground/50 transition-colors hover:text-foreground"
      aria-label="Close"
      onclick={() => closeToast?.()}
    >
      ✕
    </button>
  </div>
</div>
