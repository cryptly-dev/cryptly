import { motion } from "motion/react";
import type { FlowController } from "../types";
import { ACCENT } from "../types";
import { useScramble } from "../useScramble";

/**
 * 10 — JSON. The label is a tiny JSON object scrambling into shape with
 * VS-Code-ish syntax colors. Keys, strings and numbers each scramble in
 * their own colour, but the structural punctuation stays still — so the
 * shape always looks like JSON, even mid-glitch.
 */
export function V10_Json({ flow }: { flow: FlowController }) {
  const { state, changes, onSave, onPush } = flow;
  const onClick =
    state === "dirty" ? onSave : state === "clean" || state === "saved" ? onPush : undefined;

  const op =
    state === "dirty" ? "save" :
    state === "saving" ? "encrypt" :
    state === "saved" ? "sealed" :
    state === "clean" ? "push" :
    state === "pushing" ? "tx" :
    state === "pushed" ? "synced" : "idle";

  const opS = useScramble(`"${op}"`, { reseed: state, speed: 0.08, preserve: (c) => c === '"' });
  const nS = useScramble(String(state === "dirty" ? changes : 0), { alphabet: "0123456789".split(""), reseed: state, speed: 0.06 });

  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      layout
      transition={{ layout: { type: "spring", stiffness: 360, damping: 30 } }}
      whileTap={onClick ? { scale: 0.97 } : undefined}
      className="relative h-12 overflow-hidden rounded-md px-5 font-mono text-[13px]"
      style={{
        background: "linear-gradient(180deg, #1e1e1e, #141414)",
        color: "#d4d4d4",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 14px 30px rgba(0,0,0,0.6)",
      }}
    >
      <motion.span layout="position" className="relative z-10 inline-flex items-center gap-1.5 whitespace-nowrap tabular-nums">
        <span style={{ color: "#d4d4d4" }}>{"{"}</span>
        <span style={{ color: "#9cdcfe" }}>"op"</span>
        <span style={{ color: "#d4d4d4" }}>:</span>
        <span style={{ color: ACCENT }}>{opS}</span>
        <span style={{ color: "#d4d4d4" }}>,</span>
        <span style={{ color: "#9cdcfe" }}>"n"</span>
        <span style={{ color: "#d4d4d4" }}>:</span>
        <span style={{ color: "#b5cea8" }}>{nS}</span>
        <span style={{ color: "#d4d4d4" }}>{"}"}</span>
      </motion.span>
    </motion.button>
  );
}
