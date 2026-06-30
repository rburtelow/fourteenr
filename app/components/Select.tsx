"use client";

import { useState, useRef, useEffect } from "react";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  name?: string;
  id?: string;
  className?: string;
  disabled?: boolean;
  size?: "sm" | "md";
}

export default function Select({
  value,
  onChange,
  options,
  placeholder,
  name,
  id,
  className = "",
  disabled = false,
  size = "md",
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const selected = options.find((o) => o.value === value);
  const hasValue = Boolean(selected);
  const displayLabel = selected?.label ?? placeholder ?? "Select…";

  const padding = size === "sm" ? "px-2.5 py-1.5" : "px-4 py-2.5";
  const textSize = size === "sm" ? "text-xs" : "text-sm";
  const optionPadding = size === "sm" ? "px-3 py-2" : "px-4 py-2.5";

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {name && <input type="hidden" name={name} value={value} />}
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between ${padding} rounded-xl bg-[var(--color-surface-subtle)] border ${textSize} focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors ${
          open ? "border-[var(--color-brand-primary)]" : "border-[var(--color-border-app)]"
        }`}
      >
        <span className={hasValue ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-secondary)]/60"}>
          {displayLabel}
        </span>
        <ChevronDownIcon
          className={`${size === "sm" ? "w-3 h-3" : "w-4 h-4"} text-[var(--color-text-secondary)] flex-shrink-0 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute z-50 mt-1.5 w-full rounded-xl bg-white border border-[var(--color-border-app)] shadow-lg shadow-black/10 overflow-hidden">
          {placeholder && (
            <button
              type="button"
              onClick={() => { onChange(""); setOpen(false); }}
              className={`w-full text-left ${optionPadding} ${textSize} transition-colors ${
                !value
                  ? "bg-[var(--color-brand-primary)]/5 text-[var(--color-brand-primary)] font-medium"
                  : "text-[var(--color-text-secondary)]/60 hover:bg-[var(--color-surface-subtle)]"
              }`}
            >
              {placeholder}
            </button>
          )}
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`w-full text-left ${optionPadding} ${textSize} transition-colors ${
                opt.value === value
                  ? "bg-[var(--color-brand-primary)]/5 text-[var(--color-brand-primary)] font-medium"
                  : "text-[var(--color-text-primary)] hover:bg-[var(--color-surface-subtle)]"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}
