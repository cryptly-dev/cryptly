import { Button } from "@/components/ui/button";
import { CryptlyLogo } from "@/components/ui/CryptlyLogo";
import { GitHubIcon } from "@/components/ui/GitHubIcon";
import { useState } from "react";
import { LocalLoginForm } from "./LocalLoginForm";

export function LoginPage() {
  const allowLocalLogin = import.meta.env.VITE_ALLOW_LOCAL_LOGIN === "true";
  const [loadingProvider, setLoadingProvider] = useState<
    "google" | "github" | null
  >(null);

  const handleGoogleLogin = () => {
    setLoadingProvider("google");
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const appUrl = import.meta.env.VITE_APP_URL;

    const googleOAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${googleClientId}&redirect_uri=${appUrl}/app/callbacks/oauth/google&response_type=code&scope=openid%20email%20profile`;
    window.location.href = googleOAuthUrl;
  };

  const handleGitHubLogin = () => {
    setLoadingProvider("github");
    const githubClientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
    const appUrl = import.meta.env.VITE_APP_URL;
    const githubOAuthUrl = `https://github.com/login/oauth/authorize?client_id=${githubClientId}&redirect_uri=${appUrl}/app/callbacks/oauth/github&scope=user:email`;
    window.location.href = githubOAuthUrl;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden p-8">
      <div className="w-full max-w-62 relative z-10">
        {/* Gradient border wrapper */}
        <div className="space-y-4">
          {/* Header */}
          <div className="text-center space-y-2">
            <CryptlyLogo size={42} className="m-auto mb-4" />

            <h1 className="text-xl font-semibold text-foreground tracking-tight">
              Welcome to Cryptly
            </h1>
          </div>

          {allowLocalLogin ? (
            <LocalLoginForm />
          ) : (
            <div className="space-y-3">
              <Button
                onClick={handleGoogleLogin}
                variant="outline"
                size="lg"
                isLoading={loadingProvider === "google"}
                disabled={loadingProvider !== null}
                className="w-full flex items-center justify-center gap-3 h-10 cursor-pointer rounded-md bg-neutral-800/80 hover:bg-neutral-700/80 border-[0.5px] border-neutral-700/60 hover:border-neutral-600 transition-all duration-200"
              >
                <GoogleIcon />
                <span>Sign in with Google</span>
              </Button>

              <div className="flex items-center gap-3 w-11/12 mx-auto h-2">
                <div className="h-px flex-1 bg-neutral-700/50" />
                <span className="text-xs text-muted-foreground">or</span>
                <div className="h-px flex-1 bg-neutral-700/50" />
              </div>

              <Button
                onClick={handleGitHubLogin}
                variant="outline"
                size="lg"
                isLoading={loadingProvider === "github"}
                disabled={loadingProvider !== null}
                className="w-full flex items-center justify-center gap-3 h-10 cursor-pointer rounded-md bg-neutral-800/80 hover:bg-neutral-700/80 border-[0.5px] border-neutral-700/60 hover:border-neutral-600 transition-all duration-200"
              >
                <GitHubIcon />
                <span>Sign in with GitHub</span>
              </Button>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-[10px] text-muted-foreground/60 mt-4">
          By continuing, you agree to our
          <br />
          Terms of Service
        </p>
      </div>
    </div>
  );
}

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5">
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
);
