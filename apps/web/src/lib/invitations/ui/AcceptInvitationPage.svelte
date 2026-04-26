<script lang="ts">
  import { IconArrowRight, IconUsers } from '@tabler/icons-svelte';
  import { persistInviteIdForAfterLogin } from '$lib/auth/after-login';

  let { inviteId }: { inviteId: string } = $props();
</script>

<!-- Guest state aligned with `frontend/src/components/invitation/AcceptInvitationPage.tsx` -->
<div class="flex min-h-screen items-center justify-center p-4">
  <div class="max-w-md">
    <div class="rounded-xl border bg-card p-6 text-center">
      <div class="mb-4">
        <IconUsers class="mx-auto size-8 text-muted-foreground" />
      </div>

      <h1 class="mb-3 text-xl font-bold">Project Invitation</h1>

      <p class="mb-4 text-muted-foreground">
        You've been invited to collaborate on a project! Please log in to accept this invitation.
      </p>

      <a
        href="/app/login"
        class="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        onclick={() => persistInviteIdForAfterLogin(inviteId)}
      >
        Sign In to Continue
        <IconArrowRight class="size-4" />
      </a>

      <p class="mt-3 text-xs text-muted-foreground">
        Don't have an account? Signing in will create one for you.
      </p>
    </div>
  </div>
</div>
