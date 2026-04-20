import axios from "axios";

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  bodyMarkdown: string;
  authorUserId: string;
  createdAt: string;
  updatedAt: string;
}

export class BlogApi {
  public static async listPosts(): Promise<BlogPost[]> {
    const { data } = await axios.get<BlogPost[]>("/blog/posts");
    return data;
  }

  public static async getPost(slug: string): Promise<BlogPost> {
    const { data } = await axios.get<BlogPost>(`/blog/posts/${encodeURIComponent(slug)}`);
    return data;
  }

  public static async createPost(
    jwtToken: string,
    payload: { title: string; bodyMarkdown: string }
  ): Promise<BlogPost> {
    const { data } = await axios.post<BlogPost>("/blog/posts", payload, {
      headers: { Authorization: `Bearer ${jwtToken}` },
    });
    return data;
  }

  public static async uploadImage(jwtToken: string, source: string): Promise<{ url: string }> {
    const { data } = await axios.post<{ url: string }>(
      "/blog/images",
      { source },
      {
        headers: { Authorization: `Bearer ${jwtToken}` },
      }
    );
    return data;
  }
}
