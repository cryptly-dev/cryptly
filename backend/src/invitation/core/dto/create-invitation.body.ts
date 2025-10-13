import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';
import { Role } from '../../../shared/types/role.enum';

export class CreateInvitationBody {
  @ApiProperty()
  @IsString()
  public projectId: string;

  @ApiProperty()
  @IsString()
  public temporaryPublicKey: string;

  @ApiProperty()
  @IsString()
  public temporaryPrivateKey: string;

  @ApiProperty()
  @IsString()
  public temporarySecretsKey: string;

  @ApiProperty({ enum: [Role.Read, Role.Write, Role.Admin] })
  @IsEnum([Role.Read, Role.Write, Role.Admin])
  public role: Role;
}
