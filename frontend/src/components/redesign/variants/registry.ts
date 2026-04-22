export type VariantEntry = {
  slug: string;
  title: string;
  subtitle: string;
  hook: string;
};

export const VARIANTS: VariantEntry[] = [
  {
    slug: "a",
    title: "The Site",
    subtitle: "Features, plainly, in three entries",
    hook: "A small site, for a small vault. Three features, plainly.",
  },
  {
    slug: "b",
    title: "The Seventy-Seven, Explained",
    subtitle: "A tour + a three-entry primer on what it does",
    hook: "77 people use this. Here's the product, then the tour.",
  },
];

export const DEFAULT_VARIANT = VARIANTS[0].slug;

export function findVariant(slug: string): VariantEntry | undefined {
  return VARIANTS.find((v) => v.slug === slug);
}
