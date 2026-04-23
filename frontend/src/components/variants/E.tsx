import { GitHubIcon } from "@/components/ui/GitHubIcon";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";

/* ────────────────────────────────────────────────────────────────────────────
 * VARIANT E — "The Folio"
 * Five quiet plates, in the manner of an exhibition catalogue.
 * Strict black & white; thin SVG figures; wide margins.
 * One step denser than D — through structure, not through colour.
 * ──────────────────────────────────────────────────────────────────────────── */

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

function Header() {
  return (
    <header className="border-b border-neutral-900">
      <Shell>
        <div className="flex items-center justify-between h-16 text-[11px] font-mono tracking-[0.25em] uppercase text-neutral-500">
          <span>Cryptly · folio</span>
          <span className="hidden md:inline">Five plates · printed in black</span>
          <span>2026</span>
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

function Hero() {
  return (
    <section className="pt-24 md:pt-32">
      <Shell>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-14 items-end">
          <div className="md:col-span-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.9 }}
              className="text-[11px] font-mono uppercase tracking-[0.25em] text-neutral-500"
            >
              An exhibit, in five plates
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.1, delay: 0.1 }}
              className="mt-6 text-5xl md:text-7xl font-semibold text-neutral-100 leading-[1] tracking-tight"
            >
              A vault, drawn quietly,
              <br />
              from five sides.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.9, delay: 0.4 }}
              className="mt-8 text-lg text-neutral-400 max-w-xl leading-[1.7]"
            >
              Each plate that follows shows one face of Cryptly: how a
              secret is held, how it is shared, how it is shipped, how it
              is recalled, and what it costs. Together they form the
              brief.
            </motion.p>
          </div>
          <motion.aside
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="md:col-span-4"
          >
            <div className="border-t border-neutral-800 pt-5 space-y-3 text-[12px] font-mono text-neutral-500 leading-relaxed">
              <Definition k="Custody">in the browser, alone</Definition>
              <Definition k="Cipher">aes-256-gcm</Definition>
              <Definition k="Source">open · MIT</Definition>
              <Definition k="Price">none, in any currency</Definition>
            </div>
          </motion.aside>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, delay: 0.7 }}
          className="mt-12 flex flex-wrap items-center gap-3"
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
      </Shell>
    </section>
  );
}

function Definition({ k, children }: { k: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline gap-3">
      <dt className="w-20 text-[10px] uppercase tracking-[0.25em] text-neutral-600 shrink-0">
        {k}
      </dt>
      <dd className="text-neutral-300">{children}</dd>
    </div>
  );
}

function PlateRule({ label }: { label: string }) {
  return (
    <div className="mx-auto max-w-5xl px-6 mt-24 mb-10">
      <div className="flex items-center gap-4">
        <span className="h-px flex-1 bg-neutral-900" />
        <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-neutral-600">
          {label}
        </span>
        <span className="h-px flex-1 bg-neutral-900" />
      </div>
    </div>
  );
}

function Plate({
  numeral,
  caption,
  title,
  children,
  figure,
  side = "right",
}: {
  numeral: string;
  caption: string;
  title: React.ReactNode;
  children: React.ReactNode;
  figure: React.ReactNode;
  side?: "left" | "right";
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.9 }}
      className="py-6 md:py-10"
    >
      <Shell>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-14 items-start">
          <div
            className={cn(
              "md:col-span-7 order-2",
              side === "left" ? "md:order-2" : "md:order-1"
            )}
          >
            <div className="flex items-baseline gap-4 text-[11px] font-mono uppercase tracking-[0.25em] text-neutral-500">
              <span className="font-serif italic text-neutral-400 normal-case tracking-normal">
                Plate {numeral}.
              </span>
              <span>{caption}</span>
            </div>
            <h2 className="mt-5 text-3xl md:text-5xl font-semibold text-neutral-100 leading-[1.08] tracking-tight">
              {title}
            </h2>
            <div className="mt-6 text-[16px] text-neutral-400 leading-[1.7] space-y-4">
              {children}
            </div>
          </div>
          <div
            className={cn(
              "md:col-span-5 order-1",
              side === "left" ? "md:order-1" : "md:order-2"
            )}
          >
            <FigureFrame numeral={numeral} caption={caption}>
              {figure}
            </FigureFrame>
          </div>
        </div>
      </Shell>
    </motion.section>
  );
}

