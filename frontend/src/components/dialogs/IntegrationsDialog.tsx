import { BulbIcon } from "@/components/ui/BulbIcon";
import { Button } from "@/components/ui/button";
import { ConnectionIcon } from "@/components/ui/ConnectionIcon";
import { DisconnectionIcon } from "@/components/ui/DisconnectionIcon";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { WizardStepper } from "@/components/ui/wizard-stepper";
import type { Integration } from "@/lib/api/integrations.api";
import { ProjectMemberRole } from "@/lib/api/projects.api";
import { useProjects } from "@/lib/hooks/useProjects";
import { commonLogic } from "@/lib/logics/commonLogic";
import {
  integrationsLogic,
  type RepoWithInstallation,
} from "@/lib/logics/integrationsLogic";
import { projectLogic } from "@/lib/logics/projectLogic";
import {
  IconArrowLeft,
  IconArrowRight,
  IconBraces,
  IconBrandGithub,
  IconExternalLink,
  IconPlus,
} from "@tabler/icons-react";
import { useActions, useAsyncActions, useValues } from "kea";
import { Wand2 } from "lucide-react";
import posthog from "posthog-js";
import { useEffect, useState, type ComponentType } from "react";

// ────────────────────────────────────────────────────────────
// Integration row
// ────────────────────────────────────────────────────────────

