import { createFileRoute } from "@tanstack/react-router";
import { VariantG } from "@/components/variants/G";

export const Route = createFileRoute("/variants/g")({
  component: VariantG,
});
