import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Invitation } from "@/lib/api/invitations.api";
import type { PersonalInvitation } from "@/lib/api/personal-invitations.api";
import { ProjectMemberRole, type ProjectMember } from "@/lib/api/projects.api";
import { type SuggestedUser } from "@/lib/api/user.api";
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
  IconEye,
  IconEyeOff,
  IconLink,
  IconTrash,
  IconUsers,
  IconUserPlus,
} from "@tabler/icons-react";
import { useActions, useAsyncActions, useValues } from "kea";
import posthog from "posthog-js";
import { useEffect, useMemo, useRef, useState } from "react";

interface ProjectAccessDialogProps {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
}

function MemberItem({
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

  const canEditRole = useMemo(() => {
    // Can't edit your own role
    if (member.id === userData?.id) return false;

    // Only admins can edit roles
    if (currentUserRole === ProjectMemberRole.Admin) {
      return true;
    }

    return false;
  }, [member.id, userData?.id, currentUserRole]);

  const canRemove = useMemo(() => {
    // Can't remove yourself
    if (member.id === userData?.id) return false;

    // Only admins can remove members
    if (currentUserRole !== ProjectMemberRole.Admin) return false;

    return true;
  }, [member.id, userData?.id, currentUserRole]);

  const availableRoles = useMemo(() => {
    const roles = [];

    if (currentUserRole === ProjectMemberRole.Admin) {
      roles.push({ value: ProjectMemberRole.Read, label: "Read" });
      roles.push({ value: ProjectMemberRole.Write, label: "Write" });
      roles.push({ value: ProjectMemberRole.Admin, label: "Admin" });
    }

    return roles;
  }, [currentUserRole]);

  const handleRoleChange = async (newRole: ProjectMemberRole) => {
    if (newRole === member.role) return;

    await updateMemberRole({
      projectId,
      memberId: member.id,
      role: newRole,
    });
  };

  const handleRemove = async () => {
    setDeleteIsLoading(true);
    await removeMember({
      projectId,
      memberId: member.id,
    });
  };

  return (
    <div className="flex items-center gap-3 p-2 rounded-md bg-neutral-800">
      <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium overflow-hidden">
        {member.avatarUrl ? (
          <img
            src={member.avatarUrl}
            alt={member.displayName}
            className="size-8 rounded-full object-cover"
          />
        ) : (
          member.displayName.charAt(0).toUpperCase()
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">
          {member.id === userData?.id ? "You" : member.displayName}
        </div>
        <div className="text-xs text-muted-foreground truncate">
          {member.id === userData?.id ? userData?.email : member.displayName}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {canEditRole ? (
          <Select
            value={member.role}
            onValueChange={(value: ProjectMemberRole) =>
              handleRoleChange(value)
            }
            disabled={updateMemberRoleLoading}
          >
            <SelectTrigger className="w-24 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableRoles.map((role) => (
                <SelectItem key={role.value} value={role.value}>
                  {role.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <div className="text-xs px-2 py-1 rounded capitalize bg-muted text-muted-foreground">
            {member.role}
          </div>
        )}
        {canRemove && (
          <Button
            isLoading={deleteIsLoading}
            onClick={handleRemove}
            variant="ghost"
            size="sm"
            className="size-8 p-0 text-destructive hover:text-destructive cursor-pointer"
            aria-label={`Remove ${member.displayName} from project`}
          >
            <IconTrash className="size-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

function MembersSection() {
  const { projectData } = useValues(projectLogic);

  if (!projectData) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <IconUsers className="size-4 text-muted-foreground" />
        <h3 className="text-sm font-medium">Members</h3>
      </div>
      <div className="space-y-2 max-h-[min(50vh,280px)] overflow-y-auto pr-0.5">
        {projectData.members.map((member) => (
          <MemberItem
            key={member.id}
            member={member}
            projectId={projectData.id}
          />
        ))}
      </div>
    </div>
  );
}

type ActiveInvite =
  | { type: "link"; data: Invitation }
  | { type: "personal"; data: PersonalInvitation };

function ActiveInviteItem({ invite }: { invite: ActiveInvite }) {
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
    <div className="flex items-center gap-3 p-2 rounded-md bg-neutral-800">
      <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium overflow-hidden">
        {invite.type === "personal" ? (
          invite.data.invitedUser.avatarUrl ? (
            <img
              src={invite.data.invitedUser.avatarUrl}
              alt={invite.data.invitedUser.displayName}
              className="size-8 rounded-full object-cover"
            />
          ) : (
            invite.data.invitedUser.displayName.charAt(0).toUpperCase()
          )
        ) : (
          <IconLink className="size-4" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">
          {invite.type === "personal"
            ? invite.data.invitedUser.displayName
            : "Invite link"}
        </div>
        <div className="text-xs text-muted-foreground">
          {invite.type === "personal" ? (
            <>
              {invite.data.role} • Created{" "}
              {getRelativeTime(invite.data.createdAt)}
            </>
          ) : (
            <>
              Created {getRelativeTime(invite.data.createdAt)} • ID:{" "}
              {invite.data.id.slice(-8)}
            </>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
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
            className="size-8 p-0 cursor-pointer"
            aria-label="Copy link"
          >
            {copiedLinkId === invite.data.id ? (
              <IconCheck className="size-4 text-green-600" />
            ) : (
              <IconCopy className="size-4" />
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
          className="size-8 p-0 text-destructive hover:text-destructive cursor-pointer"
          aria-label={
            invite.type === "link" ? "Revoke link" : "Revoke invitation"
          }
        >
          <IconTrash className="size-4" />
        </Button>
      </div>
    </div>
  );
}

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
      projectData?.members.find((member) => member.id === userData?.id)?.role,
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

  if (myRole !== ProjectMemberRole.Admin) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <IconUserPlus className="size-4 text-muted-foreground" />
          <h3 className="text-sm font-medium">Active invites</h3>
        </div>
        <div className="text-center py-6 px-4 bg-neutral-800 rounded-md border border-dashed">
          <div className="text-sm text-muted-foreground">
            Only <span className="font-medium underline">Admins</span> can view
            active invites.
          </div>
        </div>
      </div>
    );
  }

  const isLoading =
    (invitationsLoading && !invitations) ||
    (personalInvitationsLoading && !personalInvitations);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <IconUserPlus className="size-4 text-muted-foreground" />
        <h3 className="text-sm font-medium">Active invites</h3>
      </div>
      {isLoading ? (
        <div className="text-center py-8 px-4">
          <div className="text-sm text-muted-foreground">
            Loading invites...
          </div>
        </div>
      ) : allInvites.length > 0 ? (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {allInvites.map((invite) => (
            <ActiveInviteItem
              key={
                invite.type === "link"
                  ? `link-${invite.data.id}`
                  : `personal-${invite.data.id}`
              }
              invite={invite}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 px-4">
          <div className="text-sm text-muted-foreground mb-2">
            No active invites
          </div>
        </div>
      )}
    </div>
  );
}

const INVITE_LINK_STEPS = 3;

function GenerateNewInviteLinkSection() {
  const { projectData, userData } = useValues(projectLogic);
  const { createInvitation } = useAsyncActions(invitationsLogic);
  const [passphrase, setPassphrase] = useState("");
  const [showPassphrase, setShowPassphrase] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"read" | "write" | "admin">(
    "read"
  );
  const [wizardStep, setWizardStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const passphraseInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (wizardStep !== 2) return;
    const id = requestAnimationFrame(() => {
      passphraseInputRef.current?.focus();
    });
    return () => cancelAnimationFrame(id);
  }, [wizardStep]);

  const myRole = useMemo(
    () =>
      projectData?.members.find((member) => member.id === userData?.id)?.role,
    [projectData?.members, userData?.id]
  );

  const availableRoles = useMemo(() => {
    if (myRole === ProjectMemberRole.Admin) {
      return [
        { value: "read" as const, label: "Read" },
        { value: "write" as const, label: "Write" },
        { value: "admin" as const, label: "Admin" },
      ];
    }
    return [];
  }, [myRole]);

  const handleGenerateLink = async () => {
    setIsLoading(true);
    await createInvitation(passphrase, selectedRole);
    setPassphrase("");
    setWizardStep(0);
    setIsLoading(false);
  };

  if (myRole !== ProjectMemberRole.Admin) {
    return (
      <div className="text-center py-6 px-4 bg-neutral-800 rounded-md border border-dashed">
        <div className="text-sm text-muted-foreground">
          Only <span className="font-medium underline">Admins</span> can
          generate invite links.
        </div>
      </div>
    );
  }

  const roleDescriptions = {
    read: "Can view secrets, the project name, and connected integrations.",
    write:
      "Everything Read can do, plus create, edit, and delete secrets.",
    admin:
      "Everything Write can do, plus manage integrations, rename or delete the project, and invite members.",
  };

  const roleLabel =
    availableRoles.find((r) => r.value === selectedRole)?.label ?? selectedRole;

  return (
    <div className="space-y-4">
      {wizardStep === 0 && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Create a single-use link and an invitation code you share with one
            person. They will need both to join.
          </p>
          <Button
            type="button"
            className="w-full cursor-pointer"
            onClick={() => setWizardStep(1)}
          >
            Generate invite link
          </Button>
        </div>
      )}

      {wizardStep > 0 && (
        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>
            Step {wizardStep} of {INVITE_LINK_STEPS}
          </span>
          <div className="flex gap-1" aria-hidden>
            {Array.from({ length: INVITE_LINK_STEPS }, (_, i) => (
              <span
                key={i}
                className={`h-1.5 w-6 rounded-full transition-colors ${
                  i + 1 <= wizardStep ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {wizardStep === 1 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">
            Choose their role
          </h4>
          <div
            role="group"
            aria-label="Role"
            className="space-y-2 rounded-md border border-neutral-700 bg-neutral-800/50 p-2"
          >
            {availableRoles.map((role) => {
              const isSelected = selectedRole === role.value;
              return (
                <label
                  key={role.value}
                  htmlFor={`invite-role-${role.value}`}
                  className={cn(
                    "flex cursor-pointer gap-3 rounded-md p-2.5 transition-colors",
                    isSelected
                      ? "bg-primary/10 ring-1 ring-primary/40"
                      : "hover:bg-neutral-800"
                  )}
                >
                  <Checkbox
                    id={`invite-role-${role.value}`}
                    checked={isSelected}
                    onCheckedChange={(checked) => {
                      if (checked === true) setSelectedRole(role.value);
                    }}
                    className="mt-0.5"
                  />
                  <span className="text-sm font-medium text-foreground shrink-0 min-w-[4.25rem] whitespace-nowrap pt-0.5">
                    {role.label}
                  </span>
                  <span className="text-sm text-muted-foreground leading-snug flex-1 min-w-0">
                    {roleDescriptions[role.value]}
                  </span>
                </label>
              );
            })}
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 cursor-pointer"
              onClick={() => setWizardStep(0)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="flex-1 cursor-pointer"
              onClick={() => setWizardStep(2)}
            >
              Continue
            </Button>
          </div>
        </div>
      )}

      {wizardStep === 2 && (
        <div className="space-y-3">
          <div>
            <h4 className="text-sm font-medium text-foreground">
              Create an invitation code
            </h4>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Invent a code you share with them (separately from the link). They
              enter it when accepting—one link, one person.
            </p>
          </div>
          <div className="relative">
            <label htmlFor="passphrase" className="sr-only">
              Invitation code
            </label>
            <input
              ref={passphraseInputRef}
              id="passphrase"
              type={showPassphrase ? "text" : "password"}
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              className="w-full rounded-md border px-3 py-2 bg-background text-base sm:text-sm pr-10"
              placeholder="e.g. a word or phrase only you two know"
              autoComplete="new-password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassphrase(!showPassphrase)}
              className="absolute inset-y-0 right-0 flex items-center justify-center h-full px-3 text-muted-foreground hover:text-foreground cursor-pointer"
              aria-label={
                showPassphrase ? "Hide invitation code" : "Show invitation code"
              }
            >
              {showPassphrase ? (
                <IconEyeOff className="size-4" />
              ) : (
                <IconEye className="size-4" />
              )}
            </button>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 cursor-pointer"
              onClick={() => setWizardStep(1)}
            >
              Back
            </Button>
            <Button
              type="button"
              className="flex-1 cursor-pointer"
              disabled={!passphrase.trim()}
              onClick={() => setWizardStep(3)}
            >
              Continue
            </Button>
          </div>
        </div>
      )}

      {wizardStep === 3 && (
        <div className="space-y-3">
          <div>
            <h4 className="text-sm font-medium text-foreground">
              Create the link
            </h4>
            <p className="text-xs text-muted-foreground mt-1">
              We will generate a single-use invite link with these settings.
            </p>
          </div>
          <dl className="rounded-md border bg-muted/40 px-3 py-2.5 space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Role</dt>
              <dd className="font-medium text-foreground">{roleLabel}</dd>
            </div>
            <div className="flex justify-between gap-4 items-center">
              <dt className="text-muted-foreground shrink-0">Invitation code</dt>
              <dd className="flex items-center gap-1.5 min-w-0">
                <span className="font-mono text-right truncate">
                  {showPassphrase
                    ? passphrase
                    : "•".repeat(passphrase.length)}
                </span>
                <button
                  type="button"
                  onClick={() => setShowPassphrase(!showPassphrase)}
                  className="shrink-0 text-muted-foreground hover:text-foreground cursor-pointer p-0.5 rounded"
                  aria-label={
                    showPassphrase ? "Hide invitation code" : "Show invitation code"
                  }
                >
                  {showPassphrase ? (
                    <IconEyeOff className="size-4" />
                  ) : (
                    <IconEye className="size-4" />
                  )}
                </button>
              </dd>
            </div>
          </dl>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 cursor-pointer"
              onClick={() => setWizardStep(2)}
            >
              Back
            </Button>
            <Button
              onClick={handleGenerateLink}
              isLoading={isLoading}
              disabled={!passphrase.trim()}
              className="flex-1 cursor-pointer"
            >
              Generate invite link
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function SuggestedUserItem({ user }: { user: SuggestedUser }) {
  const { createPersonalInvitation } = useAsyncActions(
    personalInvitationsLogic
  );
  const [selectedRole, setSelectedRole] = useState<ProjectMemberRole>(
    ProjectMemberRole.Read
  );
  const [isLoading, setIsLoading] = useState(false);

  const availableRoles = [
    { value: ProjectMemberRole.Read, label: "Read" },
    { value: ProjectMemberRole.Write, label: "Write" },
    { value: ProjectMemberRole.Admin, label: "Admin" },
  ];

  const handleInvite = async () => {
    if (!user.publicKey) {
      return;
    }

    setIsLoading(true);
    try {
      await createPersonalInvitation(user.id, user.publicKey, selectedRole);
      posthog.capture("personal_invitation_created");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3 p-2 rounded-md bg-neutral-800">
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
      <div className="flex-1 min-w-0">
        <div className="text-xs text-muted-foreground truncate">
          {user.displayName}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Select
          value={selectedRole}
          onValueChange={(value: ProjectMemberRole) => setSelectedRole(value)}
        >
          <SelectTrigger className="w-24 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {availableRoles.map((role) => (
              <SelectItem key={role.value} value={role.value}>
                {role.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          onClick={handleInvite}
          isLoading={isLoading}
          disabled={isLoading || !user.publicKey}
          variant="ghost"
          size="sm"
          className="size-8 p-0 cursor-pointer"
          aria-label={`Invite ${user.displayName}`}
        >
          <IconUserPlus className="size-4" />
        </Button>
      </div>
    </div>
  );
}

function SuggestedUsersSection() {
  const { projectData, userData } = useValues(projectLogic);
  const { suggestedUsers, suggestedUsersLoading } =
    useValues(suggestedUsersLogic);
  const { loadSuggestedUsers } = useActions(suggestedUsersLogic);

  const myRole = useMemo(
    () =>
      projectData?.members.find((member) => member.id === userData?.id)?.role,
    [projectData?.members, userData?.id]
  );

  useEffect(() => {
    if (myRole === ProjectMemberRole.Admin) {
      loadSuggestedUsers();
    }
  }, [myRole]);

  if (myRole !== ProjectMemberRole.Admin) {
    return (
      <div className="space-y-3">
        <div className="text-center py-6 px-4 bg-neutral-800 rounded-md border border-dashed">
          <div className="text-sm text-muted-foreground">
            Only <span className="font-medium underline">Admins</span> can view
            suggested users.
          </div>
        </div>
      </div>
    );
  }

  if (suggestedUsersLoading && suggestedUsers.length === 0) {
    return (
      <div className="text-center py-8 px-4">
        <div className="text-sm text-muted-foreground">
          Loading suggested users...
        </div>
      </div>
    );
  }

  if (suggestedUsers.length === 0) {
    return (
      <div className="text-center py-8 px-4 bg-neutral-800 rounded-md border border-dashed">
        <div className="text-sm text-muted-foreground">
          No suggested users found. Suggested users are people you've worked
          with in other projects.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-96 overflow-y-auto">
      {suggestedUsers.map((user) => (
        <SuggestedUserItem key={user.id} user={user} />
      ))}
    </div>
  );
}

export function MembersTabContent() {
  const { projectData } = useValues(projectLogic);

  if (!projectData) {
    return null;
  }

  return (
    <div className="w-full max-w-xl space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-1">Members</h2>
        <p className="text-sm text-muted-foreground">
          Manage who has access to{" "}
          <span className="font-medium text-foreground">{projectData.name}</span>
        </p>
      </div>

      <MembersSection />
      <ActiveInvitesSection />

      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2">
          <IconUserPlus className="size-4 text-muted-foreground" />
          <h3 className="text-sm font-medium">Invite people</h3>
        </div>

        <Tabs defaultValue="invite-link" className="w-full flex flex-col gap-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="invite-link">Invite link</TabsTrigger>
            <TabsTrigger value="suggested">Suggested users</TabsTrigger>
          </TabsList>
          <TabsContent value="invite-link">
            <GenerateNewInviteLinkSection />
          </TabsContent>
          <TabsContent value="suggested">
            <SuggestedUsersSection />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export function ProjectAccessDialog({
  open,
  onOpenChange,
}: ProjectAccessDialogProps) {
  const { projectData } = useValues(projectLogic);
  const { invitationsLoading } = useValues(invitationsLogic);

  if (!projectData) {
    return null;
  }

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

          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-2">
              <IconUserPlus className="size-4 text-muted-foreground" />
              <h3 className="text-sm font-medium">Invite people</h3>
            </div>

            <Tabs defaultValue="invite-link" className="w-full flex flex-col gap-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="invite-link">Invite link</TabsTrigger>
                <TabsTrigger value="suggested">Suggested users</TabsTrigger>
              </TabsList>
              <TabsContent value="invite-link">
                <GenerateNewInviteLinkSection />
              </TabsContent>
              <TabsContent value="suggested">
                <SuggestedUsersSection />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ProjectAccessDialog;
