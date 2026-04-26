<script lang="ts">
  import { ShieldCheck } from 'lucide-svelte';
</script>

<main class="min-h-screen bg-base-100 text-base-content">
  <section class="mx-auto grid min-h-screen max-w-6xl content-center gap-8 px-6 py-16">
    <div class="max-w-3xl">
      <div class="mb-5 flex items-center gap-3 text-sm font-medium text-primary">
        <ShieldCheck size={20} />
        Zero-knowledge secrets management
      </div>
      <h1 class="text-5xl font-semibold tracking-normal md:text-7xl">Cryptly</h1>
      <p class="mt-6 max-w-2xl text-lg leading-8 text-base-content/70">
        Store, share, version, and sync encrypted secrets while keeping plaintext and private keys out of the server.
      </p>
      <div class="mt-8 flex flex-wrap gap-3">
        <a class="btn btn-primary" href="/app/project">Open app</a>
        <a class="btn btn-ghost" href="/blog">Read blog</a>
      </div>
    </div>
  </section>
</main>
