"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { CommunityEvent } from "@/lib/community.types";
import { toggleEventAttendance, cancelEvent, updateEvent } from "../actions";
import Modal from "@/app/components/Modal";

interface Peak {
  id: string;
  name: string;
  slug: string;
  elevation: number;
}

interface EventDetailClientProps {
  event: CommunityEvent;
  isLoggedIn: boolean;
  isOwner: boolean;
  currentUserId?: string;
  allPeaks: Peak[];
}

export default function EventDetailClient({
  event: initialEvent,
  isLoggedIn,
  isOwner,
  allPeaks,
}: EventDetailClientProps) {
  const router = useRouter();
  const [event, setEvent] = useState(initialEvent);
  const [isPending, startTransition] = useTransition();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const isFull = event.max_attendees !== null && event.attendee_count >= event.max_attendees;
  const isCancelled = event.status === "cancelled";

  const handleToggleRsvp = () => {
    if (!isLoggedIn || isCancelled) return;

    // Optimistic
    setEvent((prev) => ({
      ...prev,
      user_has_rsvpd: !prev.user_has_rsvpd,
      attendee_count: prev.user_has_rsvpd ? prev.attendee_count - 1 : prev.attendee_count + 1,
    }));

    startTransition(async () => {
      const result = await toggleEventAttendance(event.id);
      if (result.error) {
        // Rollback
        setEvent((prev) => ({
          ...prev,
          user_has_rsvpd: !prev.user_has_rsvpd,
          attendee_count: prev.user_has_rsvpd ? prev.attendee_count - 1 : prev.attendee_count + 1,
        }));
      } else {
        router.refresh();
      }
    });
  };

  const handleCancel = () => {
    startTransition(async () => {
      const result = await cancelEvent(event.id);
      if (result.success) {
        setEvent((prev) => ({ ...prev, status: "cancelled" }));
        setShowCancelConfirm(false);
        router.refresh();
      }
    });
  };

  const handleEditSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setEditError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await updateEvent(event.id, formData);
      if (result.error) {
        setEditError(result.error);
      } else {
        setShowEditModal(false);
        router.refresh();
      }
    });
  };

  // Format dates for edit form defaults
  const eventDateLocal = new Date(event.event_date).toISOString().slice(0, 16);
  const endDateLocal = event.end_date ? new Date(event.end_date).toISOString().slice(0, 16) : "";

  return (
    <>
      {/* RSVP button */}
      <div className="mt-6 pt-6 border-t border-[var(--color-border-app)]">
        {!isCancelled && isLoggedIn && (
          <button
            onClick={handleToggleRsvp}
            disabled={isPending || (isFull && !event.user_has_rsvpd)}
            className={`w-full py-3 rounded-xl text-sm font-semibold transition-all ${
              event.user_has_rsvpd
                ? "bg-[var(--color-surface-subtle)] text-[var(--color-brand-primary)] hover:bg-red-50 hover:text-red-600"
                : isFull
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-[var(--color-brand-primary)] text-white hover:bg-[var(--color-brand-accent)] hover:shadow-lg hover:shadow-[var(--color-brand-primary)]/20"
            }`}
          >
            {isPending
              ? "..."
              : event.user_has_rsvpd
                ? "Cancel RSVP"
                : isFull
                  ? "Event Full"
                  : "RSVP to this event"}
          </button>
        )}

        {!isLoggedIn && !isCancelled && (
          <p className="text-sm text-[var(--color-text-secondary)] text-center">
            <a href="/auth/login" className="text-[var(--color-brand-primary)] hover:underline font-medium">
              Sign in
            </a>{" "}
            to RSVP to this event
          </p>
        )}

        {/* Owner actions */}
        {isOwner && !isCancelled && (
          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={() => setShowEditModal(true)}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium text-[var(--color-text-primary)] border border-[var(--color-border-app)] hover:bg-[var(--color-surface-subtle)] transition-colors"
            >
              Edit Event
            </button>
            <button
              onClick={() => setShowCancelConfirm(true)}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium text-red-600 border border-red-200 hover:bg-red-50 transition-colors"
            >
              Cancel Event
            </button>
          </div>
        )}
      </div>

      {/* Cancel confirmation modal */}
      <Modal
        isOpen={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        title="Cancel Event"
        size="sm"
      >
        <p className="text-sm text-[var(--color-text-secondary)] mb-6">
          Are you sure you want to cancel <strong>{event.title}</strong>? This will notify all attendees and cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setShowCancelConfirm(false)}
            className="px-4 py-2 rounded-xl text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-subtle)] transition-colors"
          >
            Keep Event
          </button>
          <button
            onClick={handleCancel}
            disabled={isPending}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {isPending ? "Cancelling..." : "Cancel Event"}
          </button>
        </div>
      </Modal>

      {/* Edit modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Event"
        size="lg"
      >
        <form onSubmit={handleEditSubmit} className="space-y-5">
          {editError && (
            <div className="px-4 py-3 rounded-xl bg-red-50 text-red-700 text-sm">
              {editError}
            </div>
          )}

          <div>
            <label htmlFor="edit-title" className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">
              Event Title *
            </label>
            <input
              id="edit-title"
              name="title"
              type="text"
              required
              defaultValue={event.title}
              maxLength={200}
              className="w-full px-4 py-2.5 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border-app)] text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 focus:border-[var(--color-brand-primary)]"
            />
          </div>

          <div>
            <label htmlFor="edit-description" className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">
              Description
            </label>
            <textarea
              id="edit-description"
              name="description"
              rows={3}
              defaultValue={event.description || ""}
              maxLength={2000}
              className="w-full px-4 py-2.5 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border-app)] text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 focus:border-[var(--color-brand-primary)] resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="edit-date" className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">
                Date & Time *
              </label>
              <input
                id="edit-date"
                name="eventDate"
                type="datetime-local"
                required
                defaultValue={eventDateLocal}
                className="w-full px-4 py-2.5 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border-app)] text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 focus:border-[var(--color-brand-primary)]"
              />
            </div>
            <div>
              <label htmlFor="edit-end-date" className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">
                End Date & Time
              </label>
              <input
                id="edit-end-date"
                name="endDate"
                type="datetime-local"
                defaultValue={endDateLocal}
                className="w-full px-4 py-2.5 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border-app)] text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 focus:border-[var(--color-brand-primary)]"
              />
            </div>
          </div>

          <div>
            <label htmlFor="edit-location" className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">
              Location *
            </label>
            <input
              id="edit-location"
              name="location"
              type="text"
              required
              defaultValue={event.location}
              className="w-full px-4 py-2.5 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border-app)] text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 focus:border-[var(--color-brand-primary)]"
            />
          </div>

          <div>
            <label htmlFor="edit-peak" className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">
              Link to a 14er
            </label>
            <select
              id="edit-peak"
              name="peakId"
              defaultValue={event.peak_id || ""}
              className="w-full px-4 py-2.5 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border-app)] text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 focus:border-[var(--color-brand-primary)]"
            >
              <option value="">None</option>
              {allPeaks.map((peak) => (
                <option key={peak.id} value={peak.id}>
                  {peak.name} ({peak.elevation.toLocaleString()}&apos;)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="edit-max" className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">
              Max Attendees
            </label>
            <input
              id="edit-max"
              name="maxAttendees"
              type="number"
              min={1}
              defaultValue={event.max_attendees || ""}
              placeholder="No limit"
              className="w-full px-4 py-2.5 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border-app)] text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 focus:border-[var(--color-brand-primary)]"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowEditModal(false)}
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-subtle)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-accent)] transition-all disabled:opacity-50"
            >
              {isPending ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
