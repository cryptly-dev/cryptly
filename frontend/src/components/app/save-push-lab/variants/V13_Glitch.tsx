import { motion } from "motion/react";
import type { FlowController } from "../types";
import { ACCENT } from "../types";
import { useScramble } from "../useScramble";

/**
 * 13 — Glitch. The cipher with chromatic aberration: red-channel and
 * cyan-channel ghosts of the label slip horizontally during scramble, then
 * snap back into alignment. Subtle scanline distortion overlays.
 */
export function V13_Glitch({ flow }: { flow: FlowController }) {
  const { state, changes, onSave, onPush } = flow;
  const target = labelFor(state, changes);
  const reseed = state;
  const display = useScramble(target, { reseed, speed: 0.07 });
  const onClick =
    state === "dirty" ? onSave : state === "clean" || state === "saved" ? onPush : undefined;
  const active = state === "saving" || state === "pushing";
  const accent = state === "dirty" || state === "saving" || state === "saved";

  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      layout
      transition={{ layout: { type: "spring", stiffness: 360, damping: 30 } }}
      whileTap={onClick ? { scale: 0.97 } : undefined}
      className="relative h-12 overflow-hidden rounded-md px-5 font-mono text-[13px] tracking-[0.05em]"
      style={{
        background: "#0a0a0a",
        color: "#fff",
        border: `1px solid ${accent ? `${ACCENT}66` : "rgba(255,255,255,0.1)"}`,
        boxShadow: accent ? `0 12px 30px ${ACCENT}33` : "0 12px 30px rgba(0,0,0,0.55)",
      }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-25"
        style={{
          background:
            "repeating-linear-gradient(0deg, rgba(255,255,255,0.05) 0 1px, transparent 1px 4px)",
          mixBlendMode: "overlay",
        }}
      />
      <motion.span layout="position" className="relative z-10 inline-flex items-center gap-2 whitespace-nowrap">
        <span className="opacity-50">{">"}</span>
        <span className="relative">
          <span className="tabular-nums" style={{ color: accent ? ACCENT : "#fff" }}>{display}</span>
          {/* Red channel ghost */}
          <motion.span
            aria-hidden
            className="absolute left-0 top-0 tabular-nums"
            style={{ color: "#ff3355", mixBlendMode: "screen" }}
            animate={active ? { x: [-2, 2, -1, 1, 0], opacity: [0.8, 0.4, 0.7, 0.3, 0] } : { x: 0, opacity: 0.0 }}
            transition={{ duration: 0.5, repeat: active ? Infinity : 0 }}
          >
            {display}
          </motion.span>
          {/* Cyan channel ghost */}
          <motion.span
            aria-hidden
            className="absolute left-0 top-0 tabular-nums"
            style={{ color: "#33eaff", mixBlendMode: "screen" }}
            animate={active ? { x: [2, -2, 1, -1, 0], opacity: [0.8, 0.4, 0.7, 0.3, 0] } : { x: 0, opacity: 0.0 }}
            transition={{ duration: 0.5, repeat: active ? Infinity : 0, delay: 0.05 }}
          >
            {display}
          </motion.span>
        </span>
      </motion.span>
    </motion.button>
  );
}

function labelFor(s: string, n: number) {
  switch (s) {
    case "dirty":
      return `save·${n}chg`;
    case "saving":
      return "encrypting";
    case "saved":
      return "sealed";
    case "clean":
      return "push→remote";
    case "pushing":
      return "transmitting";
    case "pushed":
      return "synced";
    case "idle":
      return "in sync";
  }
  return "";
}
