import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { WizardStepper } from "@/components/ui/wizard-stepper";
import type { Integration } from "@/lib/api/integrations.api";
import { ProjectMemberRole } from "@/lib/api/projects.api";
import { useProjects } from "@/lib/hooks/useProjects";
import { cn } from "@/lib/utils";
import { commonLogic } from "@/lib/logics/commonLogic";
import { integrationsLogic } from "@/lib/logics/integrationsLogic";
import { projectLogic } from "@/lib/logics/projectLogic";
import {
  IconArrowLeft,
  IconArrowNarrowRight,
  IconBraces,
  IconBrandGithub,
  IconExternalLink,
  IconLink,
  IconMessageCircle,
  IconPlugConnected,
  IconPlus,
  IconRocket,
  IconTrash,
} from "@tabler/icons-react";
import { useActions, useAsyncActions, useValues } from "kea";
import { CloudUpload } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import posthog from "posthog-js";
import { useEffect, useState } from "react";

// ────────────────────────────────────────────────────────────
// Integration card (grid item)
// ────────────────────────────────────────────────────────────

function IntegrationCard({
  integration,
  onClick,
}: {
  integration: Integration;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex flex-col items-center gap-2 p-4 rounded-lg bg-neutral-800/50 border border-border/50 hover:bg-neutral-800 hover:border-primary/30 transition-colors cursor-pointer text-center"
    >
      <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
        {integration.repositoryData?.avatarUrl ? (
          <img
            src={integration.repositoryData.avatarUrl}
            alt={integration.repositoryData.owner}
            className="size-12 rounded-full object-cover"
          />
        ) : (
          <IconBrandGithub className="size-5" />
        )}
      </div>

      <div className="text-sm font-medium truncate w-full text-center">
        {integration.repositoryData?.name ?? "Unknown"}
      </div>

      <div className="text-xs text-muted-foreground truncate w-full">
        {integration.repositoryData?.owner}
      </div>
    </button>
  );
}

// ────────────────────────────────────────────────────────────
// Integration detail dialog
// ────────────────────────────────────────────────────────────

