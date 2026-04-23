import { GitHubIcon } from "@/components/ui/GitHubIcon";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";

/* ────────────────────────────────────────────────────────────────────────────
 * VARIANT D — "The Brief"
 * One quiet long-form. Three movements. Strict black & white.
 * A measured half-step up from A/B in density; not in volume.
 * ──────────────────────────────────────────────────────────────────────────── */

function Shell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto max-w-2xl px-6", className)}>{children}</div>
  );
}

function Letterhead() {
  return (
    <div className="border-b border-neutral-900">
      <Shell>
        <div className="flex items-center justify-between h-16 text-[11px] font-mono tracking-[0.25em] uppercase text-neutral-500">
          <span>Cryptly</span>
          <span className="hidden sm:inline">A short brief, on a small vault</span>
          <span>№ IV</span>
        </div>
      </Shell>
    </div>
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
    <section className="pt-24 md:pt-36">
      <Shell>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9 }}
          className="text-[11px] font-mono uppercase tracking-[0.25em] text-neutral-500"
        >
          A brief — on the vault, the invite, the wire, the ledger.
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.1 }}
          className="mt-8 text-5xl md:text-6xl lg:text-7xl font-semibold text-neutral-100 leading-[1] tracking-tight"
        >
          A vault we cannot read,
          <br />
          for a price we won't charge.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, delay: 0.5 }}
          className="mt-10 text-lg text-neutral-400 leading-relaxed max-w-xl"
        >
          Cryptly is a small secrets manager built so its operators
          — that's us — physically cannot decrypt your values. Open
          source. Free. What follows is a brief on how that works,
          in three movements.
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, delay: 0.8 }}
          className="mt-12 flex flex-wrap items-center gap-3"
        >
          <PrimaryCTA>
            <span>Open the dashboard</span>
            <ArrowRight className="h-4 w-4" />
          </PrimaryCTA>
          <GhostCTA href="https://github.com/cryptly-dev/cryptly">
            <GitHubIcon className="h-4 w-4" />
            <span>Read the source</span>
          </GhostCTA>
          <GhostCTA href="/blog">
            <span>The blog</span>
          </GhostCTA>
        </motion.div>
      </Shell>
    </section>
  );
}

function Movement({
  numeral,
  kicker,
  title,
  children,
  delay = 0,
}: {
  numeral: string;
  kicker: string;
  title: React.ReactNode;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.9, delay }}
      className="py-20 md:py-28"
    >
      <Shell>
        <div className="text-[11px] font-mono uppercase tracking-[0.25em] text-neutral-500">
          <span className="font-serif italic text-neutral-400 normal-case tracking-normal">
            {numeral}.
          </span>
          <span className="ml-3">{kicker}</span>
        </div>
        <h2 className="mt-6 text-3xl md:text-5xl font-semibold text-neutral-100 leading-[1.08] tracking-tight">
          {title}
        </h2>
        <div className="mt-8 text-[17px] text-neutral-400 leading-[1.7] space-y-5">
          {children}
        </div>
      </Shell>
    </motion.section>
  );
}

function Rule() {
  return (
    <div className="mx-auto max-w-2xl px-6">
      <div className="border-t border-neutral-900" />
    </div>
  );
}

function PullQuote() {
  return (
    <section className="py-20 md:py-28">
      <Shell>
        <motion.blockquote
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="font-serif italic text-2xl md:text-[28px] text-neutral-200 leading-[1.45] tracking-tight"
        >
          &ldquo;A secrets manager that can read its users' secrets is
          a honeypot. We removed ourselves from the threat model in
          the most literal way available — we made it impossible.&rdquo;
        </motion.blockquote>
        <div className="mt-6 text-[11px] font-mono uppercase tracking-[0.25em] text-neutral-500">
          — From the founding note
        </div>
      </Shell>
    </section>
  );
}

