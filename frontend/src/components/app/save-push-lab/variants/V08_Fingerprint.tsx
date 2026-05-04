import { motion } from "motion/react";
import type { FlowController } from "../types";
import { ACCENT } from "../types";
import { useScramble } from "../useScramble";

const HEX = "0123456789abcdef".split("");

/**
 * 08 — Fingerprint. The label is shaped like an SSH key fingerprint: hex
 * pairs separated by colons. Six pairs, twelve characters, plus a key type
 * tag on the left. Feels like a genuine cryptographic identifier.
 */
export function V08_Fingerprint({ flow }: { flow: FlowController }) {
  const { state, changes, onSave, onPush } = flow;
  const action =
    state === "dirty"
      ? `save·${changes}`
      : state === "saving"
        ? "encrypt"
        : state === "saved"
          ? "sealed"
          : state === "clean"
            ? "push→"
            : state === "pushing"
              ? "tx"
              : state === "pushed"
                ? "synced"
                : "idle";

  const target = "aa:bf:32:d1:ee:9c";
  const display = useScramble(target, {
    alphabet: HEX,
    reseed: state,
    speed: 0.06,
    preserve: (c) => c === ":",
  });

  const onClick =
    state === "dirty" ? onSave : state === "clean" || state === "saved" ? onPush : undefined;
  const accent = state === "dirty" || state === "saving" || state === "saved";

  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      layout
      transition={{ layout: { type: "spring", stiffness: 360, damping: 30 } }}
      whileTap={onClick ? { scale: 0.97 } : undefined}
      className="relative h-12 overflow-hidden rounded-sm px-4 font-mono text-[12px]"
      style={{
        background: "linear-gradient(180deg, #0a0a0a, #050505)",
        color: accent ? ACCENT : "#e5e5e5",
        border: `1px solid ${accent ? `${ACCENT}66` : "rgba(255,255,255,0.08)"}`,
        boxShadow: "0 12px 30px rgba(0,0,0,0.55)",
      }}
    >
      <motion.span layout="position" className="relative z-10 flex items-center gap-3 whitespace-nowrap">
        <span
          className="rounded-sm px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em]"
          style={{
            background: accent ? `${ACCENT}1f` : "rgba(255,255,255,0.05)",
            color: accent ? ACCENT : "rgba(255,255,255,0.5)",
            border: `1px solid ${accent ? `${ACCENT}66` : "rgba(255,255,255,0.08)"}`,
          }}
        >
          ed25519
        </span>
        <span className="tabular-nums tracking-[0.08em]">{display}</span>
        <span className="text-[10px] uppercase tracking-[0.18em] opacity-60">{action}</span>
      </motion.span>
    </motion.button>
  );
}
