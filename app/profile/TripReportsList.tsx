"use client";

import { useState } from "react";
import Link from "next/link";
import Modal from "@/app/components/Modal";
import type { TripReportSections } from "@/lib/database.types";

interface TripReportData {
  id: string;
  peakSlug: string;
  peakName: string;
  peakElevation: string;
  hikeDate: string;
  hikeDateRaw: string;
  startTime: string | null;
  endTime: string | null;
  totalTimeMinutes: number | null;
  summary: string;
  narrative: string | null;
  difficultyRating: number;
  conditionSeverity: number;
  objectiveRisk: number;
  trailheadAccess: string | null;
  recommended: boolean;
  snowPresent: boolean;
  sections: TripReportSections | null;
}

interface TripReportsListProps {
  reports: TripReportData[];
}

const TRAILHEAD_LABELS: Record<string, string> = {
  clear_2wd: "Clear (2WD)",
  rough_2wd: "Rough (2WD)",
  "4wd_required": "4WD Required",
  snow_blocked: "Snow Blocked",
};

const SECTION_LABELS: Record<string, { label: string; icon: string }> = {
  trailhead_conditions: { label: "Trailhead Conditions", icon: "P" },
  weather: { label: "Weather", icon: "W" },
  snow_conditions: { label: "Snow Conditions", icon: "S" },
  route_conditions: { label: "Route Conditions", icon: "R" },
  water_crossings: { label: "Water Crossings", icon: "~" },
  navigation_notes: { label: "Navigation Notes", icon: "N" },
  time_breakdown: { label: "Time Breakdown", icon: "T" },
  gear: { label: "Gear", icon: "G" },
  camping: { label: "Camping", icon: "C" },
  training_prep: { label: "Training & Prep", icon: "F" },
  wildlife: { label: "Wildlife", icon: "A" },
  lessons_learned: { label: "Lessons Learned", icon: "L" },
  mistakes_made: { label: "Mistakes Made", icon: "M" },
};

function formatTime(time: string | null) {
  if (!time) return null;
  const [h, m] = time.split(":");
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const h12 = hour % 12 || 12;
  return `${h12}:${m} ${ampm}`;
}

function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

function RatingDots({ value, max = 5, color }: { value: number; max?: number; color: string }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: max }, (_, i) => (
        <div
          key={i}
          className={`w-2.5 h-2.5 rounded-full ${
            i < value ? color : "bg-[var(--color-border-app)]"
          }`}
        />
      ))}
    </div>
  );
}

function SectionDetail({ sectionKey, section }: { sectionKey: string; section: { enabled: boolean; data?: Record<string, unknown>; notes?: string } }) {
  const meta = SECTION_LABELS[sectionKey];
  if (!meta || !section.enabled) return null;

  const data = section.data || {};
  const notes = section.notes;
  const dataEntries = Object.entries(data).filter(
    ([, v]) => v !== null && v !== undefined && v !== "" && !(Array.isArray(v) && v.length === 0)
  );

  if (dataEntries.length === 0 && !notes) return null;

  return (
    <div className="p-4 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border-app)]">
      <div className="flex items-center gap-2.5 mb-2.5">
        <span className="w-7 h-7 rounded-lg bg-[var(--color-brand-primary)] text-white flex items-center justify-center text-xs font-bold">
          {meta.icon}
        </span>
        <h4 className="text-sm font-semibold text-[var(--color-text-primary)]">{meta.label}</h4>
      </div>
      {dataEntries.length > 0 && (
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 mb-2 text-sm">
          {dataEntries.map(([key, val]) => {
            const label = key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
            let display: string;
            if (typeof val === "boolean") display = val ? "Yes" : "No";
            else if (Array.isArray(val)) display = val.join(", ");
            else if (typeof val === "number" && key.includes("minutes")) display = formatDuration(val);
            else display = String(val);
            return (
              <span key={key} className="text-[var(--color-text-secondary)]">
                <span className="font-medium text-[var(--color-text-primary)]">{label}:</span>{" "}
                {display}
              </span>
            );
          })}
        </div>
      )}
      {notes && (
        <p className="text-sm text-[var(--color-text-secondary)] whitespace-pre-wrap">{notes}</p>
      )}
    </div>
  );
}

