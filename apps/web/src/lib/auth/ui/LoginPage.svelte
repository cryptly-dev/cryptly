<script lang="ts">
  import { Github, Mail } from 'lucide-svelte';
  import { publicEnv } from '$lib/shared/shared.api';
</script>

<main class="grid min-h-screen place-items-center bg-base-200 px-4">
  <section class="w-full max-w-md rounded-lg border border-base-300 bg-base-100 p-6 shadow-sm">
    <h1 class="text-2xl font-semibold">Log in to Cryptly</h1>
    <p class="mt-2 text-sm text-base-content/70">OAuth and local login will be wired through the new typed SDK layer.</p>
    <div class="mt-6 grid gap-3">
      <a class="btn btn-outline w-full" href={`${publicEnv.apiUrl}/auth/github/login`}>
        <Github size={18} />
        Continue with GitHub
      </a>
      <a class="btn btn-outline w-full" href={`${publicEnv.apiUrl}/auth/google/login`}>
        <Mail size={18} />
        Continue with Google
      </a>
      {#if publicEnv.allowLocalLogin}
        <button class="btn btn-ghost w-full" type="button">Local login</button>
      {/if}
    </div>
  </section>
</main>
