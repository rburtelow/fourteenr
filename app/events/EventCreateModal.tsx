"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import Modal from "@/app/components/Modal";
import { createEvent } from "./actions";

interface Peak {
  id: string;
  name: string;
  slug: string;
  elevation: number;
}

interface EventCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  allPeaks: Peak[];
  onEventCreated?: () => void;
}

export default function EventCreateModal({ isOpen, onClose, allPeaks, onEventCreated }: EventCreateModalProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showEndDate, setShowEndDate] = useState(false);
  const [selectedPeakId, setSelectedPeakId] = useState<string | null>(null);
  const [showPeakSelector, setShowPeakSelector] = useState(false);
  const [peakSearch, setPeakSearch] = useState("");
  const peakSelectorRef = useRef<HTMLDivElement>(null);
  const peakSearchRef = useRef<HTMLInputElement>(null);

  // Reset form on close
  useEffect(() => {
    if (!isOpen) {
      setError(null);
      setShowEndDate(false);
      setSelectedPeakId(null);
      setShowPeakSelector(false);
      setPeakSearch("");
    }
  }, [isOpen]);

  useEffect(() => {
    if (!showPeakSelector) return;
    const handleClick = (e: MouseEvent) => {
      if (peakSelectorRef.current && !peakSelectorRef.current.contains(e.target as Node)) {
        setShowPeakSelector(false);
        setPeakSearch("");
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showPeakSelector]);

  useEffect(() => {
    if (showPeakSelector) {
      requestAnimationFrame(() => peakSearchRef.current?.focus());
    }
  }, [showPeakSelector]);

  const filteredPeaks = allPeaks.filter((p) =>
    p.name.toLowerCase().includes(peakSearch.toLowerCase())
  );

  const selectedPeak = allPeaks.find((p) => p.id === selectedPeakId);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const form = e.currentTarget;
    const formData = new FormData(form);
    if (selectedPeakId) formData.set("peakId", selectedPeakId);

    startTransition(async () => {
      const result = await createEvent(formData);
      if (result.error) {
        setError(result.error);
      } else {
        onEventCreated?.();
        onClose();
      }
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Event" size="lg">
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="px-4 py-3 rounded-xl bg-red-50 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Title */}
        <div>
          <label htmlFor="event-title" className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">
            Event Title *
          </label>
          <input
            id="event-title"
            name="title"
            type="text"
            required
            maxLength={200}
            placeholder="e.g., 14er Sunrise Hike"
            className="w-full px-4 py-2.5 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border-app)] text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 focus:border-[var(--color-brand-primary)]"
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="event-description" className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">
            Description
          </label>
          <textarea
            id="event-description"
            name="description"
            rows={3}
            maxLength={2000}
            placeholder="Tell people about this event..."
            className="w-full px-4 py-2.5 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border-app)] text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 focus:border-[var(--color-brand-primary)] resize-none"
          />
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="event-date" className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">
              Date & Time *
            </label>
            <input
              id="event-date"
              name="eventDate"
              type="datetime-local"
              required
              className="w-full px-4 py-2.5 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border-app)] text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 focus:border-[var(--color-brand-primary)]"
            />
          </div>
          <div>
            {showEndDate ? (
              <>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="event-end-date" className="text-sm font-medium text-[var(--color-text-primary)]">
                    End Date & Time
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowEndDate(false)}
                    className="text-xs text-[var(--color-text-secondary)] hover:text-red-500"
                  >
                    Remove
                  </button>
                </div>
                <input
                  id="event-end-date"
                  name="endDate"
                  type="datetime-local"
                  className="w-full px-4 py-2.5 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border-app)] text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 focus:border-[var(--color-brand-primary)]"
                />
              </>
            ) : (
              <div className="flex items-end h-full">
                <button
                  type="button"
                  onClick={() => setShowEndDate(true)}
                  className="text-sm text-[var(--color-brand-primary)] hover:underline"
                >
                  + Add end time
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Location */}
        <div>
          <label htmlFor="event-location" className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">
            Location *
          </label>
          <input
            id="event-location"
            name="location"
            type="text"
            required
            placeholder="e.g., Quandary Peak Trailhead"
            className="w-full px-4 py-2.5 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border-app)] text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 focus:border-[var(--color-brand-primary)]"
          />
        </div>

        {/* Peak Selector */}
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">
            Link to a 14er
          </label>
          {selectedPeak ? (
            <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border-app)] text-sm">
              <MountainIcon className="w-4 h-4 text-[var(--color-brand-primary)]" />
              <span className="font-medium text-[var(--color-text-primary)]">{selectedPeak.name}</span>
              <span className="text-[var(--color-text-secondary)] font-mono text-xs">{selectedPeak.elevation.toLocaleString()}&apos;</span>
              <button
                type="button"
                onClick={() => setSelectedPeakId(null)}
                className="ml-1 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="relative" ref={peakSelectorRef}>
              <button
                type="button"
                onClick={() => setShowPeakSelector(!showPeakSelector)}
                className="px-4 py-2.5 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border-app)] text-sm text-[var(--color-text-secondary)] hover:border-[var(--color-brand-primary)] transition-colors"
              >
                Select a peak (optional)
              </button>
              {showPeakSelector && (
                <div className="absolute top-full left-0 mt-1 w-72 bg-white border border-[var(--color-border-app)] rounded-xl shadow-lg overflow-hidden z-20">
                  <div className="flex items-center gap-2 px-3 py-2 border-b border-[var(--color-border-app)]">
                    <SearchIcon className="w-4 h-4 text-[var(--color-text-secondary)] flex-shrink-0" />
                    <input
                      ref={peakSearchRef}
                      type="text"
                      value={peakSearch}
                      onChange={(e) => setPeakSearch(e.target.value)}
                      placeholder="Search peaks..."
                      className="flex-1 text-sm bg-transparent outline-none placeholder:text-[var(--color-text-secondary)]/60 text-[var(--color-text-primary)]"
                    />
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {filteredPeaks.length === 0 ? (
                      <div className="px-4 py-3 text-sm text-[var(--color-text-secondary)] text-center">
                        No peaks found
                      </div>
                    ) : (
                      filteredPeaks.map((peak) => (
                        <button
                          key={peak.id}
                          type="button"
                          onClick={() => {
                            setSelectedPeakId(peak.id);
                            setShowPeakSelector(false);
                            setPeakSearch("");
                          }}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-[var(--color-surface-subtle)] flex items-center justify-between"
                        >
                          <span className="font-medium text-[var(--color-text-primary)]">{peak.name}</span>
                          <span className="text-[var(--color-text-secondary)] font-mono text-xs">{peak.elevation.toLocaleString()}&apos;</span>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Max Attendees */}
        <div>
          <label htmlFor="event-max-attendees" className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">
            Max Attendees
          </label>
          <input
            id="event-max-attendees"
            name="maxAttendees"
            type="number"
            min={1}
            placeholder="No limit"
            className="w-full px-4 py-2.5 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border-app)] text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 focus:border-[var(--color-brand-primary)]"
          />
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-subtle)] transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-accent)] transition-all hover:shadow-lg hover:shadow-[var(--color-brand-primary)]/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? "Creating..." : "Create Event"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function MountainIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3L2 21h20L12 3z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v8" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  );
}
