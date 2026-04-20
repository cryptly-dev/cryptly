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
}

export interface UpdateBlogPostDto {
  title?: string;
  content?: string;
  excerpt?: string;
  coverImageUrl?: string;
  slug?: string;
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

const FREEIMAGE_API_KEY = "6d207e02198a847aa98d0a2a901485a5";

export async function uploadImageToFreeimage(
  file: Blob
): Promise<UploadImageResult> {
  const formData = new FormData();
  formData.append("key", FREEIMAGE_API_KEY);
  formData.append("action", "upload");
  formData.append("source", file as Blob);
  formData.append("format", "json");

  const response = await axios.post(
    "https://freeimage.host/api/1/upload",
    formData,
    {
      transformRequest: [(data) => data],
    }
  );

  const data = response.data as {
    status_code: number;
    status_txt: string;
    image?: {
      url: string;
      display_url: string;
    };
  };

  if (data.status_code !== 200 || !data.image) {
    throw new Error(data.status_txt || "Image upload failed");
  }

  return {
    url: data.image.url,
    displayUrl: data.image.display_url,
  };
}
