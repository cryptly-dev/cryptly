<script lang="ts">
  import { untrack, type Snippet } from "svelte";
  import { MediaQuery } from "svelte/reactivity";
  import { beforeNavigate, goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { Menu, Search } from "lucide-svelte";
  import "$lib/appearance/appearance.svelte";
  import { clearShell, loadShell, shell } from "$lib/shell/shell.svelte";
  import { auth, logout } from "$lib/stores/auth.svelte";
  import Button from "$lib/ui/Button.svelte";
  import IconButton from "$lib/ui/IconButton.svelte";
  import AppSidebar from "./AppSidebar.svelte";

  let { children }: { children: Snippet } = $props();

  const signedIn = $derived(Boolean(auth.jwtToken));
  const mobile = new MediaQuery("(max-width: 767px)");
  let drawerOpen = $state(false);
  let searchOpen = $state(false);

  $effect(() => {
    if (!signedIn) {
      clearShell();
      void goto(resolve("/app/login"));
      return;
    }
    untrack(() => void loadShell());
  });

  // The drawer (below 768px) closes on any navigation, including the guarded ones.
  beforeNavigate(() => (drawerOpen = false));
</script>

<div
  class="grid h-dvh grid-cols-1 grid-rows-[auto_minmax(0,1fr)] bg-root font-ui text-[13px] leading-5 font-[450] text-fg antialiased [color-scheme:var(--scheme)] md:grid-cols-[240px_minmax(0,1fr)] md:grid-rows-1"
>
  <AppSidebar bind:drawerOpen bind:searchOpen />
  <header
    class="flex h-11 items-center justify-between px-1.5 md:hidden"
    inert={drawerOpen}
  >
    <IconButton
      label="Open menu"
      class="size-9"
      aria-expanded={drawerOpen}
      onclick={() => (drawerOpen = true)}
    >
      <Menu strokeWidth={1.75} />
    </IconButton>
    <IconButton
      label="Search"
      class="size-9"
      onclick={() => (searchOpen = true)}
    >
      <Search strokeWidth={1.75} />
    </IconButton>
  </header>
  <main
    class="mx-1.5 mb-1.5 flex min-h-0 min-w-0 flex-col overflow-hidden rounded-panel bg-s50 shadow-panel md:my-1.5 md:ml-0"
    inert={drawerOpen && mobile.current}
  >
    {#if shell.loadError && !shell.projects}
      <div class="grid flex-1 place-items-center p-6 text-center">
        <div class="max-w-sm">
          <h2 class="text-[15px] font-semibold">We couldn't finish loading</h2>
          <p class="mt-1 text-fg3">{shell.loadError}</p>
          <div class="mt-4 flex justify-center gap-2">
            <Button variant="primary" onclick={() => void loadShell()}
              >Retry</Button
            >
            <Button onclick={() => void logout()}>Log out</Button>
          </div>
        </div>
      </div>
    {:else}
      {@render children()}
    {/if}
  </main>
</div>