function IntegrationRow({
  integration,
  canDelete,
}: {
  integration: Integration;
  canDelete: boolean;
}) {
  const { removeIntegration } = useActions(integrationsLogic);
  const owner = integration.repositoryData?.owner;
  const name = integration.repositoryData?.name ?? "Unknown";
  const avatarUrl = integration.repositoryData?.avatarUrl;
  const repoUrl = `https://github.com/${owner}/${name}`;

  const handleOpen = () => {
    window.open(repoUrl, "_blank");
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeIntegration(integration.id);
  };

  return (
    <div className="group flex items-center gap-3 px-4 py-3 hover:bg-neutral-800/40 transition-colors">
      <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden shrink-0">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={owner}
            className="size-8 rounded-full object-cover"
          />
        ) : (
          <IconBrandGithub className="size-4" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">{name}</div>
        <div className="text-xs text-muted-foreground truncate">{owner}</div>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleOpen}
          className="cursor-pointer h-8 px-2 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <IconExternalLink className="size-4 mr-1.5" />
          Open
        </Button>
        {canDelete ? (
          <TooltipProvider>
            <Tooltip delayDuration={150}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={handleRemove}
                  aria-label="Remove connection"
                  className="group/disconnect inline-flex items-center justify-center size-8 rounded-md text-green-600 hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                >
                  <ConnectionIcon className="size-4 group-hover/disconnect:hidden" />
                  <DisconnectionIcon className="size-4 hidden group-hover/disconnect:block" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" sideOffset={6}>
                Remove connection?
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <span className="inline-flex items-center justify-center size-8 text-green-600">
            <ConnectionIcon className="size-4" />
          </span>
        )}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Animation helpers
// ────────────────────────────────────────────────────────────

function SectionHeader({
  icon: Icon,
  label,
  loading,
}: {
  icon: ComponentType<{ className?: string }>;
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

function IntegrationsSection({
  canConnect,
  onConnect,
}: {
  canConnect: boolean;
  onConnect: () => void;
}) {
  const { integrations, integrationsLoading } = useValues(integrationsLogic);

  const showEmptyState = !integrationsLoading && integrations.length === 0;

  return (
    <div className="space-y-3">
      {integrations.length > 0 ? (
        <div className="rounded-lg border border-border/50 bg-neutral-800/20 overflow-hidden divide-y divide-border/50">
          {integrations.map((integration) => (
            <IntegrationRow
              key={integration.id}
              integration={integration}
              canDelete={canConnect}
            />
          ))}
        </div>
      ) : showEmptyState && !canConnect ? (
        <div className="flex items-center justify-center rounded-lg border border-dashed border-border/50 bg-neutral-800/20 py-8">
          <span className="text-sm text-muted-foreground">
            No repositories connected yet
          </span>
        </div>
      ) : null}
      {canConnect && !integrationsLoading && (
        <button
          type="button"
          onClick={onConnect}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-white text-neutral-900 h-8 w-fit px-4 text-sm font-semibold hover:bg-white/90 transition-colors cursor-pointer shadow-sm"
        >
          <IconPlus className="size-4" />
          {integrations.length > 0 ? "Connect another repository" : "Connect repository"}
        </button>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Suggested integration (flat ghost rows)
// ────────────────────────────────────────────────────────────

function SuggestedIntegrationSection() {
  const {
    suggestedIntegrations,
    allRepositoriesLoading,
    installationsLoading,
    integrationsLoading,
  } = useValues(integrationsLogic);
  const { createIntegration } = useAsyncActions(integrationsLogic);
  const [connectingId, setConnectingId] = useState<number | null>(null);
  const isLoading =
    installationsLoading || integrationsLoading || allRepositoriesLoading;

  const handleConnect = async (repo: RepoWithInstallation) => {
    setConnectingId(repo.id);
    await createIntegration(Number(repo.id), repo.installationEntityId);
    setConnectingId(null);
    posthog.capture("integration_created", {
      type: "github",
      source: "suggestion",
    });
  };

  if (!isLoading && suggestedIntegrations.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <SectionHeader icon={Wand2} label="Suggested" loading={isLoading} />
      <p className="text-xs text-muted-foreground">
        We found these repositories on your GitHub account based on your Cryptly
        project name.
      </p>
      <div className="space-y-1">
        {suggestedIntegrations.map(({ repo }) => {
          const isConnecting = connectingId === repo.id;
          return (
            <button
              key={repo.id}
              type="button"
              disabled={connectingId !== null}
              onClick={() => handleConnect(repo)}
              className={`group w-full flex items-center gap-3 rounded-md px-3 py-2 text-left transition-colors cursor-pointer disabled:cursor-not-allowed ${
                isConnecting
                  ? "bg-primary/10"
                  : "hover:bg-primary/10 disabled:opacity-50"
              }`}
            >
              <div className="size-6 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden shrink-0">
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
              <span className="flex-1 min-w-0 truncate text-sm">
                <span className="text-muted-foreground">{repo.owner}/</span>
                <span className="font-medium">{repo.name}</span>
              </span>
              {isConnecting ? (
                <Spinner className="size-3.5 text-primary" />
              ) : (
                <IconArrowRight className="size-3.5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}


// ────────────────────────────────────────────────────────────
// Add Integration wizard
// ────────────────────────────────────────────────────────────

type WizardStep = "installation" | "repository";

const STEP_NUMBER: Record<WizardStep, number> = {
  installation: 1,
  repository: 2,
};

const STEP_TITLE: Record<WizardStep, string> = {
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

  const [step, setStep] = useState<WizardStep>("installation");
  const [repoSearch, setRepoSearch] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset on close
  useEffect(() => {
    if (!open) {
      const timeout = setTimeout(() => {
        setStep("installation");
        setRepoSearch("");
        setIsSubmitting(false);
      }, 200);
      return () => clearTimeout(timeout);
    }
  }, [open]);

  // Reset repository when installation changes
  useEffect(() => {
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
    if (step === "repository") setStep("installation");
  };

  const showBack = step !== "installation";

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
          <DialogTitle className="text-center">{STEP_TITLE[step]}</DialogTitle>
          <WizardStepper currentStep={STEP_NUMBER[step]} totalSteps={2} />
          <DialogDescription className="sr-only">
            Step {STEP_NUMBER[step]} of 2
          </DialogDescription>
        </div>

        {/* Step 1: Installation */}
        {step === "installation" && (
          <div className="space-y-2 pt-2">
            {installations.length === 0 ? (
              <div className="text-center py-8 space-y-3">
                <div className="text-sm text-muted-foreground">
                  No GitHub installations found.
                </div>
                <Button onClick={handleInstallApp} className="cursor-pointer">
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

        {/* Step 2: Repository */}
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
  const { integrations, integrationsLoading } = useValues(integrationsLogic);
  const [wizardOpen, setWizardOpen] = useState(false);

  return (
    <div className="w-full max-w-xl space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-1">Sync externally</h2>
        <p className="text-sm text-muted-foreground">
          Integrate your{" "}
          <span className="font-medium text-foreground">
            {projectData?.name}
          </span>{" "}
          secrets with Github Actions.
        </p>
      </div>

      <IntegrationsSection
        canConnect={currentUserRole === ProjectMemberRole.Admin}
        onConnect={() => setWizardOpen(true)}
      />
      {!integrationsLoading && integrations.length === 0 && (
        <SuggestedIntegrationSection />
      )}

      {integrations.length > 0 && <PushTip />}

      <AddIntegrationWizard open={wizardOpen} onOpenChange={setWizardOpen} />
    </div>
  );
}

function PushTip() {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border/50 bg-neutral-800/30 px-4 py-3">
      <BulbIcon className="size-4 text-amber-500 shrink-0" />
      <p className="text-xs text-muted-foreground leading-relaxed">
        Hit{" "}
        <span className="inline-flex items-center justify-center rounded-md border bg-secondary/50 px-2 py-0.5 text-[11px] text-foreground font-medium align-middle mx-0.5">
          Push
        </span>{" "}
        in the{" "}
        <span className="inline-flex items-center gap-1 align-middle bg-secondary/50 px-1.5 py-0.5 rounded text-[11px] text-foreground font-medium">
          <IconBraces className="size-3" />
          Editor
        </span>{" "}
        to sync your secrets with{" "}
        <IconBrandGithub className="inline size-3.5 align-text-bottom text-muted-foreground" />{" "}
        GitHub Actions.
      </p>
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
  const { integrations, integrationsLoading } = useValues(integrationsLogic);
  const [wizardOpen, setWizardOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <div className="grid gap-6">
          <DialogHeader>
            <DialogTitle>Repositories</DialogTitle>
            <DialogDescription>
              Connect GitHub repositories to{" "}
              <span className="font-medium text-foreground">
                {projectData?.name}
              </span>
            </DialogDescription>
          </DialogHeader>

          <IntegrationsSection
            canConnect={currentUserRole === ProjectMemberRole.Admin}
            onConnect={() => setWizardOpen(true)}
          />
          {!integrationsLoading && integrations.length === 0 && (
            <SuggestedIntegrationSection />
          )}
        </div>

        <AddIntegrationWizard open={wizardOpen} onOpenChange={setWizardOpen} />
      </DialogContent>
    </Dialog>
  );
}

export default IntegrationsDialog;
