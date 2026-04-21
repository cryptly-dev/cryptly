import { GitHubIcon } from "@/components/ui/GitHubIcon";
import { cn } from "@/lib/utils";
import { ArrowRight, Check, CloudUpload } from "lucide-react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  type MotionValue,
} from "motion/react";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  type ReactNode,
} from "react";

// ── Pull-and-snap physics (shared by every variant) ──────────────────────────
// Gentle pull inside an outer ring, hard snap inside the inner ring. This
// matches V02 from the prior round — the variant the user picked.

const OUTER = 200;
const INNER = 70;

interface PullAndSnap {
  ref: React.RefObject<HTMLButtonElement | null>;
  x: MotionValue<number>;
  y: MotionValue<number>;
  scale: MotionValue<number>;
  /** motion template "translate3d(dx,dy,0)" useful for inner highlights */
  dxRaw: MotionValue<number>;
  dyRaw: MotionValue<number>;
}

function usePullAndSnap(): PullAndSnap {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const scale = useMotionValue(1);
  const sx = useSpring(x, { stiffness: 360, damping: 28, mass: 0.5 });
  const sy = useSpring(y, { stiffness: 360, damping: 28, mass: 0.5 });
  const sScale = useSpring(scale, { stiffness: 320, damping: 22 });

  // raw cursor delta (no spring) — variants use this for interior effects
  const dxRaw = useMotionValue(0);
  const dyRaw = useMotionValue(0);

  const handlerRef = useRef<(e: MouseEvent) => void>(() => {});
  useLayoutEffect(() => {
    handlerRef.current = (e: MouseEvent) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const distance = Math.hypot(dx, dy);
      dxRaw.set(dx);
      dyRaw.set(dy);
      if (distance < INNER) {
        x.set(dx);
        y.set(dy);
        scale.set(1.08);
      } else if (distance < OUTER) {
        const t = (OUTER - distance) / (OUTER - INNER);
        const pull = Math.pow(t, 1.6) * 0.35;
        x.set(dx * pull);
        y.set(dy * pull);
        scale.set(1 + t * 0.02);
      } else {
        x.set(0);
        y.set(0);
        scale.set(1);
      }
    };
  });

  useEffect(() => {
    const onMove = (e: MouseEvent) => handlerRef.current(e);
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return { ref, x: sx, y: sy, scale: sScale, dxRaw, dyRaw };
}

// ── Layout ───────────────────────────────────────────────────────────────────

function VariantFrame({
  index,
  title,
  blurb,
  children,
  surface,
}: {
  index: number;
  title: string;
  blurb: string;
  children: ReactNode;
  surface?: "black" | "slate" | "graphite" | "offwhite";
}) {
  const surfaceClass =
    surface === "offwhite"
      ? "bg-[#efefef]"
      : surface === "slate"
        ? "bg-[#0a1020]"
        : surface === "graphite"
          ? "bg-[#141414]"
          : "bg-neutral-950/50";

  return (
    <section className="border-t border-neutral-900 first:border-t-0">
      <div className="mx-auto max-w-6xl px-6 py-6 flex items-baseline gap-4">
        <span className="inline-flex items-center rounded-full border border-neutral-800 bg-neutral-950 px-2.5 py-0.5 text-[11px] font-medium text-neutral-300">
          V{index.toString().padStart(2, "0")}
        </span>
        <h2 className="text-lg font-semibold text-neutral-100 tracking-tight">
          {title}
        </h2>
        <p className="text-sm text-neutral-500 truncate">{blurb}</p>
      </div>
      <div className="mx-auto max-w-6xl px-6 pb-16">
        <div
          className={cn(
            "relative h-[340px] rounded-2xl border border-neutral-900 overflow-hidden",
            surfaceClass
          )}
        >
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none opacity-40 [background-image:radial-gradient(circle,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:22px_22px]"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── V01 — Classic White Pill ────────────────────────────────────────────────
// Our baseline. Clean, no-nonsense, deliberate.
function V01White() {
  const { ref, x, y, scale } = usePullAndSnap();
  return (
    <motion.button
      ref={ref}
      type="button"
      style={{ x, y, scale }}
      whileTap={{ scale: 0.96 }}
      className="inline-flex items-center gap-2.5 rounded-full bg-white text-black h-12 px-7 text-sm font-semibold tracking-tight"
    >
      <CloudUpload className="h-4 w-4" />
      Push to GitHub
    </motion.button>
  );
}

// ── V02 — Ghost Outline ──────────────────────────────────────────────────────
// Transparent body, hairline border. Confident restraint. The inner fill
// appears only when the cursor is inside the outer ring.
function V02Ghost() {
  const { ref, x, y, scale, dxRaw, dyRaw } = usePullAndSnap();
  return (
    <motion.button
      ref={ref}
      type="button"
      style={{ x, y, scale }}
      whileTap={{ scale: 0.96 }}
      className="relative inline-flex items-center gap-2.5 rounded-full h-12 px-7 text-sm font-semibold tracking-tight text-white"
    >
      <span className="absolute inset-0 rounded-full border border-white/70" />
      <FillNearCursor dx={dxRaw} dy={dyRaw} />
      <span className="relative inline-flex items-center gap-2.5">
        <CloudUpload className="h-4 w-4" />
        Push to GitHub
      </span>
    </motion.button>
  );
}

function FillNearCursor({
  dx,
  dy,
}: {
  dx: MotionValue<number>;
  dy: MotionValue<number>;
}) {
  // Opacity swells in proportion to cursor proximity.
  const opacity = useMotionValue(0);
  useEffect(() => {
    const update = () => {
      const d = Math.hypot(dx.get(), dy.get());
      const t = Math.max(0, Math.min(1, (OUTER - d) / (OUTER - INNER)));
      opacity.set(t * 0.16);
    };
    const unsubX = dx.on("change", update);
    const unsubY = dy.on("change", update);
    update();
    return () => {
      unsubX();
      unsubY();
    };
  }, [dx, dy, opacity]);
  return (
    <motion.span
      aria-hidden
      style={{ opacity }}
      className="absolute inset-0 rounded-full bg-white"
    />
  );
}

// ── V03 — Polished Chrome ────────────────────────────────────────────────────
// Dark, metallic, with a subtle edge highlight that points toward the cursor.
function V03Chrome() {
  const { ref, x, y, scale, dxRaw, dyRaw } = usePullAndSnap();
  const angle = useMotionValue(0);
  useEffect(() => {
    const update = () => {
      const deg =
        (Math.atan2(dyRaw.get(), dxRaw.get()) * 180) / Math.PI + 90;
      angle.set(deg);
    };
    const a = dxRaw.on("change", update);
    const b = dyRaw.on("change", update);
    return () => {
      a();
      b();
    };
  }, [dxRaw, dyRaw, angle]);
  const sAngle = useSpring(angle, { stiffness: 180, damping: 22 });
  const conic = useMotionTemplate`conic-gradient(from ${sAngle}deg, rgba(255,255,255,0.03) 0deg, rgba(255,255,255,0.55) 60deg, rgba(255,255,255,0.03) 140deg, rgba(255,255,255,0.03) 360deg)`;

  return (
    <motion.button
      ref={ref}
      type="button"
      style={{ x, y, scale }}
      whileTap={{ scale: 0.96 }}
      className="relative inline-flex items-center gap-2.5 rounded-full h-12 px-7 text-sm font-semibold tracking-tight text-neutral-100"
    >
      <motion.span
        aria-hidden
        style={{ background: conic }}
        className="absolute inset-0 rounded-full p-[1.5px]"
      >
        <span
          className="block h-full w-full rounded-full"
          style={{
            background:
              "linear-gradient(180deg, #1f1f1f 0%, #0d0d0d 55%, #050505 100%)",
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -1px 0 rgba(0,0,0,0.6)",
          }}
        />
      </motion.span>
      <span className="relative inline-flex items-center gap-2.5">
        <CloudUpload className="h-4 w-4" />
        Push to GitHub
      </span>
    </motion.button>
  );
}

// ── V04 — Monospace Stamp ────────────────────────────────────────────────────
// Square-cornered, mono type, uppercase. Feels like it belongs on a
// terminal. Pairs well with a dev-tool surface.
function V04Stamp() {
  const { ref, x, y, scale } = usePullAndSnap();
  return (
    <motion.button
      ref={ref}
      type="button"
      style={{ x, y, scale }}
      whileTap={{ scale: 0.97 }}
      className="relative inline-flex items-center gap-3 h-11 px-5 font-mono text-[12px] uppercase tracking-[0.22em] font-bold text-black bg-white"
    >
      <span className="absolute -inset-1 border border-white/25 pointer-events-none" />
      <span className="inline-flex items-center gap-3 relative">
        <CloudUpload className="h-4 w-4" />
        push_to_github
      </span>
    </motion.button>
  );
}

// ── V05 — Frosted Glass ──────────────────────────────────────────────────────
// Translucent pill with real backdrop-blur. Sits gracefully on any surface.
function V05Glass() {
  const { ref, x, y, scale, dxRaw, dyRaw } = usePullAndSnap();
  const spotX = useMotionValue(50);
  const spotY = useMotionValue(50);
  const sSpotX = useSpring(spotX, { stiffness: 200, damping: 22 });
  const sSpotY = useSpring(spotY, { stiffness: 200, damping: 22 });
  useEffect(() => {
    const update = () => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      // project cursor position relative to pill center, clamped
      const rx = 50 + (dxRaw.get() / w) * 100;
      const ry = 50 + (dyRaw.get() / h) * 100;
      spotX.set(Math.max(-20, Math.min(120, rx)));
      spotY.set(Math.max(-20, Math.min(120, ry)));
    };
    const a = dxRaw.on("change", update);
    const b = dyRaw.on("change", update);
    return () => {
      a();
      b();
    };
  }, [dxRaw, dyRaw, spotX, spotY, ref]);
  const bg = useMotionTemplate`radial-gradient(120px circle at ${sSpotX}% ${sSpotY}%, rgba(255,255,255,0.3), rgba(255,255,255,0.04) 65%)`;

  return (
    <motion.button
      ref={ref}
      type="button"
      style={{ x, y, scale }}
      whileTap={{ scale: 0.96 }}
      className="relative inline-flex items-center gap-2.5 rounded-full h-12 px-7 text-sm font-semibold tracking-tight text-white overflow-hidden"
    >
      <span
        aria-hidden
        className="absolute inset-0 rounded-full"
        style={{
          background: "rgba(255,255,255,0.08)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          border: "1px solid rgba(255,255,255,0.22)",
        }}
      />
      <motion.span
        aria-hidden
        style={{ background: bg }}
        className="absolute inset-0 rounded-full mix-blend-screen"
      />
      <span className="relative inline-flex items-center gap-2.5">
        <CloudUpload className="h-4 w-4" />
        Push to GitHub
      </span>
    </motion.button>
  );
}

// ── V06 — Sheen Sweep ────────────────────────────────────────────────────────
// Off-white pill with a thin light streak sweeping across. Subtle but makes
// the surface feel physical.
function V06Sheen() {
  const { ref, x, y, scale } = usePullAndSnap();
  return (
    <motion.button
      ref={ref}
      type="button"
      style={{ x, y, scale }}
      whileTap={{ scale: 0.96 }}
      className="relative inline-flex items-center gap-2.5 rounded-full h-12 px-7 text-sm font-semibold tracking-tight text-black overflow-hidden"
    >
      <span
        aria-hidden
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "linear-gradient(180deg, #ffffff 0%, #f0f0f0 60%, #e3e3e3 100%)",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.9), inset 0 -1px 0 rgba(0,0,0,0.08)",
        }}
      />
      <motion.span
        aria-hidden
        className="absolute inset-0 rounded-full"
        initial={{ x: "-110%" }}
        animate={{ x: "110%" }}
        transition={{
          duration: 2.6,
          repeat: Infinity,
          ease: "easeInOut",
          repeatDelay: 1.4,
        }}
        style={{
          background:
            "linear-gradient(90deg, transparent 20%, rgba(255,255,255,0.85) 50%, transparent 80%)",
          mixBlendMode: "overlay",
        }}
      />
      <span className="relative inline-flex items-center gap-2.5">
        <CloudUpload className="h-4 w-4" />
        Push to GitHub
      </span>
    </motion.button>
  );
}

