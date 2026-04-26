import { cn } from "@/lib/utils";
import { IconEye, IconEyeCode, IconEyeOff } from "@tabler/icons-react";

export type SecurityLevel = "yolo" | "normal" | "tight";

interface SecurityLevelPickerProps {
  value: SecurityLevel;
  onChange: (next: SecurityLevel) => void;
  disabled?: boolean;
}

const LEVELS: {
  key: SecurityLevel;
  label: string;
  description: string;
  Icon: typeof IconEye;
}[] = [
  {
    key: "yolo",
    label: "Yolo",
    description: "Values are always visible in the editor",
    Icon: IconEye,
  },
  {
    key: "normal",
    label: "Normal",
    description: "Values are masked, revealed on hover or click",
    Icon: IconEyeCode,
  },
  {
    key: "tight",
    label: "Tight",
    description: "Values are always masked, click to copy only",
    Icon: IconEyeOff,
  },
];

const KEY_TO_INDEX: Record<SecurityLevel, number> = {
  yolo: 0,
  normal: 1,
  tight: 2,
};

export function SecurityLevelPicker({
  value,
  onChange,
  disabled = false,
}: SecurityLevelPickerProps) {
  const activeIndex = KEY_TO_INDEX[value];
  const active = LEVELS[activeIndex];

  const handleSelect = (next: SecurityLevel) => {
    if (disabled || next === value) return;
    onChange(next);
  };

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-lg border border-border/50 bg-neutral-800/20 p-4",
        disabled && "opacity-60"
      )}
      data-slot="security-level-picker"
    >
      {/* Icon row */}
      <div className="grid grid-cols-3 gap-2">
        {LEVELS.map((level, index) => {
          const isActive = index === activeIndex;
          const Icon = level.Icon;
          return (
            <button
              key={level.key}
              type="button"
              disabled={disabled}
              onClick={() => handleSelect(level.key)}
              aria-pressed={isActive}
              aria-label={level.label}
              className={cn(
                "flex items-center justify-center h-10 rounded-md transition-all cursor-pointer",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground/60 hover:text-muted-foreground",
                disabled && "cursor-not-allowed"
              )}
            >
              <Icon
                className={cn(
                  "size-5 transition-transform",
                  isActive && "scale-110"
                )}
              />
            </button>
          );
        })}
      </div>

      {/* Segmented slider */}
      <div className="relative h-8 select-none">
        {/* Track */}
        <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 h-1 rounded-full bg-neutral-700/70" />
        {/* Fill */}
        <div
          className="absolute left-2 top-1/2 -translate-y-1/2 h-1 rounded-full bg-primary transition-all duration-200"
          style={{
            width: `calc(((100% - 1rem) / 2) * ${activeIndex})`,
          }}
        />
        {/* Stops */}
        <div className="absolute inset-x-2 top-0 h-full grid grid-cols-3">
          {LEVELS.map((level, index) => {
            const isActive = index === activeIndex;
            const isBehind = index < activeIndex;
            return (
              <button
                key={level.key}
                type="button"
                disabled={disabled}
                onClick={() => handleSelect(level.key)}
                aria-label={`Select ${level.label}`}
                className={cn(
                  "relative flex items-center justify-center cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring/50 rounded-full",
                  disabled && "cursor-not-allowed"
                )}
                style={{
                  justifySelf:
                    index === 0
                      ? "start"
                      : index === LEVELS.length - 1
                        ? "end"
                        : "center",
                }}
              >
                <span
                  className={cn(
                    "relative z-10 block rounded-full transition-all duration-200",
                    isActive
                      ? "size-4 bg-primary ring-4 ring-primary/20"
                      : isBehind
                        ? "size-3 bg-primary"
                        : "size-3 bg-neutral-600 group-hover:bg-neutral-500"
                  )}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Label + description */}
      <div className="flex flex-col gap-0.5 text-center">
        <span className="text-sm font-semibold text-foreground">
          {active.label}
        </span>
        <span className="text-xs text-muted-foreground">
          {active.description}
        </span>
      </div>
    </div>
  );
}

export default SecurityLevelPicker;
