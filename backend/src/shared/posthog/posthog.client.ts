import { PostHog } from 'posthog-node';
import { getEnvConfig } from '../config/env-config';

export const posthog = new PostHog(getEnvConfig().posthog.apiToken, {
  host: getEnvConfig().posthog.host,
  enableExceptionAutocapture: true,
});
