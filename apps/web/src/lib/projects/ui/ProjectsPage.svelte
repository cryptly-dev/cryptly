<script lang="ts">
  import { Plus } from 'lucide-svelte';
</script>

<section class="grid gap-6">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-semibold">Projects</h1>
      <p class="text-sm text-base-content/70">Project list migration starts here.</p>
    </div>
    <button class="btn btn-primary btn-sm" type="button">
      <Plus size={16} />
      New project
    </button>
  </div>
  <div class="rounded-lg border border-dashed border-base-300 bg-base-100 p-8 text-sm text-base-content/70">
    Existing React project workflows will be rebuilt in this domain.
  </div>
</section>
