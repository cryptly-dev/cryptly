import { ApiPropertyOptional } from '@nestjs/swagger';
import { ArrayMaxSize, IsArray, IsMongoId, IsOptional } from 'class-validator';

export class SecretsPushedBody {
  @ApiPropertyOptional({
    type: [String],
    description: 'GitHub integrations of this project the secrets were pushed to.',
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(100)
  @IsMongoId({ each: true })
  public integrationIds?: string[];
}
