import { createFileRoute } from "@tanstack/react-router";
import { VariantD } from "@/components/variants/D";

export const Route = createFileRoute("/variants/d")({
  component: VariantD,
});