function FigureFrame({
  numeral,
  caption,
  children,
}: {
  numeral: string;
  caption: string;
  children: React.ReactNode;
}) {
  return (
    <figure className="select-none">
      <div className="border border-neutral-800 p-6 md:p-8 aspect-[5/4] grid place-items-center">
        {children}
      </div>
      <figcaption className="mt-3 flex items-baseline justify-between text-[10px] font-mono uppercase tracking-[0.25em] text-neutral-500">
        <span>Fig. {numeral}</span>
        <span className="normal-case tracking-normal text-neutral-500 italic font-serif">
          {caption}
        </span>
      </figcaption>
    </figure>
  );
}

// ── Figures ─────────────────────────────────────────────────────────────────

function FigureI() {
  return (
    <svg viewBox="0 0 240 180" className="w-full h-auto">
      <g stroke="#525252" fill="none" strokeWidth="1">
        <rect x="20" y="30" width="200" height="120" />
        <line x1="20" y1="60" x2="220" y2="60" />
      </g>
      <g
        fontFamily="ui-monospace, monospace"
        fontSize="9"
        fill="#a3a3a3"
        letterSpacing="0.02em"
      >
        <text x="30" y="50">id</text>
        <text x="80" y="50">project</text>
        <text x="140" y="50">created</text>
        <text x="190" y="50">blob</text>

        <text x="30" y="80" fill="#737373">
          sec_7mFq2…
        </text>
        <text x="80" y="80" fill="#737373">
          prj_k2L7p
        </text>
        <text x="140" y="80" fill="#737373">
          1745…
        </text>
        <text x="190" y="80" fill="#e5e5e5">
          u2l9aFZ…
        </text>

        <text x="30" y="100" fill="#525252">
          —
        </text>
        <text x="80" y="100" fill="#525252">
          —
        </text>
        <text x="140" y="100" fill="#525252">
          —
        </text>
        <text x="190" y="100" fill="#525252">
          —
        </text>

        <text x="30" y="130" fill="#525252">
          (no column for plaintext)
        </text>
      </g>
    </svg>
  );
}

function FigureII() {
  return (
    <svg viewBox="0 0 240 180" className="w-full h-auto">
      <defs>
        <marker
          id="e2-arrow"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto"
        >
          <path d="M0,0 L10,5 L0,10 z" fill="#a3a3a3" />
        </marker>
      </defs>
      <g stroke="#525252" fill="none">
        <rect x="20" y="30" width="80" height="40" />
        <rect x="20" y="110" width="80" height="40" />
        <rect x="160" y="70" width="60" height="40" />
      </g>
      <g
        fontFamily="ui-monospace, monospace"
        fontSize="9"
        fill="#d4d4d4"
        textAnchor="middle"
      >
        <text x="60" y="55">link</text>
        <text x="60" y="135">passphrase</text>
        <text x="190" y="95">teammate</text>
      </g>
      <g
        stroke="#a3a3a3"
        strokeWidth="0.8"
        fill="none"
        markerEnd="url(#e2-arrow)"
      >
        <path d="M100 50 Q 130 60 160 85" />
        <path d="M100 130 Q 130 120 160 100" />
      </g>
      <g
        fontFamily="ui-monospace, monospace"
        fontSize="8"
        fill="#737373"
      >
        <text x="120" y="48" textAnchor="middle">
          channel A
        </text>
        <text x="120" y="138" textAnchor="middle">
          channel B
        </text>
      </g>
    </svg>
  );
}

