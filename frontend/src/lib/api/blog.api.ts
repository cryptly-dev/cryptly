import axios from "axios";

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

export class BlogApi {
  public static async list(): Promise<BlogPost[]> {
    const response = await axios.get<BlogPost[]>("/blog/posts");
    return response.data;
  }

  public static async getBySlug(slug: string): Promise<BlogPost> {
    const response = await axios.get<BlogPost>(
      `/blog/posts/${encodeURIComponent(slug)}`
    );
    return response.data;
  }

  public static async create(
    jwtToken: string,
    dto: CreateBlogPostDto
  ): Promise<BlogPost> {
    const response = await axios.post<BlogPost>("/blog/posts", dto, {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    });
    return response.data;
  }

  public static async update(
    jwtToken: string,
    id: string,
    dto: UpdateBlogPostDto
  ): Promise<BlogPost> {
    const response = await axios.patch<BlogPost>(`/blog/posts/${id}`, dto, {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    });
    return response.data;
  }

  public static async delete(jwtToken: string, id: string): Promise<void> {
    await axios.delete(`/blog/posts/${id}`, {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    });
  }
}

export interface UploadImageResult {
  url: string;
  displayUrl: string;
}

const IMGBB_API_KEY = "0baaf5df435c58c7f85fd01d775bbe73";

export async function uploadImage(file: Blob): Promise<UploadImageResult> {
  const formData = new FormData();
  formData.append("image", file as Blob);

  const response = await axios.post(
    `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
    formData,
    {
      transformRequest: [(data) => data],
    }
  );

  const data = response.data as {
    status: number;
    success: boolean;
    error?: { message?: string };
    data?: {
      url: string;
      display_url: string;
    };
  };

  if (!data.success || !data.data) {
    throw new Error(data.error?.message || "Image upload failed");
  }

  return {
    url: data.data.url,
    displayUrl: data.data.display_url,
  };
}
