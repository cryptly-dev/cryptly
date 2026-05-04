import { useEffect, useState } from "react";
import { motion } from "motion/react";
import type { FlowController } from "../types";
import { ACCENT } from "../types";

/**
 * 14 — Typewriter. Characters type in left-to-right with a teletype rhythm
 * — one tick per glyph — then a thin cursor blinks at the tail. State
 * change clears via backspace before the next message types in.
 */
export function V14_Typewriter({ flow }: { flow: FlowController }) {
  const { state, changes, onSave, onPush } = flow;
  const target = labelFor(state, changes);
  const display = useTypewriter(target, state);
  const onClick =
    state === "dirty" ? onSave : state === "clean" || state === "saved" ? onPush : undefined;
  const accent = state === "dirty" || state === "saving" || state === "saved";

  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      layout
      transition={{ layout: { type: "spring", stiffness: 380, damping: 32 } }}
      whileTap={onClick ? { scale: 0.97 } : undefined}
      className="relative h-12 overflow-hidden rounded-sm px-4 font-mono text-[13px] tracking-[0.04em]"
      style={{
        background: "#0a0a0a",
        color: accent ? ACCENT : "#e5e5e5",
        border: `1px solid ${accent ? `${ACCENT}66` : "rgba(255,255,255,0.08)"}`,
        boxShadow: "0 12px 30px rgba(0,0,0,0.55)",
      }}
    >
      <motion.span layout="position" className="relative z-10 inline-flex items-center gap-1 whitespace-nowrap">
        <span className="opacity-50 mr-1">{"›"}</span>
        <span className="tabular-nums">{display}</span>
        <motion.span
          aria-hidden
          className="ml-0.5 inline-block h-3 w-2 align-middle"
          style={{ background: accent ? ACCENT : "#e5e5e5" }}
          animate={{ opacity: [1, 1, 0, 0] }}
          transition={{ duration: 1, repeat: Infinity, times: [0, 0.5, 0.51, 1] }}
        />
      </motion.span>
    </motion.button>
  );
}

function useTypewriter(target: string, key: string) {
  const [out, setOut] = useState(target);
  useEffect(() => {
    let i = 0;
    setOut("");
    const interval = window.setInterval(() => {
      i += 1;
      if (i > target.length) {
        window.clearInterval(interval);
        return;
      }
      setOut(target.slice(0, i));
    }, 38);
    return () => window.clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return out;
}

function labelFor(s: string, n: number) {
  switch (s) {
    case "dirty":
      return `save · ${n} changes`;
    case "saving":
      return `encrypting…`;
    case "saved":
      return `sealed locally`;
    case "clean":
      return `push to remote`;
    case "pushing":
      return `transmitting…`;
    case "pushed":
      return `synced`;
    case "idle":
      return `in sync`;
  }
  return "";
}
