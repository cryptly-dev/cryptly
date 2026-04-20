import { createFileRoute } from "@tanstack/react-router";
import { BlogPostPage } from "@/components/blog/BlogPostPage";

export const Route = createFileRoute("/blog/$slug")({
  component: BlogPostTanstackPage,
});

function BlogPostTanstackPage() {
  return <BlogPostPage />;
}
