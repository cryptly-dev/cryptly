import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";

type VariantCard = {
  slug: "a" | "b" | "c" | "d" | "e";
  title: string;
  subtitle: string;
  hook: string;
  to:
    | "/variants/a"
    | "/variants/b"
    | "/variants/c"
    | "/variants/d"
    | "/variants/e";
};

const VARIANTS: VariantCard[] = [
  {
    slug: "a",
    title: "The Site",
    subtitle: "Three features, plainly entered",
    hook: "A small site, for a small vault.",
    to: "/variants/a",
  },
  {
    slug: "b",
    title: "The Seventy-Seven, Explained",
    subtitle: "A primer on what it does, then a tour",
    hook: "Seventy-seven people use this. Here's the product, then the tour.",
    to: "/variants/b",
  },
  {
    slug: "c",
    title: "The Redesign",
    subtitle: "The full landing page with live mocks",
    hook: "Your secrets are none of our business.",
    to: "/variants/c",
  },
  {
    slug: "d",
    title: "The Atelier",
    subtitle: "Layered sections · thin product mocks · one warm accent",
    hook: "Made by hand. Held by you. Not by us.",
    to: "/variants/d",
  },
  {
    slug: "e",
    title: "The Salon",
    subtitle: "The atelier, rounded · app-grade surfaces · soft edges",
    hook: "The atelier, rounded. Same quiet, softer room.",
    to: "/variants/e",
  },
];

export function VariantsIndexPage() {
  return (
    <div className="min-h-screen bg-black text-neutral-100">
      <div className="mx-auto max-w-5xl w-full px-6 py-20 md:py-28">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-2xl"
        >
          <div className="text-[11px] font-mono uppercase tracking-[0.25em] text-neutral-500 mb-4">
            Landing variants
          </div>
          <h1 className="text-4xl md:text-6xl font-semibold tracking-tight leading-[1.05]">
            Four candidates.
          </h1>
          <p className="mt-6 text-lg text-neutral-400 leading-[1.7]">
            Each page is self-contained. Pick one.
          </p>
        </motion.div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
          {VARIANTS.map((v, i) => (
            <motion.div
              key={v.slug}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05 + i * 0.05 }}
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
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
