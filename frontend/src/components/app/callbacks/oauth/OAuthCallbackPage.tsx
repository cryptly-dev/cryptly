import { useAfterLogin } from "@/lib/hooks/useAfterLogin";
import { authLogic } from "@/lib/logics/authLogic";
import { Spinner } from "@/components/ui/spinner";
import { useValues } from "kea";
import posthog from "posthog-js";
import { useEffect } from "react";

interface OAuthCallbackPageProps {
  exchangeCodeForJwt: (code: string) => void;
  method: "google" | "github";
}

export function OAuthCallbackPage({
  exchangeCodeForJwt,
  method,
}: OAuthCallbackPageProps) {
  const { userData } = useValues(authLogic);
  const { afterLogin } = useAfterLogin();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const authCode = urlParams.get("code");

    if (authCode) {
      exchangeCodeForJwt(authCode);
    }
  }, [exchangeCodeForJwt]);

  useEffect(() => {
    posthog.capture("logged_in", {
      method,
      email: userData?.email,
    });
    afterLogin(userData);
  }, [userData, afterLogin]);

  return (
    <div className="w-screen h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Spinner className="h-12 w-12" />
        <span className="text-lg text-muted-foreground">
          Fetching projects...
        </span>
      </div>
    </div>
  );
}