function FigureIII() {
  return (
    <svg viewBox="0 0 240 180" className="w-full h-auto">
      <defs>
        <marker
          id="e3-arrow"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto"
        >
          <path d="M0,0 L10,5 L0,10 z" fill="#a3a3a3" />
        </marker>
      </defs>
      <g stroke="#525252" fill="none">
        <rect x="20" y="60" width="60" height="40" />
        <rect x="100" y="60" width="60" height="40" />
        <rect x="180" y="60" width="50" height="40" />
      </g>
      <g
        fontFamily="ui-monospace, monospace"
        fontSize="9"
        fill="#d4d4d4"
        textAnchor="middle"
      >
        <text x="50" y="85">browser</text>
        <text x="130" y="85">cryptly</text>
        <text x="205" y="85">github</text>
      </g>
      <g
        stroke="#a3a3a3"
        strokeWidth="0.8"
        fill="none"
        markerEnd="url(#e3-arrow)"
      >
        <line x1="80" y1="80" x2="100" y2="80" />
        <line x1="160" y1="80" x2="180" y2="80" />
      </g>
      <g
        fontFamily="ui-monospace, monospace"
        fontSize="8"
        fill="#737373"
        textAnchor="middle"
      >
        <text x="90" y="68">sealed</text>
        <text x="170" y="68">forwarded</text>
      </g>
      <g
        fontFamily="ui-monospace, monospace"
        fontSize="8"
        fill="#525252"
        textAnchor="middle"
      >
        <text x="130" y="130">re-encrypted in your tab</text>
      </g>
    </svg>
  );
}

function FigureIV() {
  return (
    <svg viewBox="0 0 240 180" className="w-full h-auto">
      <g stroke="#525252" fill="none">
        <line x1="30" y1="100" x2="210" y2="100" />
      </g>
      <g
        fontFamily="ui-monospace, monospace"
        fontSize="8"
        fill="#737373"
        textAnchor="middle"
      >
        {[
          { x: 40, t: "now" },
          { x: 80, t: "−1h" },
          { x: 120, t: "−1d" },
          { x: 160, t: "−7d" },
          { x: 200, t: "−30d" },
        ].map((m) => (
          <g key={m.x}>
            <line
              x1={m.x}
              y1="96"
              x2={m.x}
              y2="104"
              stroke="#525252"
              strokeWidth="0.8"
            />
            <text x={m.x} y="118">
              {m.t}
            </text>
          </g>
        ))}
      </g>
      <g fill="#e5e5e5">
        <circle cx="40" cy="100" r="3" />
        <circle cx="50" cy="100" r="2.4" />
        <circle cx="80" cy="100" r="3" />
        <circle cx="120" cy="100" r="3" />
        <circle cx="135" cy="100" r="2" />
        <circle cx="160" cy="100" r="2.4" />
        <circle cx="200" cy="100" r="2" />
      </g>
      <g
        fontFamily="ui-monospace, monospace"
        fontSize="8"
        fill="#a3a3a3"
      >
        <text x="40" y="80" textAnchor="middle">
          Alex
        </text>
        <text x="80" y="80" textAnchor="middle">
          Marcus
        </text>
        <text x="120" y="80" textAnchor="middle">
          Priya
        </text>
        <text x="160" y="80" textAnchor="middle">
          Nina
        </text>
      </g>
      <g
        fontFamily="ui-monospace, monospace"
        fontSize="8"
        fill="#525252"
        textAnchor="middle"
      >
        <text x="120" y="160">each save signed, each save searchable</text>
      </g>
    </svg>
  );
}

function FigureV() {
  return (
    <div className="text-center">
      <div
        className="font-semibold text-neutral-100 tracking-tighter leading-none"
        style={{ fontSize: "clamp(4rem, 9vw, 7rem)" }}
      >
        $0
      </div>
      <div className="mt-3 text-[10px] font-mono uppercase tracking-[0.25em] text-neutral-500">
        per seat · per year · per anything
      </div>
    </div>
  );
}

// ── Sections ───────────────────────────────────────────────────────────────

