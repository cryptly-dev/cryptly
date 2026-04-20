import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UploadBlogImageBody {
  @ApiProperty({
    description: 'Base64-encoded image data (optionally with data URL prefix)',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(12_000_000)
  public source: string;
}
