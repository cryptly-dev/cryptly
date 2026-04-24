import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";

// GripVertical's six dots in clockwise perimeter order (matches lucide's
// geometry). Indices 0,4,5 are the left column; 1,2,3 are the right column.
const GRIP_PERIMETER = [
  { cx: 9, cy: 5 },
  { cx: 15, cy: 5 },
  { cx: 15, cy: 12 },
  { cx: 15, cy: 19 },
  { cx: 9, cy: 19 },
  { cx: 9, cy: 12 },
];

const STEP_MS = 130;
const CYCLE_MS = STEP_MS * 6;
// Steps 1 and 4 light up a full column — skip them as starting phases so
// the loader never shows an "all-left" or "all-right" state on mount.
const ALLOWED_START_OFFSETS = [0, 2, 3, 5].map((s) => s * STEP_MS);
let gripCssInjected = false;

function injectGripLoaderCSS() {
  if (gripCssInjected) return;
  gripCssInjected = true;
  const style = document.createElement("style");
  style.textContent = `
    @keyframes grip-loader-fade {
      0% { opacity: 0.12; }
      16.667% { opacity: 1; }
      50% { opacity: 1; }
      66.667% { opacity: 0.12; }
      100% { opacity: 0.12; }
    }
    .grip-loader-dot {
      animation: grip-loader-fade ${CYCLE_MS}ms linear infinite;
    }
  `;
  document.head.appendChild(style);
}

interface GripLoaderProps {
  color: string;
  className?: string;
}

export function GripLoader({ color, className }: GripLoaderProps) {
  const startOffsetRef = useRef(
    ALLOWED_START_OFFSETS[
      Math.floor(Math.random() * ALLOWED_START_OFFSETS.length)
    ]
  );

  useEffect(() => {
    injectGripLoaderCSS();
  }, []);

  const startOffsetMs = startOffsetRef.current;

  return (
    <svg
      viewBox="0 0 24 24"
      className={cn("w-3.5 h-3.5", className)}
      role="status"
      aria-label="Loading"
    >
      {GRIP_PERIMETER.map((pos, i) => {
        // Dot i's fade-in begins at cycle time F_i within the 780ms cycle.
        const fadeInStart = ((i + 4) * STEP_MS) % CYCLE_MS;
        // Negative animation-delay starts the animation mid-cycle so the
        // first painted frame already matches the chosen phase.
        const phase =
          (((startOffsetMs - fadeInStart) % CYCLE_MS) + CYCLE_MS) % CYCLE_MS;
        return (
          <circle
            key={i}
            cx={pos.cx}
            cy={pos.cy}
            r={2}
            fill={color}
            className="grip-loader-dot"
            style={{ animationDelay: `-${phase}ms` }}
          />
        );
      })}
    </svg>
  );
}
