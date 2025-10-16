import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Role } from '../../../shared/types/role.enum';
import { ProjectReadService } from '../../read/project-read.service';

@Injectable()
export class RemoveProjectMemberGuard implements CanActivate {
  constructor(readonly projectReadService: ProjectReadService) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user.id;
    const { projectId, memberId } = request.params;

    if (!userId) {
      return false;
    }

    const project = await this.projectReadService.findByIdOrThrow(projectId);
    const userRole = project.members[userId];

    if (userId === memberId) {
      return true;
    }

    if (userRole === Role.Admin) {
      return true;
    }

    throw new ForbiddenException("You don't have permission to perform this action.");
  }
}