function Coda() {
  return (
    <section className="py-24 md:py-32">
      <Shell>
        <motion.h2
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9 }}
          className="text-3xl md:text-5xl font-semibold text-neutral-100 leading-[1.05] tracking-tight"
        >
          Three minutes, one passphrase, one quiet vault.
        </motion.h2>
        <p className="mt-6 text-lg text-neutral-400 leading-relaxed">
          Sign in with GitHub. Mint a passphrase in your browser. Paste
          your first value and you're done. The vault is yours, the
          knowledge is yours, the cost is none.
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-3">
          <PrimaryCTA>
            <span>Begin</span>
            <ArrowRight className="h-4 w-4" />
          </PrimaryCTA>
          <GhostCTA href="https://github.com/cryptly-dev/cryptly">
            <GitHubIcon className="h-4 w-4" />
            <span>Read the source</span>
          </GhostCTA>
          <GhostCTA href="/blog">
            <span>The blog</span>
          </GhostCTA>
        </div>
      </Shell>
    </section>
  );
}

function Colophon() {
  return (
    <footer className="pb-16">
      <Shell>
        <div className="border-t border-neutral-900 pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-[11px] font-mono uppercase tracking-[0.25em] text-neutral-600">
          <span>Cryptly · MIT · 2026</span>
          <span className="normal-case tracking-normal text-neutral-500">
            No plaintext was held in the writing of this brief.
          </span>
        </div>
      </Shell>
    </footer>
  );
}

export function VariantD() {
  return (
    <div className="min-h-screen bg-black text-neutral-100 overflow-x-hidden">
      <Letterhead />
      <Hero />
      <Rule />
      <Movement
        numeral="I"
        kicker="The vault"
        title={
          <>
            Encryption happens before the wire.
            <br />
            <span className="text-neutral-500">Pricing happens never.</span>
          </>
        }
      >
        <p>
          Every value you save is wrapped in AES-256-GCM by your browser,
          using a key derived — locally — from a passphrase you never
          tell us. The server receives ciphertext, stores ciphertext,
          and would have nothing to volunteer if compelled. It is, in
          the polite phrasing, a zero-knowledge system; in the impolite
          phrasing, ours is a database full of noise.
        </p>
        <p>
          The price for this service is zero dollars, in every plan,
          forever. There is no team tier to upgrade to because there
          is no personal tier to upgrade from. There is one tier,
          and it is the free one.
        </p>
      </Movement>

      <Rule />

      <Movement
        numeral="II"
        kicker="The invitation"
        title={
          <>
            Two channels, one handshake,
            <br />
            <span className="text-neutral-500">
              never any plaintext on our side.
            </span>
          </>
        }
        delay={0.05}
      >
        <p>
          To bring a teammate into a project, Cryptly mints a one-time
          link and a separate passphrase. Send each through a different
          channel — a stolen link alone unlocks nothing. Once accepted,
          the project key is re-wrapped for the new member's public key
          inside their browser; the server moves wrapped bytes only.
        </p>
        <p>
          Two further methods sit alongside. You can invite a
          teammate you've already collaborated with in Cryptly, picked
          from a quiet suggested list. Whole-team invitations — entire
          org units in one stroke — arrive in Q3.
        </p>
      </Movement>

      <Rule />

      <Movement
        numeral="III"
        kicker="The wire & the ledger"
        title={
          <>
            One click for GitHub Actions.
            <br />
            <span className="text-neutral-500">
              Every save, on the record.
            </span>
          </>
        }
        delay={0.1}
      >
        <p>
          The GitHub Actions integration is a single button. Your browser
          re-encrypts each value against the target repository's public
          key — the same libsodium primitive GitHub's own CLI uses — and
          forwards the ciphertext. We are the courier. GitHub is the
          recipient. Plaintext lived only in the tab that started it
          and the runner that uses it.
        </p>
        <p>
          Every save is also a signed diff in the project's history.
          Search by author, by word, by what was added or removed,
          across months of rotations. The server returns the matching
          ciphertexts; your browser decrypts and renders them. The
          ledger is yours, the answer is yours; we supplied only the
          shelving.
        </p>
      </Movement>

      <Rule />

      <PullQuote />
      <Rule />

      <Coda />
      <Colophon />
    </div>
  );
}
