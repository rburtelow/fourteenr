"use client";

import { useState } from "react";
import Link from "next/link";
import Modal from "@/app/components/Modal";
import HikeTrackMap, { hasMapSupport } from "./HikeTrackMap";

export interface SavedHikeData {
  id: string;
  name: string;
  peakName: string | null;
  peakSlug: string | null;
  date: string;
  startedAtRaw: string;
  distanceMiles: string;
  elevationGainFt: string;
  maxElevationFt: string | null;
  duration: string;
  pointCount: number;
  // Sampled [longitude, latitude] pairs for drawing the track.
  path: [number, number][];
}

interface SavedHikesListProps {
  hikes: SavedHikeData[];
}

const DEFAULT_VISIBLE = 6;

/**
 * Project a list of [lon, lat] points into an SVG path string that fits a
 * `width`×`height` box with `pad` padding. Latitude is inverted so north is up,
 * and longitude is scaled by cos(lat) so the track keeps its real proportions.
 */
function buildPath(points: [number, number][], width: number, height: number, pad: number): string {
  if (points.length < 2) return "";

  const lats = points.map((p) => p[1]);
  const lons = points.map((p) => p[0]);
  const midLat = (Math.min(...lats) + Math.max(...lats)) / 2;
  const lonScale = Math.cos((midLat * Math.PI) / 180) || 1;

  const xs = lons.map((lon) => lon * lonScale);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...lats);
  const maxY = Math.max(...lats);

  const spanX = maxX - minX || 1e-6;
  const spanY = maxY - minY || 1e-6;
  const scale = Math.min((width - pad * 2) / spanX, (height - pad * 2) / spanY);

  // Center the track within the box.
  const offsetX = (width - spanX * scale) / 2;
  const offsetY = (height - spanY * scale) / 2;

  return points
    .map((p, i) => {
      const x = (p[0] * lonScale - minX) * scale + offsetX;
      // Invert y: larger latitude → smaller y (up).
      const y = (maxY - p[1]) * scale + offsetY;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
}

function TrackMap({ path, width, height, strokeWidth = 2.5 }: { path: [number, number][]; width: number; height: number; strokeWidth?: number }) {
  const d = buildPath(path, width, height, 8);

  if (!d) {
    // Fewer than 2 points → nothing to draw (e.g. a recording with no movement).
    const showLabel = height >= 120;
    return (
      <div
        className="flex flex-col items-center justify-center gap-2 bg-[var(--color-surface-subtle)] text-[var(--color-text-secondary)] px-4 text-center"
        style={{ width, height }}
      >
        <RouteIcon className="w-6 h-6 opacity-40" />
        {showLabel && (
          <p className="text-xs opacity-70">No GPS track was recorded for this hike</p>
        )}
      </div>
    );
  }

  // Recompute start/end marker positions using the same projection.
  const markers = (() => {
    const lats = path.map((p) => p[1]);
    const lons = path.map((p) => p[0]);
    const midLat = (Math.min(...lats) + Math.max(...lats)) / 2;
    const lonScale = Math.cos((midLat * Math.PI) / 180) || 1;
    const xs = lons.map((lon) => lon * lonScale);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...lats);
    const maxY = Math.max(...lats);
    const spanX = maxX - minX || 1e-6;
    const spanY = maxY - minY || 1e-6;
    const scale = Math.min((width - 16) / spanX, (height - 16) / spanY);
    const offsetX = (width - spanX * scale) / 2;
    const offsetY = (height - spanY * scale) / 2;
    const project = (p: [number, number]) => ({
      x: (p[0] * lonScale - minX) * scale + offsetX,
      y: (maxY - p[1]) * scale + offsetY,
    });
    return { start: project(path[0]), end: project(path[path.length - 1]) };
  })();

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="block">
      <path
        d={d}
        fill="none"
        stroke="var(--color-brand-primary)"
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle cx={markers.start.x} cy={markers.start.y} r={strokeWidth + 1.5} fill="var(--color-brand-highlight)" stroke="white" strokeWidth={1.5} />
      <circle cx={markers.end.x} cy={markers.end.y} r={strokeWidth + 1.5} fill="var(--color-brand-primary)" stroke="white" strokeWidth={1.5} />
    </svg>
  );
}

function HikeDetailModal({ hike, isOpen, onClose }: { hike: SavedHikeData; isOpen: boolean; onClose: () => void }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Recorded Hike" size="xl">
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-lg font-bold text-[var(--color-text-primary)]">{hike.name}</h3>
            {hike.peakName && hike.peakSlug && (
              <Link
                href={`/peaks/${hike.peakSlug}`}
                onClick={onClose}
                className="font-mono text-sm text-[var(--color-brand-primary)] hover:underline"
              >
                {hike.peakName}
              </Link>
            )}
          </div>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)] flex items-center gap-1">
            <CalendarIcon className="w-3.5 h-3.5" />
            {hike.date}
          </p>
        </div>

        {/* Track map */}
        {hasMapSupport(hike.path) ? (
          <HikeTrackMap
            path={hike.path}
            interactive
            className="h-72 sm:h-80 w-full rounded-2xl overflow-hidden border border-[var(--color-border-app)]"
          />
        ) : (
          <div className="rounded-2xl bg-[var(--color-surface-subtle)] border border-[var(--color-border-app)] overflow-hidden flex items-center justify-center h-72 sm:h-80">
            <TrackMap path={hike.path} width={560} height={320} strokeWidth={3} />
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Distance" value={hike.distanceMiles} suffix=" mi" />
          <StatCard label="Elevation Gain" value={hike.elevationGainFt} suffix=" ft" />
          <StatCard label="Moving Time" value={hike.duration} />
          <StatCard label="Max Elevation" value={hike.maxElevationFt ?? "—"} suffix={hike.maxElevationFt ? " ft" : ""} />
        </div>
      </div>
    </Modal>
  );
}

