import { useEffect, useRef, useState } from "react";

const DEFAULT_GLYPHS = "▓▒░█▌▐▀▄┃━╋▞▚⌬◬◇◆◈".split("");

export interface ScrambleOptions {
  /** Symbol pool to draw scramble characters from. */
  alphabet?: string[];
  /** Per-tick increment (0..1). Higher = faster reveal. */
  speed?: number;
  /** Reveal order: "ltr" left-to-right, "rtl", "random", "all". */
  order?: "ltr" | "rtl" | "random" | "all";
  /** Preserve spaces in the scrambled output. */
  preserveSpaces?: boolean;
  /** Fix specific characters during scramble (e.g. punctuation, prefixes). */
  preserve?: (ch: string) => boolean;
  /** Re-trigger scramble whenever this changes (besides target). */
  reseed?: number | string | boolean;
}

/**
 * Continuously scrambles `target` and reveals it position-by-position. Each
 * time `target` (or `reseed`) changes, the scramble starts over.
 */
export function useScramble(target: string, opts: ScrambleOptions = {}) {
  const {
    alphabet = DEFAULT_GLYPHS,
    speed = 0.07,
    order = "ltr",
    preserveSpaces = true,
    preserve,
    reseed,
  } = opts;

  const [out, setOut] = useState(target);
  const orderRef = useRef<number[]>([]);

  useEffect(() => {
    const idx = target.split("").map((_, i) => i);
    if (order === "rtl") idx.reverse();
    if (order === "random") {
      for (let i = idx.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [idx[i], idx[j]] = [idx[j], idx[i]];
      }
    }
    orderRef.current = idx;

    let t = 0;
    let ticks = 0;
    const id = window.setInterval(() => {
      t += speed;
      ticks++;
      if (t >= 1) {
        setOut(target);
        window.clearInterval(id);
        return;
      }
      const revealCount = order === "all" ? 0 : Math.floor(t * target.length);
      const revealed = new Set(orderRef.current.slice(0, revealCount));
      const next = target
        .split("")
        .map((c, i) => {
          if (preserveSpaces && c === " ") return c;
          if (preserve && preserve(c)) return c;
          if (order !== "all" && revealed.has(i)) return c;
          return alphabet[(ticks * 31 + i * 7) % alphabet.length];
        })
        .join("");
      setOut(next);
    }, 26);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, reseed]);

  return out;
}
