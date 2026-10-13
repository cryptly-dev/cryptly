<script lang="ts">
  import {
    ArrowLeft,
    Check,
    ChevronRight,
    Copy,
    Link,
    UserPlus,
  } from "lucide-svelte";
  import { toast } from "svelte-sonner";
  import { track } from "$lib/analytics/logdash";
  import { AsymmetricCrypto } from "$lib/auth/asymmetric-crypto";
  import { SymmetricCrypto } from "$lib/auth/symmetric-crypto";
  import { InvitationsApi } from "$lib/invitations/invitations.api";
  import { getUnlockedProjectKey } from "$lib/projects/project-key";
  import {
    ProjectsApi,
    type Project,
    type ProjectRole,
    type SuggestedUser,
  } from "$lib/projects/projects.api";
  import { publicEnv } from "$lib/shared/env/public-env";
  import { auth } from "$lib/stores/auth.svelte";
  import Avatar from "$lib/ui/Avatar.svelte";
  import Button from "$lib/ui/Button.svelte";
  import Dialog from "$lib/ui/Dialog.svelte";
  import IconButton from "$lib/ui/IconButton.svelte";
  import { ROLES } from "./MembersSection.svelte";

  let {
    open = $bindable(false),
    project,
    oncreated,
  }: {
    open?: boolean;
    project: Project;
    oncreated: () => void;
  } = $props();

  type Step = "type" | "person" | "role" | "done";

  let step = $state<Step>("type");
  let kind = $state<"link" | "person">("link");
  let person = $state<SuggestedUser | null>(null);
  let people = $state<SuggestedUser[] | null>(null);
  let creating = $state(false);
  let inviteUrl = $state("");
  // The code only lives in this dialog; it is never sent anywhere and is gone once it closes.
  let inviteCode = $state("");
  let copied = $state<"link" | "code" | null>(null);

  const title = $derived(
    step === "type"
      ? "Add people"
      : step === "person"
        ? "Choose a person"
        : step === "role"
          ? "Choose a role"
          : kind === "link"
            ? "Invite ready"
            : "Invitation sent",
  );
  const description = $derived(
    step === "type"
      ? `Give someone access to ${project.name}.`
      : step === "person"
        ? "People you share other projects with."
        : step === "role"
          ? kind === "link"
            ? "What the person who opens the link can do."
            : `What ${person?.displayName ?? "they"} can do in ${project.name}.`
          : kind === "link"
            ? "They need both the link and the code to join."
            : `${person?.displayName ?? "They"} will see the invitation in Cryptly.`,
  );

  function reset() {
    step = "type";
    person = null;
    people = null;
    inviteUrl = "";
    inviteCode = "";
    copied = null;
  }

  function generateInviteCode(length = 16): string {
    // No look-alike characters (0/O, 1/l/I); rejection sampling keeps every character equally likely.
    const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ123456789";
    const limit = 256 - (256 % chars.length);
    let code = "";
    while (code.length < length) {
      for (const byte of crypto.getRandomValues(new Uint8Array(length * 2))) {
        if (byte < limit && code.length < length)
          code += chars[byte % chars.length];
      }
    }
    return code;
  }

  async function choosePerson() {
    kind = "person";
    step = "person";
    const jwt = auth.jwtToken;
    if (!jwt) return;
    try {
      people = await ProjectsApi.getSuggestedUsers(jwt, project.id);
    } catch {
      people = [];
      toast.error("Failed to load suggested people");
    }
  }

  async function createInviteLink(role: ProjectRole) {
    const jwt = auth.jwtToken;
    if (!jwt) return;
    const projectKey = await getUnlockedProjectKey(project);
    if (!projectKey) {
      toast.error("Unlock this browser before creating invitations");
      return;
    }
    // A temporary key pair carries the project key: its private half is encrypted with the
    // code, so the server can't open the invitation without it.
    const keyPair = await AsymmetricCrypto.generateKeyPair();
    const code = generateInviteCode();
    const codeKey = await SymmetricCrypto.deriveBase64KeyFromPassphrase(code);
    const temporaryPrivateKey = await SymmetricCrypto.encrypt(
      keyPair.privateKey,
      codeKey,
    );
    const temporarySecretsKey = await AsymmetricCrypto.encrypt(
      await SymmetricCrypto.exportAesKey(projectKey),
      keyPair.publicKey,
    );
    const invitation = await InvitationsApi.createInvitation(jwt, {
      projectId: project.id,
      temporaryPublicKey: keyPair.publicKey,
      temporaryPrivateKey,
      temporarySecretsKey,
      role,
    });
    track("invitation_created", { kind: "link", role });
    inviteCode = code;
    inviteUrl = `${publicEnv.appUrl.replace(/\/$/, "")}/invite/${invitation.id}`;
    step = "done";
  }

  async function invitePerson(role: ProjectRole) {
    const jwt = auth.jwtToken;
    const user = person;
    if (!jwt || !user?.publicKey) return;
    const projectKey = await getUnlockedProjectKey(project);
    if (!projectKey) {
      toast.error("Unlock this browser before creating invitations");
      return;
    }
    const encryptedSecretsKey = await AsymmetricCrypto.encrypt(
      await SymmetricCrypto.exportAesKey(projectKey),
      user.publicKey,
    );
    await ProjectsApi.addEncryptedSecretsKey(
      jwt,
      project.id,
      user.id,
      encryptedSecretsKey,
    );
    await InvitationsApi.createPersonalInvitation(jwt, project.id, {
      invitedUserId: user.id,
      role,
    });
    track("invitation_created", { kind: "direct", role });
    step = "done";
  }

  async function chooseRole(role: ProjectRole) {
    if (creating) return;
    creating = true;
    try {
      await (kind === "link" ? createInviteLink(role) : invitePerson(role));
      if (step === "done") oncreated();
    } catch {
      toast.error(
        kind === "link"
          ? "Failed to create invitation"
          : "Failed to send invitation",
      );
    } finally {
      creating = false;
    }
  }

  async function copy(field: "link" | "code", value: string) {
    try {
      await navigator.clipboard.writeText(value);
      copied = field;
      setTimeout(() => {
        if (copied === field) copied = null;
      }, 1500);
    } catch {
      toast.error("Could not copy to the clipboard");
    }
  }
