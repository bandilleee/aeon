import * as React from "react";
import { cn } from "@/lib/utils";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
}

export function Avatar({ children, className, ...props }: AvatarProps) {
  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden rounded-full bg-zinc-800 text-zinc-200 font-bold uppercase",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export interface AvatarFallbackProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
}

export function AvatarFallback({ children, className, ...props }: AvatarFallbackProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center w-full h-full bg-zinc-700 text-white text-lg font-bold",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
