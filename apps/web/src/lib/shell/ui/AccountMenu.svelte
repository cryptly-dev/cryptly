<script lang="ts">
  import { afterNavigate } from "$app/navigation";
  import { resolve } from "$app/paths";
  import {
    ChevronsUpDown,
    Lock,
    LogOut,
    SlidersHorizontal,
  } from "lucide-svelte";
  import { lockBrowserKeys } from "$lib/keys/auto-lock";
  import { settingsPath } from "$lib/paths";
  import { auth, logout } from "$lib/stores/auth.svelte";
  import { keyAuth } from "$lib/stores/key.svelte";
  import Avatar from "$lib/ui/Avatar.svelte";
  import Kbd from "$lib/ui/Kbd.svelte";

  /** The account row at the top of the sidebar and its menu (a native popover: Esc and outside clicks close it). */
  let trigger: HTMLButtonElement | undefined = $state();
  let menu: HTMLDivElement | undefined = $state();

  afterNavigate(() => menu?.hidePopover());

  const name = $derived(
    auth.userData?.displayName || auth.userData?.email || "Account",
  );

  const itemClass = `flex h-[30px] w-full items-center gap-2 rounded-lg px-2 text-left text-fg2 hover:bg-elev-hover hover:text-fg focus-visible:bg-elev-hover focus-visible:text-fg focus-visible:outline-none [&_svg]:size-[15px] [&_svg]:shrink-0 [&_svg]:text-fg3`;

  function place(event: ToggleEvent) {
    if (event.newState !== "open" || !trigger || !menu) return;
    const rect = trigger.getBoundingClientRect();
    menu.style.top = `${rect.bottom + 4}px`;
    menu.style.left = `${rect.left}px`;
    menu.style.width = `${rect.width}px`;
  }

  function items() {
    return [...(menu?.querySelectorAll<HTMLElement>("[role=menuitem]") ?? [])];
  }

  function onkeydown(event: KeyboardEvent) {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    event.preventDefault();
    const list = items();
    const index = list.indexOf(document.activeElement as HTMLElement);
    const delta = event.key === "ArrowDown" ? 1 : -1;
    list[(index + delta + list.length) % list.length]?.focus();
  }

  function run(action: () => unknown) {
    menu?.hidePopover();
    void action();
  }
</script>

<button
  bind:this={trigger}
  type="button"
  popovertarget="account-menu"
  aria-haspopup="menu"
  aria-label={auth.userData ? undefined : "Account"}
  class="mb-1 flex h-9 shrink-0 items-center gap-2 rounded-lg px-2 text-[14px] font-[550] text-fg hover:bg-root-hover focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-fg3"
>
  {#if auth.userData}
    <Avatar
      {name}
      src={auth.userData.avatarUrl}
      seed={auth.userData.id}
      size={20}
      square
      class="rounded-[6px] text-[10.5px]!"
    />
    <span class="min-w-0 flex-1 truncate text-left">{name}</span>
  {:else}
    <span class="size-5 rounded-[6px] bg-root-sel"></span>
    <span class="h-2.5 w-24 rounded-full bg-root-sel"></span>
    <span class="flex-1"></span>
  {/if}
  <ChevronsUpDown class="size-[15px] shrink-0 text-fg3" strokeWidth={1.75} />
</button>

<div
  bind:this={menu}
  id="account-menu"
  popover="auto"
  role="menu"
  tabindex="-1"
  aria-label="Account"
  class="fixed inset-auto m-0 rounded-xl bg-elev p-1 font-ui text-[13px] leading-5 font-[450] text-fg shadow-elev"
  onbeforetoggle={place}
  ontoggle={(event) => {
    if (event.newState === "open") items()[0]?.focus();
  }}
  {onkeydown}
>
  <div class="px-2 pt-1.5 pb-2">
    <p class="truncate font-[550]">{name}</p>
    {#if auth.userData?.email && auth.userData.email !== name}
      <p class="truncate text-[12px] text-fg3">{auth.userData.email}</p>
    {/if}
  </div>
  <div class="mx-1 mb-1 h-px bg-elev-border"></div>
  <a
    href={resolve(settingsPath())}
    role="menuitem"
    class={itemClass}
    onclick={() => menu?.hidePopover()}
  >
    <SlidersHorizontal strokeWidth={1.75} />Settings
    <Kbd class="ml-auto">⌘,</Kbd>
  </a>
  {#if keyAuth.hasMasterKey}
    <button
      type="button"
      role="menuitem"
      class={itemClass}
      onclick={() => run(() => lockBrowserKeys())}
    >
      <Lock strokeWidth={1.75} />Lock this browser
    </button>
  {/if}
  <button
    type="button"
    role="menuitem"
    class={itemClass}
    onclick={() => run(logout)}
  >
    <LogOut strokeWidth={1.75} />Log out
  </button>
</div>
