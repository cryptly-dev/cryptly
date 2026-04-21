import Beams from "@/components/Beams";
import {
  ArrowRight,
  Book,
  FileText,
  Gavel,
  Lock,
  ShieldAlert,
  ShieldCheck,
  X,
} from "lucide-react";
import { useMemo } from "react";
import { fakeCiphertext, GhostCTA, PrimaryCTA, SectionShell } from "../common";

/* ────────────────────────────────────────────────────────────────────────────
 * VARIANT A4 — "What We Can't Read"
 * Formula A · Narrative built around our inability as the product.
 * Angle: Subpoena / compelled disclosure scenario. Inability as a feature.
 * ──────────────────────────────────────────────────────────────────────────── */

function A4Hero() {
  return (
    <section className="relative min-h-[95vh] flex items-center justify-center overflow-hidden bg-black">
      <div className="absolute inset-0 z-0 opacity-60">
        <Beams
          beamWidth={2}
          beamHeight={30}
          beamNumber={20}
          lightColor="#ffffff"
          speed={2}
          noiseIntensity={1.75}
          scale={0.2}
          rotation={30}
        />
      </div>
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/80 via-black/50 to-black" />

      <div className="relative z-10 mx-auto max-w-5xl w-full px-6 py-24">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[11px] font-medium uppercase tracking-[0.22em] bg-neutral-900 text-neutral-300 border-neutral-700">
          <Gavel className="h-3 w-3" />
          subpoena response, drafted
        </div>
        <h1 className="mt-6 text-5xl md:text-7xl font-semibold text-neutral-100 leading-[1.02] tracking-tight max-w-3xl">
          A subpoena to our database returns noise.
        </h1>
        <p className="mt-7 text-lg md:text-xl text-neutral-400 max-w-2xl leading-relaxed">
          Because we do not possess the key. Because the key never touched our
          servers. Because 'we can't' is engineered, not promised.
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-3">
          <PrimaryCTA href="/app/login">
            <span>Get the same guarantee</span>
            <ArrowRight className="h-4 w-4" />
          </PrimaryCTA>
          <GhostCTA href="#subpoena">
            <FileText className="h-4 w-4" />
            <span>Read the draft</span>
          </GhostCTA>
        </div>
      </div>
    </section>
  );
}

function A4StatusQuo() {
  return (
    <SectionShell>
      <div className="max-w-3xl mx-auto flex items-center gap-3 mb-6 text-[11px] uppercase tracking-[0.28em]">
        <span className="text-neutral-600 tabular-nums">01 · THE ASSUMPTION</span>
        <span className="h-px flex-1 bg-neutral-900" />
      </div>
      <div className="max-w-3xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-[1.1]">
          Every other vault promises to be good.
        </h2>
        <p className="mt-6 text-lg text-neutral-400 leading-relaxed">
          Promises are a kind of architecture — a very fragile one. Good
          intentions. Good processes. Good employees. Nothing mechanical
          stopping the vendor from reading what you gave them.
        </p>
      </div>

      <div className="mt-12 max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/[0.02] p-5">
          <div className="flex items-center gap-2 text-rose-300 text-sm font-semibold">
            <X className="h-4 w-4" />
            Vendor-side plaintext
          </div>
          <div className="mt-2 text-sm text-neutral-400 leading-relaxed">
            A rogue admin, a compromise, a subpoena — all of them collect
            plaintext.
          </div>
        </div>
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/[0.02] p-5">
          <div className="flex items-center gap-2 text-rose-300 text-sm font-semibold">
            <X className="h-4 w-4" />
            Policy as security
          </div>
          <div className="mt-2 text-sm text-neutral-400 leading-relaxed">
            'We won't read your data' sits beside a database that physically
            can.
          </div>
        </div>
      </div>
    </SectionShell>
  );
}

function A4Tension() {
  return (
    <div id="subpoena">
      <SectionShell>
        <div className="max-w-3xl mx-auto flex items-center gap-3 mb-6 text-[11px] uppercase tracking-[0.28em]">
          <span className="text-neutral-600 tabular-nums">02 · THE SCENARIO</span>
          <span className="h-px flex-1 bg-neutral-900" />
        </div>
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-[1.1]">
            A court compels us to hand over your project.
          </h2>
        </div>

        <div className="mt-14 max-w-4xl mx-auto">
          <div className="rounded-2xl border border-neutral-800 bg-neutral-950 overflow-hidden">
            <div className="px-5 py-4 border-b border-neutral-900 flex items-center gap-3">
              <FileText className="h-4 w-4 text-neutral-400" />
              <div className="text-xs text-neutral-400 font-mono">
                RE: Cryptly Inc. — Project Data Request #38492
              </div>
              <div className="ml-auto text-[10px] uppercase tracking-wider text-neutral-500">
                draft · public
              </div>
            </div>
            <div className="p-6 md:p-8 space-y-5 text-neutral-300 text-[15px] leading-relaxed">
              <p>To whom it may concern,</p>
              <p>
                Pursuant to your request dated <em>[redacted]</em>, please find
                attached the full contents of the database rows associated with
                the requested project identifier.
              </p>
              <p className="text-neutral-400">
                The attached values represent AES-256-GCM ciphertext, encrypted
                client-side with a passphrase derived key that has never been
                transmitted to or stored on our infrastructure. We are
                architecturally unable to produce the plaintext. No employee,
                process, or system at Cryptly possesses the decryption key.
              </p>
              <p className="text-neutral-400">
                Any further requests must be directed to the party in possession
                of the passphrase.
              </p>
              <p>Sincerely,</p>
              <p className="text-neutral-400 italic">Cryptly Inc.</p>
            </div>
          </div>
        </div>
      </SectionShell>
    </div>
  );
}

