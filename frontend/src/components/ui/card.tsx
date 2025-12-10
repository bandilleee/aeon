import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Card Component
 * --------------
 * A container component for grouping related content. 
 * Used for login forms, dashboard widgets, etc.
 */

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "hover" | "glass";
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const variants = {
      default: "bg-aeon-bg-secondary border border-aeon-border",
      hover:  "bg-aeon-bg-secondary border border-aeon-border hover:border-aeon-border-focus hover:shadow-aeon-glow transition-all duration-200",
      glass:  "bg-aeon-bg-secondary/80 backdrop-blur-lg border border-aeon-border",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-xl shadow-aeon-sm",
          variants[variant],
          className
        )}
        {...props}
      />
    );
  }
);

Card.displayName = "Card";

/**
 * Card Header
 * -----------
 * Container for card title and description
 */
const CardHeader = React.forwardRef<
  HTMLDivElement,
  React. HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6 pb-4", className)}
    {...props}
  />
));

CardHeader.displayName = "CardHeader";

/**
 * Card Title
 * ----------
 * The main heading of a card
 */
const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-xl font-semibold text-aeon-text-primary leading-none tracking-tight",
      className
    )}
    {...props}
  />
));

CardTitle.displayName = "CardTitle";

/**
 * Card Description
 * ----------------
 * Subtitle or description text
 */
const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ... props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-aeon-text-secondary", className)}
    {...props}
  />
));

CardDescription.displayName = "CardDescription";

/**
 * Card Content
 * ------------
 * Main content area of the card
 */
const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));

CardContent.displayName = "CardContent";

/**
 * Card Footer
 * -----------
 * Bottom area, typically for actions/buttons
 */
const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));

CardFooter.displayName = "CardFooter";

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
};