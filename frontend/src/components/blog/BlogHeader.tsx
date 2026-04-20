import { CryptlyLogo } from "@/components/ui/CryptlyLogo";
import { useIsAdmin } from "@/lib/hooks/useIsAdmin";
import { Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";

export function BlogHeader() {
  const isAdmin = useIsAdmin();

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-900/80 bg-black/70 backdrop-blur-xl">
      <div className="mx-auto max-w-5xl px-6 h-16 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-2.5 text-foreground hover:opacity-80 transition-opacity"
        >
          <CryptlyLogo size={24} />
          <span className="font-semibold tracking-tight">Cryptly</span>
        </Link>

        <div className="flex items-center gap-6">
          <Link
            to="/blog"
            className="text-sm text-neutral-400 hover:text-foreground transition-colors"
          >
            Blog
          </Link>
          {isAdmin && (
            <Link
              to="/blog/new"
              className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-xs font-semibold text-black transition-transform hover:scale-[1.03]"
            >
              <Plus className="w-3.5 h-3.5" />
              New post
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
