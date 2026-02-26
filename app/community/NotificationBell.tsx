"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { markNotificationAsRead, markAllNotificationsAsRead } from "./notification-actions";
import { acceptFollowRequest, rejectFollowRequest } from "./follow-actions";
import type { Notification } from "@/lib/notifications.types";

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 7) {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } else if (diffDays > 0) {
    return `${diffDays}d ago`;
  } else if (diffHours > 0) {
    return `${diffHours}h ago`;
  } else if (diffMins > 0) {
    return `${diffMins}m ago`;
  } else {
    return "just now";
  }
}

function getInitials(fullName: string | null, screenName: string | null): string {
  const name = fullName || screenName || "?";
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

interface NotificationBellProps {
  initialCount: number;
  userId: string;
}

export default function NotificationBell({ initialCount, userId }: NotificationBellProps) {
  const supabase = useMemo(() => createClient(), []);
  const [unreadCount, setUnreadCount] = useState(initialCount);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch notifications when dropdown opens
  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("notifications")
      .select(`
        id,
        user_id,
        actor_id,
        type,
        post_id,
        comment_id,
        badge_id,
        follow_id,
        message,
        is_read,
        created_at,
        actor:actor_id (
          screen_name,
          full_name,
          avatar_url
        ),
        follow:follow_id (
          status
        )
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20);

    if (!error && data) {
      // Clear follow_id on notifications where the follow request has already been acted on
      const processed = (data as unknown as (Notification & { follow?: { status: string } | null })[]).map((n) => {
        if (n.type === "follow_request" && n.follow && n.follow.status !== "pending") {
          return { ...n, follow_id: null, follow: undefined };
        }
        const { follow, ...rest } = n;
        return rest;
      });
      setNotifications(processed as Notification[]);
    }
    setIsLoading(false);
  }, [supabase, userId]);

  const handleToggle = useCallback(() => {
    setIsOpen((prev) => {
      const next = !prev;
      if (next) {
        fetchNotifications();
      }
      return next;
    });
  }, [fetchNotifications]);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  // Keep a ref for isOpen so the stable realtime subscription can read the latest value
  const isOpenRef = useRef(isOpen);
  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  // Realtime subscription — intentionally excludes isOpen to avoid re-subscribing on toggle.
  // No row-level filter: RLS (auth.uid() = user_id) handles scoping on the server side.
  // Adding a filter on top of RLS causes events to be silently dropped in some Supabase configs.
  useEffect(() => {
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        async (payload) => {
          const newRow = payload.new as { user_id: string; id: string };
          if (newRow.user_id !== userId) return; // client-side guard

          setUnreadCount((prev) => prev + 1);

          if (isOpenRef.current) {
            // Fetch with actor join since realtime payload lacks the join
            const { data } = await supabase
              .from("notifications")
              .select(`
                id, user_id, actor_id, type, post_id, comment_id, badge_id, follow_id,
                message, is_read, created_at,
                actor:actor_id (screen_name, full_name, avatar_url)
              `)
              .eq("id", newRow.id)
              .single();

            const notification = (data ?? payload.new) as unknown as Notification;
            setNotifications((prev) => [notification, ...prev]);
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "notifications" },
        (payload) => {
          const updated = payload.new as unknown as Notification;
          const old = payload.old as unknown as Partial<Notification>;
          if (updated.user_id !== userId) return; // client-side guard

          // If is_read changed from false to true, decrement count
          if (updated.is_read && old.is_read === false) {
            setUnreadCount((prev) => Math.max(0, prev - 1));
          }
          // Update in list
          setNotifications((prev) =>
            prev.map((n) => (n.id === updated.id ? { ...n, ...updated } : n))
          );
        }
      )
      .subscribe((_status, err) => {
        if (err) console.error("[NotificationBell] Realtime error:", err);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, userId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleMarkAsRead = useCallback(async (notificationId: string) => {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    const result = await markNotificationAsRead(notificationId);
    if (result.error) {
      // Rollback
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, is_read: false } : n))
      );
      setUnreadCount((prev) => prev + 1);
    }
  }, []);

  const handleMarkAllAsRead = useCallback(async () => {
    const previousNotifications = notifications;
    const previousCount = unreadCount;

    // Optimistic update
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);

    const result = await markAllNotificationsAsRead();
    if (result.error) {
      // Rollback
      setNotifications(previousNotifications);
      setUnreadCount(previousCount);
    }
  }, [notifications, unreadCount]);

  const handleFollowAction = useCallback(async (followId: string, action: "accept" | "reject", notificationId: string) => {
    // Optimistic: mark notification as read
    if (!notifications.find((n) => n.id === notificationId)?.is_read) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }

    const result = action === "accept"
      ? await acceptFollowRequest(followId)
      : await rejectFollowRequest(followId);

    if (result.error) {
      console.error("Follow action failed:", result.error);
    } else {
      // Clear follow_id so buttons don't reappear when dropdown re-opens
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, follow_id: null } : n))
      );
    }
  }, [notifications]);

  const notificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "like":
        return (
          <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-3.5 h-3.5 text-red-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
          </div>
        );
      case "comment":
        return (
          <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-3.5 h-3.5 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
            </svg>
          </div>
        );
      case "badge":
        return (
          <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-3.5 h-3.5 text-amber-600" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" d="M5.166 2.621v.858c-1.035.148-2.059.33-3.071.543a.75.75 0 00-.584.859 6.753 6.753 0 006.138 5.6 6.73 6.73 0 002.743 1.346A6.707 6.707 0 019.279 15H8.54c-1.036 0-1.875.84-1.875 1.875V19.5h-.75a.75.75 0 000 1.5h12.75a.75.75 0 000-1.5h-.75v-2.625c0-1.036-.84-1.875-1.875-1.875h-.739a6.707 6.707 0 01-1.112-3.173 6.73 6.73 0 002.743-1.347 6.753 6.753 0 006.139-5.6.75.75 0 00-.585-.858 47.077 47.077 0 00-3.07-.543V2.62a.75.75 0 00-.658-.744 49.22 49.22 0 00-6.093-.377c-2.063 0-4.096.128-6.093.377a.75.75 0 00-.657.744z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case "follow_request":
        return (
          <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-3.5 h-3.5 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 8.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
            </svg>
          </div>
        );
      case "follow_accepted":
        return (
          <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-3.5 h-3.5 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
        );
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={handleToggle}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
        className="relative p-2 rounded-full text-[var(--color-text-secondary)] hover:text-[var(--color-brand-primary)] hover:bg-[var(--color-surface-subtle)] transition-colors"
      >
        <BellIcon className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-amber-400 text-amber-950 text-xs font-bold px-1">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="fixed left-4 right-4 top-16 sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:w-96 bg-white rounded-2xl border border-[var(--color-border-app)] shadow-xl overflow-hidden z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border-app)]">
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs font-medium text-[var(--color-brand-primary)] hover:underline"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="px-4 py-8 text-center text-sm text-[var(--color-text-secondary)]">
                Loading...
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <BellIcon className="w-8 h-8 mx-auto text-[var(--color-text-secondary)] opacity-40" />
                <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                  No notifications yet
                </p>
              </div>
            ) : (
              notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                  onFollowAction={handleFollowAction}
                  notificationIcon={notificationIcon}
                  onNavigate={() => setIsOpen(false)}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function NotificationItem({
  notification,
  onMarkAsRead,
  onFollowAction,
  notificationIcon,
  onNavigate,
}: {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onFollowAction: (followId: string, action: "accept" | "reject", notificationId: string) => void;
  notificationIcon: (type: Notification["type"]) => React.ReactNode;
  onNavigate: () => void;
}) {
  const [acted, setActed] = useState(false);
  const router = useRouter();

  const handleClick = () => {
    if (!notification.is_read) {
      onMarkAsRead(notification.id);
    }
    if (notification.post_id) {
      onNavigate();
      router.push(`/community#post-${notification.post_id}`);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`w-full px-4 py-3 flex items-start gap-3 text-left hover:bg-[var(--color-surface-subtle)] transition-colors cursor-pointer ${
        !notification.is_read ? "bg-[var(--color-brand-primary)]/[0.03]" : ""
      }`}
    >
      {/* Actor avatar or type icon */}
      <div className="relative flex-shrink-0">
        {notification.actor?.avatar_url ? (
          <Image
            src={notification.actor.avatar_url}
            alt=""
            width={36}
            height={36}
            className="w-9 h-9 rounded-xl object-cover"
          />
        ) : notification.actor ? (
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--color-brand-primary)] to-[var(--color-brand-accent)] flex items-center justify-center text-white text-xs font-semibold">
            {getInitials(notification.actor.full_name, notification.actor.screen_name)}
          </div>
        ) : (
          <div className="w-9 h-9 rounded-xl bg-[var(--color-surface-subtle)] flex items-center justify-center">
            {notificationIcon(notification.type)}
          </div>
        )}
        {/* Type badge overlay */}
        {notification.actor && (
          <div className="absolute -bottom-1 -right-1">
            {notificationIcon(notification.type)}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm text-[var(--color-text-primary)] leading-snug">
          {notification.message}
        </p>
        <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">
          {formatTimeAgo(notification.created_at)}
        </p>

        {/* Follow request action buttons */}
        {notification.type === "follow_request" && notification.follow_id && !acted && (
          <div className="mt-2 flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActed(true);
                onFollowAction(notification.follow_id!, "accept", notification.id);
              }}
              className="px-3 py-1 text-xs font-semibold text-white bg-[var(--color-brand-primary)] rounded-lg hover:bg-[var(--color-brand-accent)] transition-all"
            >
              Accept
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActed(true);
                onFollowAction(notification.follow_id!, "reject", notification.id);
              }}
              className="px-3 py-1 text-xs font-semibold text-[var(--color-text-secondary)] border border-[var(--color-border-app-strong)] rounded-lg hover:bg-[var(--color-surface-subtle)] transition-all"
            >
              Decline
            </button>
          </div>
        )}
        {notification.type === "follow_request" && acted && (
          <p className="mt-1 text-xs text-[var(--color-text-secondary)] italic">Responded</p>
        )}
      </div>

      {/* Unread dot */}
      {!notification.is_read && (
        <div className="w-2 h-2 rounded-full bg-[var(--color-brand-primary)] flex-shrink-0 mt-1.5" />
      )}
    </div>
  );
}

function BellIcon({ className }: { className?: string }) {
  return (
    <svg className={className || "w-5 h-5"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
    </svg>
  );
}
