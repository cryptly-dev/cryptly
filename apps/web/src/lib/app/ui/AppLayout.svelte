<script lang="ts">
  import { LayoutDashboard, LogIn } from 'lucide-svelte';
  import type { Snippet } from 'svelte';

  let { children }: { children: Snippet } = $props();
</script>

<div class="min-h-screen bg-base-200 text-base-content">
  <header class="border-base-300 bg-base-100 border-b">
    <div class="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
      <a class="text-lg font-semibold" href="/">Cryptly</a>
      <nav class="flex items-center gap-2">
        <a class="btn btn-ghost btn-sm" href="/app/project">
          <LayoutDashboard size={16} />
          Projects
        </a>
        <a class="btn btn-primary btn-sm" href="/auth/login">
          <LogIn size={16} />
          Login
        </a>
      </nav>
    </div>
  </header>
  <main class="mx-auto max-w-7xl px-4 py-6">
    {@render children()}
  </main>
</div>
