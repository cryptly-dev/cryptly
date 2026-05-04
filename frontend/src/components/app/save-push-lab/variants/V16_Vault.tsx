import { useEffect, useState } from "react";
import { motion } from "motion/react";
import type { FlowController } from "../types";
import { ACCENT } from "../types";

/**
 * 16 — Vault Lock. Each character is a spinning combination dial. They
 * rattle through values and lock from left to right with a soft thunk
 * before the next state begins. Cipher rendered as a physical machine.
 */
export function V16_Vault({ flow }: { flow: FlowController }) {
  const { state, changes, onSave, onPush } = flow;
  const onClick =
    state === "dirty" ? onSave : state === "clean" || state === "saved" ? onPush : undefined;
  const accent = state === "dirty" || state === "saving" || state === "saved";

  const code = codeFor(state, changes);
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      layout
      transition={{ layout: { type: "spring", stiffness: 360, damping: 30 } }}
      whileTap={onClick ? { scale: 0.97 } : undefined}
      className="relative h-12 overflow-hidden rounded-md px-4 font-mono text-[14px]"
      style={{
        background: "linear-gradient(180deg, #18181b, #0a0a0a)",
        color: accent ? ACCENT : "#e5e5e5",
        border: `1px solid ${accent ? `${ACCENT}66` : "rgba(255,255,255,0.1)"}`,
        boxShadow:
          "0 14px 30px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(255,255,255,0.04)",
      }}
    >
      <motion.span layout="position" className="relative z-10 inline-flex items-center gap-2 whitespace-nowrap">
        <span className="text-[10px] uppercase tracking-[0.22em] opacity-50">vault</span>
        <span className="inline-flex gap-0.5">
          {code.split("").map((ch, i) => (
            <Dial key={`${state}-${i}`} target={ch} delay={i * 90} accent={accent} />
          ))}
        </span>
      </motion.span>
    </motion.button>
  );
}

function Dial({
  target,
  delay,
  accent,
}: {
  target: string;
  delay: number;
  accent: boolean;
}) {
  const [v, setV] = useState("0");
  useEffect(() => {
    let active = true;
    let id: number;
    const tick = () => {
      if (!active) return;
      setV(String(Math.floor(Math.random() * 10)));
      id = window.setTimeout(tick, 50 + Math.random() * 30);
    };
    tick();
    const stop = window.setTimeout(() => {
      active = false;
      window.clearTimeout(id);
      setV(target);
    }, 350 + delay);
    return () => {
      active = false;
      window.clearTimeout(id);
      window.clearTimeout(stop);
    };
  }, [target, delay]);

  return (
    <span
      className="inline-flex h-7 w-5 items-center justify-center rounded-sm tabular-nums"
      style={{
        background: "linear-gradient(180deg, #2a2a2d, #050506)",
        color: accent ? ACCENT : "#e5e5e5",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -1px 0 rgba(0,0,0,0.5)",
      }}
    >
      {v}
    </span>
  );
}

function codeFor(s: string, n: number) {
  const pad = (n: number) => String(n).padStart(4, "0");
  switch (s) {
    case "dirty":
      return pad(1000 + n);
    case "saving":
      return "8888";
    case "saved":
      return "1234";
    case "clean":
      return "0420";
    case "pushing":
      return "9999";
    case "pushed":
      return "0001";
    case "idle":
      return "0000";
  }
  return "0000";
}
