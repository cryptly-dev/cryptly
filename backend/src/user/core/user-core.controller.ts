import { Logger } from '@logdash/js-sdk';
import { Body, Controller, Delete, Get, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUserId } from '../../auth/core/decorators/current-user-id.decorator';
import { ProjectReadService } from '../../project/read/project-read.service';
import { UserReadService } from '../read/user-read.service';
import { UserWriteService } from '../write/user-write.service';
import { GetPublicKeysBody } from './dto/get-public-keys.body';
import { GetPublicKeysResponse } from './dto/get-public-keys.response';
import { UpdateUserBody } from './dto/update-user.body';
import { UserPartialSerialized, UserSerialized } from './entities/user.interface';
import { UserSerializer } from './entities/user.serializer';

@Controller('users')
@ApiTags('Users')
@ApiBearerAuth()
export class UserCoreController {
  constructor(
    private readonly userReadService: UserReadService,
    private readonly userWriteService: UserWriteService,
    private readonly projectReadService: ProjectReadService,
    private readonly logger: Logger,
  ) {}

  @Get('me')
  @ApiResponse({ type: UserSerialized })
  public async readCurrentUser(@CurrentUserId() userId: string): Promise<UserSerialized> {
    const user = await this.userReadService.readByIdOrThrow(userId);

    return UserSerializer.serialize(user);
  }

  @Patch('me')
  @ApiResponse({ type: UserSerialized })
  public async updateUser(
    @CurrentUserId() userId: string,
    @Body() body: UpdateUserBody,
  ): Promise<UserSerialized> {
    const user = await this.userWriteService.update(userId, body);

    return UserSerializer.serialize(user);
  }

  // todo: this is a temporary endpoint - IT SHOULD BE REMOVED
  @Delete('keys')
  public async deleteKeys(@CurrentUserId() userId: string): Promise<void> {
    await this.userWriteService.deleteKeys(userId);
  }

  @Post('public-keys')
  @ApiResponse({ type: GetPublicKeysResponse })
  public async getPublicKeys(@Body() body: GetPublicKeysBody): Promise<GetPublicKeysResponse> {
    const users = await this.userReadService.readByIds(body.userIds);

    if (users.some((user) => !user.publicKey)) {
      this.logger.error('Some users public key not found');
    }

    const publicKeys = users
      .filter((user) => !!user.publicKey)
      .reduce(
        (acc, user) => {
          acc[user.id] = user.publicKey!;
          return acc;
        },
        {} as Record<string, string>,
      );

    return { publicKeys };
  }

  @Get('suggested')
  @ApiResponse({ type: [UserPartialSerialized] })
  public async getSuggestedUsers(
    @CurrentUserId() userId: string,
  ): Promise<UserPartialSerialized[]> {
    const projects = await this.projectReadService.findUserProjects(userId);

    const userProjectCount = new Map<string, number>();

    for (const project of projects) {
      for (const [memberId] of project.members.entries()) {
        if (memberId === userId) {
          continue;
        }

        const currentCount = userProjectCount.get(memberId) || 0;
        userProjectCount.set(memberId, currentCount + 1);
      }
    }

    const userIds = Array.from(userProjectCount.keys());
    const users = await this.userReadService.readByIds(userIds);

    return users
      .map((user) => ({
        user,
        count: userProjectCount.get(user.id) || 0,
      }))
      .sort((a, b) => b.count - a.count)
      .map(({ user }) => UserSerializer.serializePartial(user));
  }
}
