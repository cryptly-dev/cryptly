import { ApiProperty } from '@nestjs/swagger';
import { UserPartialSerialized } from '../../../user/core/entities/user.interface';
import { Role } from '../../../shared/types/role.enum';

export class PersonalInvitationNormalized {
  public id: string;
  public projectId: string;
  public authorId: string;
  public invitedUserId: string;
  public role: Role;
  public createdAt: Date;
}

export class PersonalInvitationSerialized {
  @ApiProperty()
  public id: string;

  @ApiProperty()
  public projectId: string;

  @ApiProperty({ type: UserPartialSerialized })
  public author: UserPartialSerialized;

  @ApiProperty({ type: UserPartialSerialized })
  public invitedUser: UserPartialSerialized;

  @ApiProperty({ enum: Role })
  public role: Role;

  @ApiProperty()
  public createdAt: string;
}
