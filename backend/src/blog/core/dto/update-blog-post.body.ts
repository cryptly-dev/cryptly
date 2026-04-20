import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateBlogPostBody {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  public title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(1)
  public content?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  public excerpt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  public coverImageUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  public slug?: string;
}
