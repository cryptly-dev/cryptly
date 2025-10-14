import { actions, connect, kea, key, listeners, path, props } from "kea";
import { loaders } from "kea-loaders";
import type { PersonalInvitation } from "../api/personal-invitations.api";
import { PersonalInvitationsApi } from "../api/personal-invitations.api";
import { authLogic } from "./authLogic";
import { projectLogic } from "./projectLogic";

import type { personalInvitationsLogicType } from "./personalInvitationsLogicType";

export interface PersonalInvitationsLogicProps {
  projectId: string;
}

export const personalInvitationsLogic = kea<personalInvitationsLogicType>([
  path(["src", "lib", "logics", "personalInvitationsLogic"]),

  props({} as PersonalInvitationsLogicProps),

  key((props) => props.projectId),

  connect({
    values: [authLogic, ["jwtToken"], projectLogic, ["projectData"]],
  }),

  actions({
    deletePersonalInvitation: (invitationId: string) => ({ invitationId }),
  }),

  loaders(({ values, props }) => ({
    personalInvitations: [
      [] as PersonalInvitation[],
      {
        loadPersonalInvitations: async () => {
          console.log("loading personal invitations");
          const invitations =
            await PersonalInvitationsApi.getProjectPersonalInvitations(
              values.jwtToken!,
              props.projectId
            );
          return invitations;
        },
      },
    ],
  })),

  listeners(({ actions, values }) => ({
    deletePersonalInvitation: async ({ invitationId }) => {
      console.log("deleting personal invitation");
      await PersonalInvitationsApi.deletePersonalInvitation(
        values.jwtToken!,
        invitationId
      );
      console.log("personal invitation deleted");
      actions.loadPersonalInvitations();
    },
  })),
]);
