import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';

class InstallationPayload {
  @ApiProperty()
  @IsNumber()
  public id: number;
}

export class GithubWebhookBody {
  @ApiProperty()
  @IsString()
  public action: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => InstallationPayload)
  public installation?: InstallationPayload;
}
