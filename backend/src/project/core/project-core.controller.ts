import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Sse,
  UseGuards,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { Observable, filter, fromEvent, map } from 'rxjs';
import { Role } from 'src/shared/types/role.enum';
import { CurrentUserId } from '../../auth/core/decorators/current-user-id.decorator';
import { PersonalInvitationReadService } from '../../personal-invitation/read/personal-invitation-read.service';
import { ProjectSecretsVersionSerialized } from '../../project-secrets-version/core/entities/project-secrets-version.interface';
import { ProjectSecretsVersionReadService } from '../../project-secrets-version/read/project-secrets-version-read.service';
import { UserPartialSerialized } from '../../user/core/entities/user.interface';
import { UserSerializer } from '../../user/core/entities/user.serializer';
import { UserReadService } from '../../user/read/user-read.service';
import { UserWriteService } from '../../user/write/user-write.service';
import { RequireRole } from '../decorators/require-project-role.decorator';
import { SecretsUpdatedEvent } from '../events/definitions/secrets-updated.event';
import { ProjectEvent } from '../events/project-events.enum';
import { ProjectReadService } from '../read/project-read.service';
import { ProjectWriteService } from '../write/project-write.service';
import { AddEncryptedSecretsKeyBody } from './dto/add-encrypted-secrets-key.body';
import { CreateProjectBody } from './dto/create-project.body';
import { ProjectSearchResponse } from './dto/project-search.response';
import { UpdateMemberRoleBody } from './dto/update-member-role.body';
import { UpdateProjectBody } from './dto/update-project.body';
import { ProjectSerialized } from './entities/project.interface';
import { ProjectSerializer } from './entities/project.serializer';
import { ProjectMemberGuard } from './guards/project-member.guard';
import { RemoveProjectMemberGuard } from './guards/remove-project-member.guard';

