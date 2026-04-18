import { cn } from "@/lib/utils";

interface TypingDotsProps {
  className?: string;
}

export function TypingDots({ className }: TypingDotsProps) {
  return (
    <span
      aria-hidden="true"
      className={cn("inline-flex w-[1.5ch]", className)}
    >
      <span className="animate-typing-dot-1">.</span>
      <span className="animate-typing-dot-2">.</span>
      <span className="animate-typing-dot-3">.</span>
    </span>
  );
}
