import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserReadModule } from '../../user/read/user-read.module';
import { BlogPostEntity, BlogPostSchema } from './entities/blog-post.entity';
import { BlogCoreController } from './blog-core.controller';
import { BlogPostService } from './blog-post.service';
import { BlogImageUploadService } from './blog-image-upload.service';
import { BlogAdminGuard } from './guards/blog-admin.guard';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: BlogPostEntity.name, schema: BlogPostSchema }]),
    UserReadModule,
  ],
  controllers: [BlogCoreController],
  providers: [BlogPostService, BlogImageUploadService, BlogAdminGuard],
})
export class BlogCoreModule {}
