import { createFileRoute } from "@tanstack/react-router";
import { SearchPage } from "@/components/app/search/SearchPage";

export const Route = createFileRoute("/app/search")({
  component: SearchTanstackPage,
});

function SearchTanstackPage() {
  return <SearchPage />;
}
