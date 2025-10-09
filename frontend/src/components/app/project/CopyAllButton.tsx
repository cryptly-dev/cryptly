import { Button } from "@/components/ui/button";
import { projectLogic } from "@/lib/logics/projectLogic";
import { useValues } from "kea";
import { Check, Copy } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import posthog from "posthog-js";
import { useState } from "react";

export function CopyAllButton({ disabled = false }: { disabled?: boolean }) {
  const { inputValue } = useValues(projectLogic);
  const [showCopied, setShowCopied] = useState(false);

  const copyAll = async () => {
    try {
      await navigator.clipboard.writeText(inputValue);
      posthog.capture("copy_all_button_clicked");
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={copyAll}
      aria-label="Copy all content"
      className="cursor-pointer h-10 w-10 p-0 bg-secondary/50 hover:bg-secondary"
      tooltip={showCopied ? "Copied!" : "Copy all content"}
      disabled={disabled}
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
            <Check className="size-5 text-green-500" />
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
            <Copy className="size-5" />
          </motion.div>
        )}
      </AnimatePresence>
    </Button>
  );
}
