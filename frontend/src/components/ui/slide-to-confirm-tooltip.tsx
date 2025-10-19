import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "motion/react";
import { ChevronRight } from "lucide-react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import React, { useState, useRef, useEffect } from "react";

export interface SlideToConfirmTooltipProps {
  isVisible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  side?: "top" | "bottom" | "left" | "right";
  align?: "start" | "center" | "end";
  children: React.ReactNode;
}

export function SlideToConfirmTooltip({
  isVisible,
  onConfirm,
  onCancel,
  side = "bottom",
  align = "center",
  children,
}: SlideToConfirmTooltipProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragProgress, setDragProgress] = useState(0);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const CONFIRMATION_THRESHOLD = 0.97; // 85% of the track width

  useEffect(() => {
    if (!isVisible) {
      // Reset state when tooltip closes
      setDragProgress(0);
      setIsDragging(false);
      setIsConfirmed(false);
    }
  }, [isVisible]);

  const handleDragStart = () => {
    if (isConfirmed) return;
    setIsDragging(true);
  };

  const handleDrag = (_: unknown, info: { offset: { x: number } }) => {
    if (isConfirmed || !trackRef.current) return;

    const trackWidth = trackRef.current.offsetWidth - 42; // Subtract slider width + padding
    const clampedOffset = Math.max(0, Math.min(trackWidth, info.offset.x));
    const newProgress = clampedOffset / trackWidth;

    setDragProgress(newProgress);

    if (newProgress >= CONFIRMATION_THRESHOLD) {
      setIsConfirmed(true);
      setIsDragging(false);
      setTimeout(() => {
        onConfirm();
      }, 200);
    }
  };

  const handleDragEnd = () => {
    if (isConfirmed) return;

    setIsDragging(false);
    if (dragProgress < CONFIRMATION_THRESHOLD) {
      // Animate back to start
      setDragProgress(0);
    }
  };

  return (
    <PopoverPrimitive.Root
      open={isVisible}
      onOpenChange={(open) => !open && onCancel()}
    >
      <PopoverPrimitive.Trigger asChild>{children}</PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          side={side}
          align={align}
          sideOffset={8}
          className="z-[100] outline-none"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <AnimatePresence>
            {isVisible && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="bg-popover border border-border rounded-lg p-4 shadow-lg min-w-[280px] max-w-[320px]"
              >
                {/* Slide to confirm */}
                <div className="space-y-3">
                  {/* Slider Track */}
                  <div
                    ref={trackRef}
                    className="relative h-11 bg-secondary/50 rounded-full border border-border/50 overflow-hidden"
                  >
                    {/* Drag Container */}
                    <div className="absolute inset-0 p-[1px]">
                      {/* Slider Button */}
                      <motion.div
                        ref={sliderRef}
                        className={cn(
                          "absolute z-10 top-1/2 -translate-y-1/2 left-[1px] w-10 h-10 bg-background rounded-full shadow-sm flex items-center justify-center cursor-grab active:cursor-grabbing transition-colors duration-200 touch-none",
                          {
                            "border-green-600 text-white": isConfirmed,
                            "hover:bg-accent": !isConfirmed && !isDragging,
                          }
                        )}
                        drag="x"
                        dragConstraints={{
                          left: 0,
                          right: (trackRef.current?.offsetWidth || 280) - 42,
                        }}
                        dragElastic={0}
                        dragMomentum={false}
                        dragPropagation={false}
                        whileDrag={{ scale: 1.05 }}
                        onDragStart={handleDragStart}
                        onDrag={handleDrag}
                        onDragEnd={handleDragEnd}
                        animate={{
                          x:
                            dragProgress *
                            ((trackRef.current?.offsetWidth || 280) - 42),
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 30,
                          duration: isDragging ? 0 : 0.3,
                        }}
                        style={{
                          touchAction: "none",
                        }}
                      >
                        <ChevronRight
                          className={cn(
                            "size-5 transition-transform duration-200",
                            {
                              "rotate-0": dragProgress < CONFIRMATION_THRESHOLD,
                              "text-green-600":
                                dragProgress >= CONFIRMATION_THRESHOLD,
                            }
                          )}
                        />
                      </motion.div>
                    </div>

                    {/* Text overlay with mask effect */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                      {/* Background text (gray) */}
                      <span className="text-sm font-normal text-muted-foreground">
                        Slide to confirm
                      </span>

                      {/* Masked green text */}
                      <div
                        className="absolute inset-0 flex items-center justify-center overflow-hidden"
                        style={{
                          clipPath: `inset(0 ${100 - dragProgress * 100}% 0 0)`,
                        }}
                      >
                        <span className="text-sm font-normal text-green-600">
                          Slide to confirm
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Cancel button */}
                  <div className="flex justify-center">
                    <button
                      onClick={onCancel}
                      className="text-xs cursor-pointer text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
