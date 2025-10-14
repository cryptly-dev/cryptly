import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';
import { Role } from '../../../shared/types/role.enum';

export class CreatePersonalInvitationBody {
  @ApiProperty()
  @IsString()
  public invitedUserId: string;

  @ApiProperty({ enum: Role })
  @IsEnum(Role)
  public role: Role;
}
