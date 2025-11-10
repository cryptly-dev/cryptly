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

    const computed256 = crypto.createHmac('sha256', this.secret).update(raw!).digest('hex');
    const header256 = sig.replace(/^sha256=/, '');

    const computed1 = crypto.createHmac('sha1', this.secret).update(raw!).digest('hex');
    const header1 = (req.headers['x-hub-signature'] as string | '')?.replace(/^sha1=/, '');

    console.log('###\n\n\n');
    console.log({
      rawLen: raw?.length,
      headerContentLength: req.headers['content-length'],
      sha256: { computed: computed256, header: header256, match: computed256 === header256 },
      sha1: { computed: computed1, header: header1, match: computed1 === header1 },
      secretLen: this.secret.length,
      secretHexStart: Buffer.from(this.secret, 'utf8').subarray(0, 8).toString('hex'),
      secretHexEnd: Buffer.from(this.secret, 'utf8').subarray(-8).toString('hex'),
    });
    console.log('###\n\n\n');

    // constant-time compare
    const a = Buffer.from(expected, 'utf8');
    const b = Buffer.from(sig, 'utf8');
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      throw new UnauthorizedException('Invalid webhook signature');
    }
    return true;
  }
}
