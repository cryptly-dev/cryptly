import { ApiProperty } from '@nestjs/swagger';

export class BlogPostResponse {
  @ApiProperty()
  public id: string;

  @ApiProperty()
  public slug: string;

  @ApiProperty()
  public title: string;

  @ApiProperty()
  public bodyMarkdown: string;

  @ApiProperty()
  public authorUserId: string;

  @ApiProperty()
  public createdAt: string;

  @ApiProperty()
  public updatedAt: string;
}
