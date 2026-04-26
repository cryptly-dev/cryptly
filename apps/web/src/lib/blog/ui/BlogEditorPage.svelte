<script lang="ts">
  let { mode, slug = '' }: { mode: 'create' | 'edit'; slug?: string } = $props();
</script>

<section class="mx-auto grid max-w-4xl gap-4 px-6 py-12">
  <h1 class="text-3xl font-semibold">{mode === 'create' ? 'New post' : `Edit ${slug}`}</h1>
  <input class="input input-bordered" placeholder="Title" />
  <textarea class="textarea textarea-bordered min-h-80" placeholder="Markdown"></textarea>
</section>
