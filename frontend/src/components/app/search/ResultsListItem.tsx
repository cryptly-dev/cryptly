import { motion } from "motion/react";
import type { SearchResult } from "@/lib/logics/searchLogic";

interface ResultsListItemProps {
  result: SearchResult;
  index: number;
}

export function ResultsListItem({ result, index }: ResultsListItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.05,
        duration: 0.2,
        ease: [0, 0.55, 0.45, 1],
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
  );
}
