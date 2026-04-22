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
    slug: "a11",
    formula: "A",
    title: "The Formatted Disk",
    subtitle: "A clean install, a lost .env",
    hook: "You reinstalled the OS. The secrets reinstalled themselves as nothing.",
  },
  {
    slug: "a12",
    formula: "A",
    title: "The Deleted Project",
    subtitle: "rm -rf ~/Projects/old-stuff",
    hook: "The side-project folder had the only copy. It's in Trash, and Trash is empty.",
  },

  /* ─────────────────────────── B · QUIET / MANIFESTO ─────────────────────────── */
  {
    slug: "b3",
    formula: "B",
    title: "The Dictionary",
    subtitle: "Definitions, one word at a time",
    hook: "Zero-knowledge, defined.",
  },
  {
    slug: "b5",
    formula: "B",
    title: "Negative Space",
    subtitle: "What we don't store, don't see, don't have",
    hook: "The product is defined by what's missing.",
  },
  {
    slug: "b12",
    formula: "B",
    title: "The Site",
    subtitle: "Features, plainly, in three entries",
    hook: "A small site, for a small vault. Three features, plainly.",
  },
  {
    slug: "b15",
    formula: "B",
    title: "Small and Used",
    subtitle: "Manifesto voice, threaded with names and numbers",
    hook: "Seventy-seven people. Eighty-nine projects. Thirty stars. One steady voice.",
  },
  {
    slug: "b15-explanation",
    formula: "B",
    title: "Small and Used, Explained",
    subtitle: "B15 + a short primer on what the product does",
    hook: "The manifesto, preceded by three plain entries on what it is.",
  },

  /* ─────────────────────────── C · THE LEGAL CORNER ─────────────────────────── */
  {
    slug: "c7",
    formula: "C",
    title: "The Warrant Canary",
    subtitle: "Quiet, dated, honest",
    hook: "We have received zero requests this quarter. The ones we receive won't change our answer.",
  },
  {
    slug: "c7-explanation",
    formula: "C",
    title: "The Warrant Canary, Explained",
    subtitle: "C7 + a short primer on what the product does",
    hook: "The canary, followed by three plain entries on why its last row cannot change.",
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
    slug: "d1-explanation",
    formula: "D",
    title: "The Seventy-Seven, Explained",
    subtitle: "D1 + a short primer on what the product does",
    hook: "The tour, preceded by three plain entries on what it is.",
  },
  {
    slug: "d4",
    formula: "D",
    title: "The Small Graph",
    subtitle: "Real numbers. Small ones.",
    hook: "30 stars. 77 users. 89 projects. 1,086 versions. A tour.",
  },
  {
    slug: "d4-explanation",
    formula: "D",
    title: "The Small Graph, Explained",
    subtitle: "D4 + a short primer on what the product does",
    hook: "The numbers, preceded by three plain entries on what they measure.",
  },
  {
    slug: "d5",
    formula: "D",
    title: "From Empty",
    subtitle: "Empty vault to first secret",
    hook: "A vault, empty. Then one secret. That's stage one.",
  },
  {
    slug: "d8",
    formula: "D",
    title: "The Version Log",
    subtitle: "Seen through the 1,086 versions we've written",
    hook: "A vault, first. And then 1,086 versions inside it, each one wrapped.",
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
