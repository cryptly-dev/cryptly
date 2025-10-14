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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Invitation } from "@/lib/api/invitations.api";
import type { PersonalInvitation } from "@/lib/api/personal-invitations.api";
import {
  ProjectMemberRole,
  ProjectsApi,
  type ProjectMember,
} from "@/lib/api/projects.api";
import { type SuggestedUser } from "@/lib/api/user.api";
import { authLogic } from "@/lib/logics/authLogic";
import { invitationsLogic } from "@/lib/logics/invitationsLogic";
import { personalInvitationsLogic } from "@/lib/logics/personalInvitationsLogic";
import { projectLogic } from "@/lib/logics/projectLogic";
import { projectSettingsLogic } from "@/lib/logics/projectSettingsLogic";
import { getRelativeTime } from "@/lib/utils";
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
import { useEffect, useMemo, useState } from "react";

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
    <div className="flex items-center gap-3 p-2 rounded-md bg-muted/30">
      <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium overflow-hidden">
        {member.avatarUrl ? (
          <img
            src={member.avatarUrl}
            alt={member.email}
            className="size-8 rounded-full object-cover"
          />
        ) : (
          member.email.charAt(0).toUpperCase()
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">
          {member.id === userData?.id ? "You" : "Other member"}
        </div>
        <div className="text-xs text-muted-foreground truncate">
          {member.email}
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
            aria-label={`Remove ${member.email} from project`}
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
      <div className="space-y-2 max-h-32 overflow-y-auto">
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

function ActiveInviteItem({
  invite,
  onPersonalInviteDeleted,
}: {
  invite: ActiveInvite;
  onPersonalInviteDeleted?: () => void;
}) {
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
      onPersonalInviteDeleted?.();
    }
  };

  return (
    <div className="flex items-center gap-3 p-2 rounded-md bg-muted/30">
      <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium overflow-hidden">
        {invite.type === "personal" ? (
          invite.data.invitedUser.avatarUrl ? (
            <img
              src={invite.data.invitedUser.avatarUrl}
              alt={invite.data.invitedUser.email}
              className="size-8 rounded-full object-cover"
            />
          ) : (
            invite.data.invitedUser.email.charAt(0).toUpperCase()
          )
        ) : (
          <IconLink className="size-4" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">
          {invite.type === "personal"
            ? invite.data.invitedUser.email
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

function ActiveInvitesSection({
  onPersonalInviteDeleted,
}: {
  onPersonalInviteDeleted?: () => void;
}) {
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
        <div className="text-center py-6 px-4 bg-muted/20 rounded-md border border-dashed">
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
              onPersonalInviteDeleted={onPersonalInviteDeleted}
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

function GenerateNewInviteLinkSection() {
  const { projectData, userData } = useValues(projectLogic);
  const { createInvitation } = useAsyncActions(invitationsLogic);
  const [passphrase, setPassphrase] = useState("");
  const [showPassphrase, setShowPassphrase] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"read" | "write" | "admin">(
    "read"
  );
  const [isLoading, setIsLoading] = useState(false);

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
    setIsLoading(false);
  };

  if (myRole !== ProjectMemberRole.Admin) {
    return (
      <div className="text-center py-6 px-4 bg-muted/20 rounded-md border border-dashed">
        <div className="text-sm text-muted-foreground">
          Only <span className="font-medium underline">Admins</span> can
          generate invite links.
        </div>
      </div>
    );
  }

  const roleDescriptions = {
    read: "Users with this role can view project secrets, the project name, and connected integrations.",
    write:
      "Users with this role have all Read permissions, plus the ability to create, modify, and delete secrets.",
    admin:
      "Users with this role have all Write permissions, plus the ability to manage integrations, rename the project, delete the project, and invite new members.",
  };

  return (
    <div className="space-y-3">
      <div className="grid gap-2">
        <div className="p-3 bg-muted/20 rounded-md border border-dashed text-xs text-muted-foreground">
          {roleDescriptions[selectedRole]}
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              id="passphrase"
              type={showPassphrase ? "text" : "password"}
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              className="w-full rounded-md border px-3 py-2 bg-background text-base sm:text-sm pr-10"
              placeholder="Enter a secure code"
              autoComplete="new-password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassphrase(!showPassphrase)}
              className="absolute inset-y-0 right-0 flex items-center justify-center h-full px-3 text-muted-foreground hover:text-foreground cursor-pointer"
              aria-label={
                showPassphrase ? "Hide passphrase" : "Show passphrase"
              }
            >
              {showPassphrase ? (
                <IconEyeOff className="size-4" />
              ) : (
                <IconEye className="size-4" />
              )}
            </button>
          </div>
          <Select
            value={selectedRole}
            onValueChange={(value: "read" | "write" | "admin") =>
              setSelectedRole(value)
            }
          >
            <SelectTrigger className="w-32">
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
        </div>

        <div className="text-xs text-muted-foreground">
          This code will be required to accept the invitation. Each invite link
          can only be used by one person.
        </div>
      </div>

      <Button
        onClick={handleGenerateLink}
        isLoading={isLoading}
        disabled={!passphrase.trim()}
        className="w-full cursor-pointer"
      >
        Generate invite link
      </Button>
    </div>
  );
}

function SuggestedUserItem({
  user,
  onInviteSent,
}: {
  user: SuggestedUser;
  onInviteSent?: () => void;
}) {
  const { createPersonalInvitation } = useAsyncActions(
    personalInvitationsLogic
  );
  const [selectedRole, setSelectedRole] = useState<ProjectMemberRole>(
    ProjectMemberRole.Read
  );

  const availableRoles = [
    { value: ProjectMemberRole.Read, label: "Read" },
    { value: ProjectMemberRole.Write, label: "Write" },
    { value: ProjectMemberRole.Admin, label: "Admin" },
  ];

  const handleInvite = async () => {
    await createPersonalInvitation(user.id, selectedRole);
    onInviteSent?.();
  };

  return (
    <div className="flex items-center gap-3 p-2 rounded-md bg-muted/30">
      <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium overflow-hidden">
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.email}
            className="size-8 rounded-full object-cover"
          />
        ) : (
          user.email.charAt(0).toUpperCase()
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-muted-foreground truncate">
          {user.email}
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
          variant="ghost"
          size="sm"
          className="size-8 p-0 cursor-pointer"
          aria-label={`Invite ${user.email}`}
        >
          <IconUserPlus className="size-4" />
        </Button>
      </div>
    </div>
  );
}

function SuggestedUsersSection({ reloadKey }: { reloadKey?: number }) {
  const { projectData, userData } = useValues(projectLogic);
  const { jwtToken } = useValues(authLogic);
  const { loadPersonalInvitations } = useActions(personalInvitationsLogic);
  const [suggestedUsers, setSuggestedUsers] = useState<SuggestedUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const myRole = useMemo(
    () =>
      projectData?.members.find((member) => member.id === userData?.id)?.role,
    [projectData?.members, userData?.id]
  );

  const loadSuggestedUsers = async () => {
    if (myRole !== ProjectMemberRole.Admin || !jwtToken || !projectData) return;

    setIsLoading(true);
    try {
      const users = await ProjectsApi.getSuggestedUsers(
        jwtToken,
        projectData.id
      );
      setSuggestedUsers(users);
    } catch (error) {
      console.error("Failed to load suggested users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInviteSent = () => {
    loadSuggestedUsers();
    loadPersonalInvitations();
  };

  useEffect(() => {
    loadSuggestedUsers();
  }, [myRole, jwtToken, projectData?.id, projectData?.members, reloadKey]);

  if (myRole !== ProjectMemberRole.Admin) {
    return (
      <div className="space-y-3">
        <div className="text-center py-6 px-4 bg-muted/20 rounded-md border border-dashed">
          <div className="text-sm text-muted-foreground">
            Only <span className="font-medium underline">Admins</span> can view
            suggested users.
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
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
      <div className="text-center py-8 px-4 bg-muted/20 rounded-md border border-dashed">
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
        <SuggestedUserItem
          key={user.id}
          user={user}
          onInviteSent={handleInviteSent}
        />
      ))}
    </div>
  );
}

export function ProjectAccessDialog({
  open,
  onOpenChange,
}: ProjectAccessDialogProps) {
  const { projectData } = useValues(projectLogic);
  const { invitationsLoading } = useValues(invitationsLogic);
  const [reloadSuggestedUsersKey, setReloadSuggestedUsersKey] = useState(0);

  const handlePersonalInviteDeleted = () => {
    setReloadSuggestedUsersKey((prev) => prev + 1);
  };

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
              Invite others to collaborate on "{projectData.name}".
            </DialogDescription>
          </DialogHeader>

          <MembersSection />
          <ActiveInvitesSection
            onPersonalInviteDeleted={handlePersonalInviteDeleted}
          />

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <IconUserPlus className="size-4 text-muted-foreground" />
              <h3 className="text-sm font-medium">Invite people</h3>
            </div>

            <Tabs defaultValue="invite-link" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="invite-link">Invite link</TabsTrigger>
                <TabsTrigger value="suggested">Suggested users</TabsTrigger>
              </TabsList>
              <TabsContent value="invite-link">
                <GenerateNewInviteLinkSection />
              </TabsContent>
              <TabsContent value="suggested">
                <SuggestedUsersSection reloadKey={reloadSuggestedUsersKey} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ProjectAccessDialog;
