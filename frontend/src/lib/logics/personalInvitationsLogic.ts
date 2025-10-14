import {
  actions,
  connect,
  events,
  kea,
  key,
  listeners,
  path,
  props,
} from "kea";
import { loaders } from "kea-loaders";
import type { PersonalInvitation } from "../api/personal-invitations.api";
import { PersonalInvitationsApi } from "../api/personal-invitations.api";
import { ProjectMemberRole, ProjectsApi } from "../api/projects.api";
import { AsymmetricCrypto } from "../crypto/crypto.asymmetric";
import { authLogic } from "./authLogic";
import { projectLogic } from "./projectLogic";
import { suggestedUsersLogic } from "./suggestedUsersLogic";

import type { personalInvitationsLogicType } from "./personalInvitationsLogicType";

export interface PersonalInvitationsLogicProps {
  projectId: string;
}

export const personalInvitationsLogic = kea<personalInvitationsLogicType>([
  path(["src", "lib", "logics", "personalInvitationsLogic"]),

  props({} as PersonalInvitationsLogicProps),

  key((props) => props.projectId),

  connect(() => ({
    values: [authLogic, ["jwtToken"], projectLogic, ["projectData"]],
  })),

  actions({
    createPersonalInvitation: (
      invitedUserId: string,
      invitedUserPublicKey: string,
      role: ProjectMemberRole
    ) => ({ invitedUserId, invitedUserPublicKey, role }),
    deletePersonalInvitation: (invitationId: string) => ({ invitationId }),
  }),

  loaders(({ values, props }) => ({
    personalInvitations: [
      [] as PersonalInvitation[],
      {
        loadPersonalInvitations: async () => {
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

  listeners(({ asyncActions, values, props }) => ({
    createPersonalInvitation: async ({
      invitedUserId,
      invitedUserPublicKey,
      role,
    }) => {
      const projectKey = values.projectData!.passphraseAsKey;

      const encryptedProjectKey = await AsymmetricCrypto.encrypt(
        projectKey,
        invitedUserPublicKey
      );

      await ProjectsApi.addEncryptedSecretsKey(
        values.jwtToken!,
        props.projectId,
        invitedUserId,
        encryptedProjectKey
      );

      await PersonalInvitationsApi.createPersonalInvitation(
        values.jwtToken!,
        props.projectId,
        {
          invitedUserId,
          role,
        }
      );

      await asyncActions.loadPersonalInvitations();
      await suggestedUsersLogic({
        projectId: props.projectId,
      }).asyncActions.loadSuggestedUsers();
    },
    deletePersonalInvitation: async ({ invitationId }) => {
      await PersonalInvitationsApi.deletePersonalInvitation(
        values.jwtToken!,
        invitationId
      );
      await asyncActions.loadPersonalInvitations();
      await suggestedUsersLogic({
        projectId: props.projectId,
      }).asyncActions.loadSuggestedUsers();
    },
  })),

  events(({ asyncActions }) => ({
    afterMount: () => {
      asyncActions.loadPersonalInvitations();
    },
  })),
]);
