import { createFileRoute } from "@tanstack/react-router";
import { BlogEditorPage } from "@/components/blog/BlogEditorPage";

export const Route = createFileRoute("/blog/edit/$slug")({
  component: BlogEditTanstackPage,
});

function BlogEditTanstackPage() {
  const { slug } = Route.useParams();
  return <BlogEditorPage mode="edit" slug={slug} />;
}
