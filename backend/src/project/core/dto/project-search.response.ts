import { ApiProperty } from '@nestjs/swagger';

export class ProjectSearchResponse {
  @ApiProperty()
  public id: string;

  @ApiProperty()
  public name: string;

  @ApiProperty({ type: 'object', additionalProperties: { type: 'string' } })
  public encryptedSecretsKeys: Record<string, string>;

  @ApiProperty()
  public encryptedSecrets: string;
}
