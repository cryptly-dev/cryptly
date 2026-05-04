import { motion } from "motion/react";
import type { FlowController } from "../types";
import { ACCENT } from "../types";
import { useScramble } from "../useScramble";

/**
 * 07 — Terminal. Bash-prompt aesthetic. A green `$` prompt, the command
 * scrambles in, a blinking block cursor sits on the end. After action, exit
 * codes (0/1) appear in a soft pill.
 */
export function V07_Terminal({ flow }: { flow: FlowController }) {
  const { state, changes, onSave, onPush } = flow;
  const target = cmdFor(state, changes);
  const display = useScramble(target, {
    reseed: state,
    speed: 0.09,
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
      whileTap={onClick ? { scale: 0.98 } : undefined}
      className="relative h-12 overflow-hidden rounded-sm px-4 font-mono text-[12.5px]"
      style={{
        background: "#0a0a0a",
        color: "#e5e5e5",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 12px 32px rgba(0,0,0,0.55), inset 0 0 0 1px rgba(0,0,0,0.5)",
      }}
    >
      <motion.span layout="position" className="relative z-10 inline-flex items-center gap-2 whitespace-nowrap">
        <span style={{ color: "#22c55e" }}>$</span>
        <span style={{ color: accent ? ACCENT : "#e5e5e5" }} className="tabular-nums">
          {display}
        </span>
        <motion.span
          aria-hidden
          className="inline-block h-3 w-2 align-middle"
          style={{ background: accent ? ACCENT : "#e5e5e5" }}
          animate={{ opacity: [1, 1, 0, 0] }}
          transition={{ duration: 1.0, repeat: Infinity, times: [0, 0.5, 0.51, 1] }}
        />
        {state === "saved" || state === "pushed" ? (
          <span
            className="ml-2 rounded-sm px-1.5 py-px text-[10px]"
            style={{ background: "#14532d", color: "#a7f3d0" }}
          >
            exit 0
          </span>
        ) : null}
      </motion.span>
    </motion.button>
  );
}

function cmdFor(s: string, n: number) {
  switch (s) {
    case "dirty":
      return `cryptly save -n ${n}`;
    case "saving":
      return "cryptly encrypt …";
    case "saved":
      return "cryptly save     ";
    case "clean":
      return "cryptly push     ";
    case "pushing":
      return "cryptly push --tx";
    case "pushed":
      return "cryptly push     ";
    case "idle":
      return "cryptly status   ";
  }
  return "";
}
