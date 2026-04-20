import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, UpdateQuery } from 'mongoose';
import { BlogPostEntity } from '../core/entities/blog-post.entity';
import { BlogPostNormalized } from '../core/entities/blog-post.interface';
import { BlogPostSerializer } from '../core/entities/blog-post.serializer';
import { CreateBlogPostDto } from './dto/create-blog-post.dto';
import { UpdateBlogPostDto } from './dto/update-blog-post.dto';

@Injectable()
export class BlogWriteService {
  constructor(
    @InjectModel(BlogPostEntity.name)
    private blogPostModel: Model<BlogPostEntity>,
  ) {}

  public async create(dto: CreateBlogPostDto): Promise<BlogPostNormalized> {
    const existing = await this.blogPostModel.findOne({ slug: dto.slug }).lean().exec();
    if (existing) {
      throw new ConflictException('A blog post with this slug already exists');
    }

    const post = await this.blogPostModel.create({
      title: dto.title,
      slug: dto.slug,
      content: dto.content,
      excerpt: dto.excerpt,
      coverImageUrl: dto.coverImageUrl,
      authorId: new Types.ObjectId(dto.authorId),
    });

    return BlogPostSerializer.normalize(post);
  }

  public async update(id: string, dto: UpdateBlogPostDto): Promise<BlogPostNormalized> {
    const updateQuery: UpdateQuery<BlogPostEntity> = {};

    if (dto.title !== undefined) updateQuery.title = dto.title;
    if (dto.slug !== undefined) {
      const existing = await this.blogPostModel
        .findOne({ slug: dto.slug, _id: { $ne: new Types.ObjectId(id) } })
        .lean()
        .exec();
      if (existing) {
        throw new ConflictException('A blog post with this slug already exists');
      }
      updateQuery.slug = dto.slug;
    }
    if (dto.content !== undefined) updateQuery.content = dto.content;
    if (dto.excerpt !== undefined) updateQuery.excerpt = dto.excerpt;
    if (dto.coverImageUrl !== undefined) updateQuery.coverImageUrl = dto.coverImageUrl;

    const post = await this.blogPostModel.findOneAndUpdate(
      { _id: new Types.ObjectId(id) },
      updateQuery,
      { new: true },
    );

    if (!post) {
      throw new NotFoundException('Blog post not found');
    }

    return BlogPostSerializer.normalize(post);
  }

  public async delete(id: string): Promise<void> {
    await this.blogPostModel.deleteOne({ _id: new Types.ObjectId(id) });
  }
}
