"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import type { CommunityEvent } from "@/lib/community.types";
import { toggleEventAttendance } from "@/app/events/actions";
import EventCard from "@/app/events/EventCard";
import EventCreateModal from "@/app/events/EventCreateModal";

interface Peak {
  id: string;
  name: string;
  slug: string;
  elevation: number;
}

interface GroupEventsTabProps {
  events: CommunityEvent[];
  groupId: string;
  groupName: string;
  isActiveMember: boolean;
  isLoggedIn: boolean;
  currentUserId?: string;
  allPeaks: Peak[];
}

export default function GroupEventsTab({
  events: initialEvents,
  groupId,
  groupName,
  isActiveMember,
  isLoggedIn,
  currentUserId,
  allPeaks,
}: GroupEventsTabProps) {
  const router = useRouter();
  const [events, setEvents] = useState(initialEvents);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [rsvpPending, setRsvpPending] = useState<Set<string>>(() => new Set());
  const pendingRsvpRef = useRef<Set<string>>(new Set());

  const handleToggleRsvp = useCallback(
    async (eventId: string) => {
      if (!isLoggedIn) return;
      const event = events.find((e) => e.id === eventId);
      if (!event) return;

      setEvents((prev) =>
        prev.map((e) =>
          e.id === eventId
            ? {
                ...e,
                user_has_rsvpd: !e.user_has_rsvpd,
                attendee_count: e.user_has_rsvpd ? e.attendee_count - 1 : e.attendee_count + 1,
              }
            : e
        )
      );

      pendingRsvpRef.current.add(eventId);
      setRsvpPending((prev) => new Set(prev).add(eventId));

      const result = await toggleEventAttendance(eventId);

      setRsvpPending((prev) => {
        const next = new Set(prev);
        next.delete(eventId);
        return next;
      });

      if (result.error) {
        pendingRsvpRef.current.delete(eventId);
        setEvents((prev) =>
          prev.map((e) =>
            e.id === eventId
              ? {
                  ...e,
                  user_has_rsvpd: !e.user_has_rsvpd,
                  attendee_count: e.user_has_rsvpd ? e.attendee_count - 1 : e.attendee_count + 1,
                }
              : e
          )
        );
      }
    },
    [events, isLoggedIn]
  );

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-base font-semibold text-[var(--color-text-primary)]">Upcoming Events</h2>
          <p className="text-sm text-[var(--color-text-secondary)]">{events.length} event{events.length !== 1 ? "s" : ""}</p>
        </div>
        {isActiveMember && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-accent)] transition-all hover:shadow-lg hover:shadow-[var(--color-brand-primary)]/20"
          >
            <PlusIcon className="w-4 h-4" />
            Create Event
          </button>
        )}
      </div>

      {/* Events list */}
      {events.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[var(--color-border-app)] p-10 text-center">
          <CalendarIcon className="w-10 h-10 mx-auto text-[var(--color-text-secondary)] opacity-40 mb-3" />
          <p className="text-sm font-medium text-[var(--color-text-primary)]">No upcoming events</p>
          {isActiveMember && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-accent)] transition-all"
            >
              <PlusIcon className="w-4 h-4" />
              Create the first event
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              isLoggedIn={isLoggedIn}
              onToggleRsvp={handleToggleRsvp}
              rsvpPending={rsvpPending.has(event.id)}
            />
          ))}
        </div>
      )}

      <EventCreateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        allPeaks={allPeaks}
        groupId={groupId}
        groupName={groupName}
        onEventCreated={() => {
          setShowCreateModal(false);
          router.refresh();
        }}
      />
    </div>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
  );
}
