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
    <div className="flex items-stretch">
      <input
        ref={ref}
        className={cn(
          "flex-1 min-w-0 px-3 py-2.5 bg-background text-sm outline-none placeholder:text-muted-foreground/50 border border-border rounded-l-lg transition-colors",
          focusRing && "focus:border-neutral-500",
          className
        )}
        {...props}
      />
      <div className="flex items-stretch border border-l-0 border-border rounded-r-lg overflow-hidden">
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
    <>
      <span className="w-px self-stretch bg-border/30" />
      <button
        ref={ref}
        type="button"
        className={cn(
          "flex items-center justify-center w-10 shrink-0 cursor-pointer bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed",
          className
        )}
        {...props}
      >
        {children}
      </button>
    </>
  );
});
InputAction.displayName = "InputAction";

export { InputWithActions, InputAction };
