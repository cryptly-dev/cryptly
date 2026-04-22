import { Link, useParams } from "@tanstack/react-router";
import type { ComponentType } from "react";
import { DEFAULT_VARIANT, findVariant, VARIANTS } from "./registry";
import { VariantSwitcher } from "./VariantSwitcher";
import { VariantA11 } from "./A11";
import { VariantA12 } from "./A12";
import { VariantB3 } from "./B3";
import { VariantB5 } from "./B5";
import { VariantB12 } from "./B12";
import { VariantB15 } from "./B15";
import { VariantB15Explanation } from "./B15-explanation";
import { VariantC7 } from "./C7";
import { VariantC7Explanation } from "./C7-explanation";
import { VariantD1 } from "./D1";
import { VariantD1Explanation } from "./D1-explanation";
import { VariantD4 } from "./D4";
import { VariantD4Explanation } from "./D4-explanation";
import { VariantD5 } from "./D5";
import { VariantD8 } from "./D8";

const COMPONENTS: Record<string, ComponentType> = {
  a11: VariantA11,
  a12: VariantA12,
  b3: VariantB3,
  b5: VariantB5,
  b12: VariantB12,
  b15: VariantB15,
  "b15-explanation": VariantB15Explanation,
  c7: VariantC7,
  "c7-explanation": VariantC7Explanation,
  d1: VariantD1,
  "d1-explanation": VariantD1Explanation,
  d4: VariantD4,
  "d4-explanation": VariantD4Explanation,
  d5: VariantD5,
  d8: VariantD8,
};

export function VariantPage() {
  const { variant } = useParams({ from: "/redesign/$variant" });
  const entry = findVariant(variant);

  if (!entry) {
    return (
      <div className="min-h-screen bg-black text-neutral-100 flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <div className="text-xs uppercase tracking-[0.3em] text-neutral-500 mb-4">
            404 · unknown variant
          </div>
          <h1 className="text-4xl font-semibold tracking-tight">
            No variant called "{variant}".
          </h1>
          <p className="mt-4 text-neutral-400">
            We have {VARIANTS.length} on offer. Jump into the default?
          </p>
          <Link
            to="/redesign/$variant"
            params={{ variant: DEFAULT_VARIANT }}
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-white text-black px-5 py-2.5 text-sm font-medium"
          >
            Go to default
          </Link>
        </div>
      </div>
    );
  }

  const Component = COMPONENTS[entry.slug];

  return (
    <>
      <Component />
      <VariantSwitcher current={entry} />
    </>
  );
}
