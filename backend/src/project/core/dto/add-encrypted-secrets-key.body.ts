import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';

export class AddEncryptedSecretsKeyBody {
  @ApiProperty()
  @IsString()
  public userId: string;

  @ApiProperty()
  @IsString()
  @MaxLength(1000)
  public encryptedSecretsKey: string;
}
