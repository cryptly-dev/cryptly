import { GitHubIcon } from "@/components/ui/GitHubIcon";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";

const ACCENT = "#c9b287";

/**
 * Shared site header. Lives in the root layout so it persists across
 * route changes — the active-route underline glides between tabs via
 * Framer's shared `layoutId`.
 *
 * Hidden inside the /app shell and /invite flow, which use their own
 * navigation primitives.
 */
export function BlogHeader() {
  const location = useLocation();
  const pathname = location.pathname;

  const isAppShell =
    pathname === "/app" ||
    pathname.startsWith("/app/") ||
    pathname.startsWith("/invite/");
  if (isAppShell) return null;

  const isBlog = pathname === "/blog" || pathname.startsWith("/blog/");
  const isHome = !isBlog;

  return (
    <header className="fixed top-4 left-0 right-0 z-30 px-4">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between h-14 rounded-full border border-border/50 bg-card/60 backdrop-blur-md px-5 shadow-xl shadow-black/30">
          <Link
            to="/"
            className="inline-flex items-center text-foreground hover:opacity-80 transition-opacity"
          >
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
              className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-muted-foreground hover:text-foreground transition-colors"
            >
              <GitHubIcon className="h-3.5 w-3.5" />
              Source
            </a>
          </nav>

          <Link
            to="/app"
            className="group relative inline-flex items-center gap-1.5 overflow-hidden rounded-full bg-white text-black px-3.5 py-1.5 text-sm font-medium shadow-md shadow-black/30 transition-all duration-300 hover:shadow-lg hover:bg-neutral-100 [&_svg]:transition-transform [&_svg]:duration-300 hover:[&_svg]:translate-x-0.5"
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-black/10 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full"
            />
            <span className="relative z-10 inline-flex items-center gap-1.5">
              Open app
              <ArrowRight className="h-3.5 w-3.5" />
            </span>
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
        "relative rounded-md px-3 py-1.5 transition-colors",
        active
          ? "text-foreground"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      {children}
      {active && (
        <motion.span
          layoutId="nav-underline"
          aria-hidden
          className="absolute left-3 right-3 -bottom-0.5 h-[2px] rounded-full"
          style={{ backgroundColor: ACCENT }}
          transition={{ type: "spring", stiffness: 380, damping: 28, mass: 0.6 }}
        />
      )}
    </Link>
  );
}
