"use client";

import { useState, useTransition } from "react";
import { updatePrivacySettings } from "./actions";
import type { PrivacySettings, SectionVisibility } from "@/lib/privacy";

interface Props {
  isPrivate: boolean;
  privacySettings: PrivacySettings;
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
    </svg>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-5">
      <h2 className="text-base font-semibold text-[var(--color-text-primary)]">{title}</h2>
      {subtitle && <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{subtitle}</p>}
    </div>
  );
}

// ─── Visibility pill group ─────────────────────────────────────────────────────

const VISIBILITY_OPTIONS: { value: SectionVisibility; label: string }[] = [
  { value: "everyone", label: "Everyone" },
  { value: "followers", label: "Followers Only" },
  { value: "nobody", label: "Nobody" },
];

function VisibilityPills({
  name,
  value,
  onChange,
}: {
  name: string;
  value: SectionVisibility;
  onChange: (v: SectionVisibility) => void;
}) {
  return (
    <div className="flex gap-1.5 flex-wrap">
      {VISIBILITY_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
            value === opt.value
              ? "bg-[var(--color-brand-primary)] text-white shadow-sm"
              : "bg-[var(--color-surface-subtle)] text-[var(--color-text-secondary)] border border-[var(--color-border-app)] hover:border-[var(--color-border-app-strong)] hover:text-[var(--color-text-primary)]"
          }`}
        >
          {opt.label}
        </button>
      ))}
      {/* hidden input so formData works */}
      <input type="hidden" name={name} value={value} />
    </div>
  );
}

// ─── Section visibility row ───────────────────────────────────────────────────

function SectionVisibilityRow({
  label,
  description,
  name,
  value,
  onChange,
}: {
  label: string;
  description: string;
  name: string;
  value: SectionVisibility;
  onChange: (v: SectionVisibility) => void;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 py-4 border-b border-[var(--color-border-app)] last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--color-text-primary)]">{label}</p>
        <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">{description}</p>
      </div>
      <VisibilityPills name={name} value={value} onChange={onChange} />
    </div>
  );
}

// ─── Root component ───────────────────────────────────────────────────────────

export default function PrivacySettingsClient({ isPrivate: initialIsPrivate, privacySettings: initial }: Props) {
  const [isPending, startTransition] = useTransition();
  const [isPrivate, setIsPrivate] = useState(initialIsPrivate);
  const [settings, setSettings] = useState<PrivacySettings>(initial);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (key: keyof PrivacySettings) => (v: SectionVisibility) => {
    setSettings((prev) => ({ ...prev, [key]: v }));
    setSaved(false);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSaved(false);
    const formData = new FormData(e.currentTarget);
    formData.set("is_private", String(isPrivate));

    startTransition(async () => {
      const res = await updatePrivacySettings(formData);
      if (res.error) setError(res.error);
      else setSaved(true);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">

      {/* ── Section A: Profile Visibility ─────────────────────────── */}
      <div>
        <SectionHeader
          title="Profile Visibility"
          subtitle="Control whether your profile is open to everyone or requires a follow request."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Public card */}
          <button
            type="button"
            onClick={() => { setIsPrivate(false); setSaved(false); }}
            className={`relative flex items-start gap-3.5 p-4 rounded-2xl border-2 text-left transition-all ${
              !isPrivate
                ? "border-[var(--color-brand-primary)] bg-[var(--color-brand-primary)]/5"
                : "border-[var(--color-border-app)] bg-[var(--color-surface-subtle)] hover:border-[var(--color-border-app-strong)]"
            }`}
          >
            <div className={`mt-0.5 flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center ${
              !isPrivate ? "bg-[var(--color-brand-primary)]/10" : "bg-white border border-[var(--color-border-app)]"
            }`}>
              <GlobeIcon className={`w-5 h-5 ${!isPrivate ? "text-[var(--color-brand-primary)]" : "text-[var(--color-text-secondary)]"}`} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-[var(--color-text-primary)]">Public</p>
              <p className="text-xs text-[var(--color-text-secondary)] mt-0.5 leading-relaxed">
                Anyone can see your profile. Follows are auto-accepted.
              </p>
            </div>
            {!isPrivate && (
              <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[var(--color-brand-primary)] flex items-center justify-center">
                <CheckIcon className="w-3 h-3 text-white" />
              </div>
            )}
          </button>

          {/* Private card */}
          <button
            type="button"
            onClick={() => { setIsPrivate(true); setSaved(false); }}
            className={`relative flex items-start gap-3.5 p-4 rounded-2xl border-2 text-left transition-all ${
              isPrivate
                ? "border-[var(--color-brand-primary)] bg-[var(--color-brand-primary)]/5"
                : "border-[var(--color-border-app)] bg-[var(--color-surface-subtle)] hover:border-[var(--color-border-app-strong)]"
            }`}
          >
            <div className={`mt-0.5 flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center ${
              isPrivate ? "bg-[var(--color-brand-primary)]/10" : "bg-white border border-[var(--color-border-app)]"
            }`}>
              <LockIcon className={`w-5 h-5 ${isPrivate ? "text-[var(--color-brand-primary)]" : "text-[var(--color-text-secondary)]"}`} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-[var(--color-text-primary)]">Private</p>
              <p className="text-xs text-[var(--color-text-secondary)] mt-0.5 leading-relaxed">
                Protected sections hidden from non-followers. Follow requests require your approval.
              </p>
            </div>
            {isPrivate && (
              <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[var(--color-brand-primary)] flex items-center justify-center">
                <CheckIcon className="w-3 h-3 text-white" />
              </div>
            )}
          </button>
        </div>
      </div>

      {/* ── Section B: Section Visibility ─────────────────────────── */}
      <div>
        <SectionHeader
          title="Section Visibility"
          subtitle="Choose who can see each part of your profile, regardless of your overall visibility setting."
        />
        <div className="bg-[var(--color-surface-subtle)] rounded-2xl border border-[var(--color-border-app)] px-4 sm:px-5">
          <SectionVisibilityRow
            label="Stats"
            description="Summit count, elevation, distance, and friends count"
            name="show_stats"
            value={settings.show_stats}
            onChange={set("show_stats")}
          />
          <SectionVisibilityRow
            label="Summit History"
            description="Your logged 14er summits and trip reports"
            name="show_summit_history"
            value={settings.show_summit_history}
            onChange={set("show_summit_history")}
          />
          <SectionVisibilityRow
            label="Badges"
            description="Earned achievement badges and milestones"
            name="show_badges"
            value={settings.show_badges}
            onChange={set("show_badges")}
          />
          <SectionVisibilityRow
            label="Groups"
            description="Groups you've joined or created"
            name="show_groups"
            value={settings.show_groups}
            onChange={set("show_groups")}
          />
          <SectionVisibilityRow
            label="Trip Reports"
            description="Your published trip reports for hikes"
            name="show_trip_reports"
            value={settings.show_trip_reports}
            onChange={set("show_trip_reports")}
          />
          <SectionVisibilityRow
            label="Events"
            description="Events you're hosting or attending"
            name="show_events"
            value={settings.show_events}
            onChange={set("show_events")}
          />
        </div>
      </div>

      {/* ── Feedback & Save ───────────────────────────────────────── */}
      {error && (
        <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm">{error}</div>
      )}
      {saved && !error && (
        <div className="px-4 py-3 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border-app-strong)] text-[var(--color-brand-primary)] text-sm font-medium">
          Privacy settings saved.
        </div>
      )}

      <div className="flex justify-end pt-1">
        <button
          type="submit"
          disabled={isPending}
          className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-accent)] transition-all disabled:opacity-50"
        >
          {isPending ? "Saving…" : "Save Settings"}
        </button>
      </div>
    </form>
  );
}
