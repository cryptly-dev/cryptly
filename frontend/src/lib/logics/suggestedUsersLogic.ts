import { connect, events, kea, key, path, props } from "kea";
import { loaders } from "kea-loaders";
import { ProjectsApi } from "../api/projects.api";
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

  events(({ asyncActions }) => ({
    afterMount: () => {
      asyncActions.loadSuggestedUsers();
    },
  })),
]);
