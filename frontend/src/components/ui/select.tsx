"use client";

import * as React from "react";
import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { createPortal } from "react-dom";

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
}

export interface SelectProps {
  label?: string;
  error?: string;
  hint?: string;
  options: SelectOption[];
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  id?: string;
}

const Select = React.forwardRef<HTMLButtonElement, SelectProps>(
  (
    {
      label,
      error,
      hint,
      options,
      placeholder = "Select an option",
      value,
      onChange,
      disabled = false,
      id,
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
    const buttonRef = useRef<HTMLButtonElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const selectId = id || React.useId();

    // Handle client-side mounting for portal
    useEffect(() => {
      setMounted(true);
    }, []);

    // Merge refs
    const mergedRef = useCallback(
      (node: HTMLButtonElement) => {
        buttonRef.current = node;
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      },
      [ref]
    );

    // Find selected option
    const selectedOption = options.find((opt) => opt.value === value);

    // Calculate dropdown position
    const calculatePosition = useCallback(() => {
      if (!buttonRef.current) return;

      const rect = buttonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const dropdownHeight = Math.min(options.length * 44 + 8, 248);

      const openUpward = spaceBelow < dropdownHeight && rect.top > spaceBelow;

      setDropdownStyle({
        position: "fixed" as const,
        top: openUpward ? rect.top - dropdownHeight - 4 : rect.bottom + 4,
        left: rect.left,
        width: rect.width,
        zIndex: 9999,
      });
    }, [options.length]);

    // Update position when opening
    useEffect(() => {
      if (isOpen) {
        calculatePosition();

        const handleScrollOrResize = () => {
          calculatePosition();
        };

        window.addEventListener("scroll", handleScrollOrResize, true);
        window.addEventListener("resize", handleScrollOrResize);

        return () => {
          window.removeEventListener("scroll", handleScrollOrResize, true);
          window.removeEventListener("resize", handleScrollOrResize);
        };
      }
    }, [isOpen, calculatePosition]);

    // Close dropdown when clicking outside
    useEffect(() => {
      if (!isOpen) return;

      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as Node;

        // Check if click is outside button and dropdown
        if (
          buttonRef.current &&
          !buttonRef.current.contains(target) &&
          dropdownRef.current &&
          !dropdownRef.current.contains(target)
        ) {
          setIsOpen(false);
        }
      };

      // Use setTimeout to avoid immediate trigger
      const timeoutId = setTimeout(() => {
        document.addEventListener("mousedown", handleClickOutside);
      }, 0);

      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [isOpen]);

    // Close on escape key
    useEffect(() => {
      if (!isOpen) return;

      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          setIsOpen(false);
          buttonRef.current?.focus();
        }
      };

      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }, [isOpen]);

    // Handle option selection
    const handleSelect = useCallback(
      (optionValue: string) => {
        onChange?.(optionValue);
        setIsOpen(false);
        buttonRef.current?.focus();
      },
      [onChange]
    );

    // Handle toggle
    const handleToggle = useCallback(() => {
      if (!disabled) {
        setIsOpen((prev) => !prev);
      }
    }, [disabled]);

    // Dropdown content
    const dropdownContent = isOpen && mounted && (
      <div
        ref={dropdownRef}
        style={dropdownStyle}
        className={cn(
          "py-1 bg-zinc-900 border border-white/10 rounded-md shadow-xl shadow-black/50",
          "max-h-60 overflow-auto"
        )}
        role="listbox"
      >
        {options.length === 0 ? (
          <div className="px-3 py-2 text-sm text-zinc-500 text-center">
            No options available
          </div>
        ) : (
          options.map((option) => {
            const isSelected = option.value === value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSelect(option.value);
                }}
                onMouseDown={(e) => {
                  // Prevent blur on the trigger button
                  e.preventDefault();
                }}
                className={cn(
                  "w-full px-3 py-2.5 text-left text-sm",
                  "flex items-center justify-between gap-2",
                  "transition-colors duration-100",
                  "cursor-pointer",
                  isSelected
                    ? "bg-white/10 text-zinc-100"
                    : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
                )}
                role="option"
                aria-selected={isSelected}
              >
                <div className="flex flex-col">
                  <span>{option.label}</span>
                  {option.description && (
                    <span className="text-xs text-zinc-600">
                      {option.description}
                    </span>
                  )}
                </div>
                {isSelected && (
                  <Check className="h-4 w-4 text-white shrink-0" />
                )}
              </button>
            );
          })
        )}
      </div>
    );

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

        {/* Select trigger */}
        <button
          ref={mergedRef}
          id={selectId}
          type="button"
          onClick={handleToggle}
          disabled={disabled}
          className={cn(
            "w-full px-3 py-2.5 bg-black/20 border rounded-md text-left",
            "text-sm transition-all duration-200",
            "focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/10",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "flex items-center justify-between gap-2",
            error
              ? "border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20"
              : "border-white/10",
            isOpen && "border-white/20 ring-1 ring-white/10"
          )}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <span
            className={cn(
              "truncate",
              selectedOption ? "text-zinc-300" : "text-zinc-600"
            )}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown
            className={cn(
              "h-4 w-4 text-zinc-500 transition-transform duration-200 shrink-0",
              isOpen && "rotate-180"
            )}
          />
        </button>

        {/* Dropdown via Portal */}
        {mounted && createPortal(dropdownContent, document.body)}

        {/* Error message */}
        {error && <p className="mt-2 text-xs text-red-400">{error}</p>}

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