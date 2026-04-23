import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";

type Slug = "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h" | "i";

type VariantCard = {
  slug: Slug;
  title: string;
  subtitle: string;
  hook: string;
  to:
    | "/variants/a"
    | "/variants/b"
    | "/variants/c"
    | "/variants/d"
    | "/variants/e"
    | "/variants/f"
    | "/variants/g"
    | "/variants/h"
    | "/variants/i";
  density: number; // 0..1
};

const VARIANTS: VariantCard[] = [
  {
    slug: "a",
    title: "The Site",
    subtitle: "Three features, plainly entered",
    hook: "A small site, for a small vault.",
    to: "/variants/a",
    density: 0.08,
  },
  {
    slug: "b",
    title: "The Seventy-Seven, Explained",
    subtitle: "A primer on what it does, then a tour",
    hook: "Seventy-seven people use this. Here's the product, then the tour.",
    to: "/variants/b",
    density: 0.14,
  },
  {
    slug: "c",
    title: "The Redesign",
    subtitle: "The full landing page with live mocks",
    hook: "Your secrets are none of our business.",
    to: "/variants/c",
    density: 0.95,
  },
  {
    slug: "d",
    title: "The Brief",
    subtitle: "One quiet long-form, in three movements",
    hook: "A vault we cannot read, for a price we won't charge.",
    to: "/variants/d",
    density: 0.2,
  },
  {
    slug: "e",
    title: "The Folio",
    subtitle: "Five plates, in the manner of an exhibition catalogue",
    hook: "A vault, drawn quietly, from five sides.",
    to: "/variants/e",
    density: 0.32,
  },
  {
    slug: "f",
    title: "The Reading Room",
    subtitle: "Two-column essay · one warm parchment accent",
    hook: "A vault we cannot read.",
    to: "/variants/f",
    density: 0.45,
  },
  {
    slug: "g",
    title: "The Atelier",
    subtitle: "Layered sections · thin product mocks",
    hook: "Made by hand. Held by you. Not by us.",
    to: "/variants/g",
    density: 0.62,
  },
  {
    slug: "h",
    title: "The Conservatory",
    subtitle: "Seven exhibits · the actual UI, in repose",
    hook: "A vault, with the lights kept low.",
    to: "/variants/h",
    density: 0.78,
  },
  {
    slug: "i",
    title: "The Periodical",
    subtitle: "Five chapters · longform editorial pacing",
    hook: "On a vault we cannot read, and a price we won't charge.",
    to: "/variants/i",
    density: 0.92,
  },
];

export function VariantsIndexPage() {
  return (
    <div className="min-h-screen bg-black text-neutral-100">
      <div className="mx-auto max-w-6xl w-full px-6 py-20 md:py-28">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-3xl"
        >
          <div className="text-[11px] font-mono uppercase tracking-[0.25em] text-neutral-500 mb-4">
            Landing variants · 9 candidates
          </div>
          <h1 className="text-4xl md:text-6xl font-semibold tracking-tight leading-[1.05]">
            From quiet to composed.
          </h1>
          <p className="mt-6 text-lg text-neutral-400 leading-[1.7]">
            A — C are the originals. D through I move from a single
            quiet brief into a longform editorial — every step adds
            density through composition, not colour. Each page is
            self-contained.
          </p>
        </motion.div>

        <div className="mt-12 max-w-3xl">
          <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-neutral-500 mb-2">
            density
          </div>
          <div className="h-px w-full bg-neutral-900 relative">
            <div className="absolute inset-y-0 left-0 right-0 flex items-center">
              <div className="h-px w-full bg-neutral-700" />
            </div>
          </div>
          <div className="mt-2 flex justify-between text-[10px] font-mono text-neutral-500">
            <span>quiet · few words on the page</span>
            <span>composed · many sections, paced</span>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {VARIANTS.map((v, i) => (
            <motion.div
              key={v.slug}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05 + i * 0.04 }}
            >
              <Link
                to={v.to}
                className={cn(
                  "group block border border-neutral-900 p-6 h-full",
                  "hover:border-neutral-700 transition-colors"
                )}
              >
                <div className="flex items-baseline gap-3">
                  <span className="font-serif italic text-neutral-500 text-[15px]">
                    {v.slug}.
                  </span>
                  <span className="text-lg font-medium text-neutral-100">
                    {v.title}
                  </span>
                  <ArrowRight className="ml-auto h-4 w-4 text-neutral-700 group-hover:text-neutral-300 group-hover:translate-x-0.5 transition-all" />
                </div>
                <div className="mt-2 text-sm text-neutral-500">
                  {v.subtitle}
                </div>
                <div className="mt-5 text-[15px] text-neutral-300 italic leading-snug font-serif">
                  &ldquo;{v.hook}&rdquo;
                </div>
                <div className="mt-6 flex items-center gap-3">
                  <div className="h-px flex-1 bg-neutral-900 relative overflow-hidden">
                    <div
                      className="h-px bg-neutral-400"
                      style={{ width: `${v.density * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-neutral-600 tabular-nums">
                    {String(Math.round(v.density * 100)).padStart(2, "0")}
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="mt-14 text-[12px] font-mono text-neutral-600 max-w-2xl leading-relaxed">
          Tip · A and B keep the original elegant register. D — I keep the
          same quiet typographic vocabulary as the originals; only the
          number of pieces in play increases.
        </div>
      </div>
    </div>
  );
}
