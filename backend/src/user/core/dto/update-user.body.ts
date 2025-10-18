import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateUserBody {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  @ApiProperty({ required: false })
  public displayName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  @ApiProperty({ required: false })
  public publicKey?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  @ApiProperty({ required: false })
  public privateKeyEncrypted?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ApiProperty({ required: false, type: [String] })
  public projectsOrder?: string[];
}
