import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateBlogPostBody {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(200)
  public title: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(500_000)
  public bodyMarkdown: string;
}
