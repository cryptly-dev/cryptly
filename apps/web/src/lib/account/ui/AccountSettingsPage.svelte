<script lang="ts">
  import { Check, Contrast, Copy, Lock, Terminal, User } from "lucide-svelte";
  import { toast } from "svelte-sonner";
  import { afterNavigate, goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { page } from "$app/state";
  import {
    appearance,
    setGreys,
    setTheme,
    type ThemeChoice,
  } from "$lib/appearance/appearance.svelte";
  import {
    GREY_PRESETS,
    GREY_SWATCHES,
    type GreyPreset,
  } from "$lib/appearance/greys";
  import { UserApi } from "$lib/auth/user.api";
  import { lockBrowserKeys } from "$lib/keys/auto-lock";
  import { auth, loadUserData, logout } from "$lib/stores/auth.svelte";
  import { keyAuth } from "$lib/stores/key-state.svelte";
  import Button from "$lib/ui/Button.svelte";
  import IconButton from "$lib/ui/IconButton.svelte";
  import Segmented from "$lib/ui/Segmented.svelte";
  import SettingsItem from "$lib/ui/SettingsItem.svelte";
  import SettingsLayout from "$lib/ui/SettingsLayout.svelte";
  import Well from "$lib/ui/Well.svelte";
  import { cn, getDeviceName } from "$lib/utils";
  import AppPreview from "./AppPreview.svelte";
  import ChangePassphraseDialog from "./ChangePassphraseDialog.svelte";

  const SECTIONS = [
    { id: "profile", title: "Profile", icon: User },
    { id: "appearance", title: "Appearance", icon: Contrast },
    { id: "passphrase", title: "Passphrase", icon: Lock },
    { id: "devices", title: "Devices & CLI", icon: Terminal },
  ];
  const THEMES: { value: ThemeChoice; label: string }[] = [
    { value: "system", label: "System" },
    { value: "light", label: "Light" },
    { value: "dark", label: "Dark" },
  ];
  const PROVIDERS = { github: "GitHub", google: "Google", local: "Email" };
  const INSTALL = "npm i -g @cryptly/cli";
  const LOGIN = "cryptly login";
  // "Mac - Chrome" → "Chrome on Mac".
  const device = getDeviceName().split(" - ").reverse().join(" on ");

  const user = $derived(auth.userData);
  const themeNote = $derived(
    appearance.theme === "system"
      ? `Follows your system, ${appearance.resolved} now.`
      : `Always ${appearance.theme}.`,
  );

  // Esc goes back to the in-app page the user came from.
  let back: string | null = null;
  afterNavigate(({ from }) => {
    if (from && from.url.pathname !== page.url.pathname) {
      back = from.url.pathname + from.url.search;
    }
  });

  function isTyping(target: EventTarget | null) {
    const el = target as HTMLElement | null;
    return Boolean(
      el &&
      (el.tagName === "INPUT" ||
        el.tagName === "TEXTAREA" ||
        el.tagName === "SELECT" ||
        el.isContentEditable),
    );
  }

  function onWindowKeydown(event: KeyboardEvent) {
    if (event.key !== "Escape" || event.defaultPrevented) return;
    if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey)
      return;
    if (isTyping(event.target)) return;
    if (document.querySelector("dialog[open], [role='dialog']")) return;
    event.preventDefault();
    if (back) {
      // A URL the router just left, so it already carries the base path.
      // eslint-disable-next-line svelte/no-navigation-without-resolve
      void goto(back);
    } else {
      void goto(resolve("/app/project"));
    }
  }

  let renaming = $state(false);
  let nameDraft = $state("");
  let savingName = $state(false);

  function startRename() {
    nameDraft = user?.displayName ?? "";
    renaming = true;
  }

  async function saveName(event: SubmitEvent) {
    event.preventDefault();
    const jwt = auth.jwtToken;
    const displayName = nameDraft.trim();
    if (!jwt || !displayName || savingName) return;
    if (displayName === user?.displayName) {
      renaming = false;
      return;
    }
    savingName = true;
    try {
      await UserApi.updateMe(jwt, { displayName });
      await loadUserData();
      renaming = false;
    } catch {
      toast.error("Couldn't rename. Try again.");
    } finally {
      savingName = false;
    }
  }

  function focusSelect(node: HTMLInputElement) {
    node.focus();
    node.select();
  }

  let changingPassphrase = $state(false);

  let copied = $state<string | null>(null);
  let copiedTimer: ReturnType<typeof setTimeout> | undefined;

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      toast.error("Couldn't copy to the clipboard");
      return;
    }
    copied = text;
    clearTimeout(copiedTimer);
    copiedTimer = setTimeout(() => (copied = null), 1500);
  }

  function onSwatchKeydown(event: KeyboardEvent) {
    const step = {
      ArrowRight: 1,
      ArrowDown: 1,
      ArrowLeft: -1,
      ArrowUp: -1,
    }[event.key];
    if (!step) return;
    event.preventDefault();
    const count = GREY_PRESETS.length;
    const index = GREY_PRESETS.indexOf(appearance.greys);
    const greys = GREY_PRESETS[(index + step + count) % count]!;
    setGreys(greys);
    (event.currentTarget as HTMLElement)
      .querySelector<HTMLElement>(`[data-preset="${greys}"]`)
      ?.focus();
  }
</script>

<svelte:window onkeydown={onWindowKeydown} />

