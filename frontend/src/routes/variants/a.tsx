import { createFileRoute } from "@tanstack/react-router";
import { VariantA } from "@/components/variants/A";

export const Route = createFileRoute("/variants/a")({
  component: VariantA,
});
