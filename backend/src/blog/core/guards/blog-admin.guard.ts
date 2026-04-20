import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { UserReadService } from '../../../user/read/user-read.service';
import { isBlogAdminEmail } from '../blog-admin-emails';

@Injectable()
export class BlogAdminGuard implements CanActivate {
  constructor(private readonly userReadService: UserReadService) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId: string | undefined = request.user?.id;

    if (!userId) {
      throw new ForbiddenException();
    }

    const user = await this.userReadService.readByIdOrThrow(userId);

    if (!isBlogAdminEmail(user.email)) {
      throw new ForbiddenException('Blog admin access required');
    }

    return true;
  }
}