// ── V07 — Brand Accent ───────────────────────────────────────────────────────
// Sky-blue surface with a heavier visual weight. The accent makes it
// unmistakable as the primary action on the page.
function V07Accent() {
  const { ref, x, y, scale } = usePullAndSnap();
  return (
    <motion.button
      ref={ref}
      type="button"
      style={{ x, y, scale }}
      whileTap={{ scale: 0.96 }}
      className="relative inline-flex items-center gap-2.5 rounded-full h-12 px-7 text-sm font-semibold tracking-tight text-white"
    >
      <span
        aria-hidden
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "linear-gradient(180deg, #3b82f6 0%, #2563eb 55%, #1d4ed8 100%)",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.28), 0 1px 0 rgba(0,0,0,0.5)",
        }}
      />
      <span className="relative inline-flex items-center gap-2.5">
        <CloudUpload className="h-4 w-4" />
        Push to GitHub
      </span>
    </motion.button>
  );
}

// ── V08 — Executive Chunk ────────────────────────────────────────────────────
// Tall, bold, unapologetic. Reads as the final, confident act on the page.
function V08Executive() {
  const { ref, x, y, scale } = usePullAndSnap();
  return (
    <motion.button
      ref={ref}
      type="button"
      style={{ x, y, scale }}
      whileTap={{ scale: 0.97 }}
      className="relative inline-flex items-center gap-3 rounded-2xl h-14 px-8 text-[15px] font-semibold tracking-tight text-black bg-white"
    >
      <span
        aria-hidden
        className="absolute inset-0 rounded-2xl"
        style={{
          boxShadow:
            "0 2px 0 rgba(0,0,0,0.25), 0 10px 24px -6px rgba(0,0,0,0.55)",
        }}
      />
      <span className="relative inline-flex items-center gap-3">
        <CloudUpload className="h-4 w-4" />
        Push to GitHub
        <span className="h-5 w-px bg-black/15 mx-1" />
        <span className="text-[11px] font-mono text-black/50">⌘↵</span>
      </span>
    </motion.button>
  );
}

