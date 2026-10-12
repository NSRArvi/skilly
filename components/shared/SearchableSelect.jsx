"use client";

import React, { useState, useRef, useEffect } from "react";
import { Search, ChevronDown, Check, X } from "lucide-react";
import { twMerge } from "tailwind-merge";

/**
 * SearchableSelect
 * A searchable dropdown with live filtering suggestions from items.
 *
 * Props:
 * - value: currently selected ID/value
 * - onChange: callback when selected value changes: (value: string) => void
 * - items: array of objects { id, name, ... }
 * - placeholder: input placeholder
 * - searchPlaceholder: search input placeholder
 * - disabled: boolean
 * - emptyMessage: text when no items match search query
 * - className: custom class for container / trigger button
 */
export default function SearchableSelect({
  value,
  onChange,
  items = [],
  placeholder = "Select an option",
  searchPlaceholder = "Type to search...",
  disabled = false,
  emptyMessage = "No results found",
  className = "",
  triggerClassName = "",
  icon: Icon = null,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  const selectedItem = items.find((item) => String(item.id) === String(value));

  // Filter items based on user search query
  const filteredItems = items.filter((item) =>
    item.name?.toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Focus search input when opened
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  const handleSelect = (itemId) => {
    onChange(itemId);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange("");
    setSearchTerm("");
  };

  return (
    <div className={`relative w-full ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!disabled) setIsOpen((prev) => !prev);
        }}
        className={twMerge(
          "w-full flex items-center justify-between px-3 h-10 rounded-xl border text-sm transition-all text-left outline-none",
          disabled
            ? "bg-muted/40 text-muted-foreground/50 border-border/50 cursor-not-allowed opacity-60"
            : isOpen
            ? "bg-background border-primary ring-1 ring-primary text-foreground shadow-sm"
            : "bg-background/50 hover:bg-background border-border text-foreground hover:border-border/80",
          triggerClassName
        )}
      >
        <div className="flex items-center gap-2 truncate mr-2 min-w-0">
          {Icon && (
            <Icon className="w-3.5 h-3.5 text-primary shrink-0" />
          )}
          <span className={`truncate ${!selectedItem ? "text-muted-foreground" : "font-medium"}`}>
            {selectedItem ? selectedItem.name : placeholder}
          </span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 text-muted-foreground">
          {selectedItem && !disabled && (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClear}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") handleClear(e);
              }}
              className="p-0.5 hover:text-foreground hover:bg-muted rounded-full transition-colors"
              title="Clear selection"
            >
              <X className="w-3.5 h-3.5" />
            </span>
          )}
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${
              isOpen ? "rotate-180 text-primary" : ""
            }`}
          />
        </div>
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 bg-popover text-popover-foreground border border-border rounded-xl shadow-xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150">
          {/* Search Box */}
          <div className="p-2 border-b border-border bg-muted/20">
            <div className="relative flex items-center">
              <Search className="absolute left-2.5 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Options List */}
          <div className="max-h-60 overflow-y-auto p-1.5 space-y-0.5">
            {filteredItems.length === 0 ? (
              <div className="py-6 text-center text-xs text-muted-foreground">
                {emptyMessage}
              </div>
            ) : (
              filteredItems.map((item) => {
                const isSelected = String(item.id) === String(value);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelect(item.id)}
                    className={`w-full flex items-center justify-between px-2.5 py-2 text-xs rounded-lg text-left transition-colors ${
                      isSelected
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-foreground hover:bg-muted/70"
                    }`}
                  >
                    <span className="truncate">{item.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-primary shrink-0 ml-2" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