@Controller('')
@ApiTags('Projects')
@ApiBearerAuth()
export class ProjectCoreController {
  public constructor(
    private readonly projectWriteService: ProjectWriteService,
    private readonly projectReadService: ProjectReadService,
    private readonly userReadService: UserReadService,
    private readonly userWriteService: UserWriteService,
    private readonly projectSecretsVersionReadService: ProjectSecretsVersionReadService,
    private readonly personalInvitationReadService: PersonalInvitationReadService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Sse('projects/:projectId/events')
  @UseGuards(ProjectMemberGuard)
  @RequireRole(Role.Read, Role.Write, Role.Admin)
  @ApiBearerAuth()
  public streamEvents(
    @Param('projectId') projectId: string,
  ): Observable<{ data: SecretsUpdatedEvent }> {
    return fromEvent(this.eventEmitter, ProjectEvent.SecretsUpdated).pipe(
      filter((data: SecretsUpdatedEvent) => data.projectId === projectId),
      map((data: SecretsUpdatedEvent) => ({
        data,
      })),
    );
  }

  @Get('users/me/projects')
  @ApiResponse({ type: [ProjectSerialized] })
  public async findUserProjects(@CurrentUserId() userId: string): Promise<ProjectSerialized[]> {
    const [projects, user] = await Promise.all([
      this.projectReadService.findUserProjects(userId),
      this.userReadService.readByIdOrThrow(userId),
    ]);

    const memberIds = [...new Set(projects.flatMap((p) => Object.keys(p.members)))];
    const members = await this.userReadService.readByIds(memberIds);
    const membersHydrated = members.map((user) => UserSerializer.serializePartial(user));
    const latestVersions = await this.projectSecretsVersionReadService.findManyLatestByProjectIds(
      projects.map((p) => new Types.ObjectId(p.id)),
    );
    const latestVersionsMap = new Map(latestVersions.map((v) => [v.projectId.toString(), v]));

    const serializedProjects = projects.map((p) =>
      ProjectSerializer.serialize(
        { ...p, updatedAt: latestVersionsMap.get(p.id)!!.updatedAt },
        membersHydrated,
        latestVersionsMap.get(p.id)!!.encryptedSecrets,
      ),
    );

    const projectsMap = new Map(serializedProjects.map((p) => [p.id, p]));
    const orderedProjects = user.projectsOrder
      .map((id) => projectsMap.get(id))
      .filter((p): p is ProjectSerialized => p !== undefined);

    const remainingProjects = serializedProjects.filter((p) => !user.projectsOrder.includes(p.id));

    return [...orderedProjects, ...remainingProjects];
  }

  @Get('users/me/projects/search')
  @ApiResponse({ type: [ProjectSearchResponse] })
  public async findUserProjectsForSearch(
    @CurrentUserId() userId: string,
  ): Promise<ProjectSearchResponse[]> {
    const projects = await this.projectReadService.findUserProjects(userId);
    const latestVersions = await this.projectSecretsVersionReadService.findManyLatestByProjectIds(
      projects.map((p) => new Types.ObjectId(p.id)),
    );
    const latestVersionsMap = new Map(latestVersions.map((v) => [v.projectId.toString(), v]));

    return projects.map((p) => ({
      id: p.id,
      name: p.name,
      encryptedSecretsKeys: p.encryptedSecretsKeys,
      encryptedSecrets: latestVersionsMap.get(p.id)!!.encryptedSecrets,
    }));
  }

  @Post('projects')
  @ApiResponse({ type: ProjectSerialized })
  public async create(
    @CurrentUserId() userId: string,
    @Body() body: CreateProjectBody,
  ): Promise<ProjectSerialized> {
    const project = await this.projectWriteService.create(
      {
        ...body,
        encryptedSecretsKeys: body.encryptedSecretsKeys,
        encryptedSecrets: body.encryptedSecrets,
      },
      userId,
    );

    await this.userWriteService.addToProjectsOrder(userId, project.id);

    const members = await this.userReadService.readByIds([userId]);
    const membersHydrated = members.map((user) => UserSerializer.serializePartial(user));

    return ProjectSerializer.serialize(project, membersHydrated, body.encryptedSecrets);
  }

  @Get('projects/:projectId')
  @UseGuards(ProjectMemberGuard)
  @RequireRole(Role.Read, Role.Write, Role.Admin)
  @ApiResponse({ type: ProjectSerialized })
  public async findById(@Param('projectId') projectId: string): Promise<ProjectSerialized> {
    const project = await this.projectReadService.findByIdOrThrow(projectId);
    const memberIds = Object.keys(project.members);
    const members = await this.userReadService.readByIds(memberIds);
    const membersHydrated = members.map((user) => UserSerializer.serializePartial(user));
    const latestVersion = await this.projectSecretsVersionReadService.findLatestByProjectId(
      new Types.ObjectId(projectId),
    );

    return ProjectSerializer.serialize(
      { ...project, updatedAt: latestVersion.updatedAt },
      membersHydrated,
      latestVersion.encryptedSecrets,
    );
  }

  @Get('projects/:projectId/suggested-users')
  @UseGuards(ProjectMemberGuard)
  @RequireRole(Role.Admin)
  @ApiResponse({ type: [UserPartialSerialized] })
  public async getSuggestedUsers(
    @CurrentUserId() userId: string,
    @Param('projectId') projectId: string,
  ): Promise<UserPartialSerialized[]> {
    const projects = await this.projectReadService.findUserProjects(userId);
    const project = await this.projectReadService.findByIdOrThrow(projectId);
    const personalInvitations = await this.personalInvitationReadService.findByProjectId(projectId);

    const userProjectCount = new Map<string, number>();

    for (const proj of projects) {
      for (const [memberId] of Object.entries(proj.members)) {
        if (memberId === userId) {
          continue;
        }

        const currentCount = userProjectCount.get(memberId) || 0;
        userProjectCount.set(memberId, currentCount + 1);
      }
    }

    const existingMemberIds = new Set(Object.keys(project.members));
    const invitedUserIds = new Set(personalInvitations.map((inv) => inv.invitedUserId));

    const userIds = Array.from(userProjectCount.keys()).filter(
      (id) => !existingMemberIds.has(id) && !invitedUserIds.has(id),
    );

    const users = await this.userReadService.readByIds(userIds);

    return users
      .map((user) => ({
        user,
        count: userProjectCount.get(user.id) || 0,
      }))
      .sort((a, b) => b.count - a.count)
      .map(({ user }) => UserSerializer.serializePartial(user));
  }

  @Get('projects/:projectId/history')
  @UseGuards(ProjectMemberGuard)
  @RequireRole(Role.Read, Role.Write, Role.Admin)
  @ApiResponse({ type: [ProjectSecretsVersionSerialized] })
  public async findHistoryById(
    @Param('projectId') projectId: string,
  ): Promise<ProjectSecretsVersionSerialized[]> {
    return this.projectSecretsVersionReadService.findByProjectId(new Types.ObjectId(projectId));
  }

  @Patch('projects/:projectId')
  @UseGuards(ProjectMemberGuard)
  @ApiResponse({ type: ProjectSerialized })
  public async update(
    @Param('projectId') projectId: string,
    @Body() body: UpdateProjectBody,
    @CurrentUserId() userId: string,
  ): Promise<ProjectSerialized> {
    const project = await this.projectReadService.findByIdOrThrow(projectId);
    const userRole = project.members[userId]!;

    this.validatePayloadPermissions(userRole, body);

    const updatedProject = await this.projectWriteService.update(projectId, body, userId);
    const memberIds = Object.keys(updatedProject.members);
    const members = await this.userReadService.readByIds(memberIds);
    const membersHydrated = members.map((user) => UserSerializer.serializePartial(user));
    const latestVersion = await this.projectSecretsVersionReadService.findLatestByProjectId(
      new Types.ObjectId(projectId),
    );

    if (body.encryptedSecrets) {
      const author = membersHydrated.find((m) => m.id === userId);
      this.eventEmitter.emit(
        ProjectEvent.SecretsUpdated,
        new SecretsUpdatedEvent(projectId, body.encryptedSecrets, author!, latestVersion.updatedAt),
      );
    }

    return ProjectSerializer.serialize(
      { ...updatedProject, updatedAt: latestVersion.updatedAt },
      membersHydrated,
      latestVersion.encryptedSecrets,
    );
  }

  @Post('projects/:projectId/encrypted-secrets-keys')
  @UseGuards(ProjectMemberGuard)
  @RequireRole(Role.Admin)
  @HttpCode(204)
  public async addEncryptedSecretsKey(
    @Param('projectId') projectId: string,
    @Body() body: AddEncryptedSecretsKeyBody,
  ): Promise<void> {
    await this.projectWriteService.addEncryptedSecretsKey(
      projectId,
      body.userId,
      body.encryptedSecretsKey,
    );
  }

  @Delete('projects/:projectId/members/:memberId')
  @UseGuards(RemoveProjectMemberGuard)
  @HttpCode(204)
  public async removeMember(
    @Param('projectId') projectId: string,
    @Param('memberId') memberId: string,
  ): Promise<void> {
    await this.projectWriteService.removeMember(projectId, memberId);
    await this.userWriteService.removeFromProjectsOrder(memberId, projectId);
  }

  @Patch('projects/:projectId/members/:memberId')
  @UseGuards(ProjectMemberGuard)
  @RequireRole(Role.Admin)
  @HttpCode(204)
  public async updateMemberRole(
    @Param('projectId') projectId: string,
    @Param('memberId') memberId: string,
    @Body() body: UpdateMemberRoleBody,
  ): Promise<void> {
    await this.projectWriteService.updateMemberRole(projectId, memberId, body.role);
  }

  @Delete('projects/:projectId')
  @UseGuards(ProjectMemberGuard)
  @RequireRole(Role.Admin)
  @HttpCode(204)
  public async delete(@Param('projectId') projectId: string): Promise<void> {
    await this.projectWriteService.delete(projectId);
  }

  private validatePayloadPermissions(userRole: Role, body: UpdateProjectBody): void {
    if (userRole === Role.Read) {
      throw new ForbiddenException('Read role cannot update project');
    }

    const isUpdatingOtherFields = body.name !== undefined;

    if (userRole === Role.Write && isUpdatingOtherFields) {
      throw new ForbiddenException('Write role can only update secrets');
    }
  }
}
