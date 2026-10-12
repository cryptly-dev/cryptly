import type { ParamMatcher } from "@sveltejs/kit";

/** `/app/project/:id` is Secrets; History and Settings get their own path segment. */
export const match = ((param: string): param is "history" | "settings" =>
  param === "history" || param === "settings") satisfies ParamMatcher;
