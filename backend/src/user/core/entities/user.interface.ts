import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AuthMethod } from '../enum/auth-method.enum';

export class UserPartialNormalized {
  public id: string;
  public email: string;
  public avatarUrl: string;
  public publicKey?: string;
}

export class UserNormalized extends UserPartialNormalized {
  public authMethod: AuthMethod;
  public privateKeyEncrypted?: string;
}

export class UserPartialSerialized {
  @ApiProperty()
  public id: string;

  @ApiProperty()
  public email: string;

  @ApiProperty()
  public avatarUrl: string;

  @ApiProperty()
  public publicKey?: string;
}

export class UserSerialized extends UserPartialSerialized {
  @ApiProperty({ enum: AuthMethod })
  public authMethod: AuthMethod;

  @ApiPropertyOptional()
  public privateKeyEncrypted?: string;
}
