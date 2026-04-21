import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUserId } from '../../auth/core/decorators/current-user-id.decorator';
import { Public } from '../../auth/core/decorators/is-public';
import { AdminGuard } from '../../auth/core/guards/admin.guard';
import { UserReadService } from '../../user/read/user-read.service';
import { UserSerializer } from '../../user/core/entities/user.serializer';
import { BlogReadService } from '../read/blog-read.service';
import { BlogWriteService } from '../write/blog-write.service';
import { CreateBlogPostBody } from './dto/create-blog-post.body';
import { UpdateBlogPostBody } from './dto/update-blog-post.body';
import { BlogPostSerialized } from './entities/blog-post.interface';
import { BlogPostSerializer } from './entities/blog-post.serializer';
import { slugify } from './utils/slugify';

@Controller('blog/posts')
@ApiTags('Blog')
@ApiBearerAuth()
export class BlogCoreController {
  constructor(
    private readonly blogReadService: BlogReadService,
    private readonly blogWriteService: BlogWriteService,
    private readonly userReadService: UserReadService,
  ) {}

  @Get()
  @Public()
  @ApiResponse({ type: [BlogPostSerialized] })
  public async findAll(): Promise<BlogPostSerialized[]> {
    const posts = await this.blogReadService.findAll();

    const authorIds = [...new Set(posts.map((p) => p.authorId))];
    const authors = await this.userReadService.readByIds(authorIds);
    const authorsMap = new Map(
      authors.map((author) => [author.id, UserSerializer.serializePartial(author)]),
    );

    return posts
      .map((post) => {
        const author = authorsMap.get(post.authorId);
        if (!author) return null;
        return BlogPostSerializer.serialize(post, author);
      })
      .filter((p): p is BlogPostSerialized => p !== null);
  }

  @Get(':slug')
  @Public()
  @ApiResponse({ type: BlogPostSerialized })
  public async findBySlug(@Param('slug') slug: string): Promise<BlogPostSerialized> {
    const post = await this.blogReadService.findBySlugOrThrow(slug);
    const author = await this.userReadService.readByIdOrThrow(post.authorId);

    return BlogPostSerializer.serialize(post, UserSerializer.serializePartial(author));
  }

  @Post()
  @UseGuards(AdminGuard)
  @ApiResponse({ type: BlogPostSerialized })
  public async create(
    @CurrentUserId() userId: string,
    @Body() body: CreateBlogPostBody,
  ): Promise<BlogPostSerialized> {
    const slug = await this.generateUniqueSlug(body.slug || body.title);

    const post = await this.blogWriteService.create({
      title: body.title,
      slug,
      content: body.content,
      excerpt: body.excerpt,
      coverImageUrl: body.coverImageUrl,
      authorId: userId,
      createdAt: body.createdAt ? new Date(body.createdAt) : undefined,
    });

    const author = await this.userReadService.readByIdOrThrow(userId);

    return BlogPostSerializer.serialize(post, UserSerializer.serializePartial(author));
  }

  @Patch(':id')
  @UseGuards(AdminGuard)
  @ApiResponse({ type: BlogPostSerialized })
  public async update(
    @Param('id') id: string,
    @Body() body: UpdateBlogPostBody,
  ): Promise<BlogPostSerialized> {
    const { createdAt, ...rest } = body;
    const post = await this.blogWriteService.update(id, {
      ...rest,
      createdAt: createdAt ? new Date(createdAt) : undefined,
    });
    const author = await this.userReadService.readByIdOrThrow(post.authorId);

    return BlogPostSerializer.serialize(post, UserSerializer.serializePartial(author));
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  @HttpCode(204)
  public async delete(@Param('id') id: string): Promise<void> {
    const post = await this.blogReadService.findByIdOrThrow(id);
    if (!post) {
      throw new NotFoundException('Blog post not found');
    }
    await this.blogWriteService.delete(id);
  }

  private async generateUniqueSlug(source: string): Promise<string> {
    const base = slugify(source) || 'post';
    let candidate = base;
    let suffix = 2;

    while (await this.blogReadService.findBySlug(candidate)) {
      candidate = `${base}-${suffix}`;
      suffix += 1;
    }

    return candidate;
  }
}
