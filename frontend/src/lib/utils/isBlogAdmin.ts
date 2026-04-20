import type { User } from "@/lib/api/user.api";

/**
 * Whether the user may create blog posts. Mirrors backend blog admin rules via
 * `blogAdmin` on GET /users/me.
 */
export function isBlogAdmin(user: User | null | undefined): boolean {
  return user?.blogAdmin === true;
}
