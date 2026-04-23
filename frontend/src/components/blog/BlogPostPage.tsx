import { BlogApi, type BlogPost } from "@/lib/api/blog.api";
import { useIsAdmin } from "@/lib/hooks/useIsAdmin";
import { Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, Pencil } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { BlogMarkdown } from "./BlogMarkdown";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function BlogPostPage() {
  const { slug } = useParams({ from: "/blog/$slug" });
  const isAdmin = useIsAdmin();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setPost(null);
    setError(null);
    BlogApi.getBySlug(slug)
      .then((data) => {
        if (!cancelled) setPost(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err?.response?.data?.message || err?.message || "Failed to load post"
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  return (
    <div className="min-h-screen bg-black text-foreground">

      <main className="mx-auto max-w-3xl px-6 pt-28 md:pt-32 pb-12 md:pb-16">
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-300 transition-colors mb-10"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to blog
        </Link>

        {error && (
          <div className="rounded-lg border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}


        {post && (
          <motion.article
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0, 0.55, 0.45, 1] }}
          >
            <header className="mb-10">
              <div className="text-sm text-neutral-500 mb-4">
                {formatDate(post.createdAt)}
              </div>
              <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-foreground">
                {post.title}
              </h1>
              {post.excerpt && (
                <p className="mt-5 text-lg text-neutral-400 leading-relaxed">
                  {post.excerpt}
                </p>
              )}
              <div className="mt-7 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {post.author.avatarUrl ? (
                    <img
                      src={post.author.avatarUrl}
                      alt={post.author.displayName}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-neutral-800" />
                  )}
                  <div className="text-sm">
                    <div className="text-foreground font-medium">
                      {post.author.displayName}
                    </div>
                    <div className="text-neutral-500">Author</div>
                  </div>
                </div>

                {isAdmin && (
                  <Link
                    to="/blog/edit/$slug"
                    params={{ slug: post.slug }}
                    className="inline-flex items-center gap-1.5 rounded-full border border-neutral-800 bg-neutral-900/60 px-3 py-1.5 text-xs text-neutral-300 hover:border-neutral-700 hover:bg-neutral-900 transition-colors"
                  >
                    <Pencil className="w-3 h-3" />
                    Edit
                  </Link>
                )}
              </div>
            </header>

            {post.coverImageUrl && (
              <img
                src={post.coverImageUrl}
                alt={post.title}
                className="mb-10 w-full rounded-xl border border-neutral-900"
              />
            )}

            <BlogMarkdown content={post.content} />
          </motion.article>
        )}
      </main>

      <footer className="border-t border-neutral-900 mt-20 py-10 px-6">
        <div className="mx-auto max-w-5xl text-sm text-neutral-500 flex items-center justify-between">
          <div>© 2025 Cryptly</div>
          <Link to="/" className="hover:text-neutral-300 transition-colors">
            Home
          </Link>
        </div>
      </footer>
    </div>
  );
}

