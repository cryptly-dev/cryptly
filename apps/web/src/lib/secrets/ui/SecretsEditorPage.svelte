<script lang="ts">
  let { projectId }: { projectId: string } = $props();
</script>

<section class="grid gap-4">
  <div>
    <h1 class="text-2xl font-semibold">Project {projectId}</h1>
    <p class="text-sm text-base-content/70">Encrypted secrets editor placeholder.</p>
  </div>
  <textarea class="textarea textarea-bordered min-h-80 font-mono" placeholder="KEY=value"></textarea>
</section>
