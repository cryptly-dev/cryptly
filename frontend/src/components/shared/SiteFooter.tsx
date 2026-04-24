import { GitHubIcon } from "@/components/ui/GitHubIcon";

const ACCENT = "#c9b287";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/50 pt-14 pb-10">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <a href="/" className="inline-flex items-center">
              <span className="font-semibold tracking-tight">Cryptly</span>
            </a>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-xs">
              A small, open source secrets manager. Encrypted before it
              leaves your browser, never readable by us.
            </p>
          </div>

          <div>
            <div className="text-[11px] font-mono uppercase tracking-[0.25em] text-muted-foreground/80">
              Product
            </div>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <a
                  href="/app"
                  className="text-foreground/90 hover:text-foreground transition-colors"
                >
                  Open app
                </a>
              </li>
              <li>
                <a
                  href="/blog"
                  className="text-foreground/90 hover:text-foreground transition-colors"
                >
                  Blog
                </a>
              </li>
            </ul>
          </div>

          <div>
            <div className="text-[11px] font-mono uppercase tracking-[0.25em] text-muted-foreground/80">
              Resources
            </div>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <a
                  href="https://github.com/cryptly-dev/cryptly"
                  className="inline-flex items-center gap-1.5 text-foreground/90 hover:text-foreground transition-colors"
                >
                  <GitHubIcon className="h-3.5 w-3.5" />
                  Source code
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/cryptly-dev/cryptly/issues"
                  className="text-foreground/90 hover:text-foreground transition-colors"
                >
                  Report an issue
                </a>
              </li>
            </ul>
          </div>

          <div>
            <div className="text-[11px] font-mono uppercase tracking-[0.25em] text-muted-foreground/80">
              Legal
            </div>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <span className="text-foreground/90">MIT License</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border/50 flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-sm text-muted-foreground">
          <span>© 2026 Cryptly. Built quietly.</span>
          <span className="inline-flex items-center gap-2">
            <span
              aria-hidden
              className="inline-block h-1 w-1 rounded-full align-middle"
              style={{ backgroundColor: ACCENT }}
            />
            Zero-knowledge by construction
          </span>
        </div>
      </div>
    </footer>
  );
}
