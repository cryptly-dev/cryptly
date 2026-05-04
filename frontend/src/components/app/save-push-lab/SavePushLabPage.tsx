import { useEffect } from "react";
import { motion } from "motion/react";
import { Pencil, RotateCcw } from "lucide-react";
import { FakeEditor } from "./FakeEditor";
import { useSavePushFlow } from "./useSavePushFlow";
import { ACCENT } from "./types";
import { V01_Classic } from "./variants/V01_Classic";
import { V02_Hex } from "./variants/V02_Hex";
import { V03_Binary } from "./variants/V03_Binary";
import { V04_MatrixRain } from "./variants/V04_MatrixRain";
import { V05_Block } from "./variants/V05_Block";
import { V06_ShaPreview } from "./variants/V06_ShaPreview";
import { V07_Terminal } from "./variants/V07_Terminal";
import { V08_Fingerprint } from "./variants/V08_Fingerprint";
import { V09_Diff } from "./variants/V09_Diff";
import { V10_Json } from "./variants/V10_Json";
import { V11_Base64 } from "./variants/V11_Base64";
import { V12_Morse } from "./variants/V12_Morse";
import { V13_Glitch } from "./variants/V13_Glitch";
import { V14_Typewriter } from "./variants/V14_Typewriter";
import { V15_Layered } from "./variants/V15_Layered";
import { V16_Vault } from "./variants/V16_Vault";
import { V17_Pixel } from "./variants/V17_Pixel";
import { V18_Holographic } from "./variants/V18_Holographic";
import { V19_CodeBlock } from "./variants/V19_CodeBlock";
import { V20_StreamBanner } from "./variants/V20_StreamBanner";

interface VariantDef {
  id: string;
  number: string;
  title: string;
  blurb: string;
  initialChanges: number;
  Component: React.ComponentType<{ flow: ReturnType<typeof useSavePushFlow> }>;
}

const VARIANTS: VariantDef[] = [
  { id: "classic",      number: "01", title: "Classic",      initialChanges: 4, Component: V01_Classic,
    blurb: "Block glyphs, scanline overlay, monospace prompt. Cipher resolves left-to-right, container width morphs to fit each label." },
  { id: "hex",          number: "02", title: "Hex",          initialChanges: 4, Component: V02_Hex,
    blurb: "Drawn from `0123456789abcdef` only. Reads like the first eight chars of a SHA — what `git log` would show you." },
  { id: "binary",       number: "03", title: "Binary",       initialChanges: 4, Component: V03_Binary,
    blurb: "Just zeroes and ones. The bitstream collapses into a four-letter verb on the right. Stark, machinic, satisfying." },
  { id: "matrix",       number: "04", title: "Matrix Rain",  initialChanges: 4, Component: V04_MatrixRain,
    blurb: "Katakana columns rain down behind the label, accelerate during action. Label etched in front with a hard text-shadow." },
  { id: "block",        number: "05", title: "Block",        initialChanges: 5, Component: V05_Block,
    blurb: "Hex shown in two four-character blocks like an AES round trace. Spaces are preserved — the structure stays legible mid-scramble." },
  { id: "sha",          number: "06", title: "SHA Preview",  initialChanges: 4, Component: V06_ShaPreview,
    blurb: "Shaped like a git commit hash: prefix, ellipsis, tail, then the verb. Scrambles the hex parts, leaves the verb and `+n` alone." },
  { id: "terminal",     number: "07", title: "Terminal",     initialChanges: 3, Component: V07_Terminal,
    blurb: "Bash prompt with a green `$`, cursor blinks at the end. After action a `exit 0` chip appears in green. Pure CLI." },
  { id: "fingerprint",  number: "08", title: "Fingerprint",  initialChanges: 4, Component: V08_Fingerprint,
    blurb: "Looks like an SSH key fingerprint — six hex pairs separated by colons, ed25519 tag on the left, action verb on the right." },
  { id: "diff",         number: "09", title: "Diff",         initialChanges: 4, Component: V09_Diff,
    blurb: "Git-diff palette. Green plus-sign on the active actions, line numbers tabbed at the front. The cipher only churns the line content." },
  { id: "json",         number: "10", title: "JSON",         initialChanges: 4, Component: V10_Json,
    blurb: "A two-key JSON object with VS-Code syntax colors. Keys, structural punctuation, and the closing brace stay; values scramble." },
  { id: "base64",       number: "11", title: "Base64",       initialChanges: 5, Component: V11_Base64,
    blurb: "Mixed-case alphanumerics with the occasional `+` `/` `=`. Looks like a chunk of a JWT or env-var ciphertext." },
  { id: "morse",        number: "12", title: "Morse",        initialChanges: 3, Component: V12_Morse,
    blurb: "Dots and dashes only. Each state is encoded in CW and scrambles into shape; the verb is shown in plain text on the right." },
  { id: "glitch",       number: "13", title: "Glitch",       initialChanges: 4, Component: V13_Glitch,
    blurb: "Cipher with chromatic aberration: red and cyan ghosts of the label slip horizontally during action then snap back into alignment." },
  { id: "typewriter",   number: "14", title: "Typewriter",   initialChanges: 3, Component: V14_Typewriter,
    blurb: "Characters type in left-to-right with a teletype rhythm. State change clears via implicit backspace before the next message types in." },
  { id: "layered",      number: "15", title: "Layered",      initialChanges: 4, Component: V15_Layered,
    blurb: "Two cipher streams stacked. A faint hex layer runs at half opacity behind the foreground label — ciphertext on ciphertext." },
  { id: "vault",        number: "16", title: "Vault Lock",   initialChanges: 7, Component: V16_Vault,
    blurb: "Each digit is a spinning combination dial that rattles and locks left-to-right with a soft thunk. Cipher rendered as machinery." },
  { id: "pixel",        number: "17", title: "Pixel",        initialChanges: 4, Component: V17_Pixel,
    blurb: "Each glyph is a 5×7 bitmap. Random pixels scatter then resolve into the target letters — like an LED matrix display." },
  { id: "holographic",  number: "18", title: "Holographic",  initialChanges: 4, Component: V18_Holographic,
    blurb: "Iridescent foil-stamp gradient drifts across the cipher characters. Saturation lifts during action — like tilting a credit card to light." },
  { id: "code",         number: "19", title: "Code Block",   initialChanges: 4, Component: V19_CodeBlock,
    blurb: "A single line of TypeScript: `await cryptly.save(4)`. Keywords and method names stay locked; only the argument scrambles." },
  { id: "stream",       number: "20", title: "Stream Banner",initialChanges: 4, Component: V20_StreamBanner,
    blurb: "Hex bytes scroll horizontally underneath like a stock-ticker. Faster during action, slow on idle. Label sits above as the authority." },
];

