export type VariantFormula = "A" | "B" | "C" | "D";

export type VariantEntry = {
  slug: string;
  formula: VariantFormula;
  title: string;
  subtitle: string;
  hook: string;
};

export const VARIANTS: VariantEntry[] = [
  /* ─────────────────────────── A · LOSING / FORGETTING ─────────────────────────── */
  {
    slug: "a1",
    formula: "A",
    title: "The Orphaned Project",
    subtitle: "The secret lived with one person, and they left",
    hook: "The project nobody can deploy because Kamil left.",
  },
  {
    slug: "a2",
    formula: "A",
    title: "The Laptop That Died",
    subtitle: "Secrets on disk, disk in the recycling",
    hook: "Your DATABASE_URL lived on one MacBook. It's at the Apple Store now.",
  },
  {
    slug: "a3",
    formula: "A",
    title: "The Six-Month Gap",
    subtitle: "You come back, the .env doesn't",
    hook: "You opened a repo you hadn't touched since October. The .env is gone.",
  },
  {
    slug: "a4",
    formula: "A",
    title: "One Person's Head",
    subtitle: "Bus factor of one",
    hook: "The deploy key lives in one person's head. That person is in Patagonia.",
  },
  {
    slug: "a5",
    formula: "A",
    title: "The Notion Graveyard",
    subtitle: "Buried under two restructures",
    hook: "STRIPE_KEY was in a Notion page that got archived two restructures ago.",
  },
  {
    slug: "a6",
    formula: "A",
    title: "The Scrolled-Past Message",
    subtitle: "Retention ate the secret",
    hook: "The secret was in a Slack DM. Retention ate it last Thursday.",
  },
  {
    slug: "a7",
    formula: "A",
    title: "The Forgotten Passphrase",
    subtitle: "It was 'hunter2 plus the day'. Which day.",
    hook: "You changed the passphrase. Past-you didn't tell present-you what to.",
  },
  {
    slug: "a8",
    formula: "A",
    title: "The Acquired Company",
    subtitle: "The acquiring team asked. The acquired team is gone.",
    hook: "We bought the company. We did not buy the .env file.",
  },
  {
    slug: "a9",
    formula: "A",
    title: "The 3am Redeploy",
    subtitle: "You need the token now. It's in another timezone.",
    hook: "PRODUCTION_TOKEN is on a laptop that is currently asleep.",
  },
  {
    slug: "a10",
    formula: "A",
    title: "The Entry From 2022",
    subtitle: "Docs say 'ask James.' James left.",
    hook: "Redeploy a 2022 service. The README says ask James. James left in 2023.",
  },

  /* ─────────────────────────── B · QUIET / MANIFESTO ─────────────────────────── */
  {
    slug: "b1",
    formula: "B",
    title: "Axioms",
    subtitle: "Four postulates, then the product",
    hook: "Four things we hold to be true. The rest follows.",
  },
  {
    slug: "b2",
    formula: "B",
    title: "The Vow",
    subtitle: "Written as a promise, kept by construction",
    hook: "We promise this, and the architecture keeps the promise.",
  },
  {
    slug: "b3",
    formula: "B",
    title: "The Dictionary",
    subtitle: "Definitions, one word at a time",
    hook: "Zero-knowledge, defined.",
  },
  {
    slug: "b4",
    formula: "B",
    title: "Letters to an Engineer",
    subtitle: "Correspondence format, unhurried",
    hook: "A short letter, from us to the person reading the code.",
  },
  {
    slug: "b5",
    formula: "B",
    title: "Negative Space",
    subtitle: "What we don't store, don't see, don't have",
    hook: "The product is defined by what's missing.",
  },
  {
    slug: "b6",
    formula: "B",
    title: "The Koan",
    subtitle: "Small questions, careful answers",
    hook: "What cannot be stolen?",
  },
  {
    slug: "b7",
    formula: "B",
    title: "The Specification",
    subtitle: "RFC-style clarity",
    hook: "A small specification. Four sections. All true.",
  },
  {
    slug: "b8",
    formula: "B",
    title: "One Sentence",
    subtitle: "One claim, then the evidence",
    hook: "We cannot read your secrets. The rest of this page is why.",
  },
  {
    slug: "b9",
    formula: "B",
    title: "The Architecture",
    subtitle: "Three boundaries, described",
    hook: "Three boundaries. The passphrase does not cross any of them.",
  },
  {
    slug: "b10",
    formula: "B",
    title: "A Short Read",
    subtitle: "Chapters, unhurried",
    hook: "Five chapters. Eight minutes. One architecture.",
  },

  /* ─────────────────────────── C · THE LEGAL CORNER ─────────────────────────── */
  {
    slug: "c1",
    formula: "C",
    title: "The Exchange",
    subtitle: "A letter from a court, and our reply",
    hook: "The court wrote us a letter. We wrote one back.",
  },
  {
    slug: "c2",
    formula: "C",
    title: "The Transcript",
    subtitle: "A short court transcript, condensed",
    hook: "Court: produce the plaintext. Cryptly: we are unable.",
  },
  {
    slug: "c3",
    formula: "C",
    title: "Four Requests",
    subtitle: "Subpoena, NSL, GDPR, rogue insider — one answer",
    hook: "Four very different letters. The same reply.",
  },
  {
    slug: "c4",
    formula: "C",
    title: "Under Oath",
    subtitle: "Sworn declaration format",
    hook: "I declare, under penalty of perjury, that we cannot read it.",
  },
  {
    slug: "c5",
    formula: "C",
    title: "The Adversaries",
    subtitle: "Who asks, what they get",
    hook: "Five adversaries, five requests, the same ciphertext each time.",
  },
  {
    slug: "c6",
    formula: "C",
    title: "Dear Counsel",
    subtitle: "A note from engineering to legal",
    hook: "A letter to our lawyer, explaining what we can't produce.",
  },
  {
    slug: "c7",
    formula: "C",
    title: "The Warrant Canary",
    subtitle: "Quiet, dated, honest",
    hook: "We have received zero requests this quarter. The ones we receive won't change our answer.",
  },
  {
    slug: "c8",
    formula: "C",
    title: "Disclosure Report",
    subtitle: "A compact legal posture document",
    hook: "A one-page report on what we can and cannot disclose.",
  },
  {
    slug: "c9",
    formula: "C",
    title: "The Motion",
    subtitle: "A motion to quash, as a landing page",
    hook: "Respectfully: the order cannot be complied with. Not won't — can't.",
  },
  {
    slug: "c10",
    formula: "C",
    title: "The Hypothetical",
    subtitle: "Imagining the worst-case request",
    hook: "Suppose the worst letter a vendor could receive. This is what we'd send back.",
  },

  /* ─────────────────────────── D · HONEST TRANSFORMATION ─────────────────────────── */
  {
    slug: "d1",
    formula: "D",
    title: "The Seventy-Seven",
    subtitle: "A short, honest tour for a small group",
    hook: "77 people use this. Here's what happens when you become number 78.",
  },
  {
    slug: "d2",
    formula: "D",
    title: "Ten Days In",
    subtitle: "A short arc, plainly told",
    hook: "Day 0 to Day 10, with no flourishes.",
  },
  {
    slug: "d3",
    formula: "D",
    title: "One Afternoon",
    subtitle: "From signup to first decrypt, quietly",
    hook: "An afternoon. Not a quarter.",
  },
  {
    slug: "d4",
    formula: "D",
    title: "The Small Graph",
    subtitle: "Real numbers. Small ones.",
    hook: "30 stars. 77 users. 89 projects. 1,086 versions. A tour.",
  },
  {
    slug: "d5",
    formula: "D",
    title: "From Empty",
    subtitle: "Empty vault to first secret",
    hook: "A vault, empty. Then one secret. That's stage one.",
  },
  {
    slug: "d6",
    formula: "D",
    title: "A Slow Morning",
    subtitle: "A single morning's migration",
    hook: "Between coffee and lunch, the vault is yours.",
  },
  {
    slug: "d7",
    formula: "D",
    title: "Eighty-Nine Projects",
    subtitle: "Project-level view of the tool's life",
    hook: "89 projects live here. A tour of what they look like.",
  },
  {
    slug: "d8",
    formula: "D",
    title: "The Version Log",
    subtitle: "Seen through the 1,086 versions we've written",
    hook: "1,086 different versions of secrets. Each one wrapped.",
  },
  {
    slug: "d9",
    formula: "D",
    title: "Portraits",
    subtitle: "A few of the 77, in their own words",
    hook: "A few of the seventy-seven, describing their afternoons with it.",
  },
  {
    slug: "d10",
    formula: "D",
    title: "The Honest Arc",
    subtitle: "The four-stage arc, modest version",
    hook: "A small tool, a small arc, told straight.",
  },
];

export const DEFAULT_VARIANT = VARIANTS[0].slug;

export function findVariant(slug: string): VariantEntry | undefined {
  return VARIANTS.find((v) => v.slug === slug);
}

export function formulaDescription(f: VariantFormula): string {
  switch (f) {
    case "A":
      return "Pain: losing secrets";
    case "B":
      return "Quiet / manifesto";
    case "C":
      return "The legal corner";
    case "D":
      return "Honest transformation";
  }
}
