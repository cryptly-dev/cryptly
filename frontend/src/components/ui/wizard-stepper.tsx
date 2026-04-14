import { motion } from "motion/react";

export function WizardStepper({
  currentStep,
  totalSteps,
}: {
  currentStep: number;
  totalSteps: number;
}) {
  return (
    <div className="flex items-center justify-center gap-1.5">
      {Array.from({ length: totalSteps }, (_, i) => {
        const isActive = i + 1 === currentStep;
        return (
          <motion.div
            key={i}
            className="h-1.5 rounded-full"
            animate={{
              width: isActive ? 24 : 8,
              backgroundColor: isActive
                ? "rgba(255,255,255,0.9)"
                : "rgba(255,255,255,0.2)",
            }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          />
        );
      })}
    </div>
  );
}
