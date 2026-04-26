import { connect, events, kea, key, path, props } from "kea";
import { loaders } from "kea-loaders";
import { ProjectMemberRole, ProjectsApi } from "../api/projects.api";
import type { SuggestedUser } from "../api/user.api";
import { authLogic } from "./authLogic";
import { projectLogic } from "./projectLogic";

import type { suggestedUsersLogicType } from "./suggestedUsersLogicType";

export interface SuggestedUsersLogicProps {
  projectId: string;
}

export const suggestedUsersLogic = kea<suggestedUsersLogicType>([
  path(["src", "lib", "logics", "suggestedUsersLogic"]),

  props({} as SuggestedUsersLogicProps),

  key((props) => props.projectId),

  connect({
    values: [authLogic, ["jwtToken"], projectLogic, ["projectData"]],
    selectors: [projectLogic, ["currentUserRole"]],
  }),

  loaders(({ values, props }) => ({
    suggestedUsers: [
      [] as SuggestedUser[],
      {
        loadSuggestedUsers: async () => {
          const users = await ProjectsApi.getSuggestedUsers(
            values.jwtToken!,
            props.projectId
          );
          return users;
        },
      },
    ],
  })),

  events(({ asyncActions, values }) => ({
    afterMount: () => {
      // Endpoint requires Admin on the server; skip the call otherwise so
      // non-admin project members don't rack up console-visible 403s. The
      // ProjectAccessDialog guards its own render on `projectData`, so the
      // role selector is populated by the time this logic mounts.
      if (values.currentUserRole !== ProjectMemberRole.Admin) return;
      asyncActions.loadSuggestedUsers();
    },
  })),
]);
