import { GripLoader } from "@/components/ui/GripLoader";
import { DEFAULT_PROJECT_SETTINGS } from "@/lib/project-settings";
import { authLogic } from "@/lib/logics/authLogic";
import { projectsLogic } from "@/lib/logics/projectsLogic";
import { useNavigate } from "@tanstack/react-router";
import { useAsyncActions, useValues } from "kea";
import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import posthog from "posthog-js";
import { useEffect, useRef, useState } from "react";

export function CreateFirstProjectView() {
  const navigate = useNavigate();
  const { projects, projectsLoading } = useValues(projectsLogic);
  const { isLoggedIn } = useValues(authLogic);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate({ to: "/app/login" });
    }
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    // Wait for projects to finish loading
    if (projectsLoading) {
      return;
    }

    // If there are projects, navigate to the most recent one
    if (projects && projects.length > 0) {
      // Sort by updatedAt to find the most recent project
      const sortedProjects = [...projects].sort((a, b) => {
        return (
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      });

      const targetProjectId = sortedProjects[0].id;

      // Use replace navigation so back button doesn't bounce through this loading page
      navigate({
        to: "/app/project/$projectId",
        params: { projectId: targetProjectId },
        replace: true,
      });
    }
  }, [projects, projectsLoading, navigate]);

  // Show empty state if no projects
  if (projects && projects.length === 0) {
    return <EmptyProjectsState />;
  }

  // Loading projects, or have projects and the useEffect is about to redirect.
  // Same markup for both so the transition is seamless.
  return (
    <div className="w-screen h-screen flex items-center justify-center">
      <GripLoader color="#DDA15E" className="w-12 h-12" />
    </div>
  );
}

function EmptyProjectsState() {
  const navigate = useNavigate();
  const { addProject } = useAsyncActions(projectsLogic);
  const { userData } = useValues(authLogic);
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || submitting) return;
    setSubmitting(true);
    posthog.capture("add_project_button_clicked");
    try {
      await addProject(
        {
          name: trimmed,
          settings: {
            revealOn:
              userData?.projectCreationDefaults.revealOn ??
              DEFAULT_PROJECT_SETTINGS.revealOn,
          },
        },
        (projectId: string) =>
          navigate({
            to: "/app/project/$projectId",
            params: { projectId },
            replace: true,
          }),
      );
    } catch (err) {
      console.error(err);
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-8">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0, 0.55, 0.45, 1] }}
        className="w-full max-w-md"
      >
        <div className="mb-10">
          <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground/60 mb-5">
            New project
          </div>
          <h1 className="text-[34px] md:text-[40px] font-semibold text-foreground tracking-tight leading-[1.05]">
            Name your first{" "}
            <span className="text-muted-foreground">project.</span>
          </h1>
          <p className="mt-5 text-[15px] text-muted-foreground leading-[1.7]">
            Secrets you store in it are encrypted in your browser — before they
            leave your machine.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="checkout-api"
              disabled={submitting}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              className="w-full h-12 bg-neutral-900/40 border border-border/60 rounded-lg pl-4 pr-14 text-[15px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 focus:bg-neutral-900/60 transition-colors disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={!name.trim() || submitting}
              aria-label="Create project"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 h-9 w-9 rounded-md flex items-center justify-center bg-primary text-primary-foreground hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition"
            >
              {submitting ? (
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              ) : (
                <ArrowRight className="h-4 w-4" />
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
