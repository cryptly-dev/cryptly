import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { BlogApi, uploadImage, type BlogPost } from "@/lib/api/blog.api";
import { useIsAdmin } from "@/lib/hooks/useIsAdmin";
import { authLogic } from "@/lib/logics/authLogic";
import { useNavigate } from "@tanstack/react-router";
import { useValues } from "kea";
import { ArrowLeft, ImageUp, Save, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { BlogHeader } from "./BlogHeader";
import { BlogMarkdown } from "./BlogMarkdown";

interface BlogEditorPageProps {
  mode: "create" | "edit";
  slug?: string;
}

function toLocalDateTimeInput(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const PLACEHOLDER = `# Your next post

Write in markdown on the left. Preview renders live on the right.

Paste an image from clipboard — it will be uploaded and a markdown link inserted automatically.

## Some ideas

- Launches
- Engineering notes
- Security deep dives

\`\`\`ts
export const example = () => "hello, world";
\`\`\`
`;

export function BlogEditorPage({ mode, slug }: BlogEditorPageProps) {
  const isAdmin = useIsAdmin();
  const { jwtToken } = useValues(authLogic);
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [slugInput, setSlugInput] = useState("");
  const [releaseDate, setReleaseDate] = useState("");
  const [content, setContent] = useState(PLACEHOLDER);
  const [postId, setPostId] = useState<string | null>(null);
  const [loadingPost, setLoadingPost] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (mode !== "edit" || !slug) return;
    let cancelled = false;
    setLoadingPost(true);
    BlogApi.getBySlug(slug)
      .then((post: BlogPost) => {
        if (cancelled) return;
        setTitle(post.title);
        setExcerpt(post.excerpt ?? "");
        setCoverImageUrl(post.coverImageUrl ?? "");
        setSlugInput(post.slug);
        setReleaseDate(toLocalDateTimeInput(post.createdAt));
        setContent(post.content);
        setPostId(post.id);
      })
      .catch(() => {
        if (!cancelled) toast.error("Failed to load post");
      })
      .finally(() => {
        if (!cancelled) setLoadingPost(false);
      });
    return () => {
      cancelled = true;
    };
  }, [mode, slug]);

  const insertAtCursor = useCallback((insertion: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setContent((prev) => prev + insertion);
      return;
    }
    const start = textarea.selectionStart ?? textarea.value.length;
    const end = textarea.selectionEnd ?? textarea.value.length;
    const before = textarea.value.slice(0, start);
    const after = textarea.value.slice(end);
    const next = `${before}${insertion}${after}`;
    setContent(next);
    requestAnimationFrame(() => {
      const newCursor = start + insertion.length;
      textarea.focus();
      textarea.setSelectionRange(newCursor, newCursor);
    });
  }, []);

  const uploadPastedImage = useCallback(
    async (file: File) => {
      const placeholderToken = `__uploading_${Date.now()}__`;
      const placeholderMarkdown = `![uploading…](${placeholderToken})`;
      insertAtCursor(placeholderMarkdown);
      setUploadingImage(true);
      try {
        const result = await uploadImage(file);
        setContent((prev) =>
          prev.replace(
            placeholderMarkdown,
            `![image](${result.displayUrl || result.url})`
          )
        );
        toast.success("Image uploaded");
      } catch (err) {
        setContent((prev) => prev.replace(placeholderMarkdown, ""));
        const message =
          (err as { message?: string })?.message || "Image upload failed";
        toast.error(message);
      } finally {
        setUploadingImage(false);
      }
    },
    [insertAtCursor]
  );

  const handlePaste = useCallback(
    (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
      const items = event.clipboardData?.items;
      if (!items) return;
      for (const item of Array.from(items)) {
        if (item.kind === "file" && item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (!file) continue;
          event.preventDefault();
          void uploadPastedImage(file);
          return;
        }
      }
    },
    [uploadPastedImage]
  );

  const handleCoverImagePaste = useCallback(
    (event: React.ClipboardEvent<HTMLInputElement>) => {
      const items = event.clipboardData?.items;
      if (!items) return;
      for (const item of Array.from(items)) {
        if (item.kind === "file" && item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (!file) continue;
          event.preventDefault();
          void (async () => {
            setUploadingImage(true);
            try {
              const result = await uploadImage(file);
              setCoverImageUrl(result.displayUrl || result.url);
              toast.success("Cover image uploaded");
            } catch (err) {
              const message =
                (err as { message?: string })?.message || "Image upload failed";
              toast.error(message);
            } finally {
              setUploadingImage(false);
            }
          })();
          return;
        }
      }
    },
    []
  );

  const handleSave = useCallback(async () => {
    if (!jwtToken) {
      toast.error("Not authenticated");
      return;
    }
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!content.trim()) {
      toast.error("Content is required");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        content,
        excerpt: excerpt.trim() || undefined,
        coverImageUrl: coverImageUrl.trim() || undefined,
        slug: slugInput.trim() || undefined,
        createdAt: releaseDate ? new Date(releaseDate).toISOString() : undefined,
      };

      if (mode === "create") {
        const created = await BlogApi.create(jwtToken, payload);
        toast.success("Post published");
        navigate({ to: "/blog/$slug", params: { slug: created.slug } });
      } else if (postId) {
        const updated = await BlogApi.update(jwtToken, postId, payload);
        toast.success("Post updated");
        navigate({ to: "/blog/$slug", params: { slug: updated.slug } });
      }
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } }; message?: string })
          ?.response?.data?.message ||
        (err as { message?: string })?.message ||
        "Save failed";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }, [jwtToken, title, content, excerpt, coverImageUrl, slugInput, releaseDate, mode, postId, navigate]);

  const handleDelete = useCallback(async () => {
    if (!jwtToken || !postId) return;
    const ok = window.confirm(
      "Delete this post? This action cannot be undone."
    );
    if (!ok) return;
    setDeleting(true);
    try {
      await BlogApi.delete(jwtToken, postId);
      toast.success("Post deleted");
      navigate({ to: "/blog" });
    } catch (err) {
      const message =
        (err as { message?: string })?.message || "Delete failed";
      toast.error(message);
    } finally {
      setDeleting(false);
    }
  }, [jwtToken, postId, navigate]);

  const wordCount = useMemo(
    () => content.trim().split(/\s+/).filter(Boolean).length,
    [content]
  );

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-black text-foreground">
        <BlogHeader />
        <div className="mx-auto max-w-3xl px-6 py-24 text-center">
          <h1 className="text-3xl font-semibold">Admin access required</h1>
          <p className="mt-3 text-neutral-400">
            You need admin privileges to access the editor.
          </p>
          <Button
            className="mt-8"
            onClick={() => navigate({ to: "/blog" })}
          >
            Back to blog
          </Button>
        </div>
      </div>
    );
  }

  if (loadingPost) {
    return (
      <div className="min-h-screen bg-black text-foreground">
        <BlogHeader />
        <div className="mx-auto max-w-3xl px-6 py-24 flex items-center justify-center">
          <Spinner className="w-6 h-6" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-foreground flex flex-col">
      <BlogHeader />

      {/* Meta bar */}
      <div className="border-b border-neutral-900/80 bg-black/60 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-6 py-4 flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => navigate({ to: "/blog" })}
              className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-300 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <div className="flex items-center gap-2">
              {uploadingImage && (
                <span className="inline-flex items-center gap-2 text-xs text-neutral-500">
                  <Spinner className="w-3 h-3" />
                  Uploading image…
                </span>
              )}
              {mode === "edit" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDelete}
                  disabled={deleting || saving}
                  className="text-destructive border-red-900/60 hover:bg-red-950/40 hover:text-destructive"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {deleting ? "Deleting…" : "Delete"}
                </Button>
              )}
              <Button
                size="sm"
                onClick={handleSave}
                disabled={saving || deleting}
                className="cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                {saving
                  ? "Saving…"
                  : mode === "create"
                    ? "Publish"
                    : "Save"}
              </Button>
            </div>
          </div>

          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="w-full bg-transparent text-3xl md:text-4xl font-semibold tracking-tight text-foreground placeholder:text-neutral-700 focus:outline-none"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Excerpt (shown on blog list)"
              className="w-full bg-transparent text-sm text-neutral-300 placeholder:text-neutral-700 focus:outline-none border-b border-neutral-900 py-2"
            />
            <input
              type="text"
              value={coverImageUrl}
              onChange={(e) => setCoverImageUrl(e.target.value)}
              onPaste={handleCoverImagePaste}
              placeholder="Cover image URL — or paste an image"
              className="w-full bg-transparent text-sm text-neutral-300 placeholder:text-neutral-700 focus:outline-none border-b border-neutral-900 py-2"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text"
              value={slugInput}
              onChange={(e) => setSlugInput(e.target.value)}
              placeholder="Slug (leave empty to auto-generate)"
              className="w-full bg-transparent text-sm text-neutral-300 placeholder:text-neutral-700 focus:outline-none border-b border-neutral-900 py-2"
            />
            <input
              type="datetime-local"
              value={releaseDate}
              onChange={(e) => setReleaseDate(e.target.value)}
              className="w-full bg-transparent text-sm text-neutral-300 placeholder:text-neutral-700 focus:outline-none border-b border-neutral-900 py-2"
            />
          </div>
        </div>
      </div>

      {/* Split view */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 min-h-0">
        <div className="flex flex-col border-r border-neutral-900 min-h-0">
          <div className="flex items-center justify-between px-6 py-2 border-b border-neutral-900 bg-neutral-950/40 text-xs text-neutral-500">
            <span className="font-medium">Markdown</span>
            <div className="flex items-center gap-4">
              <span className="inline-flex items-center gap-1.5">
                <ImageUp className="w-3.5 h-3.5" />
                Paste images directly
              </span>
              <span>{wordCount} words</span>
            </div>
          </div>
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onPaste={handlePaste}
            spellCheck={false}
            className="flex-1 w-full resize-none bg-black px-6 py-6 text-[15px] leading-7 font-mono text-neutral-200 placeholder:text-neutral-700 focus:outline-none"
            placeholder="# Start typing…"
          />
        </div>
        <div className="min-h-0 overflow-y-auto">
          <div className="flex items-center justify-between px-6 py-2 border-b border-neutral-900 bg-neutral-950/40 text-xs text-neutral-500 sticky top-0 z-10 backdrop-blur">
            <span className="font-medium">Preview</span>
          </div>
          <div className="px-6 md:px-10 py-8 md:py-10">
            {title.trim() && (
              <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-foreground mb-4">
                {title}
              </h1>
            )}
            {excerpt.trim() && (
              <p className="text-lg text-neutral-400 leading-relaxed mb-8">
                {excerpt}
              </p>
            )}
            {coverImageUrl.trim() && (
              <img
                src={coverImageUrl}
                alt=""
                className="mb-8 w-full rounded-xl border border-neutral-900"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
            )}
            <BlogMarkdown content={content} />
          </div>
        </div>
      </div>
    </div>
  );
}
