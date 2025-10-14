import { Button } from "@/components/ui/button";
import { myPersonalInvitationsLogic } from "@/lib/logics/myPersonalInvitationsLogic";
import { getRelativeTime } from "@/lib/utils";
import { IconCheck, IconX } from "@tabler/icons-react";
import { useAsyncActions, useValues } from "kea";
import { useState } from "react";

function PersonalInviteItem({
  invitation,
}: {
  invitation: {
    id: string;
    projectId: string;
    author: { email: string; avatarUrl: string };
    role: string;
    createdAt: string;
  };
}) {
  const { acceptPersonalInvitation, rejectPersonalInvitation } =
    useAsyncActions(myPersonalInvitationsLogic);
  const [acceptLoading, setAcceptLoading] = useState(false);
  const [rejectLoading, setRejectLoading] = useState(false);

  const handleAccept = async () => {
    setAcceptLoading(true);
    try {
      await acceptPersonalInvitation(invitation.id);
    } finally {
      setAcceptLoading(false);
    }
  };

  const handleReject = async () => {
    setRejectLoading(true);
    try {
      await rejectPersonalInvitation(invitation.id);
    } finally {
      setRejectLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3 p-3 rounded-md bg-muted/30 border">
      <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium overflow-hidden">
        {invitation.author.avatarUrl ? (
          <img
            src={invitation.author.avatarUrl}
            alt={invitation.author.email}
            className="size-10 rounded-full object-cover"
          />
        ) : (
          invitation.author.email.charAt(0).toUpperCase()
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">
          {invitation.author.email}
        </div>
        <div className="text-xs text-muted-foreground">
          {invitation.role} • {getRelativeTime(invitation.createdAt)}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          onClick={handleAccept}
          isLoading={acceptLoading}
          disabled={acceptLoading || rejectLoading}
          size="sm"
          className="cursor-pointer"
        >
          <IconCheck className="size-4 mr-1" />
          Accept
        </Button>
        <Button
          onClick={handleReject}
          isLoading={rejectLoading}
          disabled={acceptLoading || rejectLoading}
          variant="outline"
          size="sm"
          className="cursor-pointer"
        >
          <IconX className="size-4 mr-1" />
          Reject
        </Button>
      </div>
    </div>
  );
}

export function PersonalInvitesSection() {
  const { myPersonalInvitations } = useValues(myPersonalInvitationsLogic);

  if (!myPersonalInvitations || myPersonalInvitations.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">Invites</h2>
      <div className="space-y-2">
        {myPersonalInvitations.map((invitation) => (
          <PersonalInviteItem key={invitation.id} invitation={invitation} />
        ))}
      </div>
    </div>
  );
}
