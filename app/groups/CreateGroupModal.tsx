"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/app/components/Modal";
import { createGroup } from "./actions";
import { CATEGORY_LABELS } from "@/lib/groups.types";
import type { GroupCategory } from "@/lib/groups.types";

interface Peak {
  id: string;
  name: string;
  slug: string;
  elevation: number;
}

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  allPeaks: Peak[];
}

const CATEGORIES = Object.entries(CATEGORY_LABELS) as [GroupCategory, string][];

export default function CreateGroupModal({ isOpen, onClose, allPeaks }: CreateGroupModalProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [privacy, setPrivacy] = useState<"public" | "private">("public");
  const [selectedPeakId, setSelectedPeakId] = useState<string | null>(null);
  const [showPeakSelector, setShowPeakSelector] = useState(false);
  const [peakSearch, setPeakSearch] = useState("");
  const peakSelectorRef = useRef<HTMLDivElement>(null);
  const peakSearchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setError(null);
      setPrivacy("public");
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
    formData.set("privacy", privacy);
    if (selectedPeakId) formData.set("peak_id", selectedPeakId);

    startTransition(async () => {
      const result = await createGroup(formData);
      if (result.error) {
        setError(result.error);
      } else if (result.slug) {
        onClose();
        router.push(`/groups/${result.slug}`);
      }
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create a Group" size="lg">
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Name */}
        <div>
          <label htmlFor="group-name" className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">
            Group Name <span className="text-red-500">*</span>
          </label>
          <input
            id="group-name"
            name="name"
            type="text"
            required
            maxLength={100}
            placeholder="e.g., Front Range Hikers"
            className="w-full px-4 py-2.5 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border-app)] text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 focus:border-[var(--color-brand-primary)] transition-colors"
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="group-description" className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">
            Description
          </label>
          <textarea
            id="group-description"
            name="description"
            rows={3}
            maxLength={500}
            placeholder="What is this group about?"
            className="w-full px-4 py-2.5 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border-app)] text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 focus:border-[var(--color-brand-primary)] resize-none transition-colors"
          />
        </div>

        {/* Category */}
        <div>
          <label htmlFor="group-category" className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">
            Category
          </label>
          <select
            id="group-category"
            name="category"
            defaultValue="general"
            className="w-full px-4 py-2.5 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border-app)] text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 focus:border-[var(--color-brand-primary)] transition-colors"
          >
            {CATEGORIES.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Privacy Toggle */}
        <div>
          <p className="text-sm font-medium text-[var(--color-text-primary)] mb-2">Privacy</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setPrivacy("public")}
              className={`flex items-start gap-3 p-3.5 rounded-xl border-2 text-left transition-all ${
                privacy === "public"
                  ? "border-[var(--color-brand-primary)] bg-[var(--color-brand-primary)]/5"
                  : "border-[var(--color-border-app)] bg-[var(--color-surface-subtle)] hover:border-[var(--color-border-app-strong)]"
              }`}
            >
              <GlobeIcon className="w-5 h-5 mt-0.5 flex-shrink-0 text-[var(--color-brand-primary)]" />
              <div>
                <p className="text-sm font-semibold text-[var(--color-text-primary)]">Public</p>
                <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">Anyone can join and see posts</p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setPrivacy("private")}
              className={`flex items-start gap-3 p-3.5 rounded-xl border-2 text-left transition-all ${
                privacy === "private"
                  ? "border-[var(--color-brand-primary)] bg-[var(--color-brand-primary)]/5"
                  : "border-[var(--color-border-app)] bg-[var(--color-surface-subtle)] hover:border-[var(--color-border-app-strong)]"
              }`}
            >
              <LockIcon className="w-5 h-5 mt-0.5 flex-shrink-0 text-[var(--color-brand-primary)]" />
              <div>
                <p className="text-sm font-semibold text-[var(--color-text-primary)]">Private</p>
                <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">Members must request to join</p>
              </div>
            </button>
          </div>
        </div>

        {/* Peak Selector */}
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">
            Link to a 14er (optional)
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
                Select a peak
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
            {isPending ? "Creating..." : "Create Group"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
    </svg>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
    </svg>
  );
}

function MountainIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3L2 21h20L12 3z" />
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
