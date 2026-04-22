import { createFileRoute } from "@tanstack/react-router";
import { VariantB } from "@/components/variants/B";

export const Route = createFileRoute("/variants/b")({
  component: VariantB,
});
