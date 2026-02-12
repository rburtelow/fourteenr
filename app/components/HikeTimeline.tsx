'use client';

import { useState } from 'react';

interface Hike {
  id: string;
  peakName: string;
  elevation: number;
  date: string;
  routeName?: string;
  distance?: number;
  elevationGain?: number;
  duration?: string;
  notes?: string;
  imageUrl?: string;
  conditions?: 'excellent' | 'good' | 'fair' | 'challenging';
}

interface HikeTimelineProps {
  hikes: Hike[];
  title?: string;
  showYearMarkers?: boolean;
}

const conditionColors = {
  excellent: 'bg-[var(--color-brand-highlight)] text-white',
  good: 'bg-[var(--color-brand-primary)] text-white',
  fair: 'bg-[var(--color-amber-glow)] text-white',
  challenging: 'bg-slate-500 text-white',
};

const conditionLabels = {
  excellent: 'Excellent',
  good: 'Good',
  fair: 'Fair',
  challenging: 'Challenging',
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getYear(dateString: string): number {
  return new Date(dateString).getFullYear();
}

export default function HikeTimeline({
  hikes,
  title = 'Completed Hikes',
  showYearMarkers = true,
}: HikeTimelineProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Sort hikes by date descending
  const sortedHikes = [...hikes].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Group by year if showing year markers
  const hikesByYear = sortedHikes.reduce(
    (acc, hike) => {
      const year = getYear(hike.date);
      if (!acc[year]) acc[year] = [];
      acc[year].push(hike);
      return acc;
    },
    {} as Record<number, Hike[]>
  );

  const years = Object.keys(hikesByYear)
    .map(Number)
    .sort((a, b) => b - a);

  return (
    <div className="w-full">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <h2
          className="text-2xl font-bold tracking-tight text-[var(--color-text-primary)]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {title}
        </h2>
        <span className="text-sm font-medium text-[var(--color-text-muted-green)]">
          {hikes.length} summit{hikes.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Timeline Container */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[var(--color-brand-primary)] via-[var(--color-border-app-strong)] to-transparent" />

        {showYearMarkers
          ? years.map((year) => (
              <div key={year}>
                {/* Year Marker */}
                <div className="relative flex items-center mb-4 mt-8 first:mt-0">
                  <div className="absolute left-0 w-8 h-8 rounded-full bg-[var(--color-brand-primary)] flex items-center justify-center shadow-lg shadow-[var(--color-brand-primary)]/20">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <span
                    className="ml-12 text-lg font-bold text-[var(--color-brand-primary)]"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {year}
                  </span>
                </div>

                {/* Hikes for this year */}
                {hikesByYear[year].map((hike, index) => (
                  <TimelineCard
                    key={hike.id}
                    hike={hike}
                    isExpanded={expandedId === hike.id}
                    onToggle={() =>
                      setExpandedId(expandedId === hike.id ? null : hike.id)
                    }
                    isLast={
                      index === hikesByYear[year].length - 1 &&
                      year === years[years.length - 1]
                    }
                  />
                ))}
              </div>
            ))
          : sortedHikes.map((hike, index) => (
              <TimelineCard
                key={hike.id}
                hike={hike}
                isExpanded={expandedId === hike.id}
                onToggle={() =>
                  setExpandedId(expandedId === hike.id ? null : hike.id)
                }
                isLast={index === sortedHikes.length - 1}
              />
            ))}
      </div>
    </div>
  );
}

function TimelineCard({
  hike,
  isExpanded,
  onToggle,
  isLast,
}: {
  hike: Hike;
  isExpanded: boolean;
  onToggle: () => void;
  isLast: boolean;
}) {
  return (
    <div className={`relative pl-12 ${isLast ? 'pb-0' : 'pb-6'}`}>
      {/* Timeline dot */}
      <div className="absolute left-2.5 top-4 w-3 h-3 rounded-full bg-[var(--color-surface-subtle)] border-2 border-[var(--color-brand-primary)] transition-all group-hover:scale-125" />

      {/* Card */}
      <div
        onClick={onToggle}
        className="group bg-white rounded-xl border border-[var(--color-border-app)] shadow-sm hover:shadow-lg hover:border-[var(--color-border-app-strong)] transition-all duration-300 cursor-pointer overflow-hidden"
      >
        {/* Card Header */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-base font-semibold text-[var(--color-text-primary)] truncate">
                  {hike.peakName}
                </h3>
                {hike.conditions && (
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${conditionColors[hike.conditions]}`}
                  >
                    {conditionLabels[hike.conditions]}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-sm text-[var(--color-text-secondary)]">
                <span className="font-medium">
                  {hike.elevation.toLocaleString()}&apos;
                </span>
                {hike.routeName && (
                  <>
                    <span className="text-[var(--color-border-app-strong)]">
                      •
                    </span>
                    <span>{hike.routeName}</span>
                  </>
                )}
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="text-xs font-medium text-[var(--color-text-muted-green)]">
                {formatDate(hike.date)}
              </span>
              <svg
                className={`w-5 h-5 text-[var(--color-text-secondary)] transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Expanded Content */}
        <div
          className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-96' : 'max-h-0'}`}
        >
          <div className="px-4 pb-4 border-t border-[var(--color-border-app)]">
            {/* Image */}
            {hike.imageUrl && (
              <div className="mt-4 rounded-lg overflow-hidden">
                <img
                  src={hike.imageUrl}
                  alt={hike.peakName}
                  className="w-full h-40 object-cover"
                />
              </div>
            )}

            {/* Stats Grid */}
            {(hike.distance || hike.elevationGain || hike.duration) && (
              <div className="mt-4 grid grid-cols-3 gap-3">
                {hike.distance && (
                  <div className="bg-[var(--color-surface-subtle)] rounded-lg p-3 text-center">
                    <div className="text-xs text-[var(--color-text-secondary)] mb-0.5">
                      Distance
                    </div>
                    <div className="text-sm font-semibold text-[var(--color-text-primary)]">
                      {hike.distance} mi
                    </div>
                  </div>
                )}
                {hike.elevationGain && (
                  <div className="bg-[var(--color-surface-subtle)] rounded-lg p-3 text-center">
                    <div className="text-xs text-[var(--color-text-secondary)] mb-0.5">
                      Elevation Gain
                    </div>
                    <div className="text-sm font-semibold text-[var(--color-text-primary)]">
                      {hike.elevationGain.toLocaleString()}&apos;
                    </div>
                  </div>
                )}
                {hike.duration && (
                  <div className="bg-[var(--color-surface-subtle)] rounded-lg p-3 text-center">
                    <div className="text-xs text-[var(--color-text-secondary)] mb-0.5">
                      Duration
                    </div>
                    <div className="text-sm font-semibold text-[var(--color-text-primary)]">
                      {hike.duration}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Notes */}
            {hike.notes && (
              <p className="mt-4 text-sm text-[var(--color-text-secondary)] leading-relaxed">
                {hike.notes}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
