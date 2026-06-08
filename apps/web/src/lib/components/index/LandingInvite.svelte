<script lang="ts">
  import { Check, Copy, Plus, Users } from 'lucide-svelte';
  import { cn } from '$lib/utils';
  import LandingShell from './LandingShell.svelte';
  import { ACCENT } from './landing-data';

  type Tab = 'link' | 'user' | 'team';
  let tab = $state<Tab>('link');
  let copied = $state(false);
  let picked = $state<Record<string, boolean>>({});

  const TABS = [
    { id: 'link' as const, label: 'By invite link' },
    { id: 'user' as const, label: 'By teammate' },
    { id: 'team' as const, label: 'By team', soon: true }
  ];

  const people = [
    { id: 'alex', name: 'Alex Chen', hint: 'co-owner of cryptly-dev/cryptly', a: '/avatars/alex-chen.svg' },
    { id: 'marcus', name: 'Marcus Rodriguez', hint: '8 commits on the same repo', a: '/avatars/marcus-rodriguez.svg' },
    { id: 'priya', name: 'Priya Patel', hint: 'maintains cryptly-dev/web', a: '/avatars/priya-patel.svg' }
  ];

  function copyLink() {
    void navigator.clipboard?.writeText('https://cryptly.dev/invite/a3f9-k2m-7bxQ').catch(() => {});
    copied = true;
    window.setTimeout(() => (copied = false), 1200);
  }
</script>

<section>
  <LandingShell>
    <div class="max-w-2xl">
      <h2 class="text-3xl font-semibold leading-[1.08] tracking-tight text-foreground md:text-5xl">
        <span class="text-foreground">Three ways to bring</span>
        {' '}
        <span class="text-muted-foreground">one teammate, or sixty of them.</span>
      </h2>
      <p class="mt-6 max-w-xl text-[16px] leading-[1.75] text-muted-foreground">
        Each method re-wraps the project key in the new member's browser; our server moves wrapped bytes only. Pick the
        one that matches your back-channels.
      </p>
    </div>

    <div class="mt-10">
      <div
        class="overflow-hidden rounded-2xl border border-border/50 bg-card/40 shadow-2xl shadow-black/40 backdrop-blur-sm"
      >
        <div class="flex items-center gap-1 border-b border-border/50 bg-neutral-900/40 px-3 py-2">
          {#each TABS as t}
            {@const active = tab === t.id}
            <button
              type="button"
              class={cn(
                'relative flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                active ? 'text-foreground' : 'text-muted-foreground hover:bg-neutral-800/50 hover:text-foreground'
              )}
              onclick={() => (tab = t.id)}
            >
              {#if active}
                <div class="absolute inset-0 rounded-md bg-neutral-800"></div>
              {/if}
              <span class="relative z-10">{t.label}</span>
              {#if t.soon}
                <span
                  class="relative z-10 ml-1 rounded-full border border-border/60 px-1.5 py-px font-mono text-[9px] uppercase tracking-[0.2em]"
                  style:color={ACCENT}
                >
                  soon
                </span>
              {/if}
            </button>
          {/each}
        </div>

        <div class="min-h-[240px] p-6 md:p-8">
          {#if tab === 'link'}
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <div class="text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground/80">
                  Channel A · the link
                </div>
                <div class="mt-2 flex items-center gap-2 rounded-lg border border-border/50 bg-neutral-900/50 px-3 py-2.5">
                  <span class="flex-1 truncate font-mono text-[13px] text-foreground">
                    https://cryptly.dev/invite/a3f9-k2m-7bxQ
                  </span>
                  <button
                    type="button"
                    class="inline-flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-neutral-800 hover:text-foreground"
                    onclick={copyLink}
                  >
                    {#if copied}
                      <Check class="h-3 w-3" />
                    {:else}
                      <Copy class="h-3 w-3" />
                    {/if}
                    {copied ? 'copied' : 'copy'}
                  </button>
                </div>
              </div>
              <div>
                <div class="text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground/80">
                  Channel B · the passphrase
                </div>
                <div class="mt-2 flex items-center gap-2 rounded-lg border border-border/50 bg-neutral-900/50 px-3 py-2.5">
                  <span class="flex-1 truncate font-mono text-[13px] text-foreground">sunrise-otter-42</span>
                </div>
                <div class="mt-2 font-mono text-[11px] text-muted-foreground/80">
                  Send via a different medium than the link.
                </div>
              </div>
            </div>
          {:else if tab === 'user'}
            <div class="grid grid-cols-1 gap-3 md:grid-cols-3">
              {#each people as p}
                {@const on = !!picked[p.id]}
                <button
                  type="button"
                  class={cn(
                    'group cursor-pointer rounded-xl border p-4 text-left transition-all',
                    on ? 'border-border bg-neutral-800/50' : 'border-border/50 bg-neutral-900/40 hover:border-border hover:bg-neutral-800/40'
                  )}
                  onclick={() => (picked = { ...picked, [p.id]: !picked[p.id] })}
                >
                  <div class="flex items-center gap-3">
                    <img src={p.a} alt="" class="h-9 w-9 rounded-full grayscale opacity-90" />
                    <div class="min-w-0">
                      <div class="truncate text-[14px] font-medium text-foreground">{p.name}</div>
                      <div class="truncate text-[11px] text-muted-foreground">{p.hint}</div>
                    </div>
                  </div>
                  <div class="mt-3 flex items-center justify-between">
                    <span class="text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground/70">
                      already collaborator
                    </span>
                    <span
                      class={cn(
                        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[11px] transition-colors',
                        on ? 'bg-neutral-700/60' : 'text-muted-foreground group-hover:text-foreground'
                      )}
                      style:color={on ? ACCENT : undefined}
                    >
                      {#if on}
                        <Check class="h-3 w-3" />
                        added
                      {:else}
                        <Plus class="h-3 w-3" />
                        add
                      {/if}
                    </span>
                  </div>
                </button>
              {/each}
            </div>
          {:else}
            <div>
              <p class="max-w-xl text-[15px] leading-[1.75] text-muted-foreground">
                Define a team once, grant project access to every member with one stroke. The browser fans out wrapped
                project keys; the server forwards them. Coming in Q3.
              </p>
              <div class="mt-6 grid grid-cols-1 gap-3 md:grid-cols-3">
                {#each [{ name: 'Core engineering', n: 8 }, { name: 'Infra & SRE', n: 4 }, { name: 'Frontend', n: 6 }] as t}
                  <div class="rounded-xl border border-dashed border-border/60 bg-neutral-900/30 p-4">
                    <div class="flex items-center gap-2 text-[14px] text-foreground">
                      <Users class="h-3.5 w-3.5 text-muted-foreground" />
                      {t.name}
                    </div>
                    <div class="text-[11px] text-muted-foreground">{t.n} members</div>
                    <div class="mt-3 font-mono text-[10px] uppercase tracking-[0.25em]" style:color={ACCENT}>
                      on the waitlist
                    </div>
                  </div>
                {/each}
              </div>
            </div>
          {/if}
        </div>
      </div>
    </div>
  </LandingShell>
</section>
