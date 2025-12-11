"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface SwitchProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  description?: string;
  id?: string;
}

const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  (
    {
      checked = false,
      onChange,
      disabled = false,
      label,
      description,
      id,
    },
    ref
  ) => {
    const switchId = id || React.useId();

    return (
      <div className="flex items-start gap-3">
        <button
          ref={ref}
          id={switchId}
          type="button"
          role="switch"
          aria-checked={checked}
          disabled={disabled}
          onClick={() => onChange?.(!checked)}
          className={cn(
            "relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent",
            "transition-colors duration-200 ease-in-out",
            "focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-zinc-900",
            "disabled:cursor-not-allowed disabled:opacity-50",
            checked ? "bg-white" : "bg-zinc-700"
          )}
        >
          <span
            className={cn(
              "pointer-events-none inline-block h-4 w-4 transform rounded-full shadow-lg ring-0",
              "transition duration-200 ease-in-out",
              checked
                ? "translate-x-4 bg-zinc-900"
                : "translate-x-0 bg-zinc-400"
            )}
          />
        </button>

        {(label || description) && (
          <div className="flex flex-col">
            {label && (
              <label
                htmlFor={switchId}
                className="text-sm text-zinc-300 cursor-pointer"
              >
                {label}
              </label>
            )}
            {description && (
              <p className="text-xs text-zinc-600 mt-0.5">{description}</p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Switch.displayName = "Switch";

export { Switch };