<script lang="ts">
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { ArrowLeft, ImageUp, Loader2, Save, Trash2 } from 'lucide-svelte';
  import { toast } from 'svelte-sonner';
  import { BlogApi, uploadImage, type BlogPost } from '$lib/api/blog.api';
  import { auth } from '$lib/stores/auth.svelte';
  import BlogMarkdown from './BlogMarkdown.svelte';

  let { mode, slug = '' }: { mode: 'create' | 'edit'; slug?: string } = $props();

  function toLocalDateTimeInput(iso: string): string {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  const PLACEHOLDER = `# Your next post

Write in markdown on the left. Preview renders live on the right.

Paste an image from clipboard — it will be uploaded and a markdown link inserted automatically.

Style images by adding modifiers after a pipe in the alt text:
\`![caption|small](url)\` — also \`medium\`, \`large\`, \`full\`, or pixel widths like \`![caption|400](url)\` and \`![caption|400x250](url)\`.
Combine with space-separated modifiers: \`center\` to center, \`flat\` to remove rounded corners — e.g. \`![caption|400 center flat](url)\`.

## Some ideas

- Launches
- Engineering notes
- Security deep dives

\`\`\`ts
export const example = () => "hello, world";
\`\`\`
`;

  const isAdmin = $derived(Boolean(auth.userData?.isAdmin));

  let title = $state('');
  let excerpt = $state('');
  let coverImageUrl = $state('');
  let slugInput = $state('');
  let releaseDate = $state('');
  let content = $state(PLACEHOLDER);
  let postId = $state<string | null>(null);
  let loadingPost = $state(false);
  let saving = $state(false);
  let deleting = $state(false);
  let uploadingImage = $state(false);

  let textareaEl: HTMLTextAreaElement | undefined = $state();

  const wordCount = $derived(content.trim().split(/\s+/).filter(Boolean).length);

  onMount(() => {
    if (mode !== 'edit' || !slug) return () => {};
    let cancelled = false;
    loadingPost = true;
    BlogApi.getBySlug(slug)
      .then((post: BlogPost) => {
        if (cancelled) return;
        title = post.title;
        excerpt = post.excerpt ?? '';
        coverImageUrl = post.coverImageUrl ?? '';
        slugInput = post.slug;
        releaseDate = toLocalDateTimeInput(post.createdAt);
        content = post.content;
        postId = post.id;
      })
      .catch(() => {
        if (!cancelled) toast.error('Failed to load post');
      })
      .finally(() => {
        if (!cancelled) loadingPost = false;
      });
    return () => {
      cancelled = true;
    };
  });

  function insertAtCursor(insertion: string) {
    const textarea = textareaEl;
    if (!textarea) {
      content += insertion;
      return;
    }
    const start = textarea.selectionStart ?? textarea.value.length;
    const end = textarea.selectionEnd ?? textarea.value.length;
    const before = textarea.value.slice(0, start);
    const after = textarea.value.slice(end);
    content = `${before}${insertion}${after}`;
    requestAnimationFrame(() => {
      const newCursor = start + insertion.length;
      textarea.focus();
      textarea.setSelectionRange(newCursor, newCursor);
    });
  }

  async function uploadPastedImage(file: File) {
    const placeholderToken = `__uploading_${Date.now()}__`;
    const placeholderMarkdown = `![uploading…](${placeholderToken})`;
    insertAtCursor(placeholderMarkdown);
    uploadingImage = true;
    try {
      const result = await uploadImage(file);
      content = content.replace(
        placeholderMarkdown,
        `![image](${result.displayUrl || result.url})`,
      );
      toast.success('Image uploaded');
    } catch (err) {
      content = content.replace(placeholderMarkdown, '');
      const message =
        err && typeof err === 'object' && 'message' in err && typeof (err as Error).message === 'string'
          ? (err as Error).message
          : 'Image upload failed';
      toast.error(message);
    } finally {
      uploadingImage = false;
    }
  }

  function handlePasteContent(e: ClipboardEvent) {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of Array.from(items)) {
      if (item.kind === 'file' && item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (!file) continue;
        e.preventDefault();
        void uploadPastedImage(file);
        return;
      }
    }
  }

  function handleDragOver(e: DragEvent) {
    if (e.dataTransfer && Array.from(e.dataTransfer.types).includes('Files')) {
      e.preventDefault();
    }
  }

  function handleDrop(e: DragEvent) {
    const files = e.dataTransfer?.files;
    if (!files || files.length === 0) return;
    const images = Array.from(files).filter((file) => file.type.startsWith('image/'));
    if (images.length === 0) return;
    e.preventDefault();
    for (const file of images) {
      void uploadPastedImage(file);
    }
  }

  async function handleCoverImagePaste(e: ClipboardEvent) {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of Array.from(items)) {
      if (item.kind === 'file' && item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (!file) continue;
        e.preventDefault();
        uploadingImage = true;
        try {
          const result = await uploadImage(file);
          coverImageUrl = result.displayUrl || result.url;
          toast.success('Cover image uploaded');
        } catch (err) {
          const message =
            err && typeof err === 'object' && 'message' in err && typeof (err as Error).message === 'string'
              ? (err as Error).message
              : 'Image upload failed';
          toast.error(message);
        } finally {
          uploadingImage = false;
        }
        return;
      }
    }
  }

  async function handleSave() {
    if (saving || deleting) return;
    const jwtToken = auth.jwtToken;
    if (!jwtToken) {
      toast.error('Not authenticated');
      return;
    }
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }
    if (!content.trim()) {
      toast.error('Content is required');
      return;
    }

    saving = true;
    try {
      const payload = {
        title: title.trim(),
        content,
        excerpt: excerpt.trim() || undefined,
        coverImageUrl: coverImageUrl.trim() || undefined,
        slug: slugInput.trim() || undefined,
        createdAt: releaseDate ? new Date(releaseDate).toISOString() : undefined,
      };

      if (mode === 'create') {
        const created = await BlogApi.create(jwtToken, payload);
        toast.success('Post published');
        postId = created.id;
        slugInput = created.slug;
        await goto(`/blog/edit/${created.slug}`, { replaceState: true });
      } else if (postId) {
        const updated = await BlogApi.update(jwtToken, postId, payload);
        toast.success('Post updated');
        if (updated.slug !== slug) {
          slugInput = updated.slug;
          await goto(`/blog/edit/${updated.slug}`, { replaceState: true });
        }
      }
    } catch (err) {
      const message =
        err &&
        typeof err === 'object' &&
        'response' in err &&
        err.response &&
        typeof err.response === 'object' &&
        'data' in err.response &&
        err.response.data &&
        typeof err.response.data === 'object' &&
        'message' in err.response.data &&
        typeof (err.response.data as { message?: string }).message === 'string'
          ? (err.response.data as { message: string }).message
          : err instanceof Error
            ? err.message
            : 'Save failed';
      toast.error(message);
    } finally {
      saving = false;
    }
  }

  async function handleDelete() {
    const jwtToken = auth.jwtToken;
    if (!jwtToken || !postId) return;
    const ok = window.confirm('Delete this post? This action cannot be undone.');
    if (!ok) return;
    deleting = true;
    try {
      await BlogApi.delete(jwtToken, postId);
      toast.success('Post deleted');
      await goto('/blog');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Delete failed';
      toast.error(message);
    } finally {
      deleting = false;
    }
  }

  $effect(() => {
    title;
    content;
    excerpt;
    coverImageUrl;
    slugInput;
    releaseDate;
    postId;
    mode;
    slug;
    auth.jwtToken;
    saving;
    deleting;
    const save = handleSave;
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 's') {
        event.preventDefault();
        event.stopPropagation();
        void save();
      }
    };
    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  });
