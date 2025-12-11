"use client";

import * as React from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  showCount?: boolean;
  maxLength?: number;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      label,
      error,
      hint,
      showCount = false,
      maxLength,
      id,
      disabled,
      value,
      ...props
    },
    ref
  ) => {
    const textareaId = id || React.useId();
    const characterCount = typeof value === "string" ? value.length : 0;

    return (
      <div className="w-full">
        {/* Label */}
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-zinc-200 mb-2"
          >
            {label}
          </label>
        )}

        {/* Textarea */}
        <textarea
          ref={ref}
          id={textareaId}
          disabled={disabled}
          value={value}
          maxLength={maxLength}
          className={cn(
            "w-full px-3 py-2.5 bg-black/20 border rounded-md resize-none",
            "text-sm text-zinc-300 placeholder:text-zinc-600",
            "transition-all duration-200",
            "focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/10",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            error
              ? "border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20"
              : "border-white/10",
            className
          )}
          {...props}
        />

        {/* Footer - Error/Hint and Character count */}
        <div className="flex justify-between mt-2">
          <div>
            {error && (
              <p className="text-xs text-red-400 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {error}
              </p>
            )}
            {hint && !error && (
              <p className="text-xs text-zinc-600">{hint}</p>
            )}
          </div>
          
          {showCount && maxLength && (
            <span className="text-xs text-zinc-600">
              {characterCount}/{maxLength}
            </span>
          )}
        </div>
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

export { Textarea };