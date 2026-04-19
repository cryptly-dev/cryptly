import { Kbd } from "@/components/ui/kbd";
import { projectLogic } from "@/lib/logics/projectLogic";
import { cn } from "@/lib/utils";
import { useValues } from "kea";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { V1Timeline } from "./history-variants/V1Timeline";
import { V2Feed } from "./history-variants/V2Feed";
import { V3Analytics } from "./history-variants/V3Analytics";
import { V4Command } from "./history-variants/V4Command";
import { V5Grouped } from "./history-variants/V5Grouped";
import { V6Flat } from "./history-variants/V6Flat";
import { V7Grouped } from "./history-variants/V7Grouped";
import { V8Minimal } from "./history-variants/V8Minimal";
import { V9Dropdowns } from "./history-variants/V9Dropdowns";

const VARIANTS = [
  { name: "Timeline", component: V1Timeline },
  { name: "Activity feed", component: V2Feed },
  { name: "Analytics", component: V3Analytics },
  { name: "Command", component: V4Command },
  { name: "Grouped", component: V5Grouped },
  { name: "Flat + heatmap", component: V6Flat },
  { name: "Grouped + heatmap", component: V7Grouped },
  { name: "Minimal", component: V8Minimal },
  { name: "Dropdowns", component: V9Dropdowns },
] as const;

export function DesktopHistoryView() {
  const { patches, projectVersionsLoading } = useValues(projectLogic);

  const [variantIdx, setVariantIdx] = useState(0);
  const [, setRefreshKey] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const inInput =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);
      if (inInput) return;

      if (e.key === "]") {
        e.preventDefault();
        setVariantIdx((i) => (i + 1) % VARIANTS.length);
      } else if (e.key === "[") {
        e.preventDefault();
        setVariantIdx((i) => (i - 1 + VARIANTS.length) % VARIANTS.length);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  if (!patches.length && projectVersionsLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-sm text-muted-foreground">Loading history...</div>
      </div>
    );
  }

  if (!patches.length && !projectVersionsLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-sm text-muted-foreground text-center">
          <p>No history available yet.</p>
          <p className="mt-1">Make changes to see version history.</p>
        </div>
      </div>
    );
  }

  const ActiveVariant = VARIANTS[variantIdx].component;

  return (
    <div className="h-full relative">
      <AnimatePresence mode="wait">
        <motion.div
          key={variantIdx}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="h-full"
        >
          <ActiveVariant />
        </motion.div>
      </AnimatePresence>
      <VariantBadge variantIdx={variantIdx} />
    </div>
  );
}

function VariantBadge({ variantIdx }: { variantIdx: number }) {
  return (
    <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center gap-2 rounded-full bg-neutral-900/90 border border-border/70 backdrop-blur-md px-3 py-1.5 shadow-xl shadow-black/40">
        <div className="flex items-center gap-1">
          <Kbd className="bg-neutral-800 text-neutral-200 border border-border/70">
            [
          </Kbd>
          <Kbd className="bg-neutral-800 text-neutral-200 border border-border/70">
            ]
          </Kbd>
        </div>
        <div className="flex items-center gap-1 ml-0.5">
          {VARIANTS.map((v, i) => (
            <span
              key={v.name}
              className={cn(
                "block rounded-full transition-all duration-200",
                i === variantIdx
                  ? "w-4 h-1.5 bg-primary"
                  : "w-1.5 h-1.5 bg-neutral-700"
              )}
            />
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.span
            key={variantIdx}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            className="text-xs font-semibold text-foreground tabular-nums"
          >
            {variantIdx + 1}/{VARIANTS.length} · {VARIANTS[variantIdx].name}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
}
