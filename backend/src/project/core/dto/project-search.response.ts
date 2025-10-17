import { ApiProperty } from '@nestjs/swagger';

export class ProjectSearchResponse {
  @ApiProperty()
  public id: string;

  @ApiProperty()
  public name: string;

  @ApiProperty()
  public encryptedSecretsKeys: Record<string, string>;

  @ApiProperty()
  public encryptedSecrets: string;
}
