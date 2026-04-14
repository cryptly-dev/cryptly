import { Button } from "@/components/ui/button";
import {
  InputAction,
  InputWithActions,
} from "@/components/ui/input-with-actions";
import { AuthApi } from "@/lib/api/auth.api";
import { authLogic } from "@/lib/logics/authLogic";
import { IconArrowRight } from "@tabler/icons-react";
import { useNavigate } from "@tanstack/react-router";
import { useActions } from "kea";
import { useState } from "react";

const QUICK_USERS = [
  { label: "User A", email: "user-a@cryptly.dev" },
  { label: "User B", email: "user-b@cryptly.dev" },
  { label: "User C", email: "user-c@cryptly.dev" },
];

export function LocalLoginForm() {
  const [email, setEmail] = useState("");
  const { setJwtToken } = useActions(authLogic);
  const navigate = useNavigate();

  const loginWithEmail = async (loginEmail: string) => {
    const token = await AuthApi.loginLocal(loginEmail);
    setJwtToken(token);
    navigate({ to: "/app/project" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await loginWithEmail(email);
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit}>
        <InputWithActions
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          autoFocus
          actions={
            <InputAction
              type="submit"
              disabled={!email.trim()}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <IconArrowRight className="size-4" />
            </InputAction>
          }
        />
      </form>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-neutral-700/50" />
        <span className="text-xs text-muted-foreground">or</span>
        <div className="h-px flex-1 bg-neutral-700/50" />
      </div>

      <div className="flex gap-2">
        {QUICK_USERS.map((user) => (
          <Button
            key={user.email}
            type="button"
            variant="outline"
            onClick={() => loginWithEmail(user.email)}
            className="flex-1 cursor-pointer rounded-xl bg-neutral-800/80 hover:bg-neutral-700/80 border-neutral-700/60 hover:border-neutral-600 transition-all duration-200"
          >
            {user.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
