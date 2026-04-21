export type VariantFormula = "A" | "B";

export type VariantEntry = {
  slug: string;
  formula: VariantFormula;
  title: string;
  subtitle: string;
  hook: string;
};

export const VARIANTS: VariantEntry[] = [
  {
    slug: "a1",
    formula: "A",
    title: "The Confessional",
    subtitle: "Status quo → tension → proof, zero lectures",
    hook: "Your team has a Google Doc full of API keys.",
  },
  {
    slug: "a2",
    formula: "A",
    title: "The Receipt",
    subtitle: "Timeline of specific oops moments",
    hook: "On Tuesday you Slacked your Stripe key to a new hire.",
  },
  {
    slug: "a3",
    formula: "A",
    title: "Quiet Security",
    subtitle: "Philosophical, manifesto-like",
    hook: "Secrets that aren't ours to hold.",
  },
  {
    slug: "a4",
    formula: "A",
    title: "What We Can't Read",
    subtitle: "Inability as the hero",
    hook: "A subpoena to our database returns noise.",
  },
  {
    slug: "a5",
    formula: "A",
    title: "Quiet Refactor",
    subtitle: "Tiny moments of pain, compounded",
    hook: "How many Slack DMs end with a .env?",
  },
  {
    slug: "b1",
    formula: "B",
    title: "Classic Funnel",
    subtitle: "Textbook 8-section architecture",
    hook: "Secrets management that doesn't secretly store your secrets.",
  },
  {
    slug: "b2",
    formula: "B",
    title: "Problem-First Funnel",
    subtitle: "Problem-agitate before value",
    hook: "Your .env is in three Slack DMs and one ex-employee's laptop.",
  },
  {
    slug: "b3",
    formula: "B",
    title: "Social Heavy",
    subtitle: "Testimonials and proof everywhere",
    hook: "Trusted by 3,412 developers who would rather not be breached.",
  },
  {
    slug: "b4",
    formula: "B",
    title: "Value Stack Dense",
    subtitle: "4-tier stack, pricing anchor",
    hook: "Everything in the $3,600/yr tier. For $0.",
  },
  {
    slug: "b5",
    formula: "B",
    title: "Transformation-Lead",
    subtitle: "4-stage arc structures everything",
    hook: "From .env in Slack to signed, encrypted, auditable — in one afternoon.",
  },
];

export const DEFAULT_VARIANT = VARIANTS[0].slug;

export function findVariant(slug: string): VariantEntry | undefined {
  return VARIANTS.find((v) => v.slug === slug);
}
