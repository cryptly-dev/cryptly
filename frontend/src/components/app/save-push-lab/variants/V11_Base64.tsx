import { motion } from "motion/react";
import type { FlowController } from "../types";
import { ACCENT } from "../types";
import { useScramble } from "../useScramble";

const B64 =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".split("");

/**
 * 11 — Base64. Mixed-case alphanumerics with the occasional `+` `/` `=`
 * sprinkle. Looks exactly like a chunk of base64 ciphertext you might see
 * in a JWT or env var. The trailing `==` padding settles last.
 */
export function V11_Base64({ flow }: { flow: FlowController }) {
  const { state, changes, onSave, onPush } = flow;
  const target = targetFor(state, changes);
  const display = useScramble(target, {
    alphabet: B64,
    reseed: state,
    speed: 0.06,
    preserve: (c) => c === "=" || c === " ",
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
      className="relative h-12 overflow-hidden rounded-lg px-5 font-mono text-[12.5px] tracking-[0.02em]"
      style={{
        background: "linear-gradient(180deg, #1a1a1c, #0c0c0d)",
        color: accent ? ACCENT : "#e5e5e5",
        border: `1px solid ${accent ? `${ACCENT}66` : "rgba(255,255,255,0.1)"}`,
        boxShadow: accent ? `0 14px 30px ${ACCENT}33` : "0 14px 30px rgba(0,0,0,0.55)",
      }}
    >
      <motion.span layout="position" className="relative z-10 inline-flex items-center gap-2 whitespace-nowrap">
        <span className="text-[10px] uppercase tracking-[0.2em] opacity-50">b64</span>
        <span className="tabular-nums">{display}</span>
      </motion.span>
    </motion.button>
  );
}

function targetFor(s: string, n: number) {
  switch (s) {
    case "dirty":
      return `c2F2ZSA${n}==`;
    case "saving":
      return "ZW5jcnlwdA==";
    case "saved":
      return "c2VhbGVk==";
    case "clean":
      return "cHVzaA==  ";
    case "pushing":
      return "dHJhbnNtaXQ=";
    case "pushed":
      return "c3luY2Vk==";
    case "idle":
      return "aWRsZQ==  ";
  }
  return "";
}
