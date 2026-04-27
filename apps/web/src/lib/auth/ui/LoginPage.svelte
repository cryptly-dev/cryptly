<script lang="ts">
  import CryptlyLogo from '$lib/shared/ui/CryptlyLogo.svelte';
  import GitHubIcon from '$lib/shared/ui/GitHubIcon.svelte';
  import { publicEnv } from '$lib/shared/env/public-env';
  import LocalLoginForm from './LocalLoginForm.svelte';

  let loadingProvider = $state<'google' | 'github' | null>(null);

  function googleOAuthUrl() {
    const { googleClientId, appUrl } = publicEnv;
    return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(googleClientId)}&redirect_uri=${encodeURIComponent(`${appUrl.replace(/\/$/, '')}/app/callbacks/oauth/google`)}&response_type=code&scope=openid%20email%20profile`;
  }

  function githubOAuthUrl() {
    const { githubClientId, appUrl } = publicEnv;
    return `https://github.com/login/oauth/authorize?client_id=${encodeURIComponent(githubClientId)}&redirect_uri=${encodeURIComponent(`${appUrl.replace(/\/$/, '')}/app/callbacks/oauth/github`)}&scope=user:email`;
  }

  function handleGoogleLogin() {
    loadingProvider = 'google';
    window.location.href = googleOAuthUrl();
  }

  function handleGitHubLogin() {
    loadingProvider = 'github';
    window.location.href = githubOAuthUrl();
  }
</script>

<div class="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-8">
  <!-- `max-w-62` matches React `LoginPage` (`max-w-62` → 15.5rem) -->
  <div class="relative z-10 w-full max-w-[15.5rem] space-y-4">
    <div class="space-y-2 text-center">
      <CryptlyLogo size={42} class="m-auto mb-4" />
      <h1 class="text-xl font-semibold tracking-tight text-foreground">Welcome to Cryptly</h1>
    </div>

    {#if publicEnv.allowLocalLogin}
      <LocalLoginForm />
    {:else}
      <div class="space-y-3">
        <button
          type="button"
          disabled={loadingProvider !== null}
          class="inline-flex h-10 w-full shrink-0 cursor-pointer items-center justify-center gap-3 whitespace-nowrap rounded-md border-[0.5px] border-neutral-700/60 bg-neutral-800/80 text-sm font-medium transition-all duration-200 hover:border-neutral-600 hover:bg-neutral-700/80 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0"
          onclick={handleGoogleLogin}
        >
          <svg viewBox="0 0 24 24" class="h-5 w-5">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span>Sign in with Google</span>
        </button>

        <div class="mx-auto flex h-2 w-11/12 items-center gap-3">
          <div class="h-px flex-1 bg-neutral-700/50"></div>
          <span class="text-xs text-muted-foreground">or</span>
          <div class="h-px flex-1 bg-neutral-700/50"></div>
        </div>

        <button
          type="button"
          disabled={loadingProvider !== null}
          class="inline-flex h-10 w-full shrink-0 cursor-pointer items-center justify-center gap-3 whitespace-nowrap rounded-md border-[0.5px] border-neutral-700/60 bg-neutral-800/80 text-sm font-medium transition-all duration-200 hover:border-neutral-600 hover:bg-neutral-700/80 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0"
          onclick={handleGitHubLogin}
        >
          <GitHubIcon class="h-5 w-5" />
          <span>Sign in with GitHub</span>
        </button>
      </div>
    {/if}

    <p class="mt-4 text-center text-[10px] text-muted-foreground/60">
      By continuing, you agree to our
      <br />
      Terms of Service
    </p>
  </div>
</div>
