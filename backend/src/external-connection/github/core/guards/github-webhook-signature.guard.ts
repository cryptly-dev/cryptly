import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Webhooks } from '@octokit/webhooks';
import { getEnvConfig } from '../../../../shared/config/env-config';

@Injectable()
export class GithubWebhookSignatureGuard implements CanActivate {
  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const webhooks = new Webhooks({ secret: getEnvConfig().github.webhookSecret });

    const signature = request.headers['x-hub-signature-256'];
    const body = request.rawBody ? request.rawBody.toString('utf8') : JSON.stringify(request.body);

    if (!(await webhooks.verify(body, signature))) {
      throw new UnauthorizedException('Invalid webhook signature');
    }

    return true;
  }
}
