"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import TripReportModal from "@/app/peaks/[slug]/TripReportModal";
import Modal from "@/app/components/Modal";
import type { Route } from "@/lib/database.types";

interface LogSummitButtonProps {
  peakId?: string;
  peakName?: string;
  routes?: Route[];
  peaks?: { id: string; name: string; slug: string; elevation: number }[];
  isLoggedIn: boolean;
  className?: string;
  children?: React.ReactNode;
}

export default function LogSummitButton({
  peakId: fixedPeakId,
  peakName: fixedPeakName,
  routes: fixedRoutes = [],
  peaks = [],
  isLoggedIn,
  className,
  children,
}: LogSummitButtonProps) {
  const router = useRouter();
  const [showPicker, setShowPicker] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [selectedPeakId, setSelectedPeakId] = useState("");
  const [selectedPeakName, setSelectedPeakName] = useState("");
  const [search, setSearch] = useState("");

  if (!isLoggedIn) {
    return (
      <a href="/auth/login" className={className}>
        {children}
      </a>
    );
  }

  const handleClick = () => {
    if (fixedPeakId && fixedPeakName) {
      setShowReport(true);
    } else {
      setSearch("");
      setShowPicker(true);
    }
  };

  const handlePeakSelect = (id: string, name: string) => {
    setSelectedPeakId(id);
    setSelectedPeakName(name);
    setShowPicker(false);
    setShowReport(true);
  };

  const filteredPeaks = search
    ? peaks.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    : peaks;

  const activePeakId = fixedPeakId || selectedPeakId;
  const activePeakName = fixedPeakName || selectedPeakName;

  return (
    <>
      <button type="button" onClick={handleClick} className={className}>
        {children}
      </button>

      <Modal isOpen={showPicker} onClose={() => setShowPicker(false)} title="Select a Peak" size="lg">
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Search peaks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
            className="w-full px-4 py-3 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border-app)] text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 focus:border-[var(--color-brand-primary)]"
          />
          <div className="max-h-80 overflow-y-auto space-y-1">
            {filteredPeaks.map((peak) => (
              <button
                key={peak.id}
                type="button"
                onClick={() => handlePeakSelect(peak.id, peak.name)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[var(--color-surface-subtle)] transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-lg bg-[var(--color-surface-subtle)] flex items-center justify-center">
                  <MountainIcon className="w-5 h-5 text-[var(--color-brand-primary)]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[var(--color-text-primary)]">{peak.name}</p>
                  <p className="text-xs text-[var(--color-text-secondary)]">{peak.elevation.toLocaleString()}&apos;</p>
                </div>
              </button>
            ))}
            {filteredPeaks.length === 0 && (
              <p className="text-sm text-[var(--color-text-secondary)] text-center py-6">
                No peaks found
              </p>
            )}
          </div>
        </div>
      </Modal>

      <TripReportModal
        isOpen={showReport}
        onClose={() => {
          setShowReport(false);
          setSelectedPeakId("");
          setSelectedPeakName("");
        }}
        peakId={activePeakId}
        peakName={activePeakName}
        routes={fixedRoutes}
        onReportCreated={() => router.refresh()}
      />
    </>
  );
}

function MountainIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 20l5-10 4 5 3-6 4 11H4z" />
    </svg>
  );
}
