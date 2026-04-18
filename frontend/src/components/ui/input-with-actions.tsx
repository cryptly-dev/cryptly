import * as React from "react";
import { cn } from "@/lib/utils";

interface InputWithActionsProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  actions: React.ReactNode;
  focusRing?: boolean;
}

const InputWithActions = React.forwardRef<
  HTMLInputElement,
  InputWithActionsProps
>(({ className, actions, focusRing = true, ...props }, ref) => {
  return (
    <div
      className={cn(
        "flex items-stretch border border-border rounded-lg bg-background transition-colors",
        focusRing && "focus-within:border-neutral-500"
      )}
    >
      <input
        ref={ref}
        className={cn(
          "flex-1 min-w-0 px-3 py-2.5 bg-transparent text-sm outline-none placeholder:text-muted-foreground/50",
          className
        )}
        {...props}
      />
      <div className="flex items-center gap-0.5 pr-1">
        {actions}
      </div>
    </div>
  );
});
InputWithActions.displayName = "InputWithActions";

const InputAction = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => {
  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        "flex items-center justify-center size-8 shrink-0 cursor-pointer rounded-md text-muted-foreground [&:not(.bg-primary)]:hover:text-foreground [&:not(.bg-primary)]:hover:bg-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
});
InputAction.displayName = "InputAction";

export { InputWithActions, InputAction };
