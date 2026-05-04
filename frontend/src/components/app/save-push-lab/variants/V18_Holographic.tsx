import { motion } from "motion/react";
import type { FlowController } from "../types";
import { ACCENT } from "../types";
import { useScramble } from "../useScramble";

/**
 * 18 — Holographic. The cipher characters carry an iridescent gradient
 * that drifts across them — like a foil-stamped credit card. The text
 * itself is the foil, the background dark to make it pop.
 */
export function V18_Holographic({ flow }: { flow: FlowController }) {
  const { state, changes, onSave, onPush } = flow;
  const target = labelFor(state, changes);
  const display = useScramble(target, { reseed: state, speed: 0.07 });
  const onClick =
    state === "dirty" ? onSave : state === "clean" || state === "saved" ? onPush : undefined;
  const accent = state === "dirty" || state === "saving" || state === "saved";
  const active = state === "saving" || state === "pushing";

  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      layout
      transition={{ layout: { type: "spring", stiffness: 360, damping: 30 } }}
      whileTap={onClick ? { scale: 0.97 } : undefined}
      className="relative h-12 overflow-hidden rounded-md px-5 font-mono text-[14px] font-semibold tracking-[0.04em]"
      style={{
        background: "linear-gradient(180deg, #050506, #000)",
        border: `1px solid ${accent ? `${ACCENT}66` : "rgba(255,255,255,0.08)"}`,
        boxShadow: accent
          ? `0 14px 36px ${ACCENT}33`
          : "0 14px 36px rgba(0,0,0,0.6)",
      }}
    >
      <motion.span
        layout="position"
        className="relative z-10 inline-flex items-center gap-2 whitespace-nowrap"
      >
        <span className="opacity-50 text-white">{">"}</span>
        <span
          className="tabular-nums"
          style={{
            backgroundImage: `linear-gradient(110deg, #ff6ec7 0%, ${ACCENT} 25%, #5cf 50%, ${ACCENT} 75%, #ff6ec7 100%)`,
            backgroundSize: "300% 100%",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            color: "transparent",
            filter: `saturate(${active ? 1.4 : 1.05})`,
          }}
        >
          <motion.span
            className="inline-block"
            animate={{ backgroundPositionX: ["0%", "100%"] }}
            transition={{ duration: active ? 1.2 : 4.5, ease: "linear", repeat: Infinity }}
            style={{
              backgroundImage: "inherit",
              backgroundSize: "inherit",
              WebkitBackgroundClip: "inherit",
              WebkitTextFillColor: "inherit",
              backgroundClip: "inherit",
            }}
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
      return `save · ${n}`;
    case "saving":
      return `encrypting`;
    case "saved":
      return `sealed`;
    case "clean":
      return `push to remote`;
    case "pushing":
      return `transmitting`;
    case "pushed":
      return `synced`;
    case "idle":
      return `in sync`;
  }
  return "";
}
