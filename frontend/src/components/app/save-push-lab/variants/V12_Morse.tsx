import { motion } from "motion/react";
import type { FlowController } from "../types";
import { ACCENT } from "../types";
import { useScramble } from "../useScramble";

const MORSE_GLYPHS = [".", "-", "·", "—"];

const MORSE: Record<string, string> = {
  S: "...", A: ".-", V: "...-", E: ".",
  P: ".--.", U: "..-", H: "....", I: "..",
  D: "-..", R: ".-.", Y: "-.--", N: "-.",
  C: "-.-.", L: ".-..", O: "---", T: "-", K: "-.-", G: "--.",
};

function toMorse(text: string) {
  return text
    .toUpperCase()
    .split("")
    .map((c) => (c === " " ? "  " : MORSE[c] ?? "."))
    .join(" ");
}

/**
 * 12 — Morse. Each state is encoded into morse and scrambles into shape.
 * Dots, dashes, and spaces only — when they settle the rhythm reveals the
 * verb. Slow tap-tap-tap quality in the resolution.
 */
export function V12_Morse({ flow }: { flow: FlowController }) {
  const { state, onSave, onPush } = flow;
  const word = wordFor(state);
  const target = toMorse(word);
  const display = useScramble(target, {
    alphabet: MORSE_GLYPHS,
    reseed: state,
    speed: 0.05,
    order: "ltr",
    preserve: (c) => c === " ",
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
      className="relative h-12 overflow-hidden rounded-md px-5 font-mono text-[14px] tracking-[0.18em]"
      style={{
        background: "linear-gradient(180deg, #0c0c0d, #050506)",
        color: accent ? ACCENT : "#e5e5e5",
        border: `1px solid ${accent ? `${ACCENT}77` : "rgba(255,255,255,0.1)"}`,
        boxShadow: accent ? `0 14px 30px ${ACCENT}33` : "0 14px 30px rgba(0,0,0,0.55)",
      }}
    >
      <motion.span layout="position" className="relative z-10 flex items-center gap-3 whitespace-nowrap">
        <span className="text-[10px] uppercase tracking-[0.22em] opacity-50">cw</span>
        <span className="font-bold">{display}</span>
        <span
          className="text-[10px] uppercase tracking-[0.22em] opacity-60"
          style={{ color: accent ? ACCENT : undefined }}
        >
          {word}
        </span>
      </motion.span>
    </motion.button>
  );
}

function wordFor(s: string) {
  switch (s) {
    case "dirty":
      return "SAVE";
    case "saving":
      return "SEAL";
    case "saved":
      return "OK";
    case "clean":
      return "PUSH";
    case "pushing":
      return "TX";
    case "pushed":
      return "ACK";
    case "idle":
      return "IDLE";
  }
  return "";
}
