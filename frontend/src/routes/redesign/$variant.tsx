import { createFileRoute } from "@tanstack/react-router";
import { VariantPage } from "@/components/redesign/variants/VariantPage";

export const Route = createFileRoute("/redesign/$variant")({
  component: VariantTanstackPage,
});

function VariantTanstackPage() {
  return <VariantPage />;
}
