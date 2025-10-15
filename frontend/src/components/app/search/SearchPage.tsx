import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Search } from "lucide-react";

// Hardcoded secrets as base
const SECRETS = [
  { name: "MONGO_URL", value: "mongo url" },
  { name: "POSTGRES_URL", value: "postgres url" },
  { name: "BANK_PASSWORD", value: "bank password" },
  { name: "JWT_SECRET", value: "this is jwt secret" },
];

interface Secret {
  name: string;
  value: string;
}

// Calculate similarity score between two strings using fuzzy matching
function calculateSimilarity(query: string, text: string): number {
  const queryLower = query.toLowerCase();
  const textLower = text.toLowerCase();

  // Exact match
  if (textLower.includes(queryLower)) {
    return 1.0;
  }

  // Calculate Levenshtein distance based similarity
  const words = queryLower.split(/\s+/);
  let maxScore = 0;

  for (const word of words) {
    if (textLower.includes(word)) {
      maxScore = Math.max(maxScore, 0.7);
    }

    // Check for partial matches
    const textWords = textLower.split(/[_\s-]+/);
    for (const textWord of textWords) {
      if (textWord.includes(word) || word.includes(textWord)) {
        maxScore = Math.max(maxScore, 0.5);
      }
    }
  }

  return maxScore;
}

export function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<
    Array<{ secret: Secret; score: number }>
  >([]);

  // Perform search when query changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const performSearch = () => {
      // Calculate similarity scores for all secrets
      const results = SECRETS.map((secret) => ({
        secret,
        score: Math.max(
          calculateSimilarity(searchQuery, secret.name),
          calculateSimilarity(searchQuery, secret.value) * 0.8 // Value matches weighted slightly lower
        ),
      }))
        .filter((result) => result.score > 0.3) // Only show results with decent similarity
        .sort((a, b) => b.score - a.score)
        .slice(0, 10); // Top 10 results

      setSearchResults(results);
    };

    const debounceTimer = setTimeout(performSearch, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  return (
    <div className="min-h-screen p-4 pt-20">
      <motion.div
        className="w-full max-w-3xl mx-auto"
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 1, ease: [0, 1, 0, 1] }}
      >
        {/* Search Input */}
        <div className="relative mb-8">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-muted-foreground" />
          </div>
          <input
            type="text"
            placeholder="Search secret name, project name or secret value"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex w-full rounded-xl border border-input bg-card pl-12 p-3 text-lg ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 shadow-lg"
          />
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="space-y-3">
            {searchResults.map((result, index) => (
              <motion.div
                key={result.secret.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: index * 0.05,
                  duration: 0.5,
                  ease: [0, 1, 0, 1],
                }}
                className="bg-card border border-border rounded-lg p-4 hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-mono text-sm font-semibold text-foreground truncate">
                        {result.secret.name}
                      </h3>
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                        {Math.round(result.score * 100)}%
                      </span>
                    </div>
                    <p className="font-mono text-xs text-muted-foreground truncate">
                      {result.secret.value}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* No Results */}
        {searchQuery && searchResults.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No secrets found matching your query.
            </p>
          </div>
        )}

        {/* Empty State */}
        {!searchQuery && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Start typing to search through {SECRETS.length} secrets
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
