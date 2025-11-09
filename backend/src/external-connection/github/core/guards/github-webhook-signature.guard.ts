import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import * as crypto from 'crypto';
import { getEnvConfig } from '../../../../shared/config/env-config';

@Injectable()
export class GithubWebhookSignatureGuard implements CanActivate {
  private readonly secret = getEnvConfig().github.webhookSecret;

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const sig = req.headers['x-hub-signature-256'] as string | undefined;
    if (!sig) throw new UnauthorizedException('Missing X-Hub-Signature-256');

    const raw: Buffer | undefined = req.rawBody;
    if (!raw) throw new UnauthorizedException('Missing rawBody'); // means step #1 isn’t set up

    const expected = 'sha256=' + crypto.createHmac('sha256', this.secret).update(raw).digest('hex');

    const hex = crypto.createHmac('sha256', this.secret).update(raw).digest('hex');
    console.log('computed sha256=', hex.slice(0, 12) + '…');
    console.log('header sha256=', (sig ?? '').replace(/^sha256=/, '').slice(0, 12) + '…');

    // constant-time compare
    const a = Buffer.from(expected, 'utf8');
    const b = Buffer.from(sig, 'utf8');
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      throw new UnauthorizedException('Invalid webhook signature');
    }
    return true;
  }
}