</script>

{#if !isAdmin}
  <div class="min-h-screen bg-black text-foreground">
    <div class="mx-auto max-w-3xl px-6 py-24 text-center">
      <h1 class="text-3xl font-semibold">Admin access required</h1>
      <p class="mt-3 text-neutral-400">You need admin privileges to access the editor.</p>
      <button
        type="button"
        class="mt-8 inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-xs hover:bg-primary/90"
        onclick={() => goto('/blog')}
      >
        Back to blog
      </button>
    </div>
  </div>
{:else if loadingPost}
  <div class="min-h-screen bg-black text-foreground">
    <div class="mx-auto flex max-w-3xl items-center justify-center px-6 py-24">
      <Loader2 class="h-6 w-6 animate-spin" />
    </div>
  </div>
{:else}
  <div class="flex min-h-screen flex-col bg-black pt-20 text-foreground md:pt-24">
    <div class="border-b border-neutral-900/80 bg-black/60 backdrop-blur-xl">
      <div class="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-4">
        <div class="flex items-center justify-between gap-3">
          <button
            type="button"
            onclick={() => goto('/blog')}
            class="inline-flex items-center gap-2 text-sm text-neutral-500 transition-colors hover:text-neutral-300"
          >
            <ArrowLeft class="h-4 w-4" />
            Back
          </button>
          <div class="flex items-center gap-2">
            {#if uploadingImage}
              <span class="inline-flex items-center gap-2 text-xs text-neutral-500">
                <Loader2 class="h-3 w-3 animate-spin" />
                Uploading image…
              </span>
            {/if}
            {#if mode === 'edit'}
              <button
                type="button"
                onclick={handleDelete}
                disabled={deleting || saving}
                class="inline-flex h-8 items-center justify-center gap-2 rounded-md border border-red-900/60 bg-background px-3 text-sm font-medium text-destructive shadow-xs hover:bg-red-950/40 disabled:pointer-events-none disabled:opacity-50"
              >
                <Trash2 class="h-3.5 w-3.5" />
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            {/if}
            <button
              type="button"
              onclick={handleSave}
              disabled={saving || deleting}
              class="inline-flex h-8 cursor-pointer items-center justify-center gap-2 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground shadow-xs hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
            >
              <Save class="h-3.5 w-3.5" />
              {saving ? 'Saving…' : mode === 'create' ? 'Publish' : 'Save'}
            </button>
          </div>
        </div>

        <input
          type="text"
          bind:value={title}
          placeholder="Title"
          class="w-full bg-transparent text-3xl font-semibold tracking-tight text-foreground placeholder:text-neutral-700 focus:outline-none md:text-4xl"
        />
        <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
          <input
            type="text"
            bind:value={excerpt}
            placeholder="Excerpt (shown on blog list)"
            class="w-full border-b border-neutral-900 bg-transparent py-2 text-sm text-neutral-300 placeholder:text-neutral-700 focus:outline-none"
          />
          <input
            type="text"
            bind:value={coverImageUrl}
            onpaste={handleCoverImagePaste}
            placeholder="Cover image URL — or paste an image"
            class="w-full border-b border-neutral-900 bg-transparent py-2 text-sm text-neutral-300 placeholder:text-neutral-700 focus:outline-none"
          />
        </div>
        <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
          <input
            type="text"
            bind:value={slugInput}
            placeholder="Slug (leave empty to auto-generate)"
            class="w-full border-b border-neutral-900 bg-transparent py-2 text-sm text-neutral-300 placeholder:text-neutral-700 focus:outline-none"
          />
          <input
            type="datetime-local"
            bind:value={releaseDate}
            class="w-full border-b border-neutral-900 bg-transparent py-2 text-sm text-neutral-300 placeholder:text-neutral-700 focus:outline-none"
          />
        </div>
      </div>
    </div>

    <div class="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-2">
      <div class="flex min-h-0 flex-col border-r border-neutral-900">
        <div
          class="flex items-center justify-between border-b border-neutral-900 bg-neutral-950/40 px-6 py-2 text-xs text-neutral-500"
        >
          <span class="font-medium">Markdown</span>
          <div class="flex items-center gap-4">
            <span class="inline-flex items-center gap-1.5">
              <ImageUp class="h-3.5 w-3.5" />
              Paste or drop images
            </span>
            <span>{wordCount} words</span>
          </div>
        </div>
        <textarea
          bind:this={textareaEl}
          bind:value={content}
          onpaste={handlePasteContent}
          ondragover={handleDragOver}
          ondrop={handleDrop}
          spellcheck={false}
          class="w-full flex-1 resize-none bg-black px-6 py-6 font-mono text-[15px] leading-7 text-neutral-200 placeholder:text-neutral-700 focus:outline-none"
          placeholder="# Start typing…"
        ></textarea>
      </div>
      <div class="min-h-0 overflow-y-auto">
        <div
          class="sticky top-0 z-10 flex items-center justify-between border-b border-neutral-900 bg-neutral-950/40 px-6 py-2 text-xs text-neutral-500 backdrop-blur"
        >
          <span class="font-medium">Preview</span>
        </div>
        <div class="px-6 py-8 md:px-10 md:py-10">
          {#if title.trim()}
            <h1 class="mb-4 text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
              {title}
            </h1>
          {/if}
          {#if excerpt.trim()}
            <p class="mb-8 text-lg leading-relaxed text-neutral-400">
              {excerpt}
            </p>
          {/if}
          {#if coverImageUrl.trim()}
            <img
              src={coverImageUrl}
              alt=""
              class="mb-8 w-full rounded-xl border border-neutral-900"
              onerror={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = 'none';
              }}
            />
          {/if}
          <BlogMarkdown {content} />
        </div>
      </div>
    </div>
  </div>
{/if}
