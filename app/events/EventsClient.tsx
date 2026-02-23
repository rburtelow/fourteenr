"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { CommunityEvent } from "@/lib/community.types";
import { toggleEventAttendance } from "./actions";
import EventCard from "./EventCard";
import EventCreateModal from "./EventCreateModal";

type TimeFilter = "upcoming" | "this_week" | "this_month" | "past";
type SortOption = "soonest" | "popular" | "newest";

interface Peak {
  id: string;
  name: string;
  slug: string;
  elevation: number;
}

interface EventsClientProps {
  initialEvents: CommunityEvent[];
  allPeaks: Peak[];
  isLoggedIn: boolean;
  currentUserId?: string;
}

export default function EventsClient({ initialEvents, allPeaks, isLoggedIn, currentUserId }: EventsClientProps) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [events, setEvents] = useState(initialEvents);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("upcoming");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPeakFilter, setSelectedPeakFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("soonest");
  const [rsvpPending, setRsvpPending] = useState<Set<string>>(() => new Set());
  const pendingRsvpRef = useRef<Set<string>>(new Set());

  // Realtime subscription for event_attendees
  useEffect(() => {
    const channel = supabase
      .channel("events:attendees")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "event_attendees" },
        (payload) => {
          const eventId = String(payload.new?.event_id || "");
          if (!eventId) return;
          if (payload.new?.user_id === currentUserId) {
            if (pendingRsvpRef.current.has(eventId)) {
              pendingRsvpRef.current.delete(eventId);
              return;
            }
            setEvents((prev) =>
              prev.map((e) =>
                e.id === eventId
                  ? { ...e, attendee_count: e.attendee_count + 1, user_has_rsvpd: true }
                  : e
              )
            );
            return;
          }
          setEvents((prev) =>
            prev.map((e) =>
              e.id === eventId ? { ...e, attendee_count: e.attendee_count + 1 } : e
            )
          );
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "event_attendees" },
        (payload) => {
          const eventId = String(payload.old?.event_id || "");
          if (!eventId) return;
          if (payload.old?.user_id === currentUserId) {
            if (pendingRsvpRef.current.has(eventId)) {
              pendingRsvpRef.current.delete(eventId);
              return;
            }
            setEvents((prev) =>
              prev.map((e) =>
                e.id === eventId
                  ? { ...e, attendee_count: Math.max(0, e.attendee_count - 1), user_has_rsvpd: false }
                  : e
              )
            );
            return;
          }
          setEvents((prev) =>
            prev.map((e) =>
              e.id === eventId
                ? { ...e, attendee_count: Math.max(0, e.attendee_count - 1) }
                : e
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, currentUserId]);

  const handleToggleRsvp = useCallback(
    async (eventId: string) => {
      if (!isLoggedIn) return;

      const event = events.find((e) => e.id === eventId);
      if (!event) return;

      // Optimistic update
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
        // Rollback
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

  // Client-side filtering
  const filteredEvents = useMemo(() => {
    let result = [...events];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.location.toLowerCase().includes(q)
      );
    }

    if (selectedPeakFilter) {
      result = result.filter((e) => e.peak_id === selectedPeakFilter);
    }

    return result;
  }, [events, searchQuery, selectedPeakFilter]);

  const timeFilters: { key: TimeFilter; label: string }[] = [
    { key: "upcoming", label: "Upcoming" },
    { key: "this_week", label: "This Week" },
    { key: "this_month", label: "This Month" },
    { key: "past", label: "Past" },
  ];

  const handleTimeFilterChange = (filter: TimeFilter) => {
    setTimeFilter(filter);
    // Trigger server refetch via navigation
    const params = new URLSearchParams();
    if (filter !== "upcoming") params.set("filter", filter);
    if (sortBy !== "soonest") params.set("sort", sortBy);
    if (selectedPeakFilter) params.set("peak", selectedPeakFilter);
    const qs = params.toString();
    router.push(`/events${qs ? `?${qs}` : ""}`);
  };

  const handleSortChange = (sort: SortOption) => {
    setSortBy(sort);
    const params = new URLSearchParams();
    if (timeFilter !== "upcoming") params.set("filter", timeFilter);
    if (sort !== "soonest") params.set("sort", sort);
    if (selectedPeakFilter) params.set("peak", selectedPeakFilter);
    const qs = params.toString();
    router.push(`/events${qs ? `?${qs}` : ""}`);
  };

  // Update events when initialEvents changes (server refetch)
  useEffect(() => {
    setEvents(initialEvents);
  }, [initialEvents]);

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <span className="text-xs font-semibold text-[var(--color-text-muted-green)] tracking-widest uppercase">
            Community
          </span>
          <h1
            className="mt-1 text-3xl lg:text-4xl font-bold text-[var(--color-brand-primary)] tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Events
          </h1>
        </div>
        {isLoggedIn && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-accent)] transition-all hover:shadow-lg hover:shadow-[var(--color-brand-primary)]/20"
          >
            <PlusIcon className="w-4 h-4" />
            Create Event
          </button>
        )}
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-2xl border border-[var(--color-border-app)] p-4 mb-6">
        <div className="flex flex-col gap-4">
          {/* Time filter tabs */}
          <div className="flex items-center gap-1 overflow-x-auto">
            {timeFilters.map((f) => (
              <button
                key={f.key}
                onClick={() => handleTimeFilterChange(f.key)}
                className={`px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-colors ${
                  timeFilter === f.key
                    ? "text-[var(--color-brand-primary)] bg-[var(--color-surface-subtle)]"
                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-brand-primary)] hover:bg-[var(--color-surface-subtle)]"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Search + filters row */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-secondary)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search events..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border-app)] text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]/20"
              />
            </div>

            {/* Peak filter */}
            <select
              value={selectedPeakFilter || ""}
              onChange={(e) => setSelectedPeakFilter(e.target.value || null)}
              className="px-3 py-2 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border-app)] text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]/20"
            >
              <option value="">All Peaks</option>
              {allPeaks.map((peak) => (
                <option key={peak.id} value={peak.id}>
                  {peak.name}
                </option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value as SortOption)}
              className="px-3 py-2 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border-app)] text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]/20"
            >
              <option value="soonest">Soonest</option>
              <option value="popular">Most Popular</option>
              <option value="newest">Newest</option>
            </select>
          </div>
        </div>
      </div>

      {/* Events grid */}
      {filteredEvents.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[var(--color-border-app)] p-12 text-center">
          <CalendarIcon className="w-12 h-12 mx-auto text-[var(--color-text-secondary)] opacity-50" />
          <h3 className="mt-4 text-lg font-semibold text-[var(--color-text-primary)]">
            No events found
          </h3>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
            {timeFilter === "past"
              ? "No past events to show."
              : "Be the first to create an event!"}
          </p>
          {isLoggedIn && timeFilter !== "past" && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-accent)] transition-all"
            >
              <PlusIcon className="w-4 h-4" />
              Create Event
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredEvents.map((event) => (
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

      {/* Create Event Modal */}
      <EventCreateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        allPeaks={allPeaks}
        onEventCreated={() => router.refresh()}
      />
    </>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
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

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
  );
}
