import { BlogApi, type BlogPost } from "@/lib/api/blog.api";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Newspaper } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function BlogListPage() {
  const [posts, setPosts] = useState<BlogPost[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    BlogApi.list()
      .then((data) => {
        if (!cancelled) setPosts(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err?.response?.data?.message || err?.message || "Failed to load posts"
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-black text-foreground">
      <main className="mx-auto max-w-5xl px-6 py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0, 0.55, 0.45, 1] }}
          className="mb-16"
        >
          <h1 className="text-5xl md:text-6xl font-semibold tracking-tight">
            Writing on secrets,
            <br />
            <span className="text-neutral-400">security, and shipping.</span>
          </h1>
          <p className="mt-6 text-lg text-neutral-400 max-w-2xl">
            Notes from the Cryptly team. Engineering deep dives, product
            thinking, and UX insights.
          </p>
        </motion.div>

        {error && (
          <div className="rounded-lg border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {posts === null && !error && <BlogListSkeleton />}

        {posts && posts.length === 0 && (
          <div className="rounded-2xl border border-neutral-900 bg-neutral-950/50 p-16 text-center">
            <Newspaper className="mx-auto w-8 h-8 text-neutral-700" />
            <p className="mt-4 text-neutral-400">No posts yet. Check back soon.</p>
          </div>
        )}

        {posts && posts.length > 0 && (
          <div className="divide-y divide-neutral-900">
            {posts.map((post, i) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.5,
                  ease: [0, 0.55, 0.45, 1],
                  delay: 0.08 + i * 0.04,
                }}
              >
                <BlogPostCard post={post} />
              </motion.div>
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-neutral-900 py-10 px-6">
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

function BlogPostCard({ post }: { post: BlogPost }) {
  return (
    <Link
      to="/blog/$slug"
      params={{ slug: post.slug }}
      className="group block py-8"
    >
      <div className="flex flex-col md:flex-row md:items-start md:gap-10">
        <div className="md:w-40 flex-shrink-0 text-sm text-neutral-500 mb-3 md:mb-0 md:pt-1">
          {formatDate(post.createdAt)}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground group-hover:text-neutral-300 transition-colors">
            {post.title}
          </h2>
          {post.excerpt && (
            <p className="mt-3 text-neutral-400 leading-relaxed line-clamp-2">
              {post.excerpt}
            </p>
          )}
          <div className="mt-5 flex items-center gap-3 text-sm text-neutral-500">
            <div className="flex items-center gap-2">
              {post.author.avatarUrl ? (
                <img
                  src={post.author.avatarUrl}
                  alt={post.author.displayName}
                  className="w-5 h-5 rounded-full"
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-neutral-800" />
              )}
              <span>{post.author.displayName}</span>
            </div>
            <span className="inline-flex items-center gap-1.5 text-neutral-600 group-hover:text-neutral-400 transition-colors">
              Read
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function BlogListSkeleton() {
  return (
    <div className="divide-y divide-neutral-900">
      {[0, 1, 2].map((i) => (
        <div key={i} className="py-8 animate-pulse">
          <div className="flex flex-col md:flex-row md:items-start md:gap-10">
            <div className="md:w-40 flex-shrink-0 mb-3 md:mb-0">
              <div className="h-4 w-32 rounded bg-neutral-900" />
            </div>
            <div className="flex-1 space-y-3">
              <div className="h-7 w-3/4 rounded bg-neutral-900" />
              <div className="h-4 w-full rounded bg-neutral-900" />
              <div className="h-4 w-2/3 rounded bg-neutral-900" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
