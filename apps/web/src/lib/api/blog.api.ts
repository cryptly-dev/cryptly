import { backend, bearer, unwrap, type Schemas } from "$lib/api/backend";

export type BlogPost = Schemas["BlogPostSerialized"];
export type CreateBlogPostDto = Schemas["CreateBlogPostBody"];
export type UpdateBlogPostDto = Schemas["UpdateBlogPostBody"];

export class BlogApi {
  public static list() {
    return unwrap(backend.GET("/blog/posts"), "Failed to load posts");
  }

  public static getBySlug(slug: string) {
    return unwrap(
      backend.GET("/blog/posts/{slug}", { params: { path: { slug } } }),
      "Failed to load post",
    );
  }

  public static create(jwtToken: string, dto: CreateBlogPostDto) {
    return unwrap(
      backend.POST("/blog/posts", { headers: bearer(jwtToken), body: dto }),
      "Failed to create post",
    );
  }

  public static update(jwtToken: string, id: string, dto: UpdateBlogPostDto) {
    return unwrap(
      backend.PATCH("/blog/posts/{id}", {
        params: { path: { id } },
        headers: bearer(jwtToken),
        body: dto,
      }),
      "Failed to update post",
    );
  }

  public static delete(jwtToken: string, id: string) {
    return unwrap(
      backend.DELETE("/blog/posts/{id}", {
        params: { path: { id } },
        headers: bearer(jwtToken),
      }),
      "Failed to delete post",
    );
  }
}

export interface UploadImageResult {
  url: string;
  displayUrl: string;
}

const IMGBB_API_KEY = "0baaf5df435c58c7f85fd01d775bbe73";

export async function uploadImage(
  _jwtToken: string,
  file: Blob,
): Promise<UploadImageResult> {
  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch(
    `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
    {
      method: "POST",
      body: formData,
    },
  );

  const data = (await response.json()) as {
    status: number;
    success: boolean;
    error?: { message?: string };
    data?: { url: string; display_url: string };
  };

  if (!data.success || !data.data) {
    throw new Error(data.error?.message || "Image upload failed");
  }

  return { url: data.data.url, displayUrl: data.data.display_url };
}
