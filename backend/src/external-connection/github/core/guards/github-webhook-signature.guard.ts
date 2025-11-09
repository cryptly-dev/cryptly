import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import * as crypto from 'crypto';
import { getEnvConfig } from '../../../../shared/config/env-config';

@Injectable()
export class GithubWebhookSignatureGuard implements CanActivate {
  private secretToken: string;

  constructor() {
    this.secretToken = getEnvConfig().github.webhookSecret;
  }

  public canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    const signature = request.headers['x-hub-signature-256'] as string | undefined;
    if (!signature) throw new UnauthorizedException('Missing X-Hub-Signature-256');

    if (!this.validatePayload(request.body, signature)) {
      throw new UnauthorizedException('Invalid webhook signature');
    }

    return true;
  }

  private validatePayload(payload: any, signature: string): boolean {
    const expectedSignature =
      'sha256=' +
      crypto.createHmac('sha256', this.secretToken).update(JSON.stringify(payload)).digest('hex');

    if (expectedSignature.length !== signature.length) {
      return false;
    }

    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'ascii'),
      Buffer.from(signature, 'ascii'),
    );
  }
}
