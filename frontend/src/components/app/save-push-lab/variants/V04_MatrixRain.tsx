import { useEffect, useState } from "react";
import { motion } from "motion/react";
import type { FlowController } from "../types";
import { ACCENT } from "../types";

const KATA = "ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜｦﾝ".split("");

/**
 * 04 — Matrix Rain. The label sits over a column of falling katakana that
 * race down on action. Each glyph trails a brighter head. The label itself
 * is etched on top.
 */
export function V04_MatrixRain({ flow }: { flow: FlowController }) {
  const { state, changes, onSave, onPush } = flow;
  const onClick =
    state === "dirty" ? onSave : state === "clean" || state === "saved" ? onPush : undefined;
  const active = state === "saving" || state === "pushing";
  const accent = state === "dirty" || state === "saving" || state === "saved";
  const idle = state === "idle";

  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      layout
      transition={{ layout: { type: "spring", stiffness: 360, damping: 30 } }}
      whileTap={onClick ? { scale: 0.97 } : undefined}
      className="relative h-14 overflow-hidden rounded-md px-5 font-mono text-[13px] tracking-[0.04em]"
      style={{
        background: "#000",
        color: accent ? ACCENT : idle ? "rgba(255,255,255,0.4)" : "#22c55e",
        border: `1px solid ${accent ? `${ACCENT}66` : "rgba(34,197,94,0.25)"}`,
        boxShadow: accent
          ? `0 0 28px ${ACCENT}33`
          : "0 0 28px rgba(34,197,94,0.15)",
      }}
    >
      <Rain active={active} accent={accent} />
      <motion.span
        layout="position"
        className="relative z-10 inline-flex items-center gap-2 whitespace-nowrap font-semibold"
        style={{ textShadow: "0 0 6px rgba(0,0,0,0.85)" }}
      >
        {labelFor(state, changes)}
      </motion.span>
    </motion.button>
  );
}

function Rain({ active, accent }: { active: boolean; accent: boolean }) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    let raf: number;
    let last = 0;
    const step = (ms: number) => {
      const interval = active ? 60 : 220;
      if (ms - last > interval) {
        last = ms;
        setTick((t) => t + 1);
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [active]);

  const cols = 16;
  return (
    <span aria-hidden className="pointer-events-none absolute inset-0 flex justify-between px-1.5">
      {Array.from({ length: cols }).map((_, c) => {
        const head = (tick + c * 5) % 6;
        return (
          <span key={c} className="flex flex-col items-center" style={{ fontSize: 9, lineHeight: "10px" }}>
            {Array.from({ length: 6 }).map((_, r) => {
              const isHead = r === head;
              const idx = (tick * 3 + c * 13 + r * 7) % KATA.length;
              return (
                <span
                  key={r}
                  style={{
                    color: isHead
                      ? accent
                        ? "#fff5e1"
                        : "#aaffbb"
                      : accent
                        ? `${ACCENT}66`
                        : `rgba(34,197,94,${0.12 + r * 0.04})`,
                    opacity: r < head ? 0 : 1,
                  }}
                >
                  {KATA[idx]}
                </span>
              );
            })}
          </span>
        );
      })}
    </span>
  );
}

function labelFor(s: string, n: number) {
  switch (s) {
    case "dirty":
      return `SAVE · ${n}`;
    case "saving":
      return "ENCRYPT";
    case "saved":
      return "✓ SEALED";
    case "clean":
      return "PUSH →";
    case "pushing":
      return "TRANSMIT";
    case "pushed":
      return "✓ SYNCED";
    case "idle":
      return "IN SYNC";
  }
  return "";
}
