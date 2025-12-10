import * as React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

/**
 * Button Variants
 * ---------------
 * We define different "looks" for our button. 
 * - primary: Main action buttons (like "Submit", "Save")
 * - secondary: Less important actions
 * - ghost: Minimal styling, used in navbars/menus
 * - danger: Destructive actions (like "Delete")
 * - link:  Looks like a text link
 */
const buttonVariants = {
  primary: "bg-aeon-accent-primary text-white hover:bg-aeon-accent-secondary focus:ring-aeon-accent-primary",
  secondary:  "bg-aeon-bg-tertiary text-aeon-text-primary border border-aeon-border hover:bg-aeon-bg-hover hover:border-aeon-text-muted focus:ring-aeon-border",
  ghost: "bg-transparent text-aeon-text-secondary hover:bg-aeon-bg-tertiary hover:text-aeon-text-primary",
  danger: "bg-aeon-accent-danger text-white hover:bg-red-600 focus:ring-aeon-accent-danger",
  link:  "bg-transparent text-aeon-accent-primary hover:text-aeon-accent-secondary underline-offset-4 hover:underline p-0",
};

/**
 * Button Sizes
 * ------------
 * Different sizes for different contexts
 */
const buttonSizes = {
  sm: "px-3 py-1.5 text-sm",
  md:  "px-4 py-2.5 text-sm",
  lg:  "px-6 py-3 text-base",
  xl: "px-8 py-4 text-lg",
  icon: "p-2.5", // Square button for icons only
};

/**
 * Button Props
 * ------------
 * We extend the native HTML button props so our button
 * can accept everything a normal button can (onClick, type, etc.)
 * plus our custom props (variant, size, loading, etc.)
 */
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof buttonVariants;
  size?:  keyof typeof buttonSizes;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

/**
 * Button Component
 * ----------------
 * React. forwardRef allows parent components to get a reference
 * to the actual button element.  This is important for:
 * - Focus management
 * - Animations
 * - Form libraries
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          // Base styles that apply to ALL buttons
          "inline-flex items-center justify-center gap-2 font-medium rounded-lg",
          "transition-all duration-200",
          "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-aeon-bg-primary",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          // Apply the variant styles
          buttonVariants[variant],
          // Apply the size styles
          buttonSizes[size],
          // Allow custom classes to override
          className
        )}
        {...props}
      >
        {/* Show spinner when loading, otherwise show left icon */}
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : leftIcon ?  (
          leftIcon
        ) : null}

        {/* Button text */}
        {children}

        {/* Right icon (only if not loading) */}
        {!isLoading && rightIcon}
      </button>
    );
  }
);

// Display name helps with debugging in React DevTools
Button.displayName = "Button";

export { Button, buttonVariants, buttonSizes };