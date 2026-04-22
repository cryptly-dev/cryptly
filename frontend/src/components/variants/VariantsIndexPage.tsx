import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";

type VariantCard = {
  slug: "a" | "b" | "c";
  title: string;
  subtitle: string;
  hook: string;
  to: "/variants/a" | "/variants/b" | "/variants/c";
};

const VARIANTS: VariantCard[] = [
  {
    slug: "a",
    title: "The Site",
    subtitle: "Features, plainly, in three entries",
    hook: "A small site, for a small vault. Three features, plainly.",
    to: "/variants/a",
  },
  {
    slug: "b",
    title: "The Seventy-Seven, Explained",
    subtitle: "A tour + a three-entry primer on what it does",
    hook: "77 people use this. Here's the product, then the tour.",
    to: "/variants/b",
  },
  {
    slug: "c",
    title: "The Redesign",
    subtitle: "The full-fat landing page with live mocks",
    hook: "Your secrets are none of our business.",
    to: "/variants/c",
  },
];

export function VariantsIndexPage() {
  return (
    <div className="min-h-screen bg-black text-neutral-100">
      <div className="mx-auto max-w-5xl w-full px-6 py-20 md:py-28">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl"
        >
          <div className="text-[11px] uppercase tracking-[0.3em] text-neutral-500 mb-4">
            Landing variants
          </div>
          <h1 className="text-4xl md:text-6xl font-semibold tracking-tight leading-[1.05]">
            Three candidates.
          </h1>
          <p className="mt-6 text-lg text-neutral-400 leading-relaxed">
            Each page is self-contained. Pick one.
          </p>
        </motion.div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {VARIANTS.map((v, i) => (
            <motion.div
              key={v.slug}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.06 }}
            >
              <Link
                to={v.to}
                className={cn(
                  "group block rounded-2xl border border-neutral-900 bg-neutral-950/60 p-6 h-full",
                  "hover:border-neutral-700 hover:bg-neutral-900/60 transition-colors"
                )}
              >
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center h-6 min-w-6 px-2 rounded text-[11px] font-mono font-semibold border bg-neutral-500/10 text-neutral-200 border-neutral-500/30">
                    {v.slug.toUpperCase()}
                  </span>
                  <span className="text-lg font-medium text-neutral-100">
                    {v.title}
                  </span>
                  <ArrowRight className="ml-auto h-4 w-4 text-neutral-600 group-hover:text-neutral-300 group-hover:translate-x-0.5 transition-all" />
                </div>
                <div className="mt-2 text-sm text-neutral-500">
                  {v.subtitle}
                </div>
                <div className="mt-5 text-[15px] text-neutral-300 italic leading-snug font-serif">
                  "{v.hook}"
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
