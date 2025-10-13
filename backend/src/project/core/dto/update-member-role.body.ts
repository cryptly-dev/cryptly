import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { Role } from '../../../shared/types/role.enum';

export class UpdateMemberRoleBody {
  @ApiProperty({ enum: [Role.Read, Role.Write, Role.Admin] })
  @IsEnum([Role.Read, Role.Write, Role.Admin])
  public role: Role;
}