function StatCard({ label, value, suffix }: { label: string; value: string; suffix?: string }) {
  return (
    <div className="p-3 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border-app)] text-center">
      <p className="text-xs font-semibold text-[var(--color-text-muted-green)] uppercase tracking-wider mb-1.5">{label}</p>
      <p className="text-lg font-bold text-[var(--color-brand-primary)]">
        {value}
        {suffix && <span className="text-sm font-normal text-[var(--color-text-secondary)]">{suffix}</span>}
      </p>
    </div>
  );
}

export default function SavedHikesList({ hikes }: SavedHikesListProps) {
  const [showAll, setShowAll] = useState(false);
  const [selected, setSelected] = useState<SavedHikeData | null>(null);

  if (hikes.length === 0) {
    return (
      <div className="p-8 text-center">
        <RouteIcon className="w-10 h-10 mx-auto text-[var(--color-text-secondary)] opacity-40 mb-3" />
        <p className="text-sm font-medium text-[var(--color-text-primary)]">No saved hikes yet</p>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
          Record a hike in the 14er mobile app and it&apos;ll sync here automatically.
        </p>
      </div>
    );
  }

  const visible = showAll ? hikes : hikes.slice(0, DEFAULT_VISIBLE);

  return (
    <>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        {visible.map((hike) => (
          <button
            key={hike.id}
            type="button"
            onClick={() => setSelected(hike)}
            className="group text-left card-hover bg-[var(--color-surface-subtle)]/30 rounded-2xl overflow-hidden border border-[var(--color-border-app)] cursor-pointer"
          >
            <div className="relative h-36 bg-[var(--color-surface-subtle)] flex items-center justify-center overflow-hidden">
              {hasMapSupport(hike.path) ? (
                <HikeTrackMap path={hike.path} lazy className="h-full w-full" />
              ) : (
                <TrackMap path={hike.path} width={340} height={144} />
              )}
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-brand-primary)] transition-colors truncate">
                {hike.name}
              </h3>
              <p className="text-sm text-[var(--color-text-secondary)] mt-1 flex items-center gap-1">
                <CalendarIcon className="w-3.5 h-3.5 flex-shrink-0" />
                {hike.date}
                {hike.peakName && (
                  <>
                    <span className="mx-1">•</span>
                    <span className="truncate">{hike.peakName}</span>
                  </>
                )}
              </p>
              <div className="flex items-center gap-3 mt-3 pt-3 border-t border-[var(--color-border-app)] text-xs text-[var(--color-text-secondary)]">
                <span className="flex items-center gap-1">
                  <RouteIcon className="w-3.5 h-3.5" />
                  <span className="font-mono text-[var(--color-brand-primary)]">{hike.distanceMiles}</span> mi
                </span>
                <span className="flex items-center gap-1">
                  <TrendingUpIcon className="w-3.5 h-3.5" />
                  <span className="font-mono text-[var(--color-brand-primary)]">{hike.elevationGainFt}</span> ft
                </span>
                <span className="flex items-center gap-1">
                  <ClockIcon className="w-3.5 h-3.5" />
                  {hike.duration}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="p-4 bg-[var(--color-surface-subtle)]/30 flex items-center justify-between">
        <p className="text-sm text-[var(--color-text-secondary)]">
          Showing <span className="font-semibold">{visible.length}</span> of{" "}
          <span className="font-semibold">{hikes.length}</span> hikes
        </p>
        {hikes.length > DEFAULT_VISIBLE && (
          <button
            onClick={() => setShowAll((v) => !v)}
            className="text-sm font-semibold text-[var(--color-brand-primary)] hover:underline flex items-center gap-2 group"
          >
            {showAll ? "Show Less" : "View All Hikes"}
            <ArrowRightIcon className={`w-4 h-4 transition-transform ${showAll ? "rotate-90" : "group-hover:translate-x-1"}`} />
          </button>
        )}
      </div>

      {selected && (
        <HikeDetailModal hike={selected} isOpen={!!selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}

// Icons
function RouteIcon({ className }: { className?: string }) {
  return (
    <svg className={className || "w-5 h-5"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="6" cy="19" r="2" />
      <circle cx="18" cy="5" r="2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 19h6a4 4 0 004-4V9m0 0l-2 2m2-2l2 2" />
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
    <svg className={className || "w-4 h-4"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="10" />
      <path strokeLinecap="round" d="M12 6v6l4 2" />
    </svg>
  );
}

function TrendingUpIcon({ className }: { className?: string }) {
  return (
    <svg className={className || "w-4 h-4"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l3.75 3.75L21.75 6M21.75 6h-5.25M21.75 6v5.25" />
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
