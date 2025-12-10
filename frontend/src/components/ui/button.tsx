import * as React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

/**
 * Button Variants - DevMode Style
 */
const buttonVariants = {
  primary: 
    "bg-white text-black border border-transparent hover:bg-zinc-200 shadow-lg shadow-white/5",
  secondary: 
    "bg-zinc-900 text-zinc-300 border border-white/10 hover:bg-zinc-800 hover:text-white shadow-sm",
  ghost: 
    "bg-transparent text-zinc-400 hover:bg-white/5 hover:text-zinc-200",
  danger:
    "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 hover:text-red-300",
  link:
    "bg-transparent text-zinc-400 hover:text-white underline-offset-4 hover:underline p-0 h-auto",
  outline: 
    "bg-transparent text-zinc-300 border border-white/10 hover:bg-white/5 hover:border-white/20",
};

/**
 * Button Sizes
 */
const buttonSizes = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-2.5 text-sm",
  xl: "px-6 py-3 text-base",
  icon: "p-2",
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof buttonVariants;
  size?: keyof typeof buttonSizes;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

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
          // Base styles
          "inline-flex items-center justify-center gap-2 font-medium rounded-md",
          "transition-all duration-200",
          "focus:outline-none focus:ring-1 focus:ring-white/20",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          // Variant styles
          buttonVariants[variant],
          // Size styles
          buttonSizes[size],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : leftIcon ? (
          leftIcon
        ) : null}
        {children}
        {! isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants, buttonSizes };