'use client';

import { useState, useRef } from 'react';

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

interface HikeTimelineHorizontalProps {
  hikes: Hike[];
  title?: string;
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

function formatDate(dateString: string): { month: string; day: string; year: string } {
  const date = new Date(dateString);
  return {
    month: date.toLocaleDateString('en-US', { month: 'short' }),
    day: date.toLocaleDateString('en-US', { day: 'numeric' }),
    year: date.toLocaleDateString('en-US', { year: 'numeric' }),
  };
}

function getYear(dateString: string): number {
  return new Date(dateString).getFullYear();
}

export default function HikeTimelineHorizontal({
  hikes,
  title = 'Completed Hikes',
}: HikeTimelineHorizontalProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Sort hikes by date ascending (oldest first for left-to-right reading)
  const sortedHikes = [...hikes].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const selectedHike = sortedHikes.find((h) => h.id === selectedId);

  // Get unique years for markers
  const years = [...new Set(sortedHikes.map((h) => getYear(h.date)))];

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

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
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-[var(--color-text-muted-green)] mr-4">
            {hikes.length} summit{hikes.length !== 1 ? 's' : ''}
          </span>
          <button
            onClick={() => scroll('left')}
            className="w-8 h-8 rounded-full bg-[var(--color-surface-subtle)] hover:bg-[var(--color-border-app-strong)] flex items-center justify-center transition-colors"
          >
            <svg className="w-4 h-4 text-[var(--color-text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => scroll('right')}
            className="w-8 h-8 rounded-full bg-[var(--color-surface-subtle)] hover:bg-[var(--color-border-app-strong)] flex items-center justify-center transition-colors"
          >
            <svg className="w-4 h-4 text-[var(--color-text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Timeline Container */}
      <div className="relative">
        {/* Scrollable Timeline */}
        <div
          ref={scrollRef}
          className="overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-[var(--color-border-app-strong)] scrollbar-track-transparent"
          style={{ scrollbarWidth: 'thin' }}
        >
          <div className="relative min-w-max px-4">
            {/* Horizontal line */}
            <div className="absolute left-0 right-0 top-[52px] h-0.5 bg-gradient-to-r from-transparent via-[var(--color-brand-primary)] to-transparent" />

            {/* Year markers */}
            <div className="flex gap-2 mb-2">
              {years.map((year, idx) => {
                const firstHikeOfYear = sortedHikes.findIndex((h) => getYear(h.date) === year);
                const position = firstHikeOfYear * 102 + 20; // 102px per card (90px + 12px gap) + offset
                return (
                  <div
                    key={year}
                    className="absolute text-[10px] font-bold text-[var(--color-brand-primary)] bg-white px-2 py-0.5 rounded-full border border-[var(--color-border-app)]"
                    style={{
                      left: `${position}px`,
                      top: '44px',
                      fontFamily: 'var(--font-display)'
                    }}
                  >
                    {year}
                  </div>
                );
              })}
            </div>

            {/* Cards Row */}
            <div className="flex gap-3 pt-16">
              {sortedHikes.map((hike) => (
                <HorizontalTimelineCard
                  key={hike.id}
                  hike={hike}
                  isSelected={selectedId === hike.id}
                  onSelect={() => setSelectedId(selectedId === hike.id ? null : hike.id)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Selected Hike Details Panel */}
        {selectedHike && (
          <div className="mt-6 bg-white rounded-2xl border border-[var(--color-border-app)] shadow-lg overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex flex-col md:flex-row">
              {/* Image */}
              {selectedHike.imageUrl && (
                <div className="md:w-1/3 h-48 md:h-auto">
                  <img
                    src={selectedHike.imageUrl}
                    alt={selectedHike.peakName}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Content */}
              <div className={`flex-1 p-6 ${selectedHike.imageUrl ? '' : 'md:max-w-2xl'}`}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3
                      className="text-2xl font-bold text-[var(--color-text-primary)] mb-1"
                      style={{ fontFamily: 'var(--font-display)' }}
                    >
                      {selectedHike.peakName}
                    </h3>
                    <div className="flex items-center gap-3 text-sm text-[var(--color-text-secondary)]">
                      <span className="font-semibold">{selectedHike.elevation.toLocaleString()}&apos;</span>
                      {selectedHike.routeName && (
                        <>
                          <span className="text-[var(--color-border-app-strong)]">•</span>
                          <span>{selectedHike.routeName}</span>
                        </>
                      )}
                    </div>
                  </div>
                  {selectedHike.conditions && (
                    <span className={`text-xs font-medium px-3 py-1 rounded-full ${conditionColors[selectedHike.conditions]}`}>
                      {conditionLabels[selectedHike.conditions]}
                    </span>
                  )}
                </div>

                {/* Stats */}
                {(selectedHike.distance || selectedHike.elevationGain || selectedHike.duration) && (
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    {selectedHike.distance && (
                      <div className="bg-[var(--color-surface-subtle)] rounded-xl p-4">
                        <div className="text-xs text-[var(--color-text-secondary)] mb-1">Distance</div>
                        <div className="text-lg font-bold text-[var(--color-text-primary)]">{selectedHike.distance} mi</div>
                      </div>
                    )}
                    {selectedHike.elevationGain && (
                      <div className="bg-[var(--color-surface-subtle)] rounded-xl p-4">
                        <div className="text-xs text-[var(--color-text-secondary)] mb-1">Elevation Gain</div>
                        <div className="text-lg font-bold text-[var(--color-text-primary)]">{selectedHike.elevationGain.toLocaleString()}&apos;</div>
                      </div>
                    )}
                    {selectedHike.duration && (
                      <div className="bg-[var(--color-surface-subtle)] rounded-xl p-4">
                        <div className="text-xs text-[var(--color-text-secondary)] mb-1">Duration</div>
                        <div className="text-lg font-bold text-[var(--color-text-primary)]">{selectedHike.duration}</div>
                      </div>
                    )}
                  </div>
                )}

                {/* Notes */}
                {selectedHike.notes && (
                  <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                    {selectedHike.notes}
                  </p>
                )}
              </div>

              {/* Close button */}
              <button
                onClick={() => setSelectedId(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[var(--color-surface-subtle)] hover:bg-[var(--color-border-app-strong)] flex items-center justify-center transition-colors"
              >
                <svg className="w-4 h-4 text-[var(--color-text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function HorizontalTimelineCard({
  hike,
  isSelected,
  onSelect,
}: {
  hike: Hike;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const date = formatDate(hike.date);

  return (
    <div className="relative flex flex-col items-center">
      {/* Connector dot */}
      <div
        className={`absolute -top-[22px] w-3 h-3 rounded-full border-2 transition-all duration-200 ${
          isSelected
            ? 'bg-[var(--color-brand-primary)] border-[var(--color-brand-primary)] scale-125'
            : 'bg-white border-[var(--color-brand-primary)] hover:bg-[var(--color-surface-subtle)]'
        }`}
      />

      {/* Card */}
      <button
        onClick={onSelect}
        className={`w-[90px] bg-white rounded-lg border transition-all duration-200 text-left p-2 ${
          isSelected
            ? 'border-[var(--color-brand-primary)] shadow-lg shadow-[var(--color-brand-primary)]/10 -translate-y-1'
            : 'border-[var(--color-border-app)] hover:border-[var(--color-border-app-strong)] hover:shadow-md hover:-translate-y-0.5'
        }`}
      >
        <h4 className="text-xs font-semibold text-[var(--color-text-primary)] truncate mb-1">
          {hike.peakName}
        </h4>
        <div className="text-[10px] text-[var(--color-text-muted-green)]">
          {date.month} {date.day}
        </div>
      </button>
    </div>
  );
}