</script>

{#snippet option(
  Icon: typeof Link,
  label: string,
  hint: string,
  onclick: () => void,
)}
  <button
    type="button"
    class="group flex w-full items-center gap-3 rounded-[10px] p-2 text-left hover:bg-elev-hover"
    {onclick}
  >
    <span
      class="grid size-8 shrink-0 place-items-center rounded-lg bg-[color-mix(in_oklab,var(--fg)_7%,transparent)] text-fg2"
    >
      <Icon class="size-4" strokeWidth={1.75} />
    </span>
    <span class="flex min-w-0 flex-1 flex-col">
      <span class="font-medium">{label}</span>
      <span class="truncate text-[12.5px] text-fg3">{hint}</span>
    </span>
    <ChevronRight
      class="size-4 shrink-0 text-faint group-hover:text-fg3"
      strokeWidth={1.75}
    />
  </button>
{/snippet}

{#snippet field(id: "link" | "code", label: string, value: string)}
  <label class="flex flex-col gap-1.5">
    <span class="text-[12.5px] text-fg3">{label}</span>
    <span
      class="flex h-[34px] items-center gap-1 rounded-[10px] bg-field pr-1 pl-2.5 shadow-field"
    >
      <input
        {value}
        readonly
        class="min-w-0 flex-1 truncate bg-transparent mono text-[12.5px] outline-none"
        onfocus={(event) => event.currentTarget.select()}
      />
      <IconButton
        label={`Copy ${label.toLowerCase()}`}
        onclick={() => void copy(id, value)}
      >
        {#if copied === id}
          <Check class="text-success" strokeWidth={1.75} />
        {:else}
          <Copy strokeWidth={1.75} />
        {/if}
      </IconButton>
    </span>
  </label>
{/snippet}

<Dialog bind:open {title} {description} dismissible={!creating} onclose={reset}>
  {#if step === "type"}
    <div class="-mx-2 flex flex-col gap-0.5">
      {@render option(
        Link,
        "Invite link",
        "A single-use link plus a code.",
        () => {
          kind = "link";
          step = "role";
        },
      )}
      {@render option(
        UserPlus,
        "Suggested person",
        "Someone you already work with in Cryptly.",
        () => void choosePerson(),
      )}
    </div>
  {:else if step === "person"}
    <div class="-mx-2 flex max-h-72 flex-col gap-0.5 overflow-y-auto">
      {#if people === null}
        <p class="px-2 py-6 text-center text-fg3">Loading…</p>
      {:else}
        {#each people as user (user.id)}
          <button
            type="button"
            disabled={!user.publicKey}
            class="flex w-full items-center gap-2.5 rounded-[10px] p-2 text-left hover:bg-elev-hover disabled:pointer-events-none disabled:opacity-50"
            onclick={() => {
              person = user;
              step = "role";
            }}
          >
            <Avatar
              name={user.displayName || user.email || "?"}
              src={user.avatarUrl}
              seed={user.id}
              size={24}
            />
            <span class="truncate font-medium">{user.displayName}</span>
            <span class="truncate text-[12.5px] text-fg3"
              >{user.publicKey
                ? user.email
                : "Hasn't set a passphrase yet"}</span
            >
          </button>
        {:else}
          <p class="px-2 py-6 text-center text-fg3">
            No suggestions yet. People appear here once you share another
            project with them.
          </p>
        {/each}
      {/if}
    </div>
  {:else if step === "role"}
    <div class="-mx-2 flex flex-col gap-0.5">
      {#each ROLES as role (role.value)}
        <button
          type="button"
          disabled={creating}
          class="flex w-full flex-col rounded-[10px] px-2.5 py-2 text-left hover:bg-elev-hover disabled:pointer-events-none disabled:opacity-50"
          onclick={() => void chooseRole(role.value)}
        >
          <span class="font-medium">{role.label}</span>
          <span class="text-[12.5px] text-fg3">{role.description}</span>
        </button>
      {/each}
    </div>
  {:else if kind === "link"}
    <div class="flex flex-col gap-3">
      {@render field("link", "Invite link", inviteUrl)}
      {@render field("code", "Invitation code", inviteCode)}
      <p class="text-[12.5px] text-fg3">
        You won't see the code again after closing this dialog. Send the link
        and the code through different channels.
      </p>
    </div>
  {/if}

  {#if step === "person" || step === "role"}
    <div class="-mx-2 -mb-2 flex">
      <Button
        variant="ghost"
        disabled={creating}
        onclick={() => {
          step = step === "role" && kind === "person" ? "person" : "type";
        }}
      >
        <ArrowLeft strokeWidth={1.75} />Back
      </Button>
    </div>
  {:else if step === "done"}
    <div class="flex justify-end">
      <Button variant="primary" onclick={() => (open = false)}>Done</Button>
    </div>
  {/if}
</Dialog>
