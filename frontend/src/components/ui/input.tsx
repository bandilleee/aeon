import * as React from "react";
import { cn } from "@/lib/utils";
import { AlertCircle, Eye, EyeOff } from "lucide-react";

/**
 * Input Props
 * -----------
 * We extend native input props and add our custom ones
 */
export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

/**
 * Input Component
 * ---------------
 * A styled input field with support for: 
 * - Labels
 * - Error messages
 * - Hint text
 * - Icons on left/right
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = "text",
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      disabled,
      id,
      ...props
    },
    ref
  ) => {
    // Generate a unique ID if not provided (needed for label association)
    const inputId = id || React.useId();

    return (
      <div className="w-full">
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-aeon-text-primary mb-2"
          >
            {label}
          </label>
        )}

        {/* Input wrapper - needed for positioning icons */}
        <div className="relative">
          {/* Left icon */}
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-aeon-text-muted">
              {leftIcon}
            </div>
          )}

          {/* The actual input */}
          <input
            ref={ref}
            id={inputId}
            type={type}
            disabled={disabled}
            className={cn(
              // Base styles
              "w-full px-4 py-3 bg-aeon-bg-tertiary border rounded-lg",
              "text-aeon-text-primary placeholder: text-aeon-text-muted",
              "transition-all duration-200",
              // Focus styles
              "focus:outline-none focus:border-aeon-accent-primary focus:ring-1 focus:ring-aeon-accent-primary",
              // Disabled styles
              "disabled:opacity-50 disabled:cursor-not-allowed",
              // Error styles
              error
                ? "border-aeon-accent-danger focus:border-aeon-accent-danger focus:ring-aeon-accent-danger"
                : "border-aeon-border",
              // Padding adjustments for icons
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              className
            )}
            aria-invalid={error ?  "true" : "false"}
            aria-describedby={
              error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
            }
            {... props}
          />

          {/* Right icon */}
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-aeon-text-muted">
              {rightIcon}
            </div>
          )}
        </div>

        {/* Error message */}
        {error && (
          <p
            id={`${inputId}-error`}
            className="mt-2 text-sm text-aeon-accent-danger flex items-center gap-1"
          >
            <AlertCircle className="h-4 w-4" />
            {error}
          </p>
        )}

        {/* Hint text (only show if no error) */}
        {hint && ! error && (
          <p id={`${inputId}-hint`} className="mt-2 text-sm text-aeon-text-muted">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

/**
 * Password Input Component
 * ------------------------
 * Special input for passwords with show/hide toggle
 * This is a separate component because it has its own state
 */
export interface PasswordInputProps extends Omit<InputProps, "type" | "rightIcon"> {}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  (props, ref) => {
    // State to track if password is visible
    const [showPassword, setShowPassword] = React.useState(false);

    return (
      <Input
        ref={ref}
        type={showPassword ? "text" : "password"}
        rightIcon={
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-aeon-text-muted hover:text-aeon-text-primary transition-colors"
            tabIndex={-1} // Prevent tab focus on this button
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ?  (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        }
        {... props}
      />
    );
  }
);

PasswordInput.displayName = "PasswordInput";

export { Input, PasswordInput };