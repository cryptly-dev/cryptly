<script lang="ts">
  import { IconArrowRight } from '@tabler/icons-svelte';
  import { onMount, tick } from 'svelte';
  import { gotoAfterLogin } from '$lib/auth/after-login';
  import { loadUserData, loginLocal } from '$lib/stores/auth.svelte';

  const QUICK_USERS = [
    { label: 'User A', email: 'user-a@cryptly.dev' },
    { label: 'User B', email: 'user-b@cryptly.dev' },
    { label: 'User C', email: 'user-c@cryptly.dev' }
  ];

  let email = $state('');
  let emailInput = $state<HTMLInputElement | null>(null);

  onMount(() => {
    void tick().then(() => emailInput?.focus());
  });

  async function loginWithEmail(loginEmail: string) {
    await loginLocal(loginEmail);
    await loadUserData();
    await gotoAfterLogin();
  }

  async function handleSubmit(e: Event) {
    e.preventDefault();
    await loginWithEmail(email);
  }
</script>

<div class="space-y-4">
  <form onsubmit={handleSubmit}>
    <div
      class="flex items-stretch rounded-lg border border-border bg-background transition-colors focus-within:border-neutral-500"
    >
      <input
        bind:this={emailInput}
        bind:value={email}
        type="email"
        placeholder="Enter your email"
        class="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-base outline-none placeholder:text-muted-foreground/50 md:text-sm"
      />
      <div class="flex items-center gap-0.5 pr-1">
        <button
          type="submit"
          disabled={!email.trim()}
          class="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Continue"
        >
          <IconArrowRight class="size-4" />
        </button>
      </div>
    </div>
  </form>

  <div class="flex items-center gap-3">
    <div class="h-px flex-1 bg-neutral-700/50"></div>
    <span class="text-xs text-muted-foreground">or</span>
    <div class="h-px flex-1 bg-neutral-700/50"></div>
  </div>

  <div class="flex gap-2">
    {#each QUICK_USERS as user}
      <button
        type="button"
        class="flex-1 cursor-pointer rounded-xl border border-neutral-700/60 bg-neutral-800/80 px-2 py-2 text-sm font-medium transition-all duration-200 hover:border-neutral-600 hover:bg-neutral-700/80"
        onclick={() => loginWithEmail(user.email)}
      >
        {user.label}
      </button>
    {/each}
  </div>
</div>
