import { createFileRoute } from "@tanstack/react-router";
import { VariantC } from "@/components/variants/C";

export const Route = createFileRoute("/variants/c")({
  component: VariantC,
});
