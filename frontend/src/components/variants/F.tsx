import { GitHubIcon } from "@/components/ui/GitHubIcon";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { ArrowRight, Check, Copy } from "lucide-react";
import { useState } from "react";

/* ────────────────────────────────────────────────────────────────────────────
 * VARIANT F — "The Reading Room"
 * Two-column reading layout. One restrained warm accent (#c9b287), used as
 * decoration only — a pinmark, an em-dash, a hairline underline.
 * Density ~4/10. Closer to a fine-press journal than to a software dashboard.
 * ──────────────────────────────────────────────────────────────────────────── */

const ACCENT = "#c9b287"; // warm parchment, used sparingly only.

function Shell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto max-w-5xl px-6", className)}>{children}</div>
  );
}

function Pin() {
  return (
    <span
      aria-hidden
      className="inline-block h-1.5 w-1.5 rounded-full align-middle"
      style={{ backgroundColor: ACCENT }}
    />
  );
}

function Header() {
  return (
    <header className="border-b border-neutral-900">
      <Shell>
        <div className="flex items-center justify-between h-16 text-[11px] font-mono tracking-[0.25em] uppercase text-neutral-500">
          <span className="inline-flex items-center gap-2.5">
            <Pin />
            <span>Cryptly · the reading room</span>
          </span>
          <span className="hidden md:inline">In quiet supply since 2025</span>
          <span>№ 06</span>
        </div>
      </Shell>
    </header>
  );
}

function PrimaryCTA({
  children,
  href = "/app/login",
}: {
  children: React.ReactNode;
  href?: string;
}) {
  return (
    <a
      href={href}
      className="group inline-flex items-center gap-2 rounded-full bg-neutral-100 text-black px-5 py-2.5 text-sm font-medium transition-colors hover:bg-white"
    >
      {children}
    </a>
  );
}

function GhostCTA({
  children,
  href,
}: {
  children: React.ReactNode;
  href?: string;
}) {
  return (
    <a
      href={href ?? "#"}
      className="inline-flex items-center gap-2 rounded-full border border-neutral-800 bg-transparent px-5 py-2.5 text-sm text-neutral-300 transition-colors hover:border-neutral-700 hover:text-white"
    >
      {children}
    </a>
  );
}

function Rule() {
  return (
    <div className="mx-auto max-w-5xl px-6 my-16">
      <div className="border-t border-neutral-900" />
    </div>
  );
}

function SectionLabel({ n, children }: { n: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline gap-3 text-[11px] font-mono uppercase tracking-[0.25em] text-neutral-500">
      <span
        className="font-serif italic normal-case tracking-normal"
        style={{ color: ACCENT }}
      >
        {n}.
      </span>
      <span>{children}</span>
    </div>
  );
}

// ── Hero ────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="pt-24 md:pt-32 pb-12">
      <Shell>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-14">
          <div className="md:col-span-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.9 }}
              className="text-[11px] font-mono uppercase tracking-[0.25em] text-neutral-500"
            >
              An essay on a small, careful vault
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.1, delay: 0.1 }}
              className="mt-6 text-5xl md:text-7xl font-semibold text-neutral-100 leading-[1] tracking-tight"
            >
              A vault we
              <br />
              cannot read.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.9, delay: 0.4 }}
              className="mt-8 text-lg text-neutral-300 max-w-xl leading-[1.75]"
            >
              Cryptly is a small secrets manager, free, open source,
              and built so its operators
              <span
                className="mx-1.5 align-middle text-neutral-700"
                aria-hidden
              >
                ·
              </span>
              that's us
              <span
                className="mx-1.5 align-middle text-neutral-700"
                aria-hidden
              >
                ·
              </span>
              physically cannot decrypt your values. The pages that
              follow describe how that arrangement is{" "}
              <span
                className="inline relative pb-0.5"
                style={{
                  borderBottom: `1px solid ${ACCENT}`,
                  color: "#e5e5e5",
                }}
              >
                kept honest
              </span>
              .
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.9, delay: 0.7 }}
              className="mt-10 flex flex-wrap items-center gap-3"
            >
              <PrimaryCTA>
                Open the dashboard
                <ArrowRight className="h-4 w-4" />
              </PrimaryCTA>
              <GhostCTA href="https://github.com/cryptly-dev/cryptly">
                <GitHubIcon className="h-4 w-4" />
                Read the source
              </GhostCTA>
              <GhostCTA href="/blog">The blog</GhostCTA>
            </motion.div>
          </div>

          <motion.aside
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="md:col-span-4"
          >
            <div className="border-t border-neutral-800 pt-5">
              <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-neutral-500">
                On the masthead
              </div>
              <dl className="mt-5 space-y-3 text-[13px] text-neutral-300">
                <Row k="Custody">in your browser, alone</Row>
                <Row k="Cipher">aes-256-gcm</Row>
                <Row k="Source">open · MIT</Row>
                <Row k="Inviting">link · teammate · team*</Row>
                <Row k="CI">github actions, one click</Row>
                <Row k="Audit">signed diffs, searchable</Row>
                <Row k="Price">none, in any currency</Row>
              </dl>
              <div className="mt-5 text-[11px] font-mono text-neutral-600 leading-relaxed">
                * whole-team invitations land in Q3.
              </div>
            </div>
          </motion.aside>
        </div>
      </Shell>
    </section>
  );
}