function A4NewWorld() {
  return (
    <SectionShell>
      <div className="max-w-3xl mx-auto flex items-center gap-3 mb-6 text-[11px] uppercase tracking-[0.28em]">
        <span className="text-neutral-600 tabular-nums">03 · THE WORLD</span>
        <span className="h-px flex-1 bg-neutral-900" />
      </div>
      <div className="max-w-3xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-[1.1]">
          You keep the keys. We keep the bytes.
        </h2>
        <p className="mt-6 text-lg text-neutral-400 leading-relaxed">
          The separation isn't policy. It's math. Here's what that looks like
          from both sides.
        </p>
      </div>

      <div className="mt-16 max-w-5xl mx-auto grid md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.03] p-8">
          <div className="flex items-center gap-2 text-emerald-300">
            <ShieldCheck className="h-5 w-5" />
            <div className="text-sm uppercase tracking-wider font-semibold">
              What you get
            </div>
          </div>
          <ul className="mt-6 space-y-3 text-neutral-300 text-[15px]">
            <li>— Full plaintext access in-browser</li>
            <li>— Signed diff history, decrypted client-side</li>
            <li>— One-click GitHub Actions sync</li>
            <li>— Team members you can add or revoke</li>
          </ul>
        </div>
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950/60 p-8">
          <div className="flex items-center gap-2 text-neutral-400">
            <ShieldAlert className="h-5 w-5" />
            <div className="text-sm uppercase tracking-wider font-semibold">
              What we get
            </div>
          </div>
          <ul className="mt-6 space-y-3 text-neutral-400 text-[15px]">
            <li>— A ciphertext blob</li>
            <li>— A timestamp</li>
            <li>— A project ID</li>
            <li>— Nothing else</li>
          </ul>
        </div>
      </div>
    </SectionShell>
  );
}

function A4Bridge() {
  return (
    <SectionShell>
      <div className="max-w-3xl mx-auto flex items-center gap-3 mb-6 text-[11px] uppercase tracking-[0.28em]">
        <span className="text-neutral-600 tabular-nums">04 · BRIDGE</span>
        <span className="h-px flex-1 bg-neutral-900" />
      </div>
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-[1.1]">
          Cryptly is how that subpoena response becomes plausible.
        </h2>
        <p className="mt-6 text-lg text-neutral-400 max-w-2xl mx-auto leading-relaxed">
          Three primitives, a browser, a server full of noise. That's it.
        </p>
      </div>

      <div className="mt-16 max-w-4xl mx-auto grid md:grid-cols-3 gap-4">
        {[
          {
            k: "AES-256-GCM",
            v: "symmetric encryption, in your browser, for the vault payload",
          },
          {
            k: "PBKDF2-SHA256",
            v: "your passphrase becomes a key — never a request body",
          },
          {
            k: "RSA-OAEP",
            v: "re-wrap the vault key for each teammate, client-side",
          },
        ].map((p) => (
          <div
            key={p.k}
            className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6"
          >
            <div className="font-mono text-xs text-sky-400">{p.k}</div>
            <p className="mt-3 text-sm text-neutral-400 leading-relaxed">
              {p.v}
            </p>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

function A4Proof() {
  const dump = useMemo(() => fakeCiphertext("a4-proof-subpoena", 1600), []);
  return (
    <SectionShell>
      <div className="max-w-3xl mx-auto flex items-center gap-3 mb-6 text-[11px] uppercase tracking-[0.28em]">
        <span className="text-neutral-600 tabular-nums">05 · THE PROOF</span>
        <span className="h-px flex-1 bg-neutral-900" />
      </div>
      <div className="max-w-3xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-[1.1]">
          Here is the attachment we'd hand a court.
        </h2>
      </div>

      <div className="mt-14 max-w-4xl mx-auto rounded-2xl border border-neutral-900 bg-neutral-950/60 overflow-hidden">
        <div className="px-4 py-3 border-b border-neutral-900 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-neutral-400">
            <Lock className="h-3.5 w-3.5" />
            <span className="font-mono">
              subpoena_response_attachment_01.bin
            </span>
          </div>
          <span className="text-[10px] uppercase tracking-wider text-neutral-600">
            1.6 KiB · raw
          </span>
        </div>
        <div
          className="p-5 md:p-6 font-mono text-[11px] md:text-[12px] leading-5 text-neutral-500 break-all"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 6,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {dump}
        </div>
      </div>
    </SectionShell>
  );
}

function A4CTA() {
  return (
    <SectionShell>
      <div className="max-w-3xl mx-auto flex items-center gap-3 mb-6 text-[11px] uppercase tracking-[0.28em]">
        <span className="text-neutral-600 tabular-nums">06 · YOUR MOVE</span>
        <span className="h-px flex-1 bg-neutral-900" />
      </div>
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-semibold text-neutral-100 tracking-tight leading-[1.05]">
          Move your secrets behind a wall we can't see over.
        </h2>
        <p className="mt-5 text-neutral-400 text-lg leading-relaxed">
          Create a vault. Set a passphrase. The only person who can read your
          secrets is you. That's the pitch.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <PrimaryCTA href="/app/login">
            <span>Create a vault</span>
            <ArrowRight className="h-4 w-4" />
          </PrimaryCTA>
          <GhostCTA href="/blog">
            <Book className="h-4 w-4" />
            <span>Read the whitepaper</span>
          </GhostCTA>
        </div>
      </div>
    </SectionShell>
  );
}

export function VariantA4() {
  return (
    <div className="min-h-screen bg-black text-neutral-100 pb-24 overflow-x-hidden">
      <A4Hero />
      <A4StatusQuo />
      <A4Tension />
      <A4NewWorld />
      <A4Bridge />
      <A4Proof />
      <A4CTA />
    </div>
  );
}