function PlateBody() {
  return (
    <>
      <PlateRule label="Plate I · The vault" />
      <Plate
        numeral="I"
        caption="What the database holds"
        title={
          <>
            One row, three indexes,
            <br />
            <span className="text-neutral-500">no column for the value.</span>
          </>
        }
        figure={<FigureI />}
        side="left"
      >
        <p>
          Every value you save is wrapped in AES-256-GCM by your browser
          before it leaves the tab. Our database stores an opaque blob;
          there is no second column where the plaintext lives, no
          function to produce it on demand, no master key in our vault
          to undo what your tab has done.
        </p>
        <p>
          The arrangement is deliberate. A subpoena, a leaked tape, a
          rogue hire — none gain anything they didn't already have. The
          system is zero-knowledge by construction, not by promise.
        </p>
      </Plate>

      <PlateRule label="Plate II · The invitation" />
      <Plate
        numeral="II"
        caption="One handshake, two channels"
        title={
          <>
            A link on one channel.
            <br />
            <span className="text-neutral-500">A passphrase on another.</span>
          </>
        }
        figure={<FigureII />}
      >
        <p>
          To bring a teammate aboard, Cryptly mints a one-time link and
          a separate passphrase. They travel on different channels — a
          stolen link alone unlocks nothing. Once accepted, the project
          key is re-wrapped for the new member's public key inside their
          browser. Our server moves wrapped bytes only.
        </p>
        <p>
          You may also pick from a quiet list of teammates you've
          already worked with. Whole-team invitations — entire org units
          in one stroke — follow in Q3.
        </p>
      </Plate>

      <PlateRule label="Plate III · The wire" />
      <Plate
        numeral="III"
        caption="GitHub Actions, in one click"
        title={
          <>
            Re-encrypt in your tab,
            <br />
            <span className="text-neutral-500">forward to GitHub.</span>
          </>
        }
        figure={<FigureIII />}
        side="left"
      >
        <p>
          The GitHub Actions integration is a single button. Cryptly
          re-encrypts each value against the target repository's
          libsodium sealed-box public key — the same primitive GitHub's
          own CLI uses — then forwards the ciphertext. We are the
          courier. GitHub is the recipient. The plaintext lived only
          in the tab that started it and the runner that uses it.
        </p>
      </Plate>

      <PlateRule label="Plate IV · The ledger" />
      <Plate
        numeral="IV"
        caption="Search the diff, by author or by word"
        title={
          <>
            Every save signed,
            <br />
            <span className="text-neutral-500">every change recallable.</span>
          </>
        }
        figure={<FigureIV />}
      >
        <p>
          Each save becomes a signed diff in the project's history.
          Search by author, by substring, by what was added or removed,
          across months of rotations. The server returns the matching
          ciphertexts; your browser decrypts and renders them. It is the
          only audit log we know of that we cannot read.
        </p>
      </Plate>

      <PlateRule label="Plate V · The reckoning" />
      <Plate
        numeral="V"
        caption="The plan, in one figure"
        title={
          <>
            Every plate above,
            <br />
            <span className="text-neutral-500">at no charge, indefinitely.</span>
          </>
        }
        figure={<FigureV />}
        side="left"
      >
        <p>
          Cryptly is free, for every feature, for every seat, for every
          plan. There is no team tier to upgrade to because there is no
          personal tier to upgrade from. Storage of ciphertext is
          inexpensive; the plaintext we don't have can't be mined.
        </p>
      </Plate>
    </>
  );
}

function Coda() {
  return (
    <section className="py-28">
      <Shell>
        <motion.h2
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9 }}
          className="text-3xl md:text-5xl font-semibold text-neutral-100 leading-[1.05] tracking-tight max-w-3xl"
        >
          The folio closes here. The vault begins on the next page.
        </motion.h2>
        <p className="mt-6 text-lg text-neutral-400 leading-[1.7] max-w-xl">
          Sign in with GitHub, mint a passphrase in the browser, paste your
          first value. The whole rite takes under three minutes and costs
          nothing — the plates above belong to your project from then on.
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
          <span>Cryptly · folio of five plates · MIT</span>
          <span className="normal-case tracking-normal text-neutral-500 italic font-serif">
            Set in Funnel Display, with Georgia for the italic asides.
          </span>
        </div>
      </Shell>
    </footer>
  );
}

export function VariantE() {
  return (
    <div className="min-h-screen bg-black text-neutral-100 overflow-x-hidden">
      <Header />
      <Hero />
      <PlateBody />
      <Coda />
      <Colophon />
    </div>
  );
}
