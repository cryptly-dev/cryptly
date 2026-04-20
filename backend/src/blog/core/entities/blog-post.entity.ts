import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';

@Schema({ collection: 'blog_posts', timestamps: true })
export class BlogPostEntity {
  _id: Types.ObjectId;

  @Prop({ required: true })
  slug: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  bodyMarkdown: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'UserEntity', required: true })
  authorUserId: Types.ObjectId;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export type BlogPostDocument = HydratedDocument<BlogPostEntity>;

export const BlogPostSchema = SchemaFactory.createForClass(BlogPostEntity);

BlogPostSchema.index({ slug: 1 }, { unique: true });
