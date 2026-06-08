import type { PageLoad } from "./$types";

export const load: PageLoad = ({ url }) => ({
  sessionId: url.searchParams.get("session") ?? "",
});