// ── V09 — Minimal Arrow ──────────────────────────────────────────────────────
// Not a pill at all. Text + an arrow that swings in when you approach. For
// sections where the button should whisper.
function V09Minimal() {
  const { ref, x, y, scale, dxRaw, dyRaw } = usePullAndSnap();
  const underline = useMotionValue(0);
  const sUnderline = useSpring(underline, { stiffness: 300, damping: 28 });
  useEffect(() => {
    const update = () => {
      const d = Math.hypot(dxRaw.get(), dyRaw.get());
      const t = Math.max(0, Math.min(1, (OUTER - d) / (OUTER - INNER)));
      underline.set(t);
    };
    const a = dxRaw.on("change", update);
    const b = dyRaw.on("change", update);
    return () => {
      a();
      b();
    };
  }, [dxRaw, dyRaw, underline]);
  const width = useMotionTemplate`${sUnderline}em`;
  return (
    <motion.button
      ref={ref}
      type="button"
      style={{ x, y, scale }}
      whileTap={{ scale: 0.97 }}
      className="relative inline-flex items-baseline gap-2 text-white text-base font-medium tracking-tight"
    >
      <CloudUpload className="h-4 w-4 self-center" />
      <span className="relative">
        Push to GitHub
        <motion.span
          aria-hidden
          style={{ width }}
          className="absolute left-0 -bottom-1 h-px bg-white"
        />
      </span>
      <ArrowRight className="h-4 w-4 self-center" />
    </motion.button>
  );
}

