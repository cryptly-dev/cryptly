import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BlogPostEntity } from './entities/blog-post.entity';
import { BlogPostResponse } from './dto/blog-post.response';

function slugifyTitle(title: string): string {
  const s = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
  return s || 'post';
}

@Injectable()
export class BlogPostService {
  constructor(@InjectModel(BlogPostEntity.name) private readonly blogPostModel: Model<BlogPostEntity>) {}

  public async list(): Promise<BlogPostResponse[]> {
    const docs = await this.blogPostModel
      .find()
      .sort({ createdAt: -1 })
      .lean<BlogPostEntity[]>()
      .exec();

    return docs.map((d) => this.serialize(d));
  }

  public async getBySlug(slug: string): Promise<BlogPostResponse> {
    const doc = await this.blogPostModel.findOne({ slug }).lean<BlogPostEntity>().exec();

    if (!doc) {
      throw new NotFoundException('Post not found');
    }

    return this.serialize(doc);
  }

  public async create(authorUserId: string, title: string, bodyMarkdown: string): Promise<BlogPostResponse> {
    const base = slugifyTitle(title);
    let slug = base;
    let n = 2;

    while (await this.blogPostModel.exists({ slug })) {
      slug = `${base}-${n}`;
      n += 1;
    }

    try {
      const created = await this.blogPostModel.create({
        slug,
        title: title.trim(),
        bodyMarkdown,
        authorUserId: new Types.ObjectId(authorUserId),
      });

      const doc = created.toObject() as BlogPostEntity;
      return this.serialize(doc);
    } catch (e: any) {
      if (e?.code === 11000) {
        throw new ConflictException('Slug already exists');
      }
      throw e;
    }
  }

  private serialize(doc: BlogPostEntity): BlogPostResponse {
    return {
      id: doc._id.toString(),
      slug: doc.slug,
      title: doc.title,
      bodyMarkdown: doc.bodyMarkdown,
      authorUserId: doc.authorUserId.toString(),
      createdAt: (doc as any).createdAt?.toISOString?.() ?? new Date().toISOString(),
      updatedAt: (doc as any).updatedAt?.toISOString?.() ?? new Date().toISOString(),
    };
  }
}
