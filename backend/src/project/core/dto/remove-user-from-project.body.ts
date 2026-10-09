import { ApiProperty } from '@nestjs/swagger';
import { IsObject } from 'class-validator';

export class RemoveUserFromBody {
  @ApiProperty({ type: 'object', additionalProperties: { type: 'string' } })
  @IsObject()
  public newencryptedSecretsKeys: Record<string, string>;
}
