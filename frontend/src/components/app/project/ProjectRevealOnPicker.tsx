import { cn } from "@/lib/utils";
import type { ProjectRevealOn } from "@/lib/project-settings";
import { IconEye, IconEyeCode, IconEyeOff } from "@tabler/icons-react";

interface ProjectRevealOnPickerProps {
  value: ProjectRevealOn;
  onChange: (next: ProjectRevealOn) => void;
  disabled?: boolean;
}

const OPTIONS: {
  key: ProjectRevealOn;
  label: string;
  description: string;
  Icon: typeof IconEye;
}[] = [
  {
    key: "always",
    label: "Always",
    description: "Values stay visible in the editor",
    Icon: IconEye,
  },
  {
    key: "hover",
    label: "Hover",
    description: "Values stay masked until hover or click",
    Icon: IconEyeCode,
  },
  {
    key: "never",
    label: "Never",
    description: "Values stay masked and copy without revealing",
    Icon: IconEyeOff,
  },
];

const KEY_TO_INDEX: Record<ProjectRevealOn, number> = {
  always: 0,
  hover: 1,
  never: 2,
};

export function ProjectRevealOnPicker({
  value,
  onChange,
  disabled = false,
}: ProjectRevealOnPickerProps) {
  const activeIndex = KEY_TO_INDEX[value];
  const active = OPTIONS[activeIndex];

  const handleSelect = (next: ProjectRevealOn) => {
    if (disabled || next === value) return;
    onChange(next);
  };

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-lg border border-border/50 bg-neutral-800/20 p-4",
        disabled && "opacity-60",
      )}
      data-slot="project-reveal-on-picker"
    >
      <div className="grid grid-cols-3 gap-2">
        {OPTIONS.map((option, index) => {
          const isActive = index === activeIndex;
          const Icon = option.Icon;
          return (
            <button
              key={option.key}
              type="button"
              disabled={disabled}
              onClick={() => handleSelect(option.key)}
              aria-pressed={isActive}
              aria-label={option.label}
              className={cn(
                "flex h-10 items-center justify-center rounded-md transition-all cursor-pointer",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground/60 hover:text-muted-foreground",
                disabled && "cursor-not-allowed",
              )}
            >
              <Icon
                className={cn(
                  "size-5 transition-transform",
                  isActive && "scale-110",
                )}
              />
            </button>
          );
        })}
      </div>

      <div className="relative h-8 select-none">
        <div className="absolute inset-x-2 top-1/2 h-1 -translate-y-1/2 rounded-full bg-neutral-700/70" />
        <div
          className="absolute left-2 top-1/2 h-1 -translate-y-1/2 rounded-full bg-primary transition-all duration-200"
          style={{ width: `calc(((100% - 1rem) / 2) * ${activeIndex})` }}
        />
        <div className="absolute inset-x-2 top-0 grid h-full grid-cols-3">
          {OPTIONS.map((option, index) => {
            const isActive = index === activeIndex;
            const isBehind = index < activeIndex;
            return (
              <button
                key={option.key}
                type="button"
                disabled={disabled}
                onClick={() => handleSelect(option.key)}
                aria-label={`Select ${option.label}`}
                className={cn(
                  "relative flex items-center justify-center rounded-full cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                  disabled && "cursor-not-allowed",
                )}
                style={{
                  justifySelf:
                    index === 0
                      ? "start"
                      : index === OPTIONS.length - 1
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
                        : "size-3 bg-neutral-600",
                  )}
                />
              </button>
            );
          })}
        </div>
      </div>

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

export default ProjectRevealOnPicker;
