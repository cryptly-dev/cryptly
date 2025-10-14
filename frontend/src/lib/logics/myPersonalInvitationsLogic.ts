import { actions, connect, events, kea, listeners, path } from "kea";
import { loaders } from "kea-loaders";
import type { PersonalInvitation } from "../api/personal-invitations.api";
import { PersonalInvitationsApi } from "../api/personal-invitations.api";
import { authLogic } from "./authLogic";

import type { myPersonalInvitationsLogicType } from "./myPersonalInvitationsLogicType";

export const myPersonalInvitationsLogic = kea<myPersonalInvitationsLogicType>([
  path(["src", "lib", "logics", "myPersonalInvitationsLogic"]),

  connect({
    values: [authLogic, ["jwtToken"]],
  }),

  actions({
    acceptPersonalInvitation: (invitationId: string) => ({ invitationId }),
    rejectPersonalInvitation: (invitationId: string) => ({ invitationId }),
  }),

  loaders(({ values }) => ({
    myPersonalInvitations: [
      [] as PersonalInvitation[],
      {
        loadMyPersonalInvitations: async () => {
          const invitations =
            await PersonalInvitationsApi.getMyPersonalInvitations(
              values.jwtToken!
            );
          return invitations;
        },
      },
    ],
  })),

  listeners(({ asyncActions, values }) => ({
    acceptPersonalInvitation: async ({ invitationId }) => {
      await PersonalInvitationsApi.acceptPersonalInvitation(
        values.jwtToken!,
        invitationId
      );
      await asyncActions.loadMyPersonalInvitations();
    },
    rejectPersonalInvitation: async ({ invitationId }) => {
      await PersonalInvitationsApi.rejectPersonalInvitation(
        values.jwtToken!,
        invitationId
      );
      await asyncActions.loadMyPersonalInvitations();
    },
  })),

  events(({ asyncActions }) => ({
    afterMount: () => {
      asyncActions.loadMyPersonalInvitations();
    },
  })),
]);