function Row({ k, children }: { k: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline gap-4">
      <dt className="w-20 shrink-0 text-[10px] uppercase tracking-[0.25em] text-neutral-500">
        {k}
      </dt>
      <dd className="text-neutral-200 font-mono">{children}</dd>
    </div>
  );
}

// ── Movement I — The vault, with a single quiet mock ──────────────────────

const MOCK_ROWS = [
  { k: "DATABASE_URL", v: "postgres://u:p@db.internal:5432/app" },
  { k: "STRIPE_SECRET_KEY", v: "sk_live_72Mky8qRt9tWnOpC" },
  { k: "OPENAI_API_KEY", v: "sk-proj-AbcDef123xyz456" },
];

function VaultMovement() {
  return (
    <section>
      <Shell>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-14 items-start">
          <div className="md:col-span-7">
            <SectionLabel n="I">The vault</SectionLabel>
            <h2 className="mt-5 text-3xl md:text-5xl font-semibold text-neutral-100 leading-[1.08] tracking-tight">
              <span className="text-neutral-100">
                The encryption happens before the wire.
              </span>{" "}
              <span className="text-neutral-500">
                The price happens never.
              </span>
            </h2>
            <div className="mt-7 space-y-5 text-[16px] text-neutral-400 leading-[1.75] max-w-xl">
              <p>
                Each value is wrapped in AES-256-GCM by your browser, with
                a key derived
                <span className="mx-1.5 text-neutral-700">·</span> locally
                <span className="mx-1.5 text-neutral-700">·</span> from a
                passphrase you never tell us. The server stores the
                ciphertext and nothing else; we hold no second column for
                the plaintext.
              </p>
              <p>
                The cost of this service is zero, in every plan, forever.
                The plan you're on is the plan everyone is on.
              </p>
            </div>
          </div>

          <div className="md:col-span-5">
            <MockEditor />
          </div>
        </div>
      </Shell>
    </section>
  );
}

