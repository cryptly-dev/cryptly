import { UserPartialSerialized } from '../../../user/core/entities/user.interface';
import { BlogPostEntity } from './blog-post.entity';
import { BlogPostNormalized, BlogPostSerialized } from './blog-post.interface';

export class BlogPostSerializer {
  public static normalize(entity: BlogPostEntity): BlogPostNormalized {
    return {
      id: entity._id.toString(),
      title: entity.title,
      slug: entity.slug,
      content: entity.content,
      excerpt: entity.excerpt,
      coverImageUrl: entity.coverImageUrl,
      authorId: entity.authorId.toString(),
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  public static serialize(
    normalized: BlogPostNormalized,
    author: UserPartialSerialized,
  ): BlogPostSerialized {
    return {
      id: normalized.id,
      title: normalized.title,
      slug: normalized.slug,
      content: normalized.content,
      excerpt: normalized.excerpt,
      coverImageUrl: normalized.coverImageUrl,
      author: {
        id: author.id,
        avatarUrl: author.avatarUrl,
        displayName: author.displayName,
      },
      createdAt: normalized.createdAt.toISOString(),
      updatedAt: normalized.updatedAt.toISOString(),
    };
  }
}
