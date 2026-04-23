import { createFileRoute } from "@tanstack/react-router";
import { VariantH } from "@/components/variants/H";

export const Route = createFileRoute("/variants/h")({
  component: VariantH,
});
