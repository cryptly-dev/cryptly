import { redirect } from "@sveltejs/kit";
import type { LayoutLoad } from "./$types";

export const ssr = false;

export const load: LayoutLoad = ({ url }) => {
  if (url.pathname === "/app" || url.pathname === "/app/") {
    throw redirect(302, "/app/project");
  }
  return {};
};
