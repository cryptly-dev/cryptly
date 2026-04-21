export class CreateBlogPostDto {
  public title: string;
  public slug: string;
  public content: string;
  public excerpt?: string;
  public coverImageUrl?: string;
  public authorId: string;
  public createdAt?: Date;
}
