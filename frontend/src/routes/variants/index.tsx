import { createFileRoute } from "@tanstack/react-router";
import { VariantsIndexPage } from "@/components/variants/VariantsIndexPage";

export const Route = createFileRoute("/variants/")({
  component: VariantsIndexPage,
});
