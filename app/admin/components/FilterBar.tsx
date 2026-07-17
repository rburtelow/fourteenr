"use client";

import { type ReactNode } from "react";

interface FilterBarProps {
  search?: {
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
  };
  children?: ReactNode;
}

export default function FilterBar({ search, children }: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 mb-4">
      {search && (
        <input
          type="search"
          value={search.value}
          onChange={(e) => search.onChange(e.target.value)}
          placeholder={search.placeholder ?? "Search…"}
          className="flex-1 min-w-[200px] max-w-sm px-3 py-2 text-sm rounded-lg border border-[var(--color-border-app)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]/30"
        />
      )}
      {children}
    </div>
  );
}
