<script lang="ts">
  let { inviteId }: { inviteId: string } = $props();
</script>

<main class="grid min-h-screen place-items-center bg-base-200 px-4">
  <section class="w-full max-w-lg rounded-lg border border-base-300 bg-base-100 p-6 shadow-sm">
    <h1 class="text-2xl font-semibold">Accept invitation</h1>
    <p class="mt-2 text-sm text-base-content/70">Invitation {inviteId} will be handled by the invitations domain.</p>
    <button class="btn btn-primary mt-6" type="button">Accept</button>
  </section>
</main>