function IntegrationDetailDialog({
  integration,
  open,
  onOpenChange,
}: {
  integration: Integration | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { removeIntegration } = useActions(integrationsLogic);
  const { currentUserRole } = useValues(projectLogic);
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    if (open) setIsRemoving(false);
  }, [open]);

  if (!integration) return null;

  const canDelete = currentUserRole === ProjectMemberRole.Admin;

  const handleRemove = () => {
    setIsRemoving(true);
    removeIntegration(integration.id);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-sm"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center">
            <IconBrandGithub className="size-7" />
          </div>

          <DialogTitle>
            {integration.repositoryData?.owner}/
            {integration.repositoryData?.name}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Integration details
          </DialogDescription>

          <div className="text-xs px-3 py-1.5 rounded bg-muted text-muted-foreground">
            GitHub
          </div>

          <div className="w-full space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Actions</label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                className="cursor-pointer"
                onClick={() =>
                  window.open(
                    `https://github.com/${integration.repositoryData?.owner}/${integration.repositoryData?.name}`,
                    "_blank"
                  )
                }
              >
                <IconExternalLink className="size-4 mr-2" />
                Open
              </Button>
              {canDelete && (
                <Button
                  onClick={handleRemove}
                  isLoading={isRemoving}
                  variant="outline"
                  className="cursor-pointer text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <IconTrash className="size-4 mr-2" />
                  Remove
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ────────────────────────────────────────────────────────────
// Animation helpers
// ────────────────────────────────────────────────────────────

const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];

function SectionHeader({
  icon: Icon,
  label,
  loading,
}: {
  icon: typeof IconLink;
  label: string;
  loading: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="size-4 text-muted-foreground" />
      <h3 className="text-sm font-medium">{label}</h3>
      {loading && <Spinner className="size-3.5 text-muted-foreground" />}
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Integrations section (grid, always visible)
// ────────────────────────────────────────────────────────────

function IntegrationsSection() {
  const { integrations, integrationsLoading } = useValues(integrationsLogic);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = selectedId
    ? integrations.find((i) => i.id === selectedId) ?? null
    : null;

  return (
    <div className="space-y-3">
      <SectionHeader
        icon={IconLink}
        label="Connected"
        loading={integrationsLoading && integrations.length === 0}
      />
      <div className="relative grid grid-cols-2 sm:grid-cols-3 gap-3">
        {/* Invisible card that always holds one row of height */}
        <div className="invisible pointer-events-none flex flex-col items-center gap-2 p-4 rounded-lg border" aria-hidden>
          <div className="size-12 rounded-full" />
          <div className="h-5 w-20" />
          <div className="h-4 w-14" />
        </div>
        {/* Real content overlaid on the same grid */}
        <div className="absolute inset-0 grid grid-cols-2 sm:grid-cols-3 gap-3">
          <AnimatePresence mode="popLayout">
            {integrations.length > 0 ? (
              integrations.map((integration) => (
                <motion.div
                  key={integration.id}
                  layoutId={`repo-${integration.githubRepositoryId}`}
                  layout
                  transition={{ layout: { duration: 0.3, ease: EASE_OUT } }}
                >
                  <IntegrationCard
                    integration={integration}
                    onClick={() => setSelectedId(integration.id)}
                  />
                </motion.div>
              ))
            ) : !integrationsLoading ? (
              <div className="col-span-full flex items-center justify-center h-full">
                <span className="text-sm text-muted-foreground">
                  No integrations connected yet
                </span>
              </div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
      <IntegrationDetailDialog
        integration={selected}
        open={!!selected}
        onOpenChange={(open) => {
          if (!open) setSelectedId(null);
        }}
      />
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Suggested integration (grid, always visible)
// ────────────────────────────────────────────────────────────

function SuggestedIntegrationSection() {
  const { suggestedIntegrations, allRepositoriesLoading } =
    useValues(integrationsLogic);
  const { createIntegration } = useAsyncActions(integrationsLogic);
  const [connectingId, setConnectingId] = useState<number | null>(null);

  const handleConnect = async (repo: typeof suggestedIntegrations[0]["repo"]) => {
    setConnectingId(repo.id);
    await createIntegration(Number(repo.id), repo.installationEntityId);
    setConnectingId(null);
    posthog.capture("integration_created", {
      type: "github",
      source: "suggestion",
    });
  };

  return (
    <div className="space-y-3">
      <SectionHeader
        icon={IconPlus}
        label="Suggested"
        loading={allRepositoriesLoading}
      />
      <p className="text-xs text-muted-foreground">
        Based on your project name, click to connect instantly.
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <AnimatePresence mode="popLayout">
          {suggestedIntegrations.map(({ repo }) => (
            <motion.div
              key={repo.id}
              layoutId={`repo-${repo.id}`}
              layout
              transition={{ layout: { duration: 0.3, ease: EASE_OUT } }}
            >
              <button
                type="button"
                disabled={connectingId !== null}
                onClick={() => handleConnect(repo)}
                className="w-full flex flex-col items-center gap-2 p-4 rounded-lg border border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer text-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                  {repo.avatarUrl ? (
                    <img
                      src={repo.avatarUrl}
                      alt={repo.owner}
                      className="size-12 rounded-full object-cover"
                    />
                  ) : (
                    <IconBrandGithub className="size-5" />
                  )}
                </div>
                <div className="text-sm font-medium truncate w-full text-center">
                  {repo.name}
                </div>
                <div className="text-xs text-muted-foreground truncate w-full">
                  {repo.owner}
                </div>
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
        {!allRepositoriesLoading && suggestedIntegrations.length === 0 && (
          <div className="col-span-full flex items-center justify-center py-8">
            <span className="text-sm text-muted-foreground">
              No suggestions found
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Add Integration wizard
// ────────────────────────────────────────────────────────────

type WizardStep = "provider" | "installation" | "repository";

const STEP_NUMBER: Record<WizardStep, number> = {
  provider: 1,
  installation: 2,
  repository: 3,
};

const STEP_TITLE: Record<WizardStep, string> = {
  provider: "Add integration",
  installation: "Choose installation",
  repository: "Choose repository",
};

function AddIntegrationWizard({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { activeProject } = useProjects();
  const {
    installations,
    repositories,
    selectedInstallationEntityId,
    repositoriesLoading,
  } = useValues(integrationsLogic);
  const { createIntegration } = useAsyncActions(integrationsLogic);
  const { setSelectedInstallationEntityId } = useActions(integrationsLogic);
  const { setShouldReopenIntegrationsDialog } = useActions(commonLogic);

  const [step, setStep] = useState<WizardStep>("provider");
  const [selectedRepository, setSelectedRepository] = useState<string>("");
  const [repoSearch, setRepoSearch] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset on close
  useEffect(() => {
    if (!open) {
      const timeout = setTimeout(() => {
        setStep("provider");
        setSelectedRepository("");
        setRepoSearch("");
        setIsSubmitting(false);
      }, 200);
      return () => clearTimeout(timeout);
    }
  }, [open]);

  // Reset repository when installation changes
  useEffect(() => {
    setSelectedRepository("");
    setRepoSearch("");
  }, [selectedInstallationEntityId]);

  const handleInstallApp = () => {
    setShouldReopenIntegrationsDialog(true);
    window.location.href = `https://github.com/apps/cryptly-dev/installations/new?state="projectId=${activeProject?.id}"`;
  };

  const handleInstallationSelect = (value: string) => {
    if (value === "add-installation") {
      handleInstallApp();
    } else {
      setSelectedInstallationEntityId(value);
      setStep("repository");
    }
  };

  const handleConnectRepo = async (repoFullName: string) => {
    if (!selectedInstallationEntityId) return;

    const repository = repositories.find(
      (repo) => `${repo.owner}/${repo.name}` === repoFullName
    );
    if (!repository) return;

    setIsSubmitting(true);
    await createIntegration(
      Number(repository.id),
      selectedInstallationEntityId!
    );
    setIsSubmitting(false);

    posthog.capture("integration_created", { type: "github" });
    onOpenChange(false);
  };

  const goBack = () => {
    if (step === "installation") setStep("provider");
    else if (step === "repository") setStep("installation");
  };

  const showBack = step !== "provider";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {/* Back arrow */}
        {showBack && (
          <button
            type="button"
            onClick={goBack}
            className="absolute top-4 left-4 p-1 rounded-sm opacity-70 hover:opacity-100 transition-opacity cursor-pointer z-10"
          >
            <IconArrowLeft className="size-4" />
          </button>
        )}

        {/* Header */}
        <div className="flex flex-col items-center gap-3 pt-1">
          <DialogTitle className="text-center">
            {STEP_TITLE[step]}
          </DialogTitle>
          <WizardStepper
            currentStep={STEP_NUMBER[step]}
            totalSteps={3}
          />
          <DialogDescription className="sr-only">
            Step {STEP_NUMBER[step]} of 3
          </DialogDescription>
        </div>

        {/* Step 1: Provider */}
        {step === "provider" && (
          <div className="grid grid-cols-3 gap-3 pt-2">
            <button
              type="button"
              onClick={() => setStep("installation")}
              className="flex flex-col items-center gap-2 p-5 rounded-lg border border-border/50 bg-neutral-800/50 hover:bg-neutral-800 hover:border-primary/30 transition-all cursor-pointer text-center"
            >
              <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
                <IconBrandGithub className="size-5 text-primary" />
              </div>
              <div className="text-sm font-medium">GitHub</div>
            </button>

            <button
              type="button"
              disabled
              className="flex flex-col items-center gap-2 p-5 rounded-lg border border-border/50 bg-neutral-800/30 opacity-50 cursor-not-allowed text-center relative"
            >
              <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
                <IconRocket className="size-5 text-primary" />
              </div>
              <div className="text-sm font-medium">Vercel</div>
              <span className="absolute top-2 right-2 text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                Soon
              </span>
            </button>

            <button
              type="button"
              onClick={() =>
                window.open(
                  "https://github.com/cryptly-dev/cryptly/issues",
                  "_blank"
                )
              }
              className="flex flex-col items-center gap-2 p-5 rounded-lg border border-border/50 bg-neutral-800/50 hover:bg-neutral-800 hover:border-primary/30 transition-all cursor-pointer text-center"
            >
              <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
                <IconMessageCircle className="size-5 text-primary" />
              </div>
              <div className="text-sm font-medium">Other?</div>
            </button>
          </div>
        )}

        {/* Step 2: Installation */}
        {step === "installation" && (
          <div className="space-y-2 pt-2">
            {installations.length === 0 ? (
              <div className="text-center py-8 space-y-3">
                <div className="text-sm text-muted-foreground">
                  No GitHub installations found.
                </div>
                <Button
                  onClick={handleInstallApp}
                  className="cursor-pointer"
                >
                  <IconPlus className="size-4 mr-2" />
                  Install GitHub App
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {installations.map((installation) => (
                    <button
                      key={installation.id}
                      type="button"
                      onClick={() => handleInstallationSelect(installation.id)}
                      className="flex items-center gap-3 p-3 rounded-lg w-full text-left border border-border/50 bg-neutral-800/50 hover:bg-neutral-800 hover:border-primary/30 transition-all cursor-pointer"
                    >
                      <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium overflow-hidden">
                        {installation.liveData?.avatar ? (
                          <img
                            src={installation.liveData.avatar}
                            alt={installation.liveData.owner}
                            className="size-8 rounded-full object-cover"
                          />
                        ) : (
                          <IconBrandGithub className="size-4" />
                        )}
                      </div>
                      <div className="text-sm font-medium">
                        {installation.liveData?.owner ??
                          `Installation ${installation.githubInstallationId}`}
                      </div>
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={handleInstallApp}
                  className="flex items-center gap-3 p-3 rounded-lg w-full text-left border border-dashed border-border/50 bg-neutral-800/30 hover:bg-neutral-800 hover:border-primary/30 transition-all cursor-pointer text-muted-foreground"
                >
                  <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <IconPlus className="size-4 text-primary" />
                  </div>
                  <div className="text-sm font-medium">
                    Add new installation
                  </div>
                </button>
              </>
            )}
          </div>
        )}

        {/* Step 3: Repository */}
        {step === "repository" && (
          <div className="space-y-2 pt-2 min-w-0">
            {repositoriesLoading ? (
              <div className="flex flex-col items-center justify-center py-8 gap-3">
                <Spinner className="size-5 text-muted-foreground" />
                <div className="text-sm text-muted-foreground">
                  Loading repositories...
                </div>
              </div>
            ) : (
              <>
                <Input
                  placeholder="Search repositories..."
                  value={repoSearch}
                  onChange={(e) => setRepoSearch(e.target.value)}
                  autoFocus
                />
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {repositories
                    .filter((repo) =>
                      `${repo.owner}/${repo.name}`
                        .toLowerCase()
                        .includes(repoSearch.toLowerCase())
                    )
                    .map((repo) => {
                      const fullName = `${repo.owner}/${repo.name}`;
                      return (
                        <button
                          key={repo.id}
                          type="button"
                          disabled={isSubmitting}
                          onClick={() => handleConnectRepo(fullName)}
                          className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg w-full min-w-0 text-left border border-border/50 bg-neutral-800/50 hover:bg-neutral-800 hover:border-primary/30 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <div className="size-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium overflow-hidden shrink-0">
                            {repo.avatarUrl ? (
                              <img
                                src={repo.avatarUrl}
                                alt={repo.owner}
                                className="size-6 rounded-full object-cover"
                              />
                            ) : (
                              <IconBrandGithub className="size-3.5" />
                            )}
                          </div>
                          <div className="text-sm font-medium truncate">
                            {fullName}
                          </div>
                        </button>
                      );
                    })}
                  {repositories.filter((repo) =>
                    `${repo.owner}/${repo.name}`
                      .toLowerCase()
                      .includes(repoSearch.toLowerCase())
                  ).length === 0 && (
                    <div className="text-center py-4 text-sm text-muted-foreground">
                      No repositories found.
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ────────────────────────────────────────────────────────────
// IntegrationsTabContent (desktop tab)
// ────────────────────────────────────────────────────────────

export function IntegrationsTabContent() {
  const { projectData } = useValues(projectLogic);
  const { currentUserRole } = useValues(projectLogic);
  const [wizardOpen, setWizardOpen] = useState(false);

  return (
    <div className="w-full max-w-xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold mb-1">Integrations</h2>
          <p className="text-sm text-muted-foreground">
            Connect external services to{" "}
            <span className="font-medium text-foreground">
              {projectData?.name}
            </span>
          </p>
        </div>

        {currentUserRole === ProjectMemberRole.Admin && (
          <Button
            onClick={() => setWizardOpen(true)}
            className="cursor-pointer shrink-0"
          >
            <IconPlus className="size-4 mr-2" />
            Connect integration
          </Button>
        )}
      </div>

      <IntegrationsSection />
      <SuggestedIntegrationSection />

      <div className="rounded-lg border border-border/50 bg-neutral-800/30 p-4 space-y-3">
        <p className="text-xs text-muted-foreground">
          Use the push button in{" "}
          <span className="inline-flex items-center gap-1 align-middle bg-secondary/50 px-1.5 py-0.5 rounded text-[11px] text-foreground font-medium">
            <IconBraces className="size-3" />
            Editor
          </span>{" "}
          to sync your secrets to all connected{" "}
          <span className="inline-flex items-center gap-1 align-middle bg-secondary/50 px-1.5 py-0.5 rounded text-[11px] text-foreground font-medium">
            <IconPlugConnected className="size-3" />
            Integrations
          </span>
        </p>

        <div className="flex items-center justify-center gap-4">
          <div className="flex flex-col items-center gap-1.5">
            <div className="size-10 rounded-lg bg-secondary/50 border border-border/50 flex items-center justify-center">
              <CloudUpload className="size-5 text-muted-foreground" />
            </div>
            <span className="text-[11px] text-muted-foreground">Push</span>
          </div>

          <IconArrowNarrowRight className="size-5 text-muted-foreground" />

          <div className="flex flex-col items-center gap-1.5">
            <div className="size-10 rounded-lg bg-secondary/50 border border-border/50 flex items-center justify-center">
              <IconBrandGithub className="size-5 text-muted-foreground" />
            </div>
            <span className="text-[11px] text-muted-foreground">
              Actions Secrets
            </span>
          </div>
        </div>
      </div>

      <AddIntegrationWizard open={wizardOpen} onOpenChange={setWizardOpen} />
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// IntegrationsDialog (mobile)
// ────────────────────────────────────────────────────────────

interface IntegrationsDialogProps {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function IntegrationsDialog({
  open,
  onOpenChange,
}: IntegrationsDialogProps) {
  const { projectData } = useValues(projectLogic);
  const { currentUserRole } = useValues(projectLogic);
  const [wizardOpen, setWizardOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <div className="grid gap-6">
          <DialogHeader>
            <DialogTitle>Integrations</DialogTitle>
            <DialogDescription>
              Connect external services to{" "}
              <span className="font-medium text-foreground">
                {projectData?.name}
              </span>
            </DialogDescription>
          </DialogHeader>

          <SuggestedIntegrationSection />
          <IntegrationsSection />

          {currentUserRole === ProjectMemberRole.Admin && (
            <Button
              onClick={() => setWizardOpen(true)}
              className="w-full cursor-pointer"
            >
              <IconPlus className="size-4 mr-2" />
              Connect integration
            </Button>
          )}
        </div>

        <AddIntegrationWizard
          open={wizardOpen}
          onOpenChange={setWizardOpen}
        />
      </DialogContent>
    </Dialog>
  );
}

export default IntegrationsDialog;
