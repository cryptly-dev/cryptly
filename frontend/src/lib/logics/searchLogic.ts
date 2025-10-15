import { actions, kea, path, reducers, selectors } from "kea";
import type { searchLogicType } from "./searchLogicType";

// Hardcoded secrets as base
const SECRETS = [
  { name: "MONGO_URL", value: "mongo url" },
  { name: "POSTGRES_URL", value: "postgres url" },
  { name: "BANK_PASSWORD", value: "bank password" },
  { name: "JWT_SECRET", value: "this is jwt secret" },
];

export interface Secret {
  name: string;
  value: string;
}

export interface SearchResult {
  secret: Secret;
  score: number;
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

export const searchLogic = kea<searchLogicType>([
  path(["src", "lib", "logics", "searchLogic"]),

  actions({
    setSearchQuery: (query: string) => ({ query }),
  }),

  reducers({
    searchQuery: [
      "" as string,
      {
        setSearchQuery: (_, { query }) => query,
      },
    ],
  }),

  selectors({
    secrets: [() => [], () => SECRETS],

    searchResults: [
      (s) => [s.searchQuery, s.secrets],
      (searchQuery: string, secrets: Secret[]): SearchResult[] => {
        if (!searchQuery.trim()) {
          return [];
        }

        // Calculate similarity scores for all secrets
        const results = secrets
          .map((secret) => ({
            secret,
            score: Math.max(
              calculateSimilarity(searchQuery, secret.name),
              calculateSimilarity(searchQuery, secret.value) * 0.8 // Value matches weighted slightly lower
            ),
          }))
          .filter((result) => result.score > 0.3) // Only show results with decent similarity
          .sort((a, b) => b.score - a.score)
          .slice(0, 10); // Top 10 results

        return results;
      },
    ],
  }),
]);
