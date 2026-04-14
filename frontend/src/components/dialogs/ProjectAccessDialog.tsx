import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  IconCheck,
  IconCopy,
  IconCrown,
  IconEye,
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
// Member card (vertical)
// ────────────────────────────────────────────────────────────

function MemberCard({
  member,
  projectId,
}: {
  member: ProjectMember;
  projectId: string;
}) {
  const { updateMemberRoleLoading } = useValues(projectSettingsLogic);
  const { updateMemberRole, removeMember } =
    useAsyncActions(projectSettingsLogic);
  const [deleteIsLoading, setDeleteIsLoading] = useState(false);
  const { userData } = useValues(authLogic);
  const { currentUserRole } = useValues(projectLogic);

  const canEditRole =
    member.id !== userData?.id &&
    currentUserRole === ProjectMemberRole.Admin;

  const canRemove =
    member.id !== userData?.id &&
    currentUserRole === ProjectMemberRole.Admin;

  const handleRoleChange = async (newRole: ProjectMemberRole) => {
    if (newRole === member.role) return;
    await updateMemberRole({ projectId, memberId: member.id, role: newRole });
  };

  const handleRemove = async () => {
    setDeleteIsLoading(true);
    await removeMember({ projectId, memberId: member.id });
  };

  return (
    <div className="group relative flex flex-col items-center gap-2 p-4 rounded-lg bg-neutral-800/50 border border-border/50">
      {canRemove && (
        <Button
          isLoading={deleteIsLoading}
          onClick={handleRemove}
          variant="ghost"
          size="sm"
          className="size-6 p-0 text-destructive hover:text-destructive cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2"
          aria-label={`Remove ${member.displayName}`}
        >
          <IconTrash className="size-3.5" />
        </Button>
      )}

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

      {canEditRole ? (
        <Select
          value={member.role}
          onValueChange={(v: ProjectMemberRole) => handleRoleChange(v)}
          disabled={updateMemberRoleLoading}
        >
          <SelectTrigger className="w-24 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(ROLE_META).map(([value, meta]) => (
              <SelectItem key={value} value={value}>
                {meta.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <div className="text-xs px-2 py-1 rounded capitalize bg-muted text-muted-foreground">
          {member.role}
        </div>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Members section (grid)
// ────────────────────────────────────────────────────────────

function MembersSection() {
  const { projectData } = useValues(projectLogic);
  if (!projectData) return null;

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
            projectId={projectData.id}
          />
        ))}
      </div>
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
  const [selectedRole, setSelectedRole] = useState<ProjectMemberRole>(
    ProjectMemberRole.Read
  );
  const [selectedUser, setSelectedUser] = useState<SuggestedUser | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

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
        setSelectedRole(ProjectMemberRole.Read);
        setSelectedUser(null);
        setIsSubmitting(false);
        setCopied(false);
      }, 200);
      return () => clearTimeout(timeout);
    }
  }, [open]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      if (inviteType === "invite-link") {
        await createInvitation(
          passphrase,
          selectedRole as "read" | "write" | "admin"
        );
        setStep("done");
      } else if (inviteType === "suggested-user" && selectedUser?.publicKey) {
        await createPersonalInvitation(
          selectedUser.id,
          selectedUser.publicKey,
          selectedRole
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

  const handleCopy = async () => {
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2_000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {/* ── Step 1: Choose type ── */}
        {step === "type" && (
          <div className="space-y-4">
            <DialogHeader>
              <DialogTitle>Add people</DialogTitle>
              <DialogDescription>
                Choose how you'd like to invite someone to the project.
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => {
                  setInviteType("invite-link");
                  setStep("invite-link-code");
                }}
                className="flex flex-col items-center gap-3 p-5 rounded-lg border border-border/50 bg-neutral-800/50 hover:bg-neutral-800 hover:border-primary/30 transition-all cursor-pointer text-center"
              >
                <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <IconLink className="size-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-medium">Invite link</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Secure single-use link
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setInviteType("suggested-user");
                  setStep("suggested-user");
                }}
                className="flex flex-col items-center gap-3 p-5 rounded-lg border border-border/50 bg-neutral-800/50 hover:bg-neutral-800 hover:border-primary/30 transition-all cursor-pointer text-center"
              >
                <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <IconUserPlus className="size-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-medium">Suggested</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Someone you've worked with
                  </div>
                </div>
              </button>

              <button
                type="button"
                disabled
                className="flex flex-col items-center gap-3 p-5 rounded-lg border border-border/50 bg-neutral-800/30 opacity-50 cursor-not-allowed text-center relative"
              >
                <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <IconUsers className="size-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-medium">Team</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Invite an entire team
                  </div>
                </div>
                <span className="absolute top-2 right-2 text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                  Soon
                </span>
              </button>
            </div>
          </div>
        )}

        {/* ── Step 2a: Invite-link code ── */}
        {step === "invite-link-code" && (
          <div className="space-y-4">
            <DialogHeader>
              <DialogTitle>Create an invitation code</DialogTitle>
              <DialogDescription>
                The code protects the link. Share it separately — only someone
                who knows both can join.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              <input
                type="text"
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                className="w-full rounded-md border px-3 py-2 bg-background text-sm font-mono"
                placeholder="Enter or generate a code"
                autoFocus
              />
              <Button
                type="button"
                variant="outline"
                className="w-full cursor-pointer"
                onClick={() => setPassphrase(generateInviteCode())}
              >
                <IconRefresh className="size-4 mr-2" />
                Generate random code
              </Button>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setStep("type")}
                className="flex-1 cursor-pointer"
              >
                Back
              </Button>
              <Button
                onClick={() => setStep("role")}
                disabled={!passphrase.trim()}
                className="flex-1 cursor-pointer"
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* ── Step 2b: Suggested user ── */}
        {step === "suggested-user" && (
          <div className="space-y-4">
            <DialogHeader>
              <DialogTitle>Choose a person</DialogTitle>
              <DialogDescription>
                People you've collaborated with in other projects.
              </DialogDescription>
            </DialogHeader>

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

            <Button
              variant="outline"
              onClick={() => setStep("type")}
              className="w-full cursor-pointer"
            >
              Back
            </Button>
          </div>
        )}

        {/* ── Step 2c: Team (coming soon) ── */}
        {step === "team" && (
          <div className="space-y-4">
            <DialogHeader>
              <DialogTitle>Team invitations</DialogTitle>
              <DialogDescription>
                This feature is coming soon.
              </DialogDescription>
            </DialogHeader>
            <Button
              variant="outline"
              onClick={() => setStep("type")}
              className="w-full cursor-pointer"
            >
              Back
            </Button>
          </div>
        )}

        {/* ── Step 3: Choose role ── */}
        {step === "role" && (
          <div className="space-y-4">
            <DialogHeader>
              <DialogTitle>Choose a role</DialogTitle>
              <DialogDescription>
                {inviteType === "suggested-user" && selectedUser
                  ? `What should ${selectedUser.displayName} be able to do?`
                  : "What should the invited person be able to do?"}
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-3 gap-3">
              {Object.entries(ROLE_META).map(([value, meta]) => {
                const Icon = meta.icon;
                const isSelected = selectedRole === value;

                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() =>
                      setSelectedRole(value as ProjectMemberRole)
                    }
                    className={cn(
                      "flex flex-col items-center gap-3 p-5 rounded-lg border transition-all cursor-pointer text-center",
                      isSelected
                        ? "border-primary bg-primary/10"
                        : "border-border/50 bg-neutral-800/50 hover:bg-neutral-800 hover:border-primary/30"
                    )}
                  >
                    <div
                      className={cn(
                        "size-10 rounded-full flex items-center justify-center",
                        isSelected ? "bg-primary/20" : "bg-primary/10"
                      )}
                    >
                      <Icon className="size-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">{meta.label}</div>
                      <div className="text-xs text-muted-foreground mt-1 leading-snug">
                        {meta.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() =>
                  setStep(
                    inviteType === "invite-link"
                      ? "invite-link-code"
                      : "suggested-user"
                  )
                }
                className="flex-1 cursor-pointer"
              >
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                isLoading={isSubmitting}
                className="flex-1 cursor-pointer"
              >
                {inviteType === "invite-link"
                  ? "Create invite"
                  : "Send invitation"}
              </Button>
            </div>
          </div>
        )}

        {/* ── Step 4: Done ── */}
        {step === "done" && (
          <div className="space-y-4">
            <DialogHeader>
              <DialogTitle>
                {inviteType === "invite-link"
                  ? "Invite ready!"
                  : "Invitation sent!"}
              </DialogTitle>
              <DialogDescription>
                {inviteType === "invite-link"
                  ? "Share this link with the person you want to invite. They'll also need the invitation code."
                  : `${selectedUser?.displayName} has been invited to the project.`}
              </DialogDescription>
            </DialogHeader>

            {inviteType === "invite-link" && inviteUrl && (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inviteUrl}
                  readOnly
                  className="flex-1 rounded-md border px-3 py-2 bg-neutral-800 text-sm font-mono truncate"
                />
                <Button
                  onClick={handleCopy}
                  variant="outline"
                  className="cursor-pointer shrink-0"
                >
                  {copied ? (
                    <IconCheck className="size-4 text-green-600" />
                  ) : (
                    <IconCopy className="size-4" />
                  )}
                </Button>
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
