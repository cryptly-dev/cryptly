import { motion } from "motion/react";
import { useActions, useValues } from "kea";
import { searchLogic } from "@/lib/logics/searchLogic";
import { SearchBar } from "./SearchBar";
import { ResultsList } from "./ResultsList";
import { Spinner } from "@/components/ui/spinner";

export function SearchPage() {
  const { searchQuery, searchResults, secrets, state } = useValues(searchLogic);
  const { setSearchQuery } = useActions(searchLogic);

  return (
    <div className="min-h-screen p-4 pt-20">
      <motion.div
        className="w-full max-w-3xl mx-auto"
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 2, ease: [0, 1, 0, 1] }}
      >
        <SearchBar value={searchQuery} onChange={setSearchQuery} />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 2, ease: [0, 1, 0, 1] }}
        >
          {state === "loading" ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <Spinner className="h-12 w-12" />
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
      </motion.div>
    </div>
  );
}