// ── V10 — Split Fill ─────────────────────────────────────────────────────────
// White pill that reveals a dark fill from left to right based on cursor
// proximity. Locked state is fully dark with white text — a "mode change".
function V10SplitFill() {
  const { ref, x, y, scale, dxRaw, dyRaw } = usePullAndSnap();
  const fill = useMotionValue(0);
  const sFill = useSpring(fill, { stiffness: 240, damping: 26 });
  useEffect(() => {
    const update = () => {
      const d = Math.hypot(dxRaw.get(), dyRaw.get());
      const t = Math.max(0, Math.min(1, (OUTER - d) / (OUTER - INNER)));
      fill.set(t);
    };
    const a = dxRaw.on("change", update);
    const b = dyRaw.on("change", update);
    return () => {
      a();
      b();
    };
  }, [dxRaw, dyRaw, fill]);
  const fillW = useMotionTemplate`${sFill}00%`;
  return (
    <motion.button
      ref={ref}
      type="button"
      style={{ x, y, scale }}
      whileTap={{ scale: 0.96 }}
      className="relative inline-flex items-center gap-2.5 rounded-full h-12 px-7 text-sm font-semibold tracking-tight overflow-hidden bg-white"
    >
      <motion.span
        aria-hidden
        style={{ width: fillW }}
        className="absolute inset-y-0 left-0 bg-black"
      />
      <motion.span
        aria-hidden
        style={{ width: fillW }}
        className="absolute inset-y-0 left-0 pointer-events-none"
      />
      <span className="relative inline-flex items-center gap-2.5 mix-blend-difference text-white">
        <CloudUpload className="h-4 w-4" />
        Push to GitHub
      </span>
    </motion.button>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

const VARIANTS: {
  title: string;
  blurb: string;
  Component: () => React.ReactElement;
  surface?: "black" | "slate" | "graphite" | "offwhite";
}[] = [
  { title: "Classic White", blurb: "Our baseline — clean, deliberate.", Component: V01White },
  { title: "Ghost Outline", blurb: "Hairline border. Fill swells with proximity.", Component: V02Ghost },
  { title: "Polished Chrome", blurb: "Dark metal. Edge highlight rotates toward cursor.", Component: V03Chrome, surface: "graphite" },
  { title: "Monospace Stamp", blurb: "Square, mono, uppercase — terminal energy.", Component: V04Stamp },
  { title: "Frosted Glass", blurb: "Backdrop blur with interior light spot.", Component: V05Glass, surface: "slate" },
  { title: "Sheen Sweep", blurb: "Soft white with a traveling highlight.", Component: V06Sheen },
  { title: "Brand Accent", blurb: "Heavy blue. Unambiguous primary.", Component: V07Accent },
  { title: "Executive Chunk", blurb: "Tall. Bold. With a keyboard shortcut.", Component: V08Executive },
  { title: "Minimal Arrow", blurb: "No pill. Text + arrow with proximity underline.", Component: V09Minimal },
  { title: "Split Fill", blurb: "Dark fill sweeps in with cursor proximity.", Component: V10SplitFill },
];

export function MagneticPlayground() {
  return (
    <div className="min-h-screen bg-black text-neutral-200">
      <div className="sticky top-0 z-30 border-b border-neutral-900 bg-black/80 backdrop-blur">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-[0.2em] text-neutral-500">
              Playground
            </div>
            <h1 className="text-xl font-semibold text-neutral-100 tracking-tight">
              Push button · looks, 10 takes
            </h1>
            <p className="mt-1 text-xs text-neutral-500">
              All variants share the pull-and-snap you picked. Only the surface
              changes.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-neutral-500">
            <Check className="h-3.5 w-3.5 text-emerald-400" />
            physics: pull + snap
            <span className="ml-2 text-neutral-700">·</span>
            <GitHubIcon className="h-4 w-4 ml-2" />
          </div>
        </div>
      </div>
      {VARIANTS.map((v, i) => (
        <VariantFrame
          key={v.title}
          index={i + 1}
          title={v.title}
          blurb={v.blurb}
          surface={v.surface}
        >
          <v.Component />
        </VariantFrame>
      ))}
    </div>
  );
}
