import { motion } from "motion/react";
import type { FlowController } from "../types";
import { ACCENT } from "../types";
import { useScramble } from "../useScramble";

/**
 * 19 — Code Block. The pill is a single line of TypeScript: an `await`,
 * a method call, a numeric literal — all syntax-highlighted. Only the
 * argument scrambles; the keywords and method name stay locked, so the
 * grammar reads correctly through every state.
 */
export function V19_CodeBlock({ flow }: { flow: FlowController }) {
  const { state, changes, onSave, onPush } = flow;
  const onClick =
    state === "dirty" ? onSave : state === "clean" || state === "saved" ? onPush : undefined;

  const fn =
    state === "dirty" || state === "saving" || state === "saved" ? "save" : "push";
  const argTarget = argFor(state, changes);
  const arg = useScramble(argTarget, { reseed: state, speed: 0.08, preserve: (c) => /[",.]/.test(c) });

  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      layout
      transition={{ layout: { type: "spring", stiffness: 360, damping: 30 } }}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      className="relative h-12 overflow-hidden rounded-md px-5 font-mono text-[13px]"
      style={{
        background: "linear-gradient(180deg, #1e1e1e, #141414)",
        color: "#d4d4d4",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 14px 30px rgba(0,0,0,0.6)",
      }}
    >
      <motion.span layout="position" className="relative z-10 inline-flex items-center gap-1.5 whitespace-nowrap tabular-nums">
        <span style={{ color: "#c586c0" }}>await</span>
        <span style={{ color: "#9cdcfe" }}>cryptly</span>
        <span style={{ color: "#d4d4d4" }}>.</span>
        <span style={{ color: "#dcdcaa" }}>{fn}</span>
        <span style={{ color: "#d4d4d4" }}>(</span>
        <span style={{ color: ACCENT }}>{arg}</span>
        <span style={{ color: "#d4d4d4" }}>)</span>
      </motion.span>
    </motion.button>
  );
}

function argFor(s: string, n: number) {
  switch (s) {
    case "dirty":
      return `${n}`;
    case "saving":
      return `"…"`;
    case "saved":
      return `"ok"`;
    case "clean":
      return `"origin"`;
    case "pushing":
      return `"…"`;
    case "pushed":
      return `"ack"`;
    case "idle":
      return `"clean"`;
  }
  return "";
}
