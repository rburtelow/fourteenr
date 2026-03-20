"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/app/components/Modal";
import { quickMarkPeaks } from "./quick-mark-actions";

interface PeakInfo {
  id: string;
  name: string;
  elevation: number;
  range: string | null;
  rank: number | null;
}

interface SummitLogInfo {
  peak_id: string;
  summit_date: string;
}

interface QuickMarkPeaksButtonProps {
  peaks: PeakInfo[];
  completedPeakIds: string[];
  summitLogs: SummitLogInfo[];
  isLoggedIn: boolean;
  className?: string;
  children?: React.ReactNode;
}

export default function QuickMarkPeaksButton({
  peaks,
  completedPeakIds,
  summitLogs,
  isLoggedIn,
  className,
  children,
}: QuickMarkPeaksButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [defaultDate, setDefaultDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });
  const [selected, setSelected] = useState<Map<string, string>>(new Map());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const completedSet = useMemo(() => new Set(completedPeakIds), [completedPeakIds]);

  // Map peak_id → earliest summit_date for display
  const completedDateMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const log of summitLogs) {
      const existing = map.get(log.peak_id);
      if (!existing || log.summit_date < existing) {
        map.set(log.peak_id, log.summit_date);
      }
    }
    return map;
  }, [summitLogs]);

  // Group peaks by range
  const grouped = useMemo(() => {
    const groups = new Map<string, PeakInfo[]>();
    for (const peak of peaks) {
      const range = peak.range || "Other";
      if (!groups.has(range)) groups.set(range, []);
      groups.get(range)!.push(peak);
    }
    // Sort peaks within each group by rank
    for (const [, list] of groups) {
      list.sort((a, b) => (a.rank ?? 999) - (b.rank ?? 999));
    }
    // Sort groups alphabetically
    return Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [peaks]);

  // Filter by search
  const filteredGroups = useMemo(() => {
    if (!search.trim()) return grouped;
    const q = search.toLowerCase();
    return grouped
      .map(([range, list]) => {
        const filtered = list.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            (p.range || "").toLowerCase().includes(q)
        );
        return [range, filtered] as [string, PeakInfo[]];
      })
      .filter(([, list]) => list.length > 0);
  }, [grouped, search]);

  if (!isLoggedIn) {
    return (
      <a href="/auth/login" className={className}>
        {children}
      </a>
    );
  }

  const togglePeak = (peakId: string) => {
    setSelected((prev) => {
      const next = new Map(prev);
      if (next.has(peakId)) {
        next.delete(peakId);
      } else {
        next.set(peakId, defaultDate);
      }
      return next;
    });
  };

  const updatePeakDate = (peakId: string, date: string) => {
    setSelected((prev) => {
      const next = new Map(prev);
      next.set(peakId, date);
      return next;
    });
  };

  const selectAllUncompleted = () => {
    setSelected((prev) => {
      const next = new Map(prev);
      for (const peak of peaks) {
        if (!completedSet.has(peak.id) && !next.has(peak.id)) {
          next.set(peak.id, defaultDate);
        }
      }
      return next;
    });
  };

  const handleSave = async () => {
    if (selected.size === 0) return;
    setSaving(true);
    setError(null);
    const entries = Array.from(selected.entries()).map(([peakId, date]) => ({
      peakId,
      summitDate: date,
    }));
    const result = await quickMarkPeaks(entries);
    setSaving(false);
    if (result.error) {
      setError(result.error);
    } else {
      setIsOpen(false);
      setSelected(new Map());
      setSearch("");
      router.refresh();
    }
  };

  const handleOpen = () => {
    setSelected(new Map());
    setSearch("");
    setError(null);
    setDefaultDate(new Date().toISOString().split("T")[0]);
    setIsOpen(true);
  };

  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <>
      <button type="button" onClick={handleOpen} className={className}>
        {children}
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Quick Mark Peaks"
        size="xl"
      >
        {/* Top controls */}
        <div className="space-y-3 mb-5">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
                Default Date
              </label>
              <input
                type="date"
                value={defaultDate}
                max={todayStr}
                onChange={(e) => {
                  setDefaultDate(e.target.value);
                  // Update all selected peaks that still have the old default
                  setSelected((prev) => {
                    const next = new Map(prev);
                    for (const [id, date] of prev) {
                      if (date !== e.target.value) {
                        // Only update if it was the previous default
                        next.set(id, e.target.value);
                      }
                    }
                    return next;
                  });
                }}
                className="w-full px-3 py-2 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border-app)] text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 focus:border-[var(--color-brand-primary)]"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
                Search
              </label>
              <input
                type="text"
                placeholder="Filter peaks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border-app)] text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 focus:border-[var(--color-brand-primary)]"
              />
            </div>
            <div className="flex items-end">
              <button
                type="button"
                onClick={selectAllUncompleted}
                className="px-4 py-2 text-sm font-medium text-[var(--color-brand-primary)] border border-[var(--color-border-app)] rounded-xl hover:bg-[var(--color-surface-subtle)] transition-colors whitespace-nowrap"
              >
                Select All Uncompleted
              </button>
            </div>
          </div>
        </div>

        {/* Peak list grouped by range */}
        <div className="max-h-[50vh] overflow-y-auto space-y-5 -mx-6 px-6">
          {filteredGroups.map(([range, rangePeaks]) => (
            <div key={range}>
              <h4 className="text-xs font-semibold text-[var(--color-text-muted-green)] tracking-wider uppercase mb-2 sticky top-0 bg-white py-1 z-[1]">
                {range}
              </h4>
              <div className="space-y-1">
                {rangePeaks.map((peak) => {
                  const isCompleted = completedSet.has(peak.id);
                  const isSelected = selected.has(peak.id);
                  const completedDate = completedDateMap.get(peak.id);

                  if (isCompleted) {
                    return (
                      <div
                        key={peak.id}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[var(--color-surface-subtle)]/50 opacity-70"
                      >
                        <div className="w-5 h-5 rounded-md bg-[var(--color-brand-primary)] flex items-center justify-center flex-shrink-0">
                          <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium text-[var(--color-text-primary)]">
                            {peak.name}
                          </span>
                          <span className="text-xs text-[var(--color-text-secondary)] ml-2">
                            {peak.elevation.toLocaleString()}&apos;
                          </span>
                        </div>
                        <span className="text-xs text-[var(--color-text-secondary)] flex-shrink-0">
                          {completedDate
                            ? new Date(completedDate + "T00:00:00").toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })
                            : "Completed"}
                        </span>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={peak.id}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-[var(--color-brand-primary)]/5 border border-[var(--color-brand-primary)]/20"
                          : "hover:bg-[var(--color-surface-subtle)]"
                      }`}
                      onClick={() => togglePeak(peak.id)}
                    >
                      <div
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                          isSelected
                            ? "bg-[var(--color-brand-primary)] border-[var(--color-brand-primary)]"
                            : "border-[var(--color-border-app-strong)]"
                        }`}
                      >
                        {isSelected && (
                          <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium text-[var(--color-text-primary)]">
                          {peak.name}
                        </span>
                        <span className="text-xs text-[var(--color-text-secondary)] ml-2">
                          {peak.elevation.toLocaleString()}&apos;
                        </span>
                      </div>
                      {isSelected && (
                        <input
                          type="date"
                          value={selected.get(peak.id) || defaultDate}
                          max={todayStr}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => {
                            e.stopPropagation();
                            updatePeakDate(peak.id, e.target.value);
                          }}
                          className="text-xs px-2 py-1 rounded-lg border border-[var(--color-border-app)] bg-white text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 flex-shrink-0"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          {filteredGroups.length === 0 && (
            <p className="text-sm text-[var(--color-text-secondary)] text-center py-8">
              No peaks found
            </p>
          )}
        </div>

        {/* Sticky footer */}
        <div className="mt-5 pt-4 border-t border-[var(--color-border-app)] flex items-center justify-between gap-4">
          <p className="text-sm text-[var(--color-text-secondary)]">
            {selected.size > 0 ? (
              <span className="font-medium text-[var(--color-brand-primary)]">
                {selected.size} peak{selected.size !== 1 ? "s" : ""} selected
              </span>
            ) : (
              "No peaks selected"
            )}
          </p>
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={selected.size === 0 || saving}
              className="px-5 py-2 text-sm font-semibold text-white bg-[var(--color-brand-primary)] rounded-xl hover:bg-[var(--color-brand-accent)] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[var(--color-brand-primary)]/20"
            >
              {saving ? "Saving..." : `Save ${selected.size > 0 ? `(${selected.size})` : ""}`}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
