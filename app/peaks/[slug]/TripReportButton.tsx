"use client";

import { useState } from "react";
import TripReportModal from "./TripReportModal";
import type { Route } from "@/lib/database.types";

interface TripReportButtonProps {
  peakId: string;
  peakName: string;
  routes: Route[];
  isLoggedIn: boolean;
}

export default function TripReportButton({ peakId, peakName, routes, isLoggedIn }: TripReportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!isLoggedIn) {
    return (
      <a
        href="/auth/login"
        className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-semibold text-sm text-[var(--color-text-secondary)] border-2 border-[var(--color-border-app-strong)] bg-white hover:bg-[var(--color-surface-subtle)] transition-all"
      >
        <DocumentIcon className="w-5 h-5" />
        Write Trip Report
      </a>
    );
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-semibold text-sm text-[var(--color-text-secondary)] border-2 border-[var(--color-border-app-strong)] bg-white hover:bg-[var(--color-surface-subtle)] transition-all"
      >
        <DocumentIcon className="w-5 h-5" />
        Write Trip Report
      </button>

      <TripReportModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        peakId={peakId}
        peakName={peakName}
        routes={routes}
      />
    </>
  );
}

function DocumentIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  );
}
