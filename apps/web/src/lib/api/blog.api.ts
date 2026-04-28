import { publicEnv } from "$lib/shared/env/public-env";

const baseUrl = () => publicEnv.apiUrl.replace(/\/$/, "");

export interface BlogPostAuthor {
  id: string;
  avatarUrl: string;
  displayName: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  coverImageUrl?: string;
  author: BlogPostAuthor;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBlogPostDto {
  title: string;
  content: string;
  excerpt?: string;
  coverImageUrl?: string;
  slug?: string;
  createdAt?: string;
}

export interface UpdateBlogPostDto {
  title?: string;
  content?: string;
  excerpt?: string;
  coverImageUrl?: string;
  slug?: string;
  createdAt?: string;
}

function authHeaders(jwt: string) {
  return { Authorization: `Bearer ${jwt}` };
}

export class BlogApi {
  public static async list(): Promise<BlogPost[]> {
    const res = await fetch(`${baseUrl()}/blog/posts`);
    if (!res.ok) throw new Error("Failed to load posts");
    return res.json() as Promise<BlogPost[]>;
  }

  public static async getBySlug(slug: string): Promise<BlogPost> {
    const res = await fetch(
      `${baseUrl()}/blog/posts/${encodeURIComponent(slug)}`,
    );
    if (!res.ok) throw new Error("Failed to load post");
    return res.json() as Promise<BlogPost>;
  }

  public static async create(
    jwtToken: string,
    dto: CreateBlogPostDto,
  ): Promise<BlogPost> {
    const res = await fetch(`${baseUrl()}/blog/posts`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders(jwtToken) },
      body: JSON.stringify(dto),
    });
    if (!res.ok) throw new Error("Failed to create post");
    return res.json() as Promise<BlogPost>;
  }

  public static async update(
    jwtToken: string,
    id: string,
    dto: UpdateBlogPostDto,
  ): Promise<BlogPost> {
    const res = await fetch(`${baseUrl()}/blog/posts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...authHeaders(jwtToken) },
      body: JSON.stringify(dto),
    });
    if (!res.ok) throw new Error("Failed to update post");
    return res.json() as Promise<BlogPost>;
  }

  public static async delete(jwtToken: string, id: string): Promise<void> {
    const res = await fetch(`${baseUrl()}/blog/posts/${id}`, {
      method: "DELETE",
      headers: { ...authHeaders(jwtToken) },
    });
    if (!res.ok) throw new Error("Failed to delete post");
  }
}

export interface UploadImageResult {
  url: string;
  displayUrl: string;
}

const IMGBB_API_KEY = "0baaf5df435c58c7f85fd01d775bbe73";

export async function uploadImage(_jwtToken: string, file: Blob): Promise<UploadImageResult> {
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
