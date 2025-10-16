import { motion, AnimatePresence } from "motion/react";
import { Check, Copy } from "lucide-react";
import { useState } from "react";
import type { SearchResult } from "@/lib/logics/searchLogic";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";

interface ResultsListItemProps {
  result: SearchResult;
  index: number;
}

export function ResultsListItem({ result, index }: ResultsListItemProps) {
  const [showCopied, setShowCopied] = useState(false);
  const navigate = useNavigate();

  const copyValue = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(result.secret.value);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleClick = () => {
    navigate({
      to: "/app/project/$projectId",
      params: { projectId: result.secret.projectId },
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.05,
        duration: 0.2,
        ease: [0, 0.55, 0.45, 1],
      }}
      onClick={handleClick}
      className="bg-card border border-border rounded-lg p-4 hover:border-primary/50 transition-colors cursor-pointer"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-mono text-sm font-semibold text-foreground truncate">
              {result.secret.name}
            </h3>
            <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-md font-medium">
              {result.secret.projectName}
            </span>
          </div>
          <p className="font-mono text-xs text-muted-foreground truncate">
            {result.secret.value}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={copyValue}
          aria-label="Copy secret value"
          className="cursor-pointer h-8 w-8 p-0 bg-secondary/50 hover:bg-secondary flex-shrink-0"
          tooltip={showCopied ? "Copied!" : "Copy value"}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {showCopied ? (
              <motion.div
                key="check"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{
                  duration: 0.2,
                  ease: "easeInOut",
                }}
              >
                <Check className="size-4 text-green-500" />
              </motion.div>
            ) : (
              <motion.div
                key="copy"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{
                  duration: 0.2,
                  ease: "easeInOut",
                }}
              >
                <Copy className="size-4" />
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </div>
    </motion.div>
  );
}
