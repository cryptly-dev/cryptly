import { MagneticPlayground } from "@/components/redesign/MagneticPlayground";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/magnetic")({
  component: MagneticPlayground,
});
