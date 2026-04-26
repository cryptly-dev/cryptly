<script lang="ts">
  import GitHubIcon from './GitHubIcon.svelte';
</script>

<footer class="border-t border-border/50 pt-14 pb-10">
  <div class="mx-auto max-w-6xl px-6">
    <div class="grid grid-cols-2 gap-8 md:grid-cols-4">
      <div class="col-span-2 md:col-span-1">
        <a href="/" class="inline-flex items-center">
          <span class="font-semibold tracking-tight">Cryptly</span>
        </a>
        <p class="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
          A small, open source secrets manager. Encrypted before it leaves your browser, never readable by us.
        </p>
      </div>

      <div>
        <div class="font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground/80">Product</div>
        <ul class="mt-4 space-y-2.5 text-sm">
          <li><a href="/app" class="text-foreground/90 transition-colors hover:text-foreground">Open app</a></li>
          <li><a href="/blog" class="text-foreground/90 transition-colors hover:text-foreground">Blog</a></li>
        </ul>
      </div>

      <div>
        <div class="font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground/80">Resources</div>
        <ul class="mt-4 space-y-2.5 text-sm">
          <li>
            <a
              href="https://github.com/cryptly-dev/cryptly"
              class="inline-flex items-center gap-1.5 text-foreground/90 transition-colors hover:text-foreground"
            >
              <GitHubIcon class="h-3.5 w-3.5" />
              Source code
            </a>
          </li>
          <li>
            <a href="https://github.com/cryptly-dev/cryptly/issues" class="text-foreground/90 transition-colors hover:text-foreground">
              Report an issue
            </a>
          </li>
        </ul>
      </div>

      <div>
        <div class="font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground/80">Legal</div>
        <ul class="mt-4 space-y-2.5 text-sm">
          <li><span class="text-foreground/90">MIT License</span></li>
        </ul>
      </div>
    </div>

    <div class="mt-12 flex flex-col gap-3 border-t border-border/50 pt-6 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
      <span>© 2026 Cryptly. Built quietly.</span>
      <span class="inline-flex items-center gap-2">
        <span aria-hidden="true" class="inline-block h-1 w-1 rounded-full bg-[#DDA15E] align-middle"></span>
        Zero-knowledge by construction
      </span>
    </div>
  </div>
</footer>