const SECTION_ORDER = [
  "trailhead_conditions",
  "weather",
  "snow_conditions",
  "route_conditions",
  "water_crossings",
  "navigation_notes",
  "time_breakdown",
  "gear",
  "camping",
  "training_prep",
  "wildlife",
  "lessons_learned",
  "mistakes_made",
];

function TripReportViewModal({ report, isOpen, onClose }: { report: TripReportData; isOpen: boolean; onClose: () => void }) {
  const sections = report.sections || {};
  const enabledSections = SECTION_ORDER
    .filter((key) => {
      const s = (sections as Record<string, { enabled: boolean } | null>)[key];
      return s && s.enabled;
    })
    .map((key) => [key, (sections as Record<string, unknown>)[key]] as [string, unknown]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Trip Report" size="xl">
      <div className="space-y-6">
        {/* Peak header */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[var(--color-surface-subtle)] to-[var(--color-border-app-strong)] flex items-center justify-center flex-shrink-0">
            <MountainIcon className="w-7 h-7 text-[var(--color-brand-primary)]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Link
                href={`/peaks/${report.peakSlug}`}
                className="text-lg font-bold text-[var(--color-text-primary)] hover:text-[var(--color-brand-primary)] transition-colors hover:underline"
                onClick={onClose}
              >
                {report.peakName}
              </Link>
              <span className="font-mono text-sm text-[var(--color-brand-primary)]">{report.peakElevation}</span>
            </div>
            <div className="flex items-center gap-3 mt-1 text-sm text-[var(--color-text-secondary)]">
              <span className="flex items-center gap-1">
                <CalendarIcon className="w-3.5 h-3.5" />
                {report.hikeDate}
              </span>
              {report.startTime && report.endTime && (
                <span className="flex items-center gap-1">
                  <ClockIcon className="w-3.5 h-3.5" />
                  {formatTime(report.startTime)} - {formatTime(report.endTime)}
                </span>
              )}
              {report.totalTimeMinutes && (
                <span className="font-medium text-[var(--color-brand-primary)]">
                  {formatDuration(report.totalTimeMinutes)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Badges row */}
        <div className="flex flex-wrap gap-2">
          {report.recommended ? (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Recommended
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
              Not Recommended
            </span>
          )}
          {report.snowPresent && (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
              Snow Present
            </span>
          )}
          {report.trailheadAccess && (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[var(--color-surface-subtle)] text-[var(--color-text-secondary)] border border-[var(--color-border-app)]">
              {TRAILHEAD_LABELS[report.trailheadAccess] || report.trailheadAccess}
            </span>
          )}
        </div>

        {/* Ratings */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-3 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border-app)] text-center">
            <p className="text-xs font-semibold text-[var(--color-text-muted-green)] uppercase tracking-wider mb-1.5">Difficulty</p>
            <div className="flex justify-center mb-1">
              <RatingDots value={report.difficultyRating} color="bg-[var(--color-brand-primary)]" />
            </div>
            <p className="text-lg font-bold text-[var(--color-brand-primary)]">{report.difficultyRating}/5</p>
          </div>
          <div className="p-3 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border-app)] text-center">
            <p className="text-xs font-semibold text-[var(--color-text-muted-green)] uppercase tracking-wider mb-1.5">Conditions</p>
            <div className="flex justify-center mb-1">
              <RatingDots value={report.conditionSeverity} color="bg-amber-500" />
            </div>
            <p className="text-lg font-bold text-amber-600">{report.conditionSeverity}/5</p>
          </div>
          <div className="p-3 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border-app)] text-center">
            <p className="text-xs font-semibold text-[var(--color-text-muted-green)] uppercase tracking-wider mb-1.5">Risk</p>
            <div className="flex justify-center mb-1">
              <RatingDots value={report.objectiveRisk} color="bg-rose-500" />
            </div>
            <p className="text-lg font-bold text-rose-600">{report.objectiveRisk}/5</p>
          </div>
        </div>

        {/* Summary */}
        <div>
          <h3 className="text-sm font-semibold text-[var(--color-text-muted-green)] uppercase tracking-wider mb-2">Summary</h3>
          <p className="text-sm text-[var(--color-text-primary)] leading-relaxed">{report.summary}</p>
        </div>

        {/* Narrative */}
        {report.narrative && (
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-text-muted-green)] uppercase tracking-wider mb-2">Full Report</h3>
            <div className="text-sm text-[var(--color-text-primary)] leading-relaxed whitespace-pre-wrap">
              {report.narrative}
            </div>
          </div>
        )}

        {/* Sections */}
        {enabledSections.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-text-muted-green)] uppercase tracking-wider mb-3">Details</h3>
            <div className="space-y-3">
              {enabledSections.map(([key, section]) => (
                <SectionDetail
                  key={key}
                  sectionKey={key}
                  section={section as { enabled: boolean; data?: Record<string, unknown>; notes?: string }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

export default function TripReportsList({ reports }: TripReportsListProps) {
  const [selectedReport, setSelectedReport] = useState<TripReportData | null>(null);

  return (
    <>
      {reports.length === 0 ? (
        <div className="p-8 text-center">
          <DocumentIcon className="w-10 h-10 mx-auto text-[var(--color-text-secondary)] opacity-40 mb-3" />
          <p className="text-sm font-medium text-[var(--color-text-primary)]">No trip reports yet</p>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            Submit a trip report from any peak page to see it here.
          </p>
          <Link href="/peaks" className="mt-4 inline-block text-sm font-semibold text-[var(--color-brand-primary)] hover:underline">
            Browse peaks to write a report
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-[var(--color-border-app)]">
          {reports.map((report) => (
            <button
              key={report.id}
              type="button"
              onClick={() => setSelectedReport(report)}
              className="w-full text-left p-4 sm:p-5 hover:bg-[var(--color-surface-subtle)]/50 transition-colors group cursor-pointer"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--color-surface-subtle)] to-[var(--color-border-app-strong)] flex items-center justify-center flex-shrink-0">
                  <MountainIcon className="w-6 h-6 text-[var(--color-brand-primary)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-brand-primary)] transition-colors">
                      {report.peakName}
                    </span>
                    <span className="font-mono text-xs text-[var(--color-brand-primary)]">{report.peakElevation}</span>
                    {report.recommended ? (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Recommended
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                        Not recommended
                      </span>
                    )}
                    {report.snowPresent && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-sky-50 text-sky-700 border border-sky-200">
                        Snow
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[var(--color-text-secondary)] mt-1 line-clamp-2">{report.summary}</p>
                  <div className="mt-2 text-xs text-[var(--color-text-secondary)] space-y-1">
                    <span className="flex items-center gap-1 whitespace-nowrap">
                      <CalendarIcon className="w-3.5 h-3.5 flex-shrink-0" />
                      {report.hikeDate}
                    </span>
                    <div className="flex items-center gap-3">
                      <span>Difficulty: {report.difficultyRating}/5</span>
                      <span>Conditions: {report.conditionSeverity}/5</span>
                      <span>Risk: {report.objectiveRisk}/5</span>
                    </div>
                  </div>
                </div>
                <ArrowRightIcon className="w-4 h-4 text-[var(--color-text-muted-green)] group-hover:translate-x-1 transition-transform flex-shrink-0 mt-1" />
              </div>
            </button>
          ))}
        </div>
      )}

      {selectedReport && (
        <TripReportViewModal
          report={selectedReport}
          isOpen={!!selectedReport}
          onClose={() => setSelectedReport(null)}
        />
      )}
    </>
  );
}

// Icons
function MountainIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3L2 21h20L12 3z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v8" />
    </svg>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className || "w-4 h-4"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="10" />
      <path strokeLinecap="round" d="M12 6v6l4 2" />
    </svg>
  );
}

function DocumentIcon({ className }: { className?: string }) {
  return (
    <svg className={className || "w-5 h-5"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
  );
}

export type { TripReportData };
