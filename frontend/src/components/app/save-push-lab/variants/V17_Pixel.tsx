import { useEffect, useState } from "react";
import { motion } from "motion/react";
import type { FlowController } from "../types";
import { ACCENT } from "../types";

/**
 * 17 — Pixel. Each glyph is a 5×7 bitmap. The cipher resolves pixel-by-
 * pixel: random dots scatter across the grid and gradually settle into the
 * shape of the target letters. Reads like an LED matrix display.
 */
export function V17_Pixel({ flow }: { flow: FlowController }) {
  const { state, changes, onSave, onPush } = flow;
  const target = labelFor(state, changes);
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
      className="relative h-12 overflow-hidden rounded-sm px-4"
      style={{
        background: "#050505",
        border: `1px solid ${accent ? `${ACCENT}66` : "rgba(255,255,255,0.08)"}`,
        boxShadow: accent ? `0 14px 30px ${ACCENT}33` : "0 14px 30px rgba(0,0,0,0.55)",
      }}
    >
      <span className="relative z-10 inline-flex items-center gap-1.5">
        {target.split("").map((ch, i) => (
          <PixelGlyph key={`${state}-${i}`} char={ch} delay={i * 70} accent={accent} />
        ))}
      </span>
    </motion.button>
  );
}

const FONT: Record<string, number[][]> = {
  S: [[0,1,1,1,0],[1,0,0,0,0],[0,1,1,0,0],[0,0,0,1,0],[1,1,1,0,0]],
  A: [[0,1,1,0,0],[1,0,0,1,0],[1,1,1,1,0],[1,0,0,1,0],[1,0,0,1,0]],
  V: [[1,0,0,1,0],[1,0,0,1,0],[1,0,0,1,0],[0,1,1,0,0],[0,1,0,0,0]],
  E: [[1,1,1,1,0],[1,0,0,0,0],[1,1,1,0,0],[1,0,0,0,0],[1,1,1,1,0]],
  P: [[1,1,1,0,0],[1,0,0,1,0],[1,1,1,0,0],[1,0,0,0,0],[1,0,0,0,0]],
  U: [[1,0,0,1,0],[1,0,0,1,0],[1,0,0,1,0],[1,0,0,1,0],[0,1,1,0,0]],
  H: [[1,0,0,1,0],[1,0,0,1,0],[1,1,1,1,0],[1,0,0,1,0],[1,0,0,1,0]],
  D: [[1,1,1,0,0],[1,0,0,1,0],[1,0,0,1,0],[1,0,0,1,0],[1,1,1,0,0]],
  L: [[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,0],[1,1,1,1,0]],
  N: [[1,0,0,1,0],[1,1,0,1,0],[1,0,1,1,0],[1,0,0,1,0],[1,0,0,1,0]],
  C: [[0,1,1,1,0],[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,0],[0,1,1,1,0]],
  I: [[1,1,1,0,0],[0,1,0,0,0],[0,1,0,0,0],[0,1,0,0,0],[1,1,1,0,0]],
  Y: [[1,0,0,1,0],[0,1,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0]],
  T: [[1,1,1,1,1],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0]],
  O: [[0,1,1,0,0],[1,0,0,1,0],[1,0,0,1,0],[1,0,0,1,0],[0,1,1,0,0]],
  K: [[1,0,0,1,0],[1,0,1,0,0],[1,1,0,0,0],[1,0,1,0,0],[1,0,0,1,0]],
  R: [[1,1,1,0,0],[1,0,0,1,0],[1,1,1,0,0],[1,0,1,0,0],[1,0,0,1,0]],
  G: [[0,1,1,1,0],[1,0,0,0,0],[1,0,1,1,0],[1,0,0,1,0],[0,1,1,1,0]],
  M: [[1,0,0,0,1],[1,1,0,1,1],[1,0,1,0,1],[1,0,0,0,1],[1,0,0,0,1]],
  X: [[1,0,0,0,1],[0,1,0,1,0],[0,0,1,0,0],[0,1,0,1,0],[1,0,0,0,1]],
  ".": [[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,1,0,0,0]],
  " ": [[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0]],
  "·": [[0,0,0,0,0],[0,0,0,0,0],[0,1,0,0,0],[0,0,0,0,0],[0,0,0,0,0]],
  "1": [[0,1,0,0,0],[1,1,0,0,0],[0,1,0,0,0],[0,1,0,0,0],[1,1,1,0,0]],
  "2": [[1,1,1,0,0],[0,0,0,1,0],[0,1,1,0,0],[1,0,0,0,0],[1,1,1,1,0]],
  "3": [[1,1,1,0,0],[0,0,0,1,0],[0,1,1,0,0],[0,0,0,1,0],[1,1,1,0,0]],
  "4": [[1,0,0,1,0],[1,0,0,1,0],[1,1,1,1,0],[0,0,0,1,0],[0,0,0,1,0]],
  "5": [[1,1,1,1,0],[1,0,0,0,0],[1,1,1,0,0],[0,0,0,1,0],[1,1,1,0,0]],
  "6": [[0,1,1,1,0],[1,0,0,0,0],[1,1,1,0,0],[1,0,0,1,0],[0,1,1,0,0]],
  "7": [[1,1,1,1,0],[0,0,0,1,0],[0,0,1,0,0],[0,1,0,0,0],[0,1,0,0,0]],
  "8": [[0,1,1,0,0],[1,0,0,1,0],[0,1,1,0,0],[1,0,0,1,0],[0,1,1,0,0]],
  "9": [[0,1,1,0,0],[1,0,0,1,0],[0,1,1,1,0],[0,0,0,1,0],[1,1,1,0,0]],
  "0": [[0,1,1,0,0],[1,0,0,1,0],[1,0,0,1,0],[1,0,0,1,0],[0,1,1,0,0]],
};

function PixelGlyph({ char, delay, accent }: { char: string; delay: number; accent: boolean }) {
  const grid = FONT[char.toUpperCase()] ?? FONT[" "];
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    let raf: number;
    const start = performance.now() + delay;
    const tick = (t: number) => {
      const dt = Math.max(0, t - start) / 240;
      setProgress(Math.min(1, dt));
      if (dt < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [delay, char]);

  return (
    <span className="inline-flex flex-col gap-[1px]" style={{ width: 10 }}>
      {grid.map((row, ri) => (
        <span key={ri} className="flex gap-[1px]">
          {row.map((cell, ci) => {
            const noise = Math.random() < (1 - progress) * 0.5;
            const filled = cell === 1 ? progress > 0.2 : noise && progress < 0.7;
            return (
              <span
                key={ci}
                style={{
                  width: 1.6,
                  height: 1.6,
                  background: filled ? (accent ? ACCENT : "#e5e5e5") : "rgba(255,255,255,0.06)",
                  boxShadow: filled && accent ? `0 0 3px ${ACCENT}` : undefined,
                }}
              />
            );
          })}
        </span>
      ))}
    </span>
  );
}

function labelFor(s: string, n: number) {
  switch (s) {
    case "dirty":
      return `SAVE${n}`;
    case "saving":
      return `SEAL`;
    case "saved":
      return `OK`;
    case "clean":
      return `PUSH`;
    case "pushing":
      return `TX`;
    case "pushed":
      return `SYNC`;
    case "idle":
      return `IDLE`;
  }
  return "";
}
