import * as React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?:  string;
  description?: string;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, id, ...props }, ref) => {
    const checkboxId = id || React.useId();

    return (
      <div className="flex items-start gap-3">
        {/* Custom checkbox wrapper */}
        <div className="relative flex items-center justify-center">
          <input
            ref={ref}
            id={checkboxId}
            type="checkbox"
            className={cn(
              "peer h-5 w-5 cursor-pointer appearance-none rounded border border-aeon-border",
              "bg-aeon-bg-tertiary transition-all duration-200",
              "checked:bg-aeon-accent-primary checked:border-aeon-accent-primary",
              "focus:outline-none focus:ring-2 focus:ring-aeon-accent-primary focus:ring-offset-2 focus:ring-offset-aeon-bg-primary",
              "disabled:cursor-not-allowed disabled:opacity-50",
              className
            )}
            {...props}
          />
          {/* Checkmark icon - only visible when checked */}
          <Check
            className="pointer-events-none absolute h-3. 5 w-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity"
          />
        </div>

        {/* Label and description */}
        {(label || description) && (
          <div className="flex flex-col">
            {label && (
              <label
                htmlFor={checkboxId}
                className="text-sm font-medium text-aeon-text-primary cursor-pointer"
              >
                {label}
              </label>
            )}
            {description && (
              <p className="text-sm text-aeon-text-muted">{description}</p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";

export { Checkbox };