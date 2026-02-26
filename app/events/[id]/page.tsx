import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getEventById, getEventAttendees } from "@/lib/community";
import { getUnreadNotificationCount } from "@/lib/notifications";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import EventDetailClient from "./EventDetailClient";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const event = await getEventById(id);
  if (!event) notFound();

  const attendees = await getEventAttendees(id);

  let userNav: { email: string; screen_name: string | null; avatar_url: string | null } | null = null;
  let unreadNotificationCount = 0;

  if (user) {
    const [{ data: profile }, notifCount] = await Promise.all([
      supabase.from("profiles").select("screen_name, avatar_url").eq("id", user.id).single(),
      getUnreadNotificationCount(user.id),
    ]);
    userNav = {
      email: user.email || "",
      screen_name: profile?.screen_name || null,
      avatar_url: profile?.avatar_url || null,
    };
    unreadNotificationCount = notifCount;
  }

  // Get all peaks for edit modal and nav
  const { data: allPeaks } = await supabase
    .from("peaks")
    .select("id, name, slug, elevation")
    .order("name");

  const isOwner = user?.id === event.created_by;

  const eventDate = new Date(event.event_date);
  const dateFormatted = eventDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const timeFormatted = eventDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  let endTimeFormatted: string | null = null;
  if (event.end_date) {
    const endDate = new Date(event.end_date);
    endTimeFormatted = endDate.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
    // If different day, include date too
    if (endDate.toDateString() !== eventDate.toDateString()) {
      endTimeFormatted = endDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
    }
  }

  const creatorName = event.profiles.full_name || event.profiles.screen_name || "Anonymous";
  const creatorInitials = creatorName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-[var(--color-page)] antialiased">
      <Navbar
        user={userNav}
        userId={user?.id}
        unreadNotificationCount={unreadNotificationCount}
        peaks={(allPeaks || []).map((p) => ({ id: p.id, name: p.name, slug: p.slug, elevation: p.elevation }))}
      />

      {/* Content */}
      <div className="pt-28 pb-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-8">
          {/* Back link */}
          <Link
            href="/events"
            className="inline-flex items-center gap-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-brand-primary)] transition-colors mb-6"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to Events
          </Link>

          {/* Event card */}
          <div className="bg-white rounded-2xl border border-[var(--color-border-app)] overflow-hidden">
            {/* Status banner */}
            {event.status === "cancelled" && (
              <div className="px-6 py-3 bg-red-50 border-b border-red-100 text-red-700 text-sm font-medium text-center">
                This event has been cancelled
              </div>
            )}

            <div className="p-6 sm:p-8">
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1
                    className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] tracking-tight"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {event.title}
                  </h1>
                  <div className="mt-3 flex items-center gap-3">
                    {event.profiles.avatar_url ? (
                      <Image
                        src={event.profiles.avatar_url}
                        alt={creatorName}
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--color-brand-primary)] to-[var(--color-brand-accent)] flex items-center justify-center text-white text-xs font-semibold">
                        {creatorInitials}
                      </div>
                    )}
                    <span className="text-sm text-[var(--color-text-secondary)]">
                      Hosted by{" "}
                      <span className="font-medium text-[var(--color-text-primary)]">
                        {creatorName}
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Details grid */}
              <div className="mt-6 space-y-4">
                {/* Date & Time */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--color-brand-primary)]/10 flex items-center justify-center flex-shrink-0">
                    <CalendarIcon className="w-5 h-5 text-[var(--color-brand-primary)]" />
                  </div>
                  <div>
                    <p className="font-medium text-[var(--color-text-primary)]">{dateFormatted}</p>
                    <p className="text-sm text-[var(--color-text-secondary)]">
                      {timeFormatted}
                      {endTimeFormatted && ` - ${endTimeFormatted}`}
                    </p>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--color-brand-primary)]/10 flex items-center justify-center flex-shrink-0">
                    <MapPinIcon className="w-5 h-5 text-[var(--color-brand-primary)]" />
                  </div>
                  <div>
                    <p className="font-medium text-[var(--color-text-primary)]">{event.location}</p>
                  </div>
                </div>

                {/* Peak link */}
                {event.peaks && (
                  <Link
                    href={`/peaks/${event.peaks.slug}`}
                    className="flex items-start gap-3 group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[var(--color-brand-primary)]/10 flex items-center justify-center flex-shrink-0">
                      <MountainIcon className="w-5 h-5 text-[var(--color-brand-primary)]" />
                    </div>
                    <div>
                      <p className="font-medium text-[var(--color-text-primary)] group-hover:text-[var(--color-brand-primary)] transition-colors">
                        {event.peaks.name}
                      </p>
                      <p className="text-sm text-[var(--color-text-secondary)]">
                        {event.peaks.elevation.toLocaleString()}&apos; elevation
                      </p>
                    </div>
                  </Link>
                )}

                {/* Attendees info */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--color-brand-primary)]/10 flex items-center justify-center flex-shrink-0">
                    <UsersIcon className="w-5 h-5 text-[var(--color-brand-primary)]" />
                  </div>
                  <div>
                    <p className="font-medium text-[var(--color-text-primary)]">
                      {event.attendee_count} attendee{event.attendee_count !== 1 ? "s" : ""}
                      {event.max_attendees && ` / ${event.max_attendees} spots`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Description */}
              {event.description && (
                <div className="mt-6 pt-6 border-t border-[var(--color-border-app)]">
                  <h2 className="text-sm font-semibold text-[var(--color-text-muted-green)] tracking-wider uppercase mb-3">
                    About this event
                  </h2>
                  <p className="text-[var(--color-text-primary)] leading-relaxed whitespace-pre-wrap">
                    {event.description}
                  </p>
                </div>
              )}

              {/* RSVP + Owner Actions (client component) */}
              <EventDetailClient
                event={event}
                isLoggedIn={!!user}
                isOwner={isOwner}
                currentUserId={user?.id}
                allPeaks={allPeaks || []}
              />

              {/* Attendees list */}
              {attendees.length > 0 && (
                <div className="mt-6 pt-6 border-t border-[var(--color-border-app)]">
                  <h2 className="text-sm font-semibold text-[var(--color-text-muted-green)] tracking-wider uppercase mb-4">
                    Attendees ({attendees.length})
                  </h2>
                  <div className="flex flex-wrap gap-3">
                    {attendees.map((attendee) => {
                      const name = attendee.profiles.full_name || attendee.profiles.screen_name || "Anonymous";
                      const initials = name
                        .split(" ")
                        .map((w) => w[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2);

                      return (
                        <div key={attendee.id} className="flex items-center gap-2">
                          {attendee.profiles.avatar_url ? (
                            <Image
                              src={attendee.profiles.avatar_url}
                              alt={name}
                              width={32}
                              height={32}
                              className="w-8 h-8 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--color-brand-primary)] to-[var(--color-brand-accent)] flex items-center justify-center text-white text-xs font-semibold">
                              {initials}
                            </div>
                          )}
                          <span className="text-sm font-medium text-[var(--color-text-primary)]">
                            {name}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Link to community post */}
              {event.community_post_id && (
                <div className="mt-6 pt-6 border-t border-[var(--color-border-app)]">
                  <Link
                    href="/community"
                    className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-brand-primary)] hover:underline"
                  >
                    <CommentIcon className="w-4 h-4" />
                    View discussion in community feed
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
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

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
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

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  );
}

function CommentIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
    </svg>
  );
}

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
    </svg>
  );
}
