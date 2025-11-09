import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Webhooks } from '@octokit/webhooks';
import { getEnvConfig } from '../../../../shared/config/env-config';

@Injectable()
export class GithubWebhookSignatureGuard implements CanActivate {
  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const webhooks = new Webhooks({ secret: getEnvConfig().github.webhookSecret });

    const signature = request.headers['x-hub-signature-256'] as string | undefined;
    if (!signature) throw new UnauthorizedException('Missing X-Hub-Signature-256');

    const raw = request.rawBody as Buffer | undefined;
    if (!raw) throw new UnauthorizedException('Missing rawBody');

    const body = raw.toString('utf8');

    if (!(await webhooks.verify(body, signature))) {
      throw new UnauthorizedException('Invalid webhook signature');
    }

    return true;
  }
}