export function SavePushLabPage() {
  useEffect(() => {
    document.title = "Cipher Lab — Cryptly";
  }, []);

  return (
    <div className="h-full w-full overflow-y-auto bg-background text-foreground">
      <div className="mx-auto max-w-6xl px-6 pb-32 pt-16">
        <header className="mb-16">
          <div
            className="mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em]"
            style={{
              color: ACCENT,
              background: `${ACCENT}14`,
              border: `1px solid ${ACCENT}33`,
            }}
          >
            Lab · Cipher · 20 takes
          </div>
          <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
            Twenty ciphers for a single button.
          </h1>
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
            One mechanic — characters scrambling into intent — explored
            twenty different ways. Different alphabets, different content
            schemas, different treatments. Reset to <em>dirty</em> to feel
            the save → push flow, or to <em>clean</em> to see how each
            variant rests when there's nothing to do.
          </p>
        </header>

        <div className="grid gap-12">
          {VARIANTS.map((v, i) => (
            <VariantCard key={v.id} index={i} def={v} />
          ))}
        </div>
      </div>
    </div>
  );
}

function VariantCard({ index, def }: { index: number; def: VariantDef }) {
  const flow = useSavePushFlow(def.initialChanges);

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, delay: Math.min(index, 4) * 0.04, ease: [0.2, 0.8, 0.2, 1] }}
      className="overflow-hidden rounded-2xl border border-border/60 bg-card/40 backdrop-blur"
    >
      <div className="flex flex-col gap-0 md:flex-row">
        <div className="relative flex-1 min-w-0">
          <FakeEditor height={300} />
          <div className="pointer-events-none absolute inset-x-0 bottom-8 flex justify-center">
            <div className="pointer-events-auto">
              <def.Component flow={flow} />
            </div>
          </div>
          <div className="absolute left-4 top-3 flex items-center gap-2 rounded-full bg-black/60 px-2.5 py-1 backdrop-blur">
            <StatusDot state={flow.state} />
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-neutral-400">
              {flow.state}
            </span>
          </div>
        </div>

        <div className="flex w-full md:w-80 flex-col justify-between border-t md:border-t-0 md:border-l border-border/60 bg-card/30 p-6">
          <div>
            <div
              className="mb-2 font-mono text-[11px] tracking-[0.2em]"
              style={{ color: ACCENT }}
            >
              VARIANT {def.number}
            </div>
            <h3 className="text-2xl font-semibold tracking-tight">
              {def.title}
            </h3>
            <p className="mt-3 text-[14px] leading-relaxed text-muted-foreground">
              {def.blurb}
            </p>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <ResetButton onClick={flow.reset} icon={<Pencil className="size-3" />}>
              Reset to dirty
            </ResetButton>
            <ResetButton onClick={flow.resetToClean} icon={<RotateCcw className="size-3" />}>
              Reset to clean
            </ResetButton>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

function ResetButton({
  onClick,
  icon,
  children,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/40 px-3.5 py-1.5 text-[12px] font-medium text-muted-foreground transition-colors hover:border-border hover:text-foreground"
    >
      {icon}
      {children}
    </button>
  );
}

function StatusDot({ state }: { state: ReturnType<typeof useSavePushFlow>["state"] }) {
  const color =
    state === "dirty"
      ? ACCENT
      : state === "saving" || state === "pushing"
        ? "#fbbf24"
        : state === "saved" || state === "pushed"
          ? "#10b981"
          : state === "idle"
            ? "#525252"
            : "#525252";
  return (
    <span className="relative inline-flex">
      <span
        className="block size-2 rounded-full"
        style={{ background: color, boxShadow: `0 0 8px ${color}` }}
      />
      {(state === "saving" || state === "pushing" || state === "dirty") && (
        <motion.span
          className="absolute inset-0 rounded-full"
          style={{ border: `1px solid ${color}` }}
          animate={{ scale: [1, 2.4], opacity: [0.7, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
        />
      )}
    </span>
  );
}
