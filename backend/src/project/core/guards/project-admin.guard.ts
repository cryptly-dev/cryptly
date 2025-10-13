import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Role } from '../../../shared/types/role.enum';
import { ProjectReadService } from '../../read/project-read.service';

@Injectable()
export class ProjectAdminGuard implements CanActivate {
  constructor(readonly projectReadService: ProjectReadService) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id;
    const projectId = request.params?.projectId || request?.body?.projectId;

    if (!userId || !projectId) {
      return false;
    }

    const project = await this.projectReadService.findById(projectId);

    if (project.members.get(userId) !== Role.Admin) {
      throw new ForbiddenException('You are not an admin of this project');
    }

    return true;
  }
}
