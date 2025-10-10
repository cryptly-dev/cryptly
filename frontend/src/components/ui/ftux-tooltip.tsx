import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import React from "react";

export interface FTUXTooltipProps {
  isVisible: boolean;
  description: string;
  currentStep: number;
  totalSteps: number;
  onNext?: () => void;
  onSkip: () => void;
  position?: "top" | "bottom" | "left" | "right";
  align?: "start" | "center" | "end";
  className?: string;
  children?: React.ReactNode;
}

export function FTUXTooltip({
  isVisible,
  description,
  currentStep,
  totalSteps,
  onNext,
  onSkip,
  position = "bottom",
  align = "center",
  className,
  children,
}: FTUXTooltipProps) {
  const getPositionClasses = () => {
    const positions = {
      top: "bottom-full mb-3",
      bottom: "top-full mt-3",
      left: "right-full mr-3",
      right: "left-full ml-3",
    };

    const alignments = {
      start: {
        top: "left-0",
        bottom: "left-0",
        left: "top-0",
        right: "top-0",
      },
      center: {
        top: "left-1/2 -translate-x-1/2",
        bottom: "left-1/2 -translate-x-1/2",
        left: "top-1/2 -translate-y-1/2",
        right: "top-1/2 -translate-y-1/2",
      },
      end: {
        top: "right-0",
        bottom: "right-0",
        left: "bottom-0",
        right: "bottom-0",
      },
    };

    return `${positions[position]} ${alignments[align][position]}`;
  };

  const getArrowPositionClasses = () => {
    const arrowPositions = {
      top: "top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-popover",
      bottom:
        "bottom-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-popover",
      left: "left-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-popover",
      right:
        "right-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-popover",
    };

    return arrowPositions[position];
  };

  const getInitialAnimation = () => {
    switch (position) {
      case "top":
        return { opacity: 0, y: 10, scale: 0.95 };
      case "bottom":
        return { opacity: 0, y: -10, scale: 0.95 };
      case "left":
        return { opacity: 0, x: 10, scale: 0.95 };
      case "right":
        return { opacity: 0, x: -10, scale: 0.95 };
    }
  };

  return (
    <div className={cn("relative", className)}>
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={getInitialAnimation()}
            animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
            exit={getInitialAnimation()}
            transition={{
              duration: 0.3,
              ease: [0.16, 1, 0.3, 1],
            }}
            className={cn("absolute z-[100] w-80", getPositionClasses())}
          >
            <motion.div
              className="relative rounded-lg bg-popover border border-border shadow-2xl p-4"
              initial={{ boxShadow: "0 0 0 0 rgba(0, 0, 0, 0)" }}
              animate={{
                boxShadow: [
                  "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                  "0 25px 30px -5px rgba(0, 0, 0, 0.15), 0 12px 12px -5px rgba(0, 0, 0, 0.06)",
                  "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                ],
              }}
              transition={{
                boxShadow: {
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
              }}
            >
              {/* Arrow */}
              <div
                className={cn(
                  "absolute w-0 h-0 border-[8px]",
                  getArrowPositionClasses()
                )}
              />

              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <motion.div
                    className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      delay: 0.2,
                      type: "spring",
                      stiffness: 500,
                      damping: 15,
                    }}
                  >
                    {currentStep}
                  </motion.div>
                  <span className="text-xs font-medium text-muted-foreground">
                    Step {currentStep} of {totalSteps}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onSkip}
                  className="h-6 w-6 -mr-1 -mt-1 hover:bg-secondary"
                  aria-label="Skip tutorial"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Description */}
              <motion.p
                className="text-sm text-foreground mb-4 leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                {description}
              </motion.p>

              {/* Actions */}
              <motion.div
                className="flex justify-end gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15 }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onSkip}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Skip tutorial
                </Button>
                {onNext && (
                  <Button size="sm" onClick={onNext} className="font-semibold">
                    Next
                  </Button>
                )}
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
