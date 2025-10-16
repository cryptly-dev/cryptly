import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';

export class UpdateUserBody {
  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  public publicKey?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  public privateKeyEncrypted?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ApiProperty({ required: false, type: [String] })
  public projectsOrder?: string[];
}
