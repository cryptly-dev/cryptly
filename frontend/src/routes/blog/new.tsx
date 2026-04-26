import { createFileRoute } from "@tanstack/react-router";
import { BlogEditorPage } from "@/components/blog/BlogEditorPage";

export const Route = createFileRoute("/blog/new")({
  component: BlogNewTanstackPage,
});

function BlogNewTanstackPage() {
  return <BlogEditorPage mode="create" />;
}
