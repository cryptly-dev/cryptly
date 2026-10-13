import type { ProjectTab } from "$lib/projects/project-tab";
import type { PageLoad } from "./$types";

export const load: PageLoad = ({ params }) => {
  return {
    projectId: params.projectId,
    tab: (params.tab ?? "secrets") as ProjectTab,
  };
};
