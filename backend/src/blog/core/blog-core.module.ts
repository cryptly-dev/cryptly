import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserReadModule } from '../../user/read/user-read.module';
import { BlogReadModule } from '../read/blog-read.module';
import { BlogWriteModule } from '../write/blog-write.module';
import { BlogCoreController } from './blog-core.controller';
import { BlogPostEntity, BlogPostSchema } from './entities/blog-post.entity';
import { AdminGuard } from '../../auth/core/guards/admin.guard';

@Module({
  imports: [
    BlogReadModule,
    BlogWriteModule,
    UserReadModule,
    MongooseModule.forFeature([{ name: BlogPostEntity.name, schema: BlogPostSchema }]),
  ],
  providers: [AdminGuard],
  controllers: [BlogCoreController],
})
export class BlogCoreModule {}
