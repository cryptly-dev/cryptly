import { getOurEnv, OurEnv } from '../../shared/types/our-env.enum';
import { getEnvConfig } from '../../shared/config/env-config';

/** Emails used in backend Jest tests — treated as blog admins in dev only */
const DEV_TEST_USER_EMAILS = [
  'admina@test.com',
  'adminb@test.com',
  'admin@test.com',
  'invited-a@test.com',
  'invited-b@test.com',
  'invited@test.com',
  'invitee@test.com',
  'member@test.com',
  'other-invitee@test.com',
  'other@test.com',
  'owner@test.com',
  'random@test.com',
  'reada@test.com',
  'readb@test.com',
  'read@test.com',
  'test2@test.com',
  'testb@test.com',
  'test@test.com',
  'user1@test.com',
  'user2@test.com',
  'user3@test.com',
  'user4@test.com',
  'usera@test.com',
  'userb@test.com',
  'write@test.com',
  /** Local dev quick-login buttons on the login page */
  'user-a@cryptly.dev',
  'user-b@cryptly.dev',
  'user-c@cryptly.dev',
];

export function getBlogAdminEmails(): Set<string> {
  const fromEnv = getEnvConfig().blog.adminEmails;
  const merged =
    getOurEnv() === OurEnv.Dev ? [...fromEnv, ...DEV_TEST_USER_EMAILS] : [...fromEnv];
  return new Set(merged.map((e) => e.toLowerCase()));
}

export function isBlogAdminEmail(email: string | undefined): boolean {
  if (!email) {
    return false;
  }
  return getBlogAdminEmails().has(email.trim().toLowerCase());
}
