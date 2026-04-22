import { Link, useParams } from "@tanstack/react-router";
import type { ComponentType } from "react";
import { DEFAULT_VARIANT, findVariant, VARIANTS } from "./registry";
import { VariantSwitcher } from "./VariantSwitcher";
import { VariantA1 } from "./A1";
import { VariantA2 } from "./A2";
import { VariantA3 } from "./A3";
import { VariantA4 } from "./A4";
import { VariantA5 } from "./A5";
import { VariantA6 } from "./A6";
import { VariantA7 } from "./A7";
import { VariantA8 } from "./A8";
import { VariantA9 } from "./A9";
import { VariantA10 } from "./A10";
import { VariantA11 } from "./A11";
import { VariantA12 } from "./A12";
import { VariantA13 } from "./A13";
import { VariantA14 } from "./A14";
import { VariantA15 } from "./A15";
import { VariantB1 } from "./B1";
import { VariantB2 } from "./B2";
import { VariantB3 } from "./B3";
import { VariantB4 } from "./B4";
import { VariantB5 } from "./B5";
import { VariantB6 } from "./B6";
import { VariantB7 } from "./B7";
import { VariantB8 } from "./B8";
import { VariantB9 } from "./B9";
import { VariantB10 } from "./B10";
import { VariantB11 } from "./B11";
import { VariantB12 } from "./B12";
import { VariantB13 } from "./B13";
import { VariantB14 } from "./B14";
import { VariantB15 } from "./B15";
import { VariantC1 } from "./C1";
import { VariantC2 } from "./C2";
import { VariantC3 } from "./C3";
import { VariantC4 } from "./C4";
import { VariantC5 } from "./C5";
import { VariantC6 } from "./C6";
import { VariantC7 } from "./C7";
import { VariantC8 } from "./C8";
import { VariantC9 } from "./C9";
import { VariantC10 } from "./C10";
import { VariantC11 } from "./C11";
import { VariantC12 } from "./C12";
import { VariantC13 } from "./C13";
import { VariantC14 } from "./C14";
import { VariantC15 } from "./C15";
import { VariantD1 } from "./D1";
import { VariantD2 } from "./D2";
import { VariantD3 } from "./D3";
import { VariantD4 } from "./D4";
import { VariantD5 } from "./D5";
import { VariantD6 } from "./D6";
import { VariantD7 } from "./D7";
import { VariantD8 } from "./D8";
import { VariantD9 } from "./D9";
import { VariantD10 } from "./D10";
import { VariantD11 } from "./D11";
import { VariantD12 } from "./D12";
import { VariantD13 } from "./D13";
import { VariantD14 } from "./D14";
import { VariantD15 } from "./D15";

const COMPONENTS: Record<string, ComponentType> = {
  a1: VariantA1,
  a2: VariantA2,
  a3: VariantA3,
  a4: VariantA4,
  a5: VariantA5,
  a6: VariantA6,
  a7: VariantA7,
  a8: VariantA8,
  a9: VariantA9,
  a10: VariantA10,
  a11: VariantA11,
  a12: VariantA12,
  a13: VariantA13,
  a14: VariantA14,
  a15: VariantA15,
  b1: VariantB1,
  b2: VariantB2,
  b3: VariantB3,
  b4: VariantB4,
  b5: VariantB5,
  b6: VariantB6,
  b7: VariantB7,
  b8: VariantB8,
  b9: VariantB9,
  b10: VariantB10,
  b11: VariantB11,
  b12: VariantB12,
  b13: VariantB13,
  b14: VariantB14,
  b15: VariantB15,
  c1: VariantC1,
  c2: VariantC2,
  c3: VariantC3,
  c4: VariantC4,
  c5: VariantC5,
  c6: VariantC6,
  c7: VariantC7,
  c8: VariantC8,
  c9: VariantC9,
  c10: VariantC10,
  c11: VariantC11,
  c12: VariantC12,
  c13: VariantC13,
  c14: VariantC14,
  c15: VariantC15,
  d1: VariantD1,
  d2: VariantD2,
  d3: VariantD3,
  d4: VariantD4,
  d5: VariantD5,
  d6: VariantD6,
  d7: VariantD7,
  d8: VariantD8,
  d9: VariantD9,
  d10: VariantD10,
  d11: VariantD11,
  d12: VariantD12,
  d13: VariantD13,
  d14: VariantD14,
  d15: VariantD15,
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
