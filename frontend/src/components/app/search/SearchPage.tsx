import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { pipeline, FeatureExtractionPipeline } from "@xenova/transformers";
import { Search } from "lucide-react";

// Hardcoded secrets as base
const SECRETS = [
  { name: "MONGO_URL", value: "mongo url" },
  { name: "POSTGRES_URL", value: "postgres url" },
  { name: "BANK_PASSWORD", value: "bank password" },
  { name: "JWT_SECRET", value: "this is jwt secret" },
];

interface SecretWithEmbedding {
  name: string;
  value: string;
  embedding: number[];
}

// Calculate cosine similarity between two vectors
function cosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

export function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [embedder, setEmbedder] = useState<FeatureExtractionPipeline | null>(
    null
  );
  const [secretsWithEmbeddings, setSecretsWithEmbeddings] = useState<
    SecretWithEmbedding[]
  >([]);
  const [searchResults, setSearchResults] = useState<
    Array<{ secret: SecretWithEmbedding; score: number }>
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState("");

  // Initialize the model and generate embeddings
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        setLoadingProgress("Loading embedding model...");

        // Load the embedding model
        const pipe = await pipeline(
          "feature-extraction",
          "keeeeenw/MicroLlama-text-embedding",
          {
            progress_callback: (progress: any) => {
              if (progress.status === "progress") {
                setLoadingProgress(
                  `Loading model: ${Math.round(progress.progress)}%`
                );
              }
            },
          }
        );

        if (cancelled) return;
        setEmbedder(pipe);

        setLoadingProgress("Generating embeddings for secrets...");

        // Generate embeddings for all secrets
        const secretsWithEmb: SecretWithEmbedding[] = [];
        for (let i = 0; i < SECRETS.length; i++) {
          if (cancelled) return;

          const secret = SECRETS[i];
          setLoadingProgress(
            `Generating embeddings: ${i + 1}/${SECRETS.length}`
          );

          const output = await pipe(secret.name, {
            pooling: "mean",
            normalize: true,
          });

          const embedding = Array.from(output.data) as number[];
          secretsWithEmb.push({
            ...secret,
            embedding,
          });
        }

        if (cancelled) return;
        setSecretsWithEmbeddings(secretsWithEmb);
        setIsLoading(false);
        setLoadingProgress("");
      } catch (error) {
        console.error("Error initializing embeddings:", error);
        setLoadingProgress("Error loading model. Please refresh.");
      }
    };

    init();

    return () => {
      cancelled = true;
    };
  }, []);

  // Perform search when query changes
  useEffect(() => {
    if (
      !searchQuery.trim() ||
      !embedder ||
      secretsWithEmbeddings.length === 0
    ) {
      setSearchResults([]);
      return;
    }

    const performSearch = async () => {
      setIsSearching(true);
      try {
        // Check for exact match first
        const exactMatches = secretsWithEmbeddings.filter((secret) =>
          secret.name.toLowerCase().includes(searchQuery.toLowerCase())
        );

        if (exactMatches.length > 0) {
          setSearchResults(
            exactMatches.map((secret) => ({ secret, score: 1.0 }))
          );
          setIsSearching(false);
          return;
        }

        // Perform semantic search
        const output = await embedder(searchQuery, {
          pooling: "mean",
          normalize: true,
        });
        const queryEmbedding = Array.from(output.data) as number[];

        // Calculate similarities
        const results = secretsWithEmbeddings
          .map((secret) => ({
            secret,
            score: cosineSimilarity(queryEmbedding, secret.embedding),
          }))
          .sort((a, b) => b.score - a.score)
          .slice(0, 10); // Top 10 results

        setSearchResults(results);
      } catch (error) {
        console.error("Error performing search:", error);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(performSearch, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, embedder, secretsWithEmbeddings]);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0, 1, 0, 1] },
    },
  } as const;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        className="w-full max-w-3xl"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Search Input */}
        <div className="relative mb-8">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-muted-foreground" />
          </div>
          <input
            type="text"
            placeholder="Search exact secret name or do semantic search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={isLoading}
            className="flex h-auto w-full rounded-xl border border-input bg-card px-3 pl-12 py-6 text-lg ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 shadow-lg"
          />
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-muted border-t-primary mb-4"></div>
            <p className="text-muted-foreground">{loadingProgress}</p>
          </div>
        )}

        {/* Searching State */}
        {isSearching && !isLoading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-muted border-t-primary"></div>
          </div>
        )}

        {/* Search Results */}
        {!isLoading && !isSearching && searchResults.length > 0 && (
          <div className="space-y-3">
            {searchResults.map((result, index) => (
              <motion.div
                key={result.secret.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
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
        {!isLoading &&
          !isSearching &&
          searchQuery &&
          searchResults.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No secrets found matching your query.
              </p>
            </div>
          )}

        {/* Empty State */}
        {!isLoading && !searchQuery && (
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
