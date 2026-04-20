import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';

@Schema({ collection: 'blog_posts', timestamps: true })
export class BlogPostEntity {
  _id: Types.ObjectId;

  @Prop()
  public title: string;

  @Prop()
  public slug: string;

  @Prop()
  public content: string;

  @Prop({ required: false })
  public excerpt?: string;

  @Prop({ required: false })
  public coverImageUrl?: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'UserEntity' })
  public authorId: Types.ObjectId;

  @Prop()
  public createdAt: Date;

  @Prop()
  public updatedAt: Date;
}

export type BlogPostDocument = HydratedDocument<BlogPostEntity>;

export const BlogPostSchema = SchemaFactory.createForClass(BlogPostEntity);
