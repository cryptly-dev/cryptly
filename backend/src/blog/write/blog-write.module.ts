import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BlogPostEntity, BlogPostSchema } from '../core/entities/blog-post.entity';
import { BlogWriteService } from './blog-write.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: BlogPostEntity.name, schema: BlogPostSchema }]),
  ],
  providers: [BlogWriteService],
  exports: [BlogWriteService],
})
export class BlogWriteModule {}
