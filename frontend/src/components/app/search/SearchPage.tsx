import { motion } from "motion/react";
import { useActions, useValues } from "kea";
import { searchLogic } from "@/lib/logics/searchLogic";
import { SearchBar } from "./SearchBar";
import { ResultsList } from "./ResultsList";

export function SearchPage() {
  const { searchQuery, searchResults, secrets, state } = useValues(searchLogic);
  const { setSearchQuery } = useActions(searchLogic);

  return (
    <div className="min-h-screen p-4 pt-20">
      <motion.div
        className="w-full max-w-3xl mx-auto"
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 1, ease: [0, 1, 0, 1] }}
      >
        <SearchBar value={searchQuery} onChange={setSearchQuery} />

        {state === "loading" ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-muted border-t-primary mb-4"></div>
            <p className="text-muted-foreground">Loading secrets...</p>
          </div>
        ) : (
          <ResultsList
            results={searchResults}
            searchQuery={searchQuery}
            secretsCount={secrets.length}
          />
        )}
      </motion.div>
    </div>
  );
}
