import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { UserReadService } from '../../../user/read/user-read.service';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly userReadService: UserReadService) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id;

    if (!userId) {
      throw new ForbiddenException('Admin access required');
    }

    const user = await this.userReadService.readByIdOrThrow(userId);

    if (!user.isAdmin) {
      throw new ForbiddenException('Admin access required');
    }

    return true;
  }
}
