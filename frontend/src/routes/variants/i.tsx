import { createFileRoute } from "@tanstack/react-router";
import { VariantI } from "@/components/variants/I";

export const Route = createFileRoute("/variants/i")({
  component: VariantI,
});
