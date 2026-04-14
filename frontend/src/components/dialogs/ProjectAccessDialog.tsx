import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  InputAction,
  InputWithActions,
} from "@/components/ui/input-with-actions";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Invitation } from "@/lib/api/invitations.api";
import type { PersonalInvitation } from "@/lib/api/personal-invitations.api";
import { ProjectMemberRole, type ProjectMember } from "@/lib/api/projects.api";
import type { SuggestedUser } from "@/lib/api/user.api";
import { authLogic } from "@/lib/logics/authLogic";
import { invitationsLogic } from "@/lib/logics/invitationsLogic";
import { personalInvitationsLogic } from "@/lib/logics/personalInvitationsLogic";
import { projectLogic } from "@/lib/logics/projectLogic";
import { projectSettingsLogic } from "@/lib/logics/projectSettingsLogic";
import { suggestedUsersLogic } from "@/lib/logics/suggestedUsersLogic";
import { cn, getRelativeTime } from "@/lib/utils";
import {
  IconArrowLeft,
  IconArrowRight,
  IconCheck,
  IconCopy,
  IconCrown,
  IconEye,
  IconEyeOff,
  IconLink,
  IconPencil,
  IconRefresh,
  IconTrash,
  IconUsers,
  IconUserPlus,
} from "@tabler/icons-react";
import { useActions, useAsyncActions, useValues } from "kea";
import posthog from "posthog-js";
import { useEffect, useMemo, useState } from "react";
import { WizardStepper } from "@/components/ui/wizard-stepper";

// ────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────

function generateInviteCode(length = 32): string {
  // Exclude ambiguous characters: i, l, 0, o (and uppercase I, L, O)
  const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ123456789";
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => chars[byte % chars.length]).join("");
}

const ROLE_META: Record<
  string,
  { icon: typeof IconEye; label: string; description: string }
> = {
  [ProjectMemberRole.Read]: {
    icon: IconEye,
    label: "Read",
    description: "View secrets, project name, and integrations.",
  },
  [ProjectMemberRole.Write]: {
    icon: IconPencil,
    label: "Write",
    description: "Read access plus create, edit, and delete secrets.",
  },
  [ProjectMemberRole.Admin]: {
    icon: IconCrown,
    label: "Admin",
    description:
      "Full control — integrations, members, and project settings.",
  },
};

// ────────────────────────────────────────────────────────────
// Member card (vertical, clickable)
// ────────────────────────────────────────────────────────────

function MemberCard({
  member,
  onClick,
}: {
  member: ProjectMember;
  onClick: () => void;
}) {
  const { userData } = useValues(authLogic);
  const roleMeta = ROLE_META[member.role];

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-2 p-4 rounded-lg bg-neutral-800/50 border border-border/50 hover:bg-neutral-800 hover:border-primary/30 transition-all cursor-pointer text-center"
    >
      <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium overflow-hidden">
        {member.avatarUrl ? (
          <img
            src={member.avatarUrl}
            alt={member.displayName}
            className="size-12 rounded-full object-cover"
          />
        ) : (
          <span className="text-lg">
            {member.displayName.charAt(0).toUpperCase()}
          </span>
        )}
      </div>

      <div className="text-sm font-medium truncate w-full text-center">
        {member.id === userData?.id ? "You" : member.displayName}
      </div>

      <div className="text-xs px-2 py-1 rounded capitalize bg-muted text-muted-foreground">
        {roleMeta?.label ?? member.role}
      </div>
    </button>
  );
}

// ────────────────────────────────────────────────────────────
// Member detail dialog
// ────────────────────────────────────────────────────────────

