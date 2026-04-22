import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  VARIANTS,
  formulaDescription,
  type VariantEntry,
  type VariantFormula,
} from "./registry";

const FORMULA_TINT: Record<
  VariantFormula,
  { pill: string; badge: string; active: string }
> = {
  A: {
    pill: "bg-sky-500/15 text-sky-300 border-sky-500/30",
    badge: "bg-sky-500/10 text-sky-300 border-sky-500/30",
    active: "bg-sky-500/20 text-sky-200 border-sky-500/40",
  },
  B: {
    pill: "bg-neutral-500/15 text-neutral-200 border-neutral-500/30",
    badge: "bg-neutral-500/10 text-neutral-200 border-neutral-500/30",
    active: "bg-neutral-500/20 text-neutral-100 border-neutral-500/40",
  },
  C: {
    pill: "bg-amber-500/15 text-amber-200 border-amber-500/30",
    badge: "bg-amber-500/10 text-amber-200 border-amber-500/30",
    active: "bg-amber-500/20 text-amber-100 border-amber-500/40",
  },
  D: {
    pill: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    badge: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
    active: "bg-emerald-500/20 text-emerald-200 border-emerald-500/40",
  },
};

export function VariantSwitcher({ current }: { current: VariantEntry }) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [tab, setTab] = useState<VariantFormula>(current.formula);

  const currentIdx = VARIANTS.findIndex((v) => v.slug === current.slug);
  const prev = VARIANTS[(currentIdx - 1 + VARIANTS.length) % VARIANTS.length];
  const next = VARIANTS[(currentIdx + 1) % VARIANTS.length];

  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (
        t &&
        (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)
      )
        return;
      if (e.key === "[") {
        window.location.href = `/redesign/${prev.slug}`;
      } else if (e.key === "]") {
        window.location.href = `/redesign/${next.slug}`;
      } else if (e.key === "v") {
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [prev.slug, next.slug]);

  useEffect(() => {
    if (open) setTab(current.formula);
  }, [open, current.formula]);

  const grouped = useMemo(() => {
    const map: Record<VariantFormula, VariantEntry[]> = {
      A: [],
      B: [],
      C: [],
      D: [],
    };
    for (const v of VARIANTS) map[v.formula].push(v);
    return map;
  }, []);

  const tint = FORMULA_TINT[current.formula];

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] bg-black/80 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.22, 0.61, 0.36, 1] }}
            className="fixed left-1/2 top-[6vh] z-[100] -translate-x-1/2 w-[min(760px,94vw)] max-h-[88vh] overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950/95 backdrop-blur-xl shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-900">
              <div>
                <div className="text-[11px] uppercase tracking-[0.3em] text-neutral-500">
                  Landing variants
                </div>
                <div className="mt-0.5 text-lg font-medium text-neutral-100">
                  Fifteen candidates. Four angles.
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="h-8 w-8 rounded-md hover:bg-neutral-900 flex items-center justify-center text-neutral-400 hover:text-neutral-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-center gap-1 px-4 pt-4 border-b border-neutral-900">
              {(Object.keys(grouped) as VariantFormula[]).map((f) => {
                const items = grouped[f];
                const isActive = tab === f;
                return (
                  <button
                    key={f}
                    onClick={() => setTab(f)}
                    className={cn(
                      "relative px-4 py-2.5 text-sm transition-colors",
                      isActive ? "text-neutral-100" : "text-neutral-500 hover:text-neutral-300"
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className={cn(
                          "inline-flex items-center justify-center h-4 min-w-4 px-1 rounded-sm text-[10px] font-mono font-semibold border",
                          FORMULA_TINT[f].badge
                        )}
                      >
                        {f}
                      </span>
                      <span>{formulaDescription(f)}</span>
                      <span className="text-[10px] text-neutral-600 tabular-nums">
                        {items.length}
                      </span>
                    </span>
                    {isActive && (
                      <motion.div
                        layoutId="tab-underline"
                        className="absolute -bottom-px left-2 right-2 h-px bg-neutral-100"
                      />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="overflow-y-auto p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {grouped[tab].map((v) => {
                  const active = v.slug === current.slug;
                  const vTint = FORMULA_TINT[v.formula];
                  return (
                    <Link
                      key={v.slug}
                      to="/redesign/$variant"
                      params={{ variant: v.slug }}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "group block rounded-lg border px-4 py-3 transition-colors",
                        active
                          ? "border-neutral-700 bg-neutral-900"
                          : "border-neutral-900 bg-neutral-950/60 hover:border-neutral-800 hover:bg-neutral-900/50"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded text-[10px] font-mono font-semibold border",
                            vTint.badge
                          )}
                        >
                          {v.slug.toUpperCase()}
                        </span>
                        <span className="text-sm font-medium text-neutral-100">
                          {v.title}
                        </span>
                        {active && (
                          <span className="ml-auto text-[10px] uppercase tracking-[0.2em] text-neutral-500">
                            now
                          </span>
                        )}
                      </div>
                      <div className="mt-1 text-xs text-neutral-500">
                        {v.subtitle}
                      </div>
                      <div className="mt-2 text-[13px] text-neutral-400 italic leading-snug line-clamp-2">
                        "{v.hook}"
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="px-6 py-3 border-t border-neutral-900 text-xs text-neutral-500 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span>
                  <kbd className="px-1.5 py-0.5 rounded border border-neutral-800 bg-neutral-900 text-neutral-300">
                    v
                  </kbd>{" "}
                  toggle picker
                </span>
                <span>
                  <kbd className="px-1.5 py-0.5 rounded border border-neutral-800 bg-neutral-900 text-neutral-300">
                    [
                  </kbd>{" "}
                  <kbd className="px-1.5 py-0.5 rounded border border-neutral-800 bg-neutral-900 text-neutral-300">
                    ]
                  </kbd>{" "}
                  prev / next
                </span>
              </div>
              <span className="tabular-nums">
                {currentIdx + 1} / {VARIANTS.length}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[80]">
        <motion.div
          layout
          className="flex items-stretch gap-1 rounded-full border border-neutral-800 bg-neutral-950/90 backdrop-blur-xl shadow-2xl shadow-black/60 overflow-hidden"
        >
          <Link
            to="/redesign/$variant"
            params={{ variant: prev.slug }}
            className="pl-3 pr-2 flex items-center gap-1 text-neutral-400 hover:text-neutral-100 hover:bg-neutral-900/70 transition-colors"
            title={`← ${prev.title}`}
          >
            <ChevronLeft className="h-4 w-4" />
          </Link>

          <button
            onClick={() => setExpanded((v) => !v)}
            className="px-3 py-2 flex items-center gap-2 min-w-0 max-w-[min(60vw,460px)] hover:bg-neutral-900/70 transition-colors"
          >
            <span
              className={cn(
                "inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full text-[10px] font-bold tracking-wider border",
                tint.pill
              )}
            >
              {current.slug.toUpperCase()}
            </span>
            <span className="text-sm font-medium text-neutral-100 truncate">
              {current.title}
            </span>
            <AnimatePresence initial={false}>
              {expanded && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-xs text-neutral-500 truncate whitespace-nowrap overflow-hidden"
                >
                  · {current.subtitle}
                </motion.span>
              )}
            </AnimatePresence>
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 text-neutral-500 transition-transform",
                expanded && "rotate-180"
              )}
            />
          </button>

          <button
            onClick={() => setOpen(true)}
            className="px-3 flex items-center gap-1.5 text-sm text-neutral-400 hover:text-neutral-100 hover:bg-neutral-900/70 transition-colors border-l border-neutral-800"
            title="All variants"
          >
            <LayoutGrid className="h-4 w-4" />
            <span className="hidden sm:inline">All</span>
          </button>

          <Link
            to="/redesign/$variant"
            params={{ variant: next.slug }}
            className="pl-2 pr-3 flex items-center gap-1 text-neutral-400 hover:text-neutral-100 hover:bg-neutral-900/70 transition-colors border-l border-neutral-800"
            title={`${next.title} →`}
          >
            <ChevronRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    </>
  );
}