function MockEditor() {
  const [reveal, setReveal] = useState<number | null>(null);
  return (
    <figure className="select-none">
      <div className="border border-neutral-800 bg-neutral-950/40">
        <div className="flex items-center justify-between px-3 h-9 border-b border-neutral-900 text-[10px] font-mono uppercase tracking-[0.25em] text-neutral-500">
          <span>cryptly · production · .env</span>
          <span style={{ color: ACCENT }} className="text-[10px]">
            ciphertext
          </span>
        </div>
        <div className="font-mono text-[12px] leading-[1.95]">
          {MOCK_ROWS.map((r, i) => (
            <div
              key={i}
              className="grid grid-cols-[36px_1fr] items-baseline gap-3 px-3 hover:bg-white/[0.015]"
              onMouseEnter={() => setReveal(i)}
              onMouseLeave={() => setReveal(null)}
            >
              <span className="text-right text-neutral-700 tabular-nums">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="flex items-baseline">
                <span className="text-neutral-300 mr-1">{r.k}</span>
                <span className="text-neutral-600">=</span>
                <span
                  className={cn(
                    "ml-1 truncate",
                    reveal === i ? "text-neutral-200" : "text-neutral-600"
                  )}
                >
                  {reveal === i ? r.v : "•".repeat(Math.min(r.v.length, 28))}
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className="px-3 h-9 flex items-center justify-between border-t border-neutral-900 text-[10px] font-mono uppercase tracking-[0.25em] text-neutral-500">
          <span>3 of 12 · hover to peek</span>
          <span className="font-mono normal-case tracking-normal text-neutral-600">
            kept off our wire
          </span>
        </div>
      </div>
      <figcaption className="mt-3 text-[10px] font-mono uppercase tracking-[0.25em] text-neutral-500">
        Fig. I · the editor, with values masked
      </figcaption>
    </figure>
  );
}

// ── Movement II — The invitation ──────────────────────────────────────────

function InviteMovement() {
  return (
    <section>
      <Shell>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-14 items-start">
          <div className="md:col-span-5 order-2 md:order-1">
            <InviteCard />
          </div>
          <div className="md:col-span-7 order-1 md:order-2">
            <SectionLabel n="II">The invitation</SectionLabel>
            <h2 className="mt-5 text-3xl md:text-5xl font-semibold text-neutral-100 leading-[1.08] tracking-tight">
              <span className="text-neutral-100">Two channels.</span>{" "}
              <span className="text-neutral-500">One handshake.</span>
            </h2>
            <div className="mt-7 space-y-5 text-[16px] text-neutral-400 leading-[1.75] max-w-xl">
              <p>
                Cryptly mints a one-time URL and a separate passphrase.
                Send each on a different channel — a stolen link alone
                unlocks nothing. Once accepted, the project key is
                re-wrapped in the new member's browser. Our server moves
                wrapped bytes only.
              </p>
              <p>
                Two further methods sit alongside: pick a teammate
                you've already worked with in Cryptly, or wait for{" "}
                <span style={{ color: ACCENT }}>whole-team invitations</span>,
                which arrive in Q3.
              </p>
            </div>
          </div>
        </div>
      </Shell>
    </section>
  );
}

function InviteCard() {
  const [copied, setCopied] = useState(false);
  const link = "cryptly.dev/invite/a3f9-k2m-7bxQ";
  const pass = "sunrise-otter-42";
  return (
    <figure className="select-none">
      <div className="border border-neutral-800 bg-neutral-950/40 p-5">
        <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-neutral-500">
          One invitation, two halves
        </div>
        <div className="mt-4 space-y-3">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-neutral-500">
              On channel A
            </div>
            <div className="mt-1 flex items-center gap-2 border-b border-neutral-900 pb-2">
              <span className="font-mono text-[12px] text-neutral-200 truncate flex-1">
                https://{link}
              </span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard
                    ?.writeText(`https://${link}`)
                    .catch(() => {});
                  setCopied(true);
                  window.setTimeout(() => setCopied(false), 1200);
                }}
                className="inline-flex items-center gap-1 text-[11px] text-neutral-400 hover:text-neutral-100"
              >
                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                {copied ? "copied" : "copy"}
              </button>
            </div>
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-neutral-500">
              On channel B
            </div>
            <div className="mt-1 flex items-baseline gap-2 pb-2 border-b border-neutral-900">
              <span className="font-mono text-[12px] text-neutral-200 truncate flex-1">
                {pass}
              </span>
              <span
                className="text-[10px] uppercase tracking-[0.25em]"
                style={{ color: ACCENT }}
              >
                separate
              </span>
            </div>
          </div>
        </div>
        <div className="mt-4 text-[11px] font-mono text-neutral-500 leading-relaxed">
          The two strings unlock the project together. Apart, they're a
          URL and three English words, doing nothing in particular.
        </div>
      </div>
      <figcaption className="mt-3 text-[10px] font-mono uppercase tracking-[0.25em] text-neutral-500">
        Fig. II · invite — link &amp; passphrase
      </figcaption>
    </figure>
  );
}

// ── Movement III — The wire & the ledger ──────────────────────────────────

function WireAndLedgerMovement() {
  return (
    <section>
      <Shell>
        <div className="max-w-2xl">
          <SectionLabel n="III">The wire & the ledger</SectionLabel>
          <h2 className="mt-5 text-3xl md:text-5xl font-semibold text-neutral-100 leading-[1.08] tracking-tight">
            <span className="text-neutral-100">One click for GitHub.</span>{" "}
            <span className="text-neutral-500">
              Every save, on the record.
            </span>
          </h2>
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-14">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-[0.25em] text-neutral-500">
              The wire
            </div>
            <p className="mt-3 text-[16px] text-neutral-400 leading-[1.75]">
              The GitHub Actions integration is one button. Your browser
              re-encrypts each value against the target repository's
              libsodium sealed-box public key — the same primitive
              GitHub's own CLI uses — and forwards the ciphertext. We
              are the courier. GitHub is the recipient. The plaintext
              lived only in the tab that started it.
            </p>
            <SmallList
              items={[
                "Re-encrypt locally",
                "Forward as ciphertext",
                "GitHub stores it like its own UI did",
              ]}
            />
          </div>
          <div>
            <div className="text-[11px] font-mono uppercase tracking-[0.25em] text-neutral-500">
              The ledger
            </div>
            <p className="mt-3 text-[16px] text-neutral-400 leading-[1.75]">
              Every save becomes a signed diff in the project's history.
              Search by author, by substring, by what was added or
              removed across months of rotations. The server returns the
              matching ciphertexts; your browser decrypts and renders
              them. It is the only audit log we know of that we cannot
              read.
            </p>
            <SmallList
              items={[
                "Search by who and what",
                "Filter by time",
                "Decrypted in your tab",
              ]}
            />
          </div>
        </div>
      </Shell>
    </section>
  );
}

function SmallList({ items }: { items: string[] }) {
  return (
    <ul className="mt-5 space-y-1.5 font-mono text-[12px] text-neutral-300">
      {items.map((it, i) => (
        <li key={i} className="flex items-baseline gap-3">
          <span style={{ color: ACCENT }} className="text-[10px]">
            ◦
          </span>
          <span>{it}</span>
        </li>
      ))}
    </ul>
  );
}

// ── Pull quote ────────────────────────────────────────────────────────────

function PullQuote() {
  return (
    <section className="py-14">
      <Shell>
        <motion.blockquote
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9 }}
          className="font-serif italic text-2xl md:text-[28px] text-neutral-200 leading-[1.45] tracking-tight max-w-3xl"
        >
          &ldquo;The fastest way to lose a customer's trust is to be
          able to read what they trusted you with. We removed ourselves
          from that conversation entirely.&rdquo;
        </motion.blockquote>
        <div className="mt-6 text-[11px] font-mono uppercase tracking-[0.25em] text-neutral-500">
          — From the founding note
        </div>
      </Shell>
    </section>
  );
}