{#snippet copyButton(text: string, label: string)}
  <IconButton {label} onclick={() => void copy(text)}>
    {#if copied === text}
      <Check class="text-success" strokeWidth={1.75} />
    {:else}
      <Copy strokeWidth={1.75} />
    {/if}
  </IconButton>
{/snippet}

{#snippet swatch(name: GreyPreset)}
  {@const on = appearance.greys === name}
  {@const [dark, mid, light] = GREY_SWATCHES[name]}
  <button
    type="button"
    role="radio"
    aria-checked={on}
    tabindex={on ? 0 : -1}
    data-preset={name}
    class={cn(
      "flex min-w-0 flex-col gap-[5px] text-left text-[11.5px]",
      on ? "text-fg" : "text-fg3 hover:text-fg",
    )}
    onclick={() => setGreys(name)}
  >
    <span
      class={cn(
        "grid h-[30px] grid-rows-[2fr_1fr_1fr] overflow-hidden rounded-lg",
        on
          ? "shadow-[0_0_0_2px_var(--s100),0_0_0_3.5px_var(--fg)]"
          : "shadow-[0_0_0_0.5px_var(--s100-border)]",
      )}
    >
      <span style:background={dark}></span>
      <span style:background={mid}></span>
      <span style:background={light}></span>
    </span>
    {name}
  </button>
{/snippet}

<div class="flex h-12 shrink-0 items-center gap-2 px-3 font-medium">
  {#if user?.displayName}
    <span class="truncate text-fg3">{user.displayName}</span>
    <span class="text-faint">/</span>
  {/if}
  <span class="whitespace-nowrap">Settings</span>
</div>

<SettingsLayout sections={SECTIONS}>
  <Well id="profile" title="Profile">
    <SettingsItem label="Name">
      {#if renaming}
        <form id="rename-form" class="flex min-w-0 flex-1" onsubmit={saveName}>
          <input
            {@attach focusSelect}
            bind:value={nameDraft}
            aria-label="Display name"
            maxlength={200}
            autocomplete="off"
            spellcheck="false"
            disabled={savingName}
            class="-ml-2 h-7 min-w-0 flex-1 rounded-lg bg-field px-2 shadow-field outline-none focus:shadow-[inset_0_0_0_1px_var(--fg3)]"
            onkeydown={(event) => {
              if (event.key === "Escape") {
                event.preventDefault();
                renaming = false;
              }
            }}
          />
        </form>
      {:else}
        <span class="truncate">{user?.displayName}</span>
      {/if}
      {#snippet actions()}
        {#if renaming}
          <Button
            size="sm"
            variant="ghost"
            disabled={savingName}
            onclick={() => (renaming = false)}>Cancel</Button
          >
          <Button
            size="sm"
            variant="primary"
            type="submit"
            form="rename-form"
            disabled={savingName || !nameDraft.trim()}>Save</Button
          >
        {:else}
          <Button size="sm" onclick={startRename}>Rename</Button>
        {/if}
      {/snippet}
    </SettingsItem>
    <SettingsItem label="Login">
      {#if user}
        <span class="shrink-0">{PROVIDERS[user.authMethod]}</span>
        {#if user.email}
          <span class="truncate text-[12.5px] text-fg3">{user.email}</span>
        {/if}
      {/if}
      {#snippet actions()}
        <Button size="sm" onclick={() => void logout()}>Sign out</Button>
      {/snippet}
    </SettingsItem>
  </Well>

  <Well id="appearance" title="Appearance">
    <SettingsItem label="Theme">
      <span class="truncate text-[12.5px] text-fg3">{themeNote}</span>
      {#snippet actions()}
        <Segmented
          label="Theme"
          options={THEMES}
          bind:value={() => appearance.theme, setTheme}
        />
      {/snippet}
    </SettingsItem>
    <SettingsItem label="Greys" top>
      <div
        role="radiogroup"
        aria-label="Greys"
        tabindex="-1"
        class="grid flex-1 grid-cols-5 gap-x-2 gap-y-2.5"
        onkeydown={onSwatchKeydown}
      >
        {#each GREY_PRESETS as name (name)}
          {@render swatch(name)}
        {/each}
      </div>
    </SettingsItem>
    <SettingsItem label="Preview" top>
      <AppPreview />
    </SettingsItem>
  </Well>

  <Well id="passphrase" title="Passphrase">
    <SettingsItem label="Passphrase">
      <span class="truncate text-[12.5px] text-fg3"
        >Cryptly never sees it and cannot reset it.</span
      >
      {#snippet actions()}
        <Button size="sm" onclick={() => (changingPassphrase = true)}
          >Change</Button
        >
      {/snippet}
    </SettingsItem>
  </Well>

  <Well id="devices" title="Devices & CLI">
    <SettingsItem label="Browser">
      <span class="truncate">{device}</span>
      <span class="shrink-0 text-[12.5px] text-fg3"
        >{keyAuth.hasMasterKey ? "Unlocked" : "Locked"}</span
      >
      {#snippet actions()}
        {#if keyAuth.hasMasterKey}
          <Button size="sm" onclick={() => void lockBrowserKeys()}>Lock</Button>
        {/if}
      {/snippet}
    </SettingsItem>
    <SettingsItem label="Install">
      <span class="truncate mono text-[12.5px]">{INSTALL}</span>
      {#snippet actions()}
        {@render copyButton(INSTALL, "Copy install command")}
      {/snippet}
    </SettingsItem>
    <SettingsItem label="Log in">
      <span class="truncate mono text-[12.5px]">{LOGIN}</span>
      {#snippet actions()}
        {@render copyButton(LOGIN, "Copy login command")}
      {/snippet}
    </SettingsItem>
  </Well>
</SettingsLayout>

<ChangePassphraseDialog bind:open={changingPassphrase} />
