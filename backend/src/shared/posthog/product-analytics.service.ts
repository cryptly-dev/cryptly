import { Injectable } from '@nestjs/common';
import { getEnvConfig } from '../config/env-config';
import { posthog } from './posthog.client';

/**
 * High-signal product events (PostHog). No-ops when POSTHOG_API_KEY is unset.
 */
@Injectable()
export class ProductAnalyticsService {
  private enabled(): boolean {
    return Boolean(getEnvConfig().posthog.apiKey);
  }

  /** Call when a JWT is minted so downstream captures align with the authenticated user. */
  identify(userId: string, email: string): void {
    if (!this.enabled()) return;
    posthog.identify({
      distinctId: userId,
      properties: {
        email,
      },
    });
  }

  capture(userId: string, event: string, properties?: Record<string, unknown>): void {
    if (!this.enabled()) return;
    posthog.capture({
      distinctId: userId,
      event,
      properties,
    });
  }

  loggedIn(userId: string, email: string, method: string): void {
    this.identify(userId, email);
    this.capture(userId, 'logged_in', { method });
  }
}
