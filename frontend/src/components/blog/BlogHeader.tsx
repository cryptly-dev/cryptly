import { CryptlyLogo } from "@/components/ui/CryptlyLogo";
import { GitHubIcon } from "@/components/ui/GitHubIcon";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

/**
 * Shared site header used across landing variants and the blog. Shows
 * the currently selected top-level page (Home / Blog) via background pill.
 */
export function BlogHeader() {
  const location = useLocation();
  const pathname = location.pathname;

  const isBlog = pathname === "/blog" || pathname.startsWith("/blog/");
  const isHome = !isBlog; // landing + variants + anything else → "Home"

  return (
    <header className="fixed top-4 left-0 right-0 z-30 px-4">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between h-14 rounded-full border border-border/50 bg-card/60 backdrop-blur-md px-5 shadow-xl shadow-black/30">
          <Link
            to="/"
            className="inline-flex items-center gap-2.5 text-foreground hover:opacity-80 transition-opacity"
          >
            <CryptlyLogo size={22} />
            <span className="font-semibold tracking-tight">Cryptly</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1 text-sm">
            <NavLink to="/" active={isHome}>
              Home
            </NavLink>
            <NavLink to="/blog" active={isBlog}>
              Blog
            </NavLink>
            <a
              href="https://github.com/cryptly-dev/cryptly"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-muted-foreground hover:text-foreground hover:bg-neutral-800/50 transition-colors"
            >
              <GitHubIcon className="h-3.5 w-3.5" />
              Source
            </a>
          </nav>

          <Link
            to="/app/login"
            className="inline-flex items-center gap-1.5 rounded-full bg-white text-black px-3.5 py-1.5 text-sm font-medium hover:bg-neutral-100 transition-colors"
          >
            Open app
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}

function NavLink({
  to,
  active,
  children,
}: {
  to: "/" | "/blog";
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      className={cn(
        "rounded-md px-3 py-1.5 transition-colors",
        active
          ? "text-foreground bg-neutral-800/60"
          : "text-muted-foreground hover:text-foreground hover:bg-neutral-800/50"
      )}
    >
      {children}
    </Link>
  );
}
