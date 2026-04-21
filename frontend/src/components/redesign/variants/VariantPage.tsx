import { Link, useParams } from "@tanstack/react-router";
import type { ComponentType } from "react";
import { DEFAULT_VARIANT, findVariant, VARIANTS } from "./registry";
import { VariantSwitcher } from "./VariantSwitcher";
import { VariantA1 } from "./A1";
import { VariantA2 } from "./A2";
import { VariantA3 } from "./A3";
import { VariantA4 } from "./A4";
import { VariantA5 } from "./A5";
import { VariantB1 } from "./B1";
import { VariantB2 } from "./B2";
import { VariantB3 } from "./B3";
import { VariantB4 } from "./B4";
import { VariantB5 } from "./B5";

const COMPONENTS: Record<string, ComponentType> = {
  a1: VariantA1,
  a2: VariantA2,
  a3: VariantA3,
  a4: VariantA4,
  a5: VariantA5,
  b1: VariantB1,
  b2: VariantB2,
  b3: VariantB3,
  b4: VariantB4,
  b5: VariantB5,
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
