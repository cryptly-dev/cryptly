import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserPartialSerialized } from '../../../user/core/entities/user.interface';

export class BlogPostNormalized {
  public id: string;
  public title: string;
  public slug: string;
  public content: string;
  public excerpt?: string;
  public coverImageUrl?: string;
  public authorId: string;
  public createdAt: Date;
  public updatedAt: Date;
}

export class BlogPostSerialized {
  @ApiProperty()
  public id: string;

  @ApiProperty()
  public title: string;

  @ApiProperty()
  public slug: string;

  @ApiProperty()
  public content: string;

  @ApiPropertyOptional()
  public excerpt?: string;

  @ApiPropertyOptional()
  public coverImageUrl?: string;

  @ApiProperty({ type: UserPartialSerialized })
  public author: UserPartialSerialized;

  @ApiProperty()
  public createdAt: string;

  @ApiProperty()
  public updatedAt: string;
}