function MemberDetailDialog({
  member,
  projectId,
  open,
  onOpenChange,
}: {
  member: ProjectMember | null;
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { updateMemberRole, removeMember } =
    useAsyncActions(projectSettingsLogic);
  const { userData } = useValues(authLogic);
  const { currentUserRole } = useValues(projectLogic);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  if (!member) return null;

  const canEdit =
    member.id !== userData?.id &&
    currentUserRole === ProjectMemberRole.Admin;

  const handleRoleChange = async (newRole: ProjectMemberRole) => {
    if (newRole === member.role) return;
    setIsUpdating(true);
    await updateMemberRole({ projectId, memberId: member.id, role: newRole });
    setIsUpdating(false);
  };

  const handleRemove = async () => {
    setIsRemoving(true);
    await removeMember({ projectId, memberId: member.id });
    setIsRemoving(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm" onOpenAutoFocus={(e) => e.preventDefault()}>
        <div className="flex flex-col items-center gap-4">
          <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium overflow-hidden">
            {member.avatarUrl ? (
              <img
                src={member.avatarUrl}
                alt={member.displayName}
                className="size-16 rounded-full object-cover"
              />
            ) : (
              <span className="text-2xl">
                {member.displayName.charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          <DialogTitle>{member.id === userData?.id ? "You" : member.displayName}</DialogTitle>
          <DialogDescription className="sr-only">Member details</DialogDescription>

          {canEdit ? (
            <div className="w-full space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Role</label>
                <TooltipProvider skipDelayDuration={300}>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.entries(ROLE_META).map(([value, meta]) => {
                      const Icon = meta.icon;
                      const isSelected = member.role === value;

                      return (
                        <Tooltip key={value} delayDuration={400}>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              disabled={isUpdating}
                              onClick={() => handleRoleChange(value as ProjectMemberRole)}
                              className={cn(
                                "flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-all cursor-pointer text-center disabled:opacity-50 disabled:cursor-not-allowed",
                                isSelected
                                  ? "border-primary bg-primary/10"
                                  : "border-border/50 bg-neutral-800/50 hover:bg-neutral-800 hover:border-primary/30"
                              )}
                            >
                              <Icon className="size-4 text-primary" />
                              <div className="text-xs font-medium">
                                {meta.label}
                              </div>
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="bottom" className="max-w-48 text-center">
                            {meta.description}
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </div>
                </TooltipProvider>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Actions</label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={handleRemove}
                    isLoading={isRemoving}
                    variant="outline"
                    className="cursor-pointer text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <IconTrash className="size-4 mr-2" />
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-xs px-3 py-1.5 rounded capitalize bg-muted text-muted-foreground">
              {ROLE_META[member.role]?.label ?? member.role}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ────────────────────────────────────────────────────────────
// Members section (grid)
// ────────────────────────────────────────────────────────────

function MembersSection() {
  const { projectData } = useValues(projectLogic);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  if (!projectData) return null;

  const selectedMember = selectedMemberId
    ? projectData.members.find((m) => m.id === selectedMemberId) ?? null
    : null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <IconUsers className="size-4 text-muted-foreground" />
        <h3 className="text-sm font-medium">Members</h3>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {projectData.members.map((member) => (
          <MemberCard
            key={member.id}
            member={member}
            onClick={() => setSelectedMemberId(member.id)}
          />
        ))}
      </div>
      <MemberDetailDialog
        member={selectedMember}
        projectId={projectData.id}
        open={!!selectedMember}
        onOpenChange={(open) => { if (!open) setSelectedMemberId(null); }}
      />
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Active invite card (vertical)
// ────────────────────────────────────────────────────────────

type ActiveInvite =
  | { type: "link"; data: Invitation }
  | { type: "personal"; data: PersonalInvitation };

function ActiveInviteCard({ invite }: { invite: ActiveInvite }) {
  const { deleteInvitation } = useAsyncActions(invitationsLogic);
  const { deletePersonalInvitation } = useActions(personalInvitationsLogic);
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCopyLink = async (linkId: string, link: string) => {
    await navigator.clipboard.writeText(link);
    setCopiedLinkId(linkId);
    setTimeout(() => setCopiedLinkId(null), 1_000);
  };

  const handleRevoke = async () => {
    setIsLoading(true);
    if (invite.type === "link") {
      await deleteInvitation(invite.data.id);
    } else {
      deletePersonalInvitation(invite.data.id);
    }
  };

  return (
    <div className="group relative flex flex-col items-center gap-2 p-4 rounded-lg bg-neutral-800/50 border border-border/50">
      <div className="absolute top-2 right-2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        {invite.type === "link" && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() =>
              handleCopyLink(
                invite.data.id,
                `${import.meta.env.VITE_APP_URL}/invite/${invite.data.id}`
              )
            }
            className="size-6 p-0 cursor-pointer"
            aria-label="Copy link"
          >
            {copiedLinkId === invite.data.id ? (
              <IconCheck className="size-3.5 text-green-600" />
            ) : (
              <IconCopy className="size-3.5" />
            )}
          </Button>
        )}
        <Button
          isLoading={isLoading}
          type="button"
          size="sm"
          variant="ghost"
          onClick={handleRevoke}
          disabled={isLoading}
          className="size-6 p-0 text-destructive hover:text-destructive cursor-pointer"
          aria-label={
            invite.type === "link" ? "Revoke link" : "Revoke invitation"
          }
        >
          <IconTrash className="size-3.5" />
        </Button>
      </div>

      <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium overflow-hidden">
        {invite.type === "personal" ? (
          invite.data.invitedUser.avatarUrl ? (
            <img
              src={invite.data.invitedUser.avatarUrl}
              alt={invite.data.invitedUser.displayName}
              className="size-12 rounded-full object-cover"
            />
          ) : (
            <span className="text-lg">
              {invite.data.invitedUser.displayName.charAt(0).toUpperCase()}
            </span>
          )
        ) : (
          <IconLink className="size-5" />
        )}
      </div>

      <div className="text-sm font-medium truncate w-full text-center">
        {invite.type === "personal"
          ? invite.data.invitedUser.displayName
          : "Invite link"}
      </div>

      <div className="text-xs text-muted-foreground text-center">
        {invite.type === "personal" ? (
          <>
            {invite.data.role} &middot;{" "}
            {getRelativeTime(invite.data.createdAt)}
          </>
        ) : (
          <>ID: {invite.data.id.slice(-8)}</>
        )}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Active invites section (grid)
// ────────────────────────────────────────────────────────────

function ActiveInvitesSection() {
  const { projectData, userData } = useValues(projectLogic);
  const { invitations, invitationsLoading } = useValues(invitationsLogic);
  const { personalInvitations, personalInvitationsLoading } = useValues(
    personalInvitationsLogic
  );
  const { loadInvitations } = useActions(invitationsLogic);
  const { loadPersonalInvitations } = useActions(personalInvitationsLogic);

  const myRole = useMemo(
    () =>
      projectData?.members.find((m) => m.id === userData?.id)?.role,
    [projectData?.members, userData?.id]
  );

  useEffect(() => {
    if (myRole === ProjectMemberRole.Admin) {
      loadInvitations();
      loadPersonalInvitations();
    }
  }, [myRole]);

  const allInvites = useMemo((): ActiveInvite[] => {
    const linkInvites: ActiveInvite[] =
      invitations?.map((inv) => ({ type: "link" as const, data: inv })) || [];
    const personalInvites: ActiveInvite[] =
      personalInvitations?.map((inv) => ({
        type: "personal" as const,
        data: inv,
      })) || [];
    return [...linkInvites, ...personalInvites].sort(
      (a, b) =>
        new Date(b.data.createdAt).getTime() -
        new Date(a.data.createdAt).getTime()
    );
  }, [invitations, personalInvitations]);

  if (myRole !== ProjectMemberRole.Admin) return null;

  const isLoading =
    (invitationsLoading && !invitations) ||
    (personalInvitationsLoading && !personalInvitations);

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <IconUserPlus className="size-4 text-muted-foreground" />
          <h3 className="text-sm font-medium">Active invites</h3>
        </div>
        <div className="text-center py-8">
          <div className="text-sm text-muted-foreground">
            Loading invites...
          </div>
        </div>
      </div>
    );
  }

  if (allInvites.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <IconUserPlus className="size-4 text-muted-foreground" />
        <h3 className="text-sm font-medium">Active invites</h3>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {allInvites.map((invite) => (
          <ActiveInviteCard
            key={
              invite.type === "link"
                ? `link-${invite.data.id}`
                : `personal-${invite.data.id}`
            }
            invite={invite}
          />
        ))}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Add People wizard
// ────────────────────────────────────────────────────────────

type WizardStep =
  | "type"
  | "invite-link-code"
  | "suggested-user"
  | "team"
  | "role"
  | "done";

type InviteType = "invite-link" | "suggested-user" | "team";

const STEP_NUMBER: Record<WizardStep, number> = {
  type: 1,
  "invite-link-code": 2,
  "suggested-user": 2,
  team: 2,
  role: 3,
  done: 3,
};

const STEP_TITLE: Record<WizardStep, string> = {
  type: "Add people",
  "invite-link-code": "Invitation code",
  "suggested-user": "Choose a person",
  team: "Team",
  role: "Choose a role",
  done: "",
};

function AddPeopleWizard({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { createInvitation } = useAsyncActions(invitationsLogic);
  const { createPersonalInvitation } = useAsyncActions(
    personalInvitationsLogic
  );
  const { suggestedUsers, suggestedUsersLoading } =
    useValues(suggestedUsersLogic);
  const { loadSuggestedUsers } = useActions(suggestedUsersLogic);
  const { lastCreatedInvitation } = useValues(invitationsLogic);

  const [step, setStep] = useState<WizardStep>("type");
  const [inviteType, setInviteType] = useState<InviteType | null>(null);
  const [passphrase, setPassphrase] = useState("");
  const [selectedUser, setSelectedUser] = useState<SuggestedUser | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showCode, setShowCode] = useState(false);

  useEffect(() => {
    if (open) loadSuggestedUsers();
  }, [open]);

  // Reset on close (delayed to let the dialog's close animation finish)
  useEffect(() => {
    if (!open) {
      const timeout = setTimeout(() => {
        setStep("type");
        setInviteType(null);
        setPassphrase("");
        setSelectedUser(null);
        setIsSubmitting(false);
        setCopiedField(null);
        setShowCode(false);
      }, 200);
      return () => clearTimeout(timeout);
    }
  }, [open]);

  const goBack = () => {
    if (
      step === "invite-link-code" ||
      step === "suggested-user" ||
      step === "team"
    )
      setStep("type");
    else if (step === "role")
      setStep(
        inviteType === "invite-link" ? "invite-link-code" : "suggested-user"
      );
  };

  const showBack = step !== "type" && step !== "done";

  const handleSubmit = async (role: ProjectMemberRole) => {
    setIsSubmitting(true);
    try {
      if (inviteType === "invite-link") {
        await createInvitation(
          passphrase,
          role as "read" | "write" | "admin"
        );
        setStep("done");
      } else if (inviteType === "suggested-user" && selectedUser?.publicKey) {
        await createPersonalInvitation(
          selectedUser.id,
          selectedUser.publicKey,
          role
        );
        posthog.capture("personal_invitation_created");
        setStep("done");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const inviteUrl = lastCreatedInvitation
    ? `${import.meta.env.VITE_APP_URL}/invite/${lastCreatedInvitation.id}`
    : "";

  const handleCopy = async (field: string, value: string) => {
    await navigator.clipboard.writeText(value);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2_000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" onOpenAutoFocus={(e) => e.preventDefault()}>
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

        {/* ── Header: title + info icon + stepper ── */}
        {step !== "done" && (
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
        )}

        {/* ── Step 1: Choose type ── */}
        {step === "type" && (
          <TooltipProvider skipDelayDuration={300}>
            <div className="grid grid-cols-3 gap-3 pt-2">
              <Tooltip delayDuration={400}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => {
                      setInviteType("invite-link");
                      setStep("invite-link-code");
                    }}
                    className="flex flex-col items-center gap-2 p-5 rounded-lg border border-border/50 bg-neutral-800/50 hover:bg-neutral-800 hover:border-primary/30 transition-all cursor-pointer text-center"
                  >
                    <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <IconLink className="size-5 text-primary" />
                    </div>
                    <div className="text-sm font-medium">Invite link</div>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  Secure single-use link
                </TooltipContent>
              </Tooltip>

              <Tooltip delayDuration={400}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => {
                      setInviteType("suggested-user");
                      setStep("suggested-user");
                    }}
                    className="flex flex-col items-center gap-2 p-5 rounded-lg border border-border/50 bg-neutral-800/50 hover:bg-neutral-800 hover:border-primary/30 transition-all cursor-pointer text-center"
                  >
                    <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <IconUserPlus className="size-5 text-primary" />
                    </div>
                    <div className="text-sm font-medium">Suggested</div>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  Someone you've worked with
                </TooltipContent>
              </Tooltip>

              <Tooltip delayDuration={400}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    disabled
                    className="flex flex-col items-center gap-2 p-5 rounded-lg border border-border/50 bg-neutral-800/30 opacity-50 cursor-not-allowed text-center relative"
                  >
                    <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <IconUsers className="size-5 text-primary" />
                    </div>
                    <div className="text-sm font-medium">Team</div>
                    <span className="absolute top-2 right-2 text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                      Soon
                    </span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  Invite an entire team at once
                </TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        )}

        {/* ── Step 2a: Invite-link code ── */}
        {step === "invite-link-code" && (
          <TooltipProvider skipDelayDuration={300}>
            <div className="space-y-3 pt-2">
              <InputWithActions
                type="text"
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                className="font-mono"
                placeholder="Enter or generate a code"
                autoFocus
                actions={
                  <>
                    <Tooltip delayDuration={300}>
                      <TooltipTrigger asChild>
                        <InputAction
                          onClick={() => setPassphrase(generateInviteCode())}
                        >
                          <IconRefresh className="size-4" />
                        </InputAction>
                      </TooltipTrigger>
                      <TooltipContent>Generate random code</TooltipContent>
                    </Tooltip>
                    <InputAction
                      onClick={() => setStep("role")}
                      disabled={!passphrase.trim()}
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      <IconArrowRight className="size-4" />
                    </InputAction>
                  </>
                }
              />
              <p className="text-xs text-muted-foreground text-center leading-relaxed">
                The code protects the link. Share it separately — only someone who knows both can join.
              </p>
            </div>
          </TooltipProvider>
        )}

        {/* ── Step 2b: Suggested user ── */}
        {step === "suggested-user" && (
          <div className="space-y-4 pt-2">
            {suggestedUsersLoading && suggestedUsers.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-sm text-muted-foreground">Loading...</div>
              </div>
            ) : suggestedUsers.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-sm text-muted-foreground">
                  No suggested users found.
                </div>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {suggestedUsers.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => {
                      setSelectedUser(user);
                      setStep("role");
                    }}
                    disabled={!user.publicKey}
                    className="flex items-center gap-3 p-3 rounded-lg w-full text-left border border-border/50 bg-neutral-800/50 hover:bg-neutral-800 hover:border-primary/30 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium overflow-hidden">
                      {user.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt={user.displayName}
                          className="size-8 rounded-full object-cover"
                        />
                      ) : (
                        user.displayName.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="text-sm font-medium">
                      {user.displayName}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Step 2c: Team (coming soon) ── */}
        {step === "team" && (
          <div className="space-y-4 pt-2">
            <p className="text-sm text-muted-foreground text-center">
              This feature is coming soon.
            </p>
          </div>
        )}

        {/* ── Step 3: Choose role ── */}
        {step === "role" && (
          <div className="pt-2">
            <TooltipProvider skipDelayDuration={300}>
              <div className="grid grid-cols-3 gap-3">
                {Object.entries(ROLE_META).map(([value, meta]) => {
                  const Icon = meta.icon;

                  return (
                    <Tooltip key={value} delayDuration={400}>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          disabled={isSubmitting}
                          onClick={() => handleSubmit(value as ProjectMemberRole)}
                          className="flex flex-col items-center gap-2 p-5 rounded-lg border border-border/50 bg-neutral-800/50 hover:bg-neutral-800 hover:border-primary/30 transition-all cursor-pointer text-center disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <div className="size-10 rounded-full flex items-center justify-center bg-primary/10">
                            <Icon className="size-5 text-primary" />
                          </div>
                          <div className="text-sm font-medium">
                            {meta.label}
                          </div>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent
                        side="bottom"
                        className="max-w-48 text-center"
                      >
                        {meta.description}
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            </TooltipProvider>
          </div>
        )}

        {/* ── Step 4: Done ── */}
        {step === "done" && (
          <div className="space-y-4">
            <DialogHeader>
              <DialogTitle className="text-center">
                {inviteType === "invite-link"
                  ? "Invite ready"
                  : "Invitation sent"}
              </DialogTitle>
              <DialogDescription className="text-center">
                {inviteType === "invite-link"
                  ? "The invited person needs both the link and the code to join."
                  : `${selectedUser?.displayName} has been invited to the project.`}
              </DialogDescription>
            </DialogHeader>

            {inviteType === "invite-link" && inviteUrl && (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Invite link</label>
                  <InputWithActions
                    type="text"
                    value={inviteUrl}
                    readOnly
                    className="font-mono truncate"
                    focusRing={false}
                    actions={
                      <InputAction onClick={() => handleCopy("link", inviteUrl)}>
                        {copiedField === "link" ? (
                          <IconCheck className="size-4 text-green-500" />
                        ) : (
                          <IconCopy className="size-4" />
                        )}
                      </InputAction>
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Invitation code</label>
                  <InputWithActions
                    type={showCode ? "text" : "password"}
                    value={passphrase}
                    readOnly
                    className="font-mono truncate"
                    focusRing={false}
                    actions={
                      <>
                        <InputAction onClick={() => setShowCode(!showCode)}>
                          {showCode ? (
                            <IconEyeOff className="size-4" />
                          ) : (
                            <IconEye className="size-4" />
                          )}
                        </InputAction>
                        <InputAction onClick={() => handleCopy("code", passphrase)}>
                          {copiedField === "code" ? (
                            <IconCheck className="size-4 text-green-500" />
                          ) : (
                            <IconCopy className="size-4" />
                          )}
                        </InputAction>
                      </>
                    }
                  />
                </div>

                <p className="text-xs text-muted-foreground text-center">
                  You won't be able to see the code again after closing this dialog.
                </p>
              </div>
            )}

            <Button
              onClick={() => onOpenChange(false)}
              className="w-full cursor-pointer"
            >
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ────────────────────────────────────────────────────────────
// MembersTabContent (desktop tab)
// ────────────────────────────────────────────────────────────

export function MembersTabContent() {
  const { projectData } = useValues(projectLogic);
  const { currentUserRole } = useValues(projectLogic);
  const [wizardOpen, setWizardOpen] = useState(false);

  if (!projectData) return null;

  return (
    <div className="w-full max-w-xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold mb-1">Members</h2>
          <p className="text-sm text-muted-foreground">
            Manage who has access to{" "}
            <span className="font-medium text-foreground">
              {projectData.name}
            </span>
          </p>
        </div>

        {currentUserRole === ProjectMemberRole.Admin && (
          <Button
            onClick={() => setWizardOpen(true)}
            className="cursor-pointer shrink-0"
          >
            <IconUserPlus className="size-4 mr-2" />
            Add people
          </Button>
        )}
      </div>

      <MembersSection />
      <ActiveInvitesSection />

      <AddPeopleWizard open={wizardOpen} onOpenChange={setWizardOpen} />
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// ProjectAccessDialog (mobile)
// ────────────────────────────────────────────────────────────

interface ProjectAccessDialogProps {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ProjectAccessDialog({
  open,
  onOpenChange,
}: ProjectAccessDialogProps) {
  const { projectData } = useValues(projectLogic);
  const { currentUserRole } = useValues(projectLogic);
  const { invitationsLoading } = useValues(invitationsLogic);
  const [wizardOpen, setWizardOpen] = useState(false);

  if (!projectData) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={!invitationsLoading}
        className="sm:max-w-lg"
      >
        <div className="grid gap-6">
          <DialogHeader>
            <DialogTitle>Project access</DialogTitle>
            <DialogDescription>
              Invite others to collaborate on{" "}
              <span className="font-medium text-foreground">
                {projectData.name}
              </span>
              .
            </DialogDescription>
          </DialogHeader>

          <MembersSection />
          <ActiveInvitesSection />

          {currentUserRole === ProjectMemberRole.Admin && (
            <Button
              onClick={() => setWizardOpen(true)}
              className="w-full cursor-pointer"
            >
              <IconUserPlus className="size-4 mr-2" />
              Add people
            </Button>
          )}
        </div>

        <AddPeopleWizard open={wizardOpen} onOpenChange={setWizardOpen} />
      </DialogContent>
    </Dialog>
  );
}

export default ProjectAccessDialog;
