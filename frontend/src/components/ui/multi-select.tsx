"use client";

import * as React from "react";
import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronDown, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { createPortal } from "react-dom";

export interface MultiSelectOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

export interface MultiSelectProps {
  label?: string;
  error?: string;
  hint?: string;
  options: MultiSelectOption[];
  placeholder?: string;
  value?: string[];
  onChange?: (value: string[]) => void;
  disabled?: boolean;
  id?: string;
  maxItems?: number;
}

const MultiSelect = React.forwardRef<HTMLButtonElement, MultiSelectProps>(
  (
    {
      label,
      error,
      hint,
      options,
      placeholder = "Select options",
      value = [],
      onChange,
      disabled = false,
      id,
      maxItems,
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
    const [searchQuery, setSearchQuery] = useState("");
    const buttonRef = useRef<HTMLButtonElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
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

    // Find selected options
    const selectedOptions = options.filter((opt) => value.includes(opt.value));

    // Filter options by search query
    const filteredOptions = options.filter((opt) =>
      opt.label.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Calculate dropdown position
    const calculatePosition = useCallback(() => {
      if (!buttonRef.current) return;

      const rect = buttonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const dropdownHeight = Math.min(filteredOptions.length * 44 + 56, 300);

      const openUpward = spaceBelow < dropdownHeight && rect.top > spaceBelow;

      setDropdownStyle({
        position: "fixed" as const,
        top: openUpward ? rect.top - dropdownHeight - 4 : rect.bottom + 4,
        left: rect.left,
        width: rect.width,
        zIndex: 9999,
      });
    }, [filteredOptions.length]);

    // Update position when opening
    useEffect(() => {
      if (isOpen) {
        calculatePosition();
        // Focus search input when opened
        setTimeout(() => {
          searchInputRef.current?.focus();
        }, 0);

        const handleScrollOrResize = () => {
          calculatePosition();
        };

        window.addEventListener("scroll", handleScrollOrResize, true);
        window.addEventListener("resize", handleScrollOrResize);

        return () => {
          window.removeEventListener("scroll", handleScrollOrResize, true);
          window.removeEventListener("resize", handleScrollOrResize);
        };
      } else {
        setSearchQuery("");
      }
    }, [isOpen, calculatePosition]);

    // Close dropdown when clicking outside
    useEffect(() => {
      if (!isOpen) return;

      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as Node;

        if (
          buttonRef.current &&
          !buttonRef.current.contains(target) &&
          dropdownRef.current &&
          !dropdownRef.current.contains(target)
        ) {
          setIsOpen(false);
        }
      };

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

    // Handle option toggle
    const handleToggleOption = useCallback(
      (optionValue: string) => {
        const isSelected = value.includes(optionValue);

        if (isSelected) {
          onChange?.(value.filter((v) => v !== optionValue));
        } else {
          if (maxItems && value.length >= maxItems) return;
          onChange?.([...value, optionValue]);
        }
      },
      [value, onChange, maxItems]
    );

    // Handle remove selected
    const handleRemove = useCallback(
      (optionValue: string, e: React.MouseEvent | React.KeyboardEvent) => {
        e.stopPropagation();
        onChange?.(value.filter((v) => v !== optionValue));
      },
      [value, onChange]
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
          "bg-zinc-900 border border-white/10 rounded-md shadow-xl shadow-black/50",
          "max-h-[300px] flex flex-col"
        )}
      >
        {/* Search input */}
        <div className="p-2 border-b border-white/5">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded text-sm text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-white/20"
            onClick={(e) => e.stopPropagation()}
          />
        </div>

        {/* Options */}
        <div className="overflow-auto flex-1 py-1">
          {filteredOptions.length === 0 ? (
            <div className="px-3 py-2 text-sm text-zinc-500 text-center">
              No options found
            </div>
          ) : (
            filteredOptions.map((option) => {
              const isSelected = value.includes(option.value);
              const isDisabled = !!(maxItems && !isSelected && value.length >= maxItems);

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (!isDisabled) {
                      handleToggleOption(option.value);
                    }
                  }}
                  onMouseDown={(e) => e.preventDefault()}
                  disabled={isDisabled}
                  className={cn(
                    "w-full px-3 py-2.5 text-left text-sm",
                    "flex items-center gap-3",
                    "transition-colors duration-100",
                    isDisabled
                      ? "opacity-50 cursor-not-allowed"
                      : isSelected
                      ? "bg-white/10 text-zinc-100"
                      : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200 cursor-pointer"
                  )}
                >
                  {/* Checkbox */}
                  <div
                    className={cn(
                      "w-4 h-4 rounded border flex items-center justify-center shrink-0",
                      isSelected
                        ? "bg-white border-white"
                        : "border-zinc-600"
                    )}
                  >
                    {isSelected && <Check className="h-3 w-3 text-black" />}
                  </div>

                  {/* Icon */}
                  {option.icon && (
                    <div className="shrink-0">{option.icon}</div>
                  )}

                  {/* Label */}
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="truncate">{option.label}</span>
                    {option.description && (
                      <span className="text-xs text-zinc-600 truncate">
                        {option.description}
                      </span>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        {maxItems && (
          <div className="px-3 py-2 border-t border-white/5 text-xs text-zinc-500">
            {value.length} / {maxItems} selected
          </div>
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
            "min-h-[42px]",
            error
              ? "border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20"
              : "border-white/10",
            isOpen && "border-white/20 ring-1 ring-white/10"
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 flex flex-wrap gap-1.5 min-w-0">
              {selectedOptions.length === 0 ? (
                <span className="text-zinc-600">{placeholder}</span>
              ) : (
                selectedOptions.map((option) => (
                  <span
                    key={option.value}
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-white/10 border border-white/10 rounded text-xs text-zinc-300"
                  >
                    {option.label}
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => handleRemove(option.value, e)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleRemove(option.value, e);
                        }
                      }}
                      className="text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                    >
                      <X className="h-3 w-3" />
                    </span>
                  </span>
                ))
              )}
            </div>
            <ChevronDown
              className={cn(
                "h-4 w-4 text-zinc-500 transition-transform duration-200 shrink-0",
                isOpen && "rotate-180"
              )}
            />
          </div>
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

MultiSelect.displayName = "MultiSelect";

export { MultiSelect };