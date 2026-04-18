import { motion } from "motion/react";
import { useId, useState } from "react";
import { cn } from "@/lib/utils";

interface CryptlyLogoProps {
  size?: number;
  className?: string;
  active?: boolean;
}

const ACTIVE_BG_HEX = "#0060D1";

const KEY_COLOR_DEFAULT = "#292929";
const KEY_COLOR_ACTIVE = ACTIVE_BG_HEX;

const RING_COLOR_DEFAULT = "#0060D1";
const RING_COLOR_ACTIVE = ACTIVE_BG_HEX;

const HOLE_RADIUS_DEFAULT = 10;
const HOLE_RADIUS_ACTIVE = 0;

const RING_OUTER_RADIUS_DEFAULT = 18;
const RING_OUTER_RADIUS_ACTIVE = 16;

const CENTER = 50;
const RING_OUTER_R = 40;
const RING_INNER_R = 34;
// Notch opening half-height. Outer and inner share the same value so the
// notch walls run parallel (straight across) instead of slanting inward.
// Default is the wider resting gap; active is the tighter gap used on hover.
const NOTCH_HALF_HEIGHT_DEFAULT = 12;
const NOTCH_HALF_HEIGHT_ACTIVE = 5;

/**
 * Builds an annulus segment centered at (CENTER, CENTER): two concentric arcs
 * connected by straight notch walls. Use `arc: "major"` to get the big "C"
 * (ring with a notch cut out) or `arc: "minor"` to get the small sliver
 * opposite the notch.
 *
 * The notch walls slant inward when `outerNotchH > innerNotchH`, matching the
 * trapezoidal "key slot" shape of the original logo.
 *
 * @param outerR       Outer radius.
 * @param innerR       Inner radius (controls ring thickness).
 * @param outerNotchH  Half-height where the notch meets the outer arc.
 * @param innerNotchH  Half-height where the notch meets the inner arc.
 * @param side         Which side the notch endpoints sit on ("right" = +x).
 * @param arc          "major" sweeps the long way around (the C);
 *                     "minor" sweeps the short way (the small sliver).
 */
function buildCRingPath(
  outerR: number,
  innerR: number,
  outerNotchH: number,
  innerNotchH: number,
  side: "left" | "right",
  arc: "major" | "minor"
): string {
  const sign = side === "right" ? 1 : -1;
  const outerX =
    CENTER + sign * Math.sqrt(outerR * outerR - outerNotchH * outerNotchH);
  const innerX =
    CENTER + sign * Math.sqrt(innerR * innerR - innerNotchH * innerNotchH);
  const largeArc = arc === "major" ? 1 : 0;
  // For the major arc the outer sweeps clockwise from top-to-bottom going the
  // long way around; the inner returns counter-clockwise. The minor arc swaps
  // both. The "left" side mirrors all sweep directions.
  const outerSweep = (arc === "major") === (side === "right") ? 0 : 1;
  const innerSweep = (arc === "major") === (side === "right") ? 1 : 0;
  return `M ${outerX} ${
    CENTER - outerNotchH
  } A ${outerR} ${outerR} 0 ${largeArc} ${outerSweep} ${outerX} ${
    CENTER + outerNotchH
  } L ${innerX} ${
    CENTER + innerNotchH
  } A ${innerR} ${innerR} 0 ${largeArc} ${innerSweep} ${innerX} ${
    CENTER - innerNotchH
  } Z`;
}

const C_RING_DEFAULT = buildCRingPath(
  RING_OUTER_R,
  RING_INNER_R,
  NOTCH_HALF_HEIGHT_DEFAULT,
  NOTCH_HALF_HEIGHT_DEFAULT,
  "right",
  "major"
);

const C_RING_ACTIVE = buildCRingPath(
  RING_OUTER_R,
  RING_INNER_R,
  NOTCH_HALF_HEIGHT_ACTIVE,
  NOTCH_HALF_HEIGHT_ACTIVE,
  "right",
  "major"
);

const KEY_SEGMENT = buildCRingPath(
  RING_OUTER_R,
  RING_INNER_R,
  NOTCH_HALF_HEIGHT_DEFAULT / 2.5,
  NOTCH_HALF_HEIGHT_DEFAULT / 2.5,
  "left",
  "minor"
);

const KEY_SHAFT = "M 40 45 L 15 45 L 15 55 L 40 55 Z";

const rotateEase = [0.22, 1, 0.36, 1] as const;

const fillTransition = { duration: 0.6, ease: "easeOut" as const };

const transformOriginStyle = {
  transformOrigin: "50px 50px",
  transformBox: "view-box" as const,
};

export function CryptlyLogo({
  size = 40,
  className,
  active,
}: CryptlyLogoProps) {
  const [hovered, setHovered] = useState(false);
  const isActive = active ?? hovered;

  const keyFill = isActive ? KEY_COLOR_ACTIVE : KEY_COLOR_DEFAULT;
  const ringFill = isActive ? RING_COLOR_ACTIVE : RING_COLOR_DEFAULT;
  const holeRadius = isActive ? HOLE_RADIUS_ACTIVE : HOLE_RADIUS_DEFAULT;
  const ringOuterRadius = isActive
    ? RING_OUTER_RADIUS_ACTIVE
    : RING_OUTER_RADIUS_DEFAULT;
  const rotate = isActive ? -180 : 0;
  const cRingPath = isActive ? C_RING_ACTIVE : C_RING_DEFAULT;

  const maskId = `cryptly-logo-hole-${useId()}`;

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={cn("block", className)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <defs>
        <mask id={maskId}>
          <rect x="0" y="0" width="100" height="100" fill="white" />
          <motion.circle
            cx="50"
            cy="50"
            fill="black"
            initial={false}
            animate={{ r: holeRadius }}
            transition={{ r: fillTransition }}
          />
        </mask>
      </defs>

      <motion.path
        d={KEY_SHAFT}
        style={transformOriginStyle}
        initial={false}
        animate={{ rotate, fill: keyFill }}
        transition={{
          rotate: { duration: 0.95, ease: rotateEase, delay: 0.05 },
          fill: fillTransition,
        }}
      />

      <motion.path
        d={KEY_SEGMENT}
        style={transformOriginStyle}
        strokeLinejoin="round"
        strokeWidth={2}
        initial={false}
        animate={{ rotate, fill: keyFill, stroke: keyFill }}
        transition={{
          rotate: { duration: 0.95, ease: rotateEase, delay: 0.05 },
          fill: fillTransition,
          stroke: fillTransition,
        }}
      />

      <motion.path
        strokeLinejoin="round"
        strokeWidth={2}
        initial={false}
        animate={{ fill: ringFill, stroke: ringFill, d: cRingPath }}
        transition={{
          fill: fillTransition,
          stroke: fillTransition,
          d: { duration: 0.6, ease: "easeOut" },
        }}
      />

      <motion.circle
        cx="50"
        cy="50"
        mask={`url(#${maskId})`}
        style={transformOriginStyle}
        initial={false}
        animate={{ rotate, fill: keyFill, r: ringOuterRadius }}
        transition={{
          rotate: { duration: 0.45, ease: rotateEase },
          fill: fillTransition,
          r: fillTransition,
        }}
      />
    </svg>
  );
}
