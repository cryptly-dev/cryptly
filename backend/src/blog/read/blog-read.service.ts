import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BlogPostEntity } from '../core/entities/blog-post.entity';
import { BlogPostNormalized } from '../core/entities/blog-post.interface';
import { BlogPostSerializer } from '../core/entities/blog-post.serializer';

@Injectable()
export class BlogReadService {
  constructor(
    @InjectModel(BlogPostEntity.name)
    private blogPostModel: Model<BlogPostEntity>,
  ) {}

  public async findAll(): Promise<BlogPostNormalized[]> {
    const posts = await this.blogPostModel
      .find()
      .sort({ createdAt: -1 })
      .lean<BlogPostEntity[]>()
      .exec();

    return posts.map(BlogPostSerializer.normalize);
  }

  public async findBySlugOrThrow(slug: string): Promise<BlogPostNormalized> {
    const post = await this.blogPostModel.findOne({ slug }).lean<BlogPostEntity>().exec();

    if (!post) {
      throw new NotFoundException('Blog post not found');
    }

    return BlogPostSerializer.normalize(post);
  }

  public async findByIdOrThrow(id: string): Promise<BlogPostNormalized> {
    const post = await this.blogPostModel.findById(id).lean<BlogPostEntity>().exec();

    if (!post) {
      throw new NotFoundException('Blog post not found');
    }

    return BlogPostSerializer.normalize(post);
  }

  public async findBySlug(slug: string): Promise<BlogPostNormalized | null> {
    const post = await this.blogPostModel.findOne({ slug }).lean<BlogPostEntity>().exec();

    return post ? BlogPostSerializer.normalize(post) : null;
  }
}
