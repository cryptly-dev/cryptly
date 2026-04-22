import { Link, useParams } from "@tanstack/react-router";
import type { ComponentType } from "react";
import { DEFAULT_VARIANT, findVariant, VARIANTS } from "./registry";
import { VariantSwitcher } from "./VariantSwitcher";
import { VariantA } from "./A";
import { VariantB } from "./B";

const COMPONENTS: Record<string, ComponentType> = {
  a: VariantA,
  b: VariantB,
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
