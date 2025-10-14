import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ProjectMemberGuard } from 'src/project/core/guards/project-member.guard';
import { RequireRole } from 'src/project/decorators/require-project-role.decorator';
import { Role } from 'src/shared/types/role.enum';
import { CurrentUserId } from '../../auth/core/decorators/current-user-id.decorator';
import { ProjectReadService } from '../../project/read/project-read.service';
import { ProjectWriteService } from '../../project/write/project-write.service';
import { UserReadService } from '../../user/read/user-read.service';
import { PersonalInvitationReadService } from '../read/personal-invitation-read.service';
import { PersonalInvitationWriteService } from '../write/personal-invitation-write.service';
import { CreatePersonalInvitationBody } from './dto/create-personal-invitation.body';
import { PersonalInvitationSerialized } from './entities/personal-invitation.interface';
import { PersonalInvitationSerializer } from './entities/personal-invitation.serializer';

@Controller('')
@ApiTags('Personal Invitations')
@ApiBearerAuth()
export class PersonalInvitationCoreController {
  constructor(
    private readonly personalInvitationWriteService: PersonalInvitationWriteService,
    private readonly personalInvitationReadService: PersonalInvitationReadService,
    private readonly projectReadService: ProjectReadService,
    private readonly projectWriteService: ProjectWriteService,
    private readonly userReadService: UserReadService,
  ) {}

  @Get('projects/:projectId/personal-invitations')
  @UseGuards(ProjectMemberGuard)
  @RequireRole(Role.Admin)
  @ApiResponse({ type: [PersonalInvitationSerialized] })
  public async findProjectPersonalInvitations(
    @Param('projectId') projectId: string,
  ): Promise<PersonalInvitationSerialized[]> {
    const invitations = await this.personalInvitationReadService.findByProjectId(projectId);
    const authorIds = invitations.map((i) => i.authorId);
    const invitedUserIds = invitations.map((i) => i.invitedUserId);
    const allUserIds = [...new Set([...authorIds, ...invitedUserIds])];
    const users = await this.userReadService.readByIds(allUserIds);

    const projectIds = [...new Set(invitations.map((i) => i.projectId))];
    const projects = await Promise.all(
      projectIds.map((id) => this.projectReadService.findByIdOrThrow(id)),
    );
    const projectsMap = new Map(projects.map((p) => [p.id, p.name]));

    return invitations
      .map((invitation) => {
        const author = users.find((u) => u.id === invitation.authorId);
        const invitedUser = users.find((u) => u.id === invitation.invitedUserId);
        const projectName = projectsMap.get(invitation.projectId);

        if (!author || !invitedUser || !projectName) {
          return null;
        }

        return PersonalInvitationSerializer.serialize(invitation, author, invitedUser, projectName);
      })
      .filter((i) => i !== null);
  }

  @Get('users/me/personal-invitations')
  @ApiResponse({ type: [PersonalInvitationSerialized] })
  public async findMyPersonalInvitations(
    @CurrentUserId() userId: string,
  ): Promise<PersonalInvitationSerialized[]> {
    const invitations = await this.personalInvitationReadService.findByInvitedUserId(userId);
    const authorIds = invitations.map((i) => i.authorId);
    const users = await this.userReadService.readByIds([...authorIds, userId]);

    const projectIds = [...new Set(invitations.map((i) => i.projectId))];
    const projects = await Promise.all(
      projectIds.map((id) => this.projectReadService.findByIdOrThrow(id)),
    );
    const projectsMap = new Map(projects.map((p) => [p.id, p.name]));

    return invitations
      .map((invitation) => {
        const author = users.find((u) => u.id === invitation.authorId);
        const invitedUser = users.find((u) => u.id === invitation.invitedUserId);
        const projectName = projectsMap.get(invitation.projectId);

        if (!author || !invitedUser || !projectName) {
          return null;
        }

        return PersonalInvitationSerializer.serialize(invitation, author, invitedUser, projectName);
      })
      .filter((i) => i !== null);
  }

  @Post('projects/:projectId/personal-invitations')
  @ApiResponse({ type: PersonalInvitationSerialized })
  @UseGuards(ProjectMemberGuard)
  @RequireRole(Role.Admin)
  public async create(
    @CurrentUserId() userId: string,
    @Param('projectId') projectId: string,
    @Body() body: CreatePersonalInvitationBody,
  ): Promise<PersonalInvitationSerialized> {
    const invitation = await this.personalInvitationWriteService.create({
      ...body,
      authorId: userId,
      projectId,
    });
    const author = await this.userReadService.readByIdOrThrow(userId);
    const invitedUser = await this.userReadService.readByIdOrThrow(body.invitedUserId);
    const project = await this.projectReadService.findByIdOrThrow(projectId);

    return PersonalInvitationSerializer.serialize(invitation, author, invitedUser, project.name);
  }

  @Post('personal-invitations/:personalInvitationId/accept')
  @ApiResponse({ type: PersonalInvitationSerialized })
  public async accept(
    @Param('personalInvitationId') id: string,
    @CurrentUserId() userId: string,
  ): Promise<void> {
    const invitation = await this.personalInvitationReadService.findByIdOrThrow(id);

    if (invitation.invitedUserId !== userId) {
      throw new ForbiddenException('You are not the invited user');
    }

    await this.projectWriteService.addMemberWithoutSettingSecretsKey(
      invitation.projectId.toString(),
      userId,
      invitation.role,
    );

    await this.personalInvitationWriteService.delete(id);
  }

  @Delete('personal-invitations/:personalInvitationId')
  @HttpCode(204)
  @UseGuards(ProjectMemberGuard)
  @RequireRole(Role.Admin)
  public async delete(@Param('personalInvitationId') id: string): Promise<void> {
    const invitation = await this.personalInvitationReadService.findByIdOrThrow(id);

    await this.personalInvitationWriteService.delete(id);
    await this.projectWriteService.removeEncryptedSecretsKey(
      invitation.projectId.toString(),
      invitation.invitedUserId,
    );
  }

  @Post('personal-invitations/:personalInvitationId/reject')
  @HttpCode(204)
  public async reject(
    @Param('personalInvitationId') id: string,
    @CurrentUserId() userId: string,
  ): Promise<void> {
    const invitation = await this.personalInvitationReadService.findByIdOrThrow(id);

    if (invitation.invitedUserId !== userId) {
      throw new ForbiddenException('You are not the invited user');
    }

    await this.personalInvitationWriteService.delete(id);
    await this.projectWriteService.removeEncryptedSecretsKey(
      invitation.projectId.toString(),
      invitation.invitedUserId,
    );
  }
}
