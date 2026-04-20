import { MarkdownContent } from "@/components/blog/MarkdownContent";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BlogApi, type BlogPost } from "@/lib/api/blog.api";
import { authLogic } from "@/lib/logics/authLogic";
import { isBlogAdmin } from "@/lib/utils/isBlogAdmin";
import { cn } from "@/lib/utils";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useValues } from "kea";
import { ArrowLeft, Loader2, PenLine } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/blog/")({
  component: BlogIndexPage,
});

function BlogIndexPage() {
  const navigate = useNavigate();
  const { jwtToken, userData } = useValues(authLogic);
  const [posts, setPosts] = useState<BlogPost[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadingPaste, setUploadingPaste] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const userLoaded = !jwtToken || userData !== null;
  const admin = Boolean(jwtToken && userData && isBlogAdmin(userData));
  const resolvingUser = Boolean(jwtToken && userData === null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await BlogApi.listPosts();
        if (!cancelled) {
          setPosts(list);
          setLoadError(null);
        }
      } catch {
        if (!cancelled) {
          setLoadError("Could not load posts.");
          setPosts([]);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const insertAtCursor = useCallback((text: string) => {
    const el = textareaRef.current;
    if (!el) {
      setBody((b) => `${b}${text}`);
      return;
    }
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const before = body.slice(0, start);
    const after = body.slice(end);
    const next = `${before}${text}${after}`;
    setBody(next);
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + text.length;
      el.setSelectionRange(pos, pos);
    });
  }, [body]);

  const handlePaste = useCallback(
    async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      if (!jwtToken || !admin) return;
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.kind !== "file") continue;
        const file = item.getAsFile();
        if (!file || !file.type.startsWith("image/")) continue;
        e.preventDefault();
        setUploadingPaste(true);
        try {
          const dataUrl = await readFileAsDataUrl(file);
          const { url } = await BlogApi.uploadImage(jwtToken, dataUrl);
          insertAtCursor(`\n![](${url})\n`);
          toast.success("Image uploaded");
        } catch {
          toast.error("Image upload failed");
        } finally {
          setUploadingPaste(false);
        }
        return;
      }
    },
    [admin, insertAtCursor, jwtToken]
  );

  const handlePublish = async () => {
    if (!jwtToken || !title.trim() || !body.trim()) return;
    setSaving(true);
    try {
      const post = await BlogApi.createPost(jwtToken, {
        title: title.trim(),
        bodyMarkdown: body,
      });
      toast.success("Post published");
      setTitle("");
      setBody("");
      setPosts((prev) => (prev ? [post, ...prev] : [post]));
      navigate({ to: "/blog/$slug", params: { slug: post.slug } });
    } catch {
      toast.error("Could not publish (admin only)");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-neutral-400 transition-colors hover:text-neutral-200"
        >
          <ArrowLeft className="h-4 w-4" />
          Home
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

      <header className="mb-12">
        <h1 className="text-4xl font-semibold tracking-tight">Blog</h1>
        <p className="mt-2 text-neutral-400">Updates and notes from the Cryptly team.</p>
      </header>

      {resolvingUser && (
        <p className="mb-8 flex items-center gap-2 text-sm text-neutral-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading account…
        </p>
      )}

      {admin && (
        <section className="mb-14 rounded-xl border border-neutral-800 bg-neutral-950/80 p-6 shadow-xl">
          <div className="mb-4 flex items-center gap-2 text-neutral-200">
            <PenLine className="h-5 w-5" />
            <h2 className="text-lg font-medium">New post</h2>
          </div>
          <label className="block text-sm text-neutral-400 mb-2">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Post title"
            className="mb-4 w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-neutral-100 outline-none ring-0 focus:border-neutral-600"
          />
          <Tabs defaultValue="write" className="w-full">
            <TabsList className="mb-2 bg-neutral-900">
              <TabsTrigger value="write" data-testid="blog-tab-write">
                Write
              </TabsTrigger>
              <TabsTrigger value="preview" data-testid="blog-tab-preview">
                Preview
              </TabsTrigger>
            </TabsList>
            <TabsContent value="write" className="mt-0">
              <textarea
                ref={textareaRef}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                onPaste={handlePaste}
                placeholder="Write in Markdown… Paste images to upload."
                rows={14}
                disabled={uploadingPaste}
                className={cn(
                  "w-full resize-y rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-3 font-mono text-sm leading-relaxed text-neutral-100 outline-none focus:border-neutral-600",
                  uploadingPaste && "opacity-70"
                )}
              />
              {uploadingPaste && (
                <p className="mt-2 flex items-center gap-2 text-xs text-neutral-500">
                  <Loader2 className="h-3 w-3 animate-spin" /> Uploading image…
                </p>
              )}
            </TabsContent>
            <TabsContent
              value="preview"
              className="mt-0 min-h-[320px] rounded-lg border border-neutral-800 bg-black/40 p-4"
            >
              {body.trim() ? (
                <MarkdownContent markdown={body} />
              ) : (
                <p className="text-neutral-500">Nothing to preview yet.</p>
              )}
            </TabsContent>
          </Tabs>
          <div className="mt-4 flex justify-end">
            <Button
              type="button"
              onClick={handlePublish}
              disabled={saving || !title.trim() || !body.trim()}
              className="bg-white text-black hover:bg-neutral-200"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Publishing…
                </>
              ) : (
                "Publish"
              )}
            </Button>
          </div>
        </section>
      )}

      {userLoaded && jwtToken && userData && !isBlogAdmin(userData) && (
        <p className="mb-8 rounded-lg border border-amber-900/50 bg-amber-950/30 px-4 py-3 text-sm text-amber-200/90">
          You are signed in, but this account is not a blog admin. Ask a team member to add your email to{" "}
          <code className="rounded bg-neutral-900 px-1">BLOG_ADMIN_EMAILS</code>.
        </p>
      )}

      <section>
        <h2 className="mb-6 text-xl font-medium text-neutral-200">Posts</h2>
        {loadError && <p className="text-red-400/90">{loadError}</p>}
        {posts === null && !loadError && (
          <p className="flex items-center gap-2 text-neutral-500">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading…
          </p>
        )}
        {posts && posts.length === 0 && <p className="text-neutral-500">No posts yet.</p>}
        {posts && posts.length > 0 && (
          <ul className="space-y-4">
            {posts.map((p) => (
              <li key={p.id}>
                <Link
                  to="/blog/$slug"
                  params={{ slug: p.slug }}
                  className="group block rounded-lg border border-neutral-800 bg-neutral-950/50 px-4 py-4 transition-colors hover:border-neutral-600 hover:bg-neutral-900/50"
                >
                  <span className="text-lg font-medium text-neutral-100 group-hover:underline">{p.title}</span>
                  <div className="mt-1 text-xs text-neutral-500">
                    {new Date(p.createdAt).toLocaleDateString(undefined, {
                      dateStyle: "medium",
                    })}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
