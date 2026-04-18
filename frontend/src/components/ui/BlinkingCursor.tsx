import { cn } from "@/lib/utils";

interface BlinkingCursorProps {
  className?: string;
}

export function BlinkingCursor({ className }: BlinkingCursorProps) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn(
        "inline-block h-6 w-2 animate-cursor-blink rounded-[2px] align-middle",
        className
      )}
    />
  );
}