// ── Coda ──────────────────────────────────────────────────────────────────

function Coda() {
  return (
    <section className="py-24">
      <Shell>
        <motion.h2
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9 }}
          className="text-3xl md:text-5xl font-semibold text-neutral-100 leading-[1.05] tracking-tight max-w-3xl"
        >
          The reading room closes here. The vault opens at the next click.
        </motion.h2>
        <p className="mt-6 text-lg text-neutral-400 leading-[1.7] max-w-xl">
          Sign in with GitHub, mint a passphrase in the browser, paste your
          first value. The ritual takes under three minutes; the
          subscription is and remains free.
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-3">
          <PrimaryCTA>
            Open the dashboard
            <ArrowRight className="h-4 w-4" />
          </PrimaryCTA>
          <GhostCTA href="https://github.com/cryptly-dev/cryptly">
            <GitHubIcon className="h-4 w-4" />
            Read the source
          </GhostCTA>
          <GhostCTA href="/blog">The blog</GhostCTA>
        </div>
      </Shell>
    </section>
  );
}

function Colophon() {
  return (
    <footer className="pb-16">
      <Shell>
        <div className="border-t border-neutral-900 pt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-2 text-[11px] font-mono uppercase tracking-[0.25em] text-neutral-600">
          <span className="inline-flex items-center gap-2.5">
            <Pin />
            <span>Cryptly · the reading room · MIT</span>
          </span>
          <span className="normal-case tracking-normal text-neutral-500 italic font-serif">
            Set quietly. Printed in black.
          </span>
        </div>
      </Shell>
    </footer>
  );
}

export function VariantF() {
  return (
    <div className="min-h-screen bg-black text-neutral-100 overflow-x-hidden">
      <Header />
      <Hero />
      <Rule />
      <VaultMovement />
      <Rule />
      <InviteMovement />
      <Rule />
      <WireAndLedgerMovement />
      <Rule />
      <PullQuote />
      <Rule />
      <Coda />
      <Colophon />
    </div>
  );
}
