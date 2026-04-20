import { MarkdownContent } from "@/components/blog/MarkdownContent";
import { Button } from "@/components/ui/button";
import { BlogApi, type BlogPost } from "@/lib/api/blog.api";
import { authLogic } from "@/lib/logics/authLogic";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useValues } from "kea";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/blog/$slug")({
  component: BlogPostPage,
});

function BlogPostPage() {
  const { slug } = Route.useParams();
  const { jwtToken } = useValues(authLogic);
  const [post, setPost] = useState<BlogPost | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const p = await BlogApi.getPost(slug);
        if (!cancelled) {
          setPost(p);
          setError(null);
        }
      } catch {
        if (!cancelled) {
          setError("Post not found.");
          setPost(null);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-sm text-neutral-400 transition-colors hover:text-neutral-200"
          >
            <ArrowLeft className="h-4 w-4" />
            All posts
          </Link>
          {jwtToken ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-neutral-700 bg-neutral-900/80"
              onClick={() => authLogic.findMounted()?.actions.logout()}
            >
              Log out
            </Button>
          ) : (
            <Link to="/app/login">
              <Button type="button" variant="outline" size="sm" className="border-neutral-700 bg-neutral-900/80">
                Sign in
              </Button>
            </Link>
          )}
        </div>

        {!post && !error && (
          <p className="flex items-center gap-2 text-neutral-500">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading…
          </p>
        )}
        {error && <p className="text-red-400/90">{error}</p>}
        {post && (
          <>
            <header className="mb-10 border-b border-neutral-800 pb-8">
              <h1 className="text-4xl font-semibold tracking-tight text-neutral-50">{post.title}</h1>
              <time
                dateTime={post.createdAt}
                className="mt-3 block text-sm text-neutral-500"
              >
                {new Date(post.createdAt).toLocaleDateString(undefined, {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
            </header>
            <MarkdownContent markdown={post.bodyMarkdown} />
          </>
        )}
    </article>
  );
}
