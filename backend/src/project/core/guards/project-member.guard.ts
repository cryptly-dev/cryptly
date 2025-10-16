import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { REQUIRE_ROLE_KEY } from 'src/project/decorators/require-project-role.decorator';
import { Role } from 'src/shared/types/role.enum';
import { requireIsMongoId } from 'src/shared/utils/mongo-id-transform';
import { ProjectReadService } from '../../read/project-read.service';
import { PersonalInvitationReadModule } from 'src/personal-invitation/read/personal-invitation-read.module';
import { ProjectNormalized } from '../entities/project.interface';
import { ProjectReadModule } from 'src/project/read/project-read.module';
import { PersonalInvitationReadService } from 'src/personal-invitation/read/personal-invitation-read.service';

export const PROJECT_MEMBER_GUARD_REQUIRED_IMPORTS = [
  ProjectReadModule,
  PersonalInvitationReadModule,
];
@Injectable()
export class ProjectMemberGuard implements CanActivate {
  constructor(
    readonly projectReadService: ProjectReadService,
    private readonly personalInvitationReadService: PersonalInvitationReadService,
    private reflector: Reflector,
  ) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id;
    const projectId = request?.params?.projectId || request?.body?.projectId;
    const personalInvitationId =
      request?.params?.personalInvitationId || request?.body?.personalInvitationId;

    const allowedRoles =
      this.reflector.getAllAndOverride<Role[]>(REQUIRE_ROLE_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? Object.values(Role);

    if (!userId || (!projectId && !personalInvitationId)) {
      return false;
    }

    let project: ProjectNormalized | null = null;

    if (projectId) {
      requireIsMongoId(projectId);
      project = await this.projectReadService.findByIdOrThrow(projectId);
    } else if (personalInvitationId) {
      requireIsMongoId(personalInvitationId);
      project = await this.getProjectFromPersonalInvitationId(personalInvitationId);
    }

    if (!project) {
      throw new ForbiddenException('Project not found');
    }

    const userRole = project.members[userId];

    if (!userRole) {
      throw new ForbiddenException('You are not a member of this project');
    }

    if (allowedRoles.includes(userRole)) {
      return true;
    }

    throw new ForbiddenException('You are not allowed to perform this action');
  }

  private async getProjectFromPersonalInvitationId(
    personalInvitationId: string,
  ): Promise<ProjectNormalized> {
    const personalInvitation =
      await this.personalInvitationReadService.findByIdOrThrow(personalInvitationId);

    return await this.projectReadService.findByIdOrThrow(personalInvitation.projectId);
  }
}
