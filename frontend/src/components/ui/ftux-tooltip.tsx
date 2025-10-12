import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { X } from "lucide-react";
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
  return (
    <TooltipProvider>
      <Tooltip open={isVisible}>
        <TooltipTrigger asChild className={className}>
          {children}
        </TooltipTrigger>
        <TooltipContent side={position} align={align} sideOffset={12}>
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                {currentStep}
              </div>
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
          <p className="text-sm text-foreground mb-4 leading-relaxed">
            {description}
          </p>

          {/* Actions */}
          <div className="flex justify-end gap-2">
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
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
