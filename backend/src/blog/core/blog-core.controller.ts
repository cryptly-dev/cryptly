import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../../auth/core/decorators/is-public';
import { CurrentUserId } from '../../auth/core/decorators/current-user-id.decorator';
import { BlogAdminGuard } from './guards/blog-admin.guard';
import { BlogPostService } from './blog-post.service';
import { BlogImageUploadService } from './blog-image-upload.service';
import { CreateBlogPostBody } from './dto/create-blog-post.body';
import { BlogPostResponse } from './dto/blog-post.response';
import { UploadBlogImageBody } from './dto/upload-blog-image.body';

@Controller('blog')
@ApiTags('Blog')
export class BlogCoreController {
  constructor(
    private readonly blogPostService: BlogPostService,
    private readonly blogImageUploadService: BlogImageUploadService,
  ) {}

  @Public()
  @Get('posts')
  @ApiResponse({ type: [BlogPostResponse] })
  public async listPosts(): Promise<BlogPostResponse[]> {
    return this.blogPostService.list();
  }

  @Public()
  @Get('posts/:slug')
  @ApiResponse({ type: BlogPostResponse })
  public async getPost(@Param('slug') slug: string): Promise<BlogPostResponse> {
    return this.blogPostService.getBySlug(slug);
  }

  @Post('posts')
  @UseGuards(BlogAdminGuard)
  @ApiBearerAuth()
  @ApiResponse({ type: BlogPostResponse })
  public async createPost(
    @CurrentUserId() userId: string,
    @Body() body: CreateBlogPostBody,
  ): Promise<BlogPostResponse> {
    return this.blogPostService.create(userId, body.title, body.bodyMarkdown);
  }

  @Post('images')
  @UseGuards(BlogAdminGuard)
  @ApiBearerAuth()
  @ApiResponse({ schema: { properties: { url: { type: 'string' } } } })
  public async uploadImage(@Body() body: UploadBlogImageBody): Promise<{ url: string }> {
    return this.blogImageUploadService.uploadBase64(body.source);
  }
}
