import { Button } from "@/components/ui/button";
import { AuthApi } from "@/lib/api/auth.api";
import { authLogic } from "@/lib/logics/authLogic";
import { useNavigate } from "@tanstack/react-router";
import { useActions } from "kea";
import { useState } from "react";

export function LocalLoginForm() {
  const [email, setEmail] = useState("");
  const { setJwtToken } = useActions(authLogic);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = await AuthApi.loginLocal(email);

    setJwtToken(token);

    navigate({ to: "/app/project" });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      <Button
        type="submit"
        size="lg"
        className="w-full h-12"
        disabled={!email.trim()}
      >
        Local Login
      </Button>
    </form>
  );
}
