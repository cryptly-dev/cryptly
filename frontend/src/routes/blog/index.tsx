import { createFileRoute } from "@tanstack/react-router";
import { BlogListPage } from "@/components/blog/BlogListPage";

export const Route = createFileRoute("/blog/")({
  component: BlogListTanstackPage,
});

function BlogListTanstackPage() {
  return <BlogListPage />;
}
