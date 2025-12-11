"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "onChange"> {
  label?: string;
  error?: string;
  hint?: string;
  options: SelectOption[];
  placeholder?: string;
  onChange?: (value: string) => void;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      label,
      error,
      hint,
      options,
      placeholder = "Select an option",
      onChange,
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const selectId = id || React.useId();

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      onChange?.(e.target.value);
    };

    return (
      <div className="w-full">
        {/* Label */}
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-zinc-200 mb-2"
          >
            {label}
          </label>
        )}

        {/* Select wrapper */}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            onChange={handleChange}
            className={cn(
              "w-full px-3 py-2.5 bg-black/20 border rounded-md appearance-none",
              "text-sm text-zinc-300",
              "transition-all duration-200",
              "focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/10",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              error
                ? "border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20"
                : "border-white/10",
              className
            )}
            {...props}
          >
            <option value="" disabled className="bg-zinc-900 text-zinc-500">
              {placeholder}
            </option>
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                className="bg-zinc-900 text-zinc-300"
              >
                {option.label}
              </option>
            ))}
          </select>

          {/* Chevron icon */}
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
        </div>

        {/* Error message */}
        {error && (
          <p className="mt-2 text-xs text-red-400">{error}</p>
        )}

        {/* Hint text */}
        {hint && !error && (
          <p className="mt-2 text-xs text-zinc-600">{hint}</p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";

export { Select };