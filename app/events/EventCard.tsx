"use client";

import Link from "next/link";
import type { CommunityEvent } from "@/lib/community.types";


interface EventCardProps {
  event: CommunityEvent;
  isLoggedIn: boolean;
  onToggleRsvp: (eventId: string) => void;
  rsvpPending?: boolean;
}

export default function EventCard({ event, isLoggedIn, onToggleRsvp, rsvpPending }: EventCardProps) {
  const eventDate = new Date(event.event_date);
  const month = eventDate.toLocaleDateString("en-US", { month: "short" });
  const day = eventDate.getDate();
  const timeStr = eventDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  const isFull = event.max_attendees !== null && event.attendee_count >= event.max_attendees;
  const isCancelled = event.status === "cancelled";

  return (
    <div className={`bg-white rounded-2xl border border-[var(--color-border-app)] overflow-hidden card-hover transition-all ${isCancelled ? "opacity-60" : ""}`}>
      <Link href={`/events/${event.id}`} className="block p-5">
        <div className="flex items-start gap-4">
          {/* Date badge */}
          <div className="w-14 h-14 rounded-xl bg-[var(--color-brand-primary)]/10 flex flex-col items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-[var(--color-brand-primary)] uppercase leading-none">
              {month}
            </span>
            <span className="text-lg font-bold text-[var(--color-brand-primary)] leading-tight">
              {day}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-[var(--color-text-primary)] leading-snug line-clamp-2">
                {event.title}
              </h3>
              {isCancelled && (
                <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-medium flex-shrink-0">
                  Cancelled
                </span>
              )}
            </div>

            <div className="mt-1.5 flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
              <MapPinIcon className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{event.location}</span>
              <span className="w-1 h-1 rounded-full bg-[var(--color-text-secondary)]/30 flex-shrink-0" />
              <span className="flex-shrink-0">{timeStr}</span>
            </div>

            <div className="mt-2 flex flex-wrap gap-1.5">
              {event.peaks && (
                <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-[var(--color-surface-subtle)] text-xs">
                  <MountainIcon className="w-3.5 h-3.5 text-[var(--color-brand-primary)]" />
                  <span className="font-medium text-[var(--color-text-primary)]">{event.peaks.name}</span>
                </div>
              )}
              {event.groups && (
                <Link
                  href={`/groups/${event.groups.slug}`}
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-xs hover:bg-emerald-100 transition-colors"
                >
                  <UsersGroupIcon className="w-3.5 h-3.5 text-emerald-700" />
                  <span className="font-medium text-emerald-800">{event.groups.name}</span>
                </Link>
              )}
            </div>

            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                <UsersIcon className="w-4 h-4" />
                <span>
                  {event.attendee_count} going
                  {event.max_attendees && ` / ${event.max_attendees}`}
                </span>
                {event.user_has_rsvpd && (
                  <span className="px-2 py-0.5 rounded-full bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)] text-xs font-medium">
                    Going
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </Link>

      {/* RSVP button */}
      {!isCancelled && isLoggedIn && (
        <div className="px-5 pb-4">
          <button
            onClick={(e) => {
              e.preventDefault();
              onToggleRsvp(event.id);
            }}
            disabled={rsvpPending || (isFull && !event.user_has_rsvpd)}
            className={`w-full py-2 rounded-xl text-sm font-semibold transition-all ${
              event.user_has_rsvpd
                ? "bg-[var(--color-surface-subtle)] text-[var(--color-brand-primary)] hover:bg-red-50 hover:text-red-600"
                : isFull
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-[var(--color-brand-primary)] text-white hover:bg-[var(--color-brand-accent)] hover:shadow-lg hover:shadow-[var(--color-brand-primary)]/20"
            }`}
          >
            {rsvpPending
              ? "..."
              : event.user_has_rsvpd
                ? "Cancel RSVP"
                : isFull
                  ? "Event Full"
                  : "RSVP"}
          </button>
        </div>
      )}
    </div>
  );
}

function MapPinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
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

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  );
}

function UsersGroupIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
    </svg>
  );
}
