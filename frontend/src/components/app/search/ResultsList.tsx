import type { SearchResult } from "@/lib/logics/searchLogic";
import { ResultsListItem } from "./ResultsListItem";

interface ResultsListProps {
  results: SearchResult[];
  searchQuery: string;
  secretsCount: number;
}

export function ResultsList({
  results,
  searchQuery,
  secretsCount,
}: ResultsListProps) {
  // Search Results
  if (results.length > 0) {
    return (
      <div className="space-y-3">
        {results.map((result, index) => (
          <ResultsListItem
            key={result.secret.name}
            result={result}
            index={index}
          />
        ))}
      </div>
    );
  }

  // No Results
  if (searchQuery && results.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          No secrets found matching your query.
        </p>
      </div>
    );
  }

  // Empty State
  return (
    <div className="text-center py-12">
      <p className="text-muted-foreground">
        Start typing to search through {secretsCount} secrets
      </p>
    </div>
  );
}
