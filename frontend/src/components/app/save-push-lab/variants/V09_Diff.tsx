import { motion } from "motion/react";
import type { FlowController } from "../types";
import { useScramble } from "../useScramble";

/**
 * 09 — Diff. Git-diff palette. Plus-sign in green for adds, minus in red
 * for removes, line numbers tabbed at the front. The cipher only scrambles
 * the contents of each diff line; the markers stay still.
 */
export function V09_Diff({ flow }: { flow: FlowController }) {
  const { state, changes, onSave, onPush } = flow;
  const target = lineFor(state, changes);
  const display = useScramble(target, {
    reseed: state,
    speed: 0.08,
    preserve: (c) => c === " " || c === "+" || c === "-" || /\d/.test(c),
  });
  const onClick =
    state === "dirty" ? onSave : state === "clean" || state === "saved" ? onPush : undefined;

  const isAdd = state === "dirty" || state === "saving" || state === "saved";

  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      layout
      transition={{ layout: { type: "spring", stiffness: 360, damping: 30 } }}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      className="relative h-12 overflow-hidden rounded-sm px-4 font-mono text-[12.5px]"
      style={{
        background: isAdd
          ? "linear-gradient(180deg, rgba(34,197,94,0.08), rgba(34,197,94,0.02))"
          : "linear-gradient(180deg, #0a0a0a, #050505)",
        color: "#e5e5e5",
        border: `1px solid ${isAdd ? "rgba(34,197,94,0.35)" : "rgba(255,255,255,0.08)"}`,
        boxShadow: "0 12px 30px rgba(0,0,0,0.55)",
      }}
    >
      <motion.span layout="position" className="relative z-10 flex items-center gap-3 whitespace-nowrap">
        <span
          className="text-[10px] tabular-nums opacity-50"
          style={{ minWidth: 18, textAlign: "right" }}
        >
          {state === "dirty" ? "+ 4" : "  1"}
        </span>
        <span style={{ color: isAdd ? "#22c55e" : "#fb7185" }}>{isAdd ? "+" : "•"}</span>
        <span className="tabular-nums">{display}</span>
        {state === "saved" || state === "pushed" ? (
          <span
            className="rounded-sm px-1.5 py-px text-[10px]"
            style={{ background: "#14532d", color: "#a7f3d0" }}
          >
            ok
          </span>
        ) : null}
      </motion.span>
    </motion.button>
  );
}

function lineFor(s: string, n: number) {
  switch (s) {
    case "dirty":
      return `cryptly: save ${n} secrets`;
    case "saving":
      return `cryptly: encrypting…   `;
    case "saved":
      return `cryptly: sealed locally`;
    case "clean":
      return `cryptly: push → origin `;
    case "pushing":
      return `cryptly: pushing…       `;
    case "pushed":
      return `cryptly: synced @ origin`;
    case "idle":
      return `cryptly: clean working  `;
  }
  return "";
}
