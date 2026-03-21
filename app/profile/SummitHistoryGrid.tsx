"use client";

import { useState } from "react";
import Image from "next/image";

type SummitPeak = {
  id: string;
  slug: string;
  name: string;
  elevation: string;
  region: string;
  completedDate: string;
  weather: string;
  rating: number;
};

const DEFAULT_VISIBLE = 6;

function StarIcon({ className, filled }: { className?: string; filled?: boolean }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
    </svg>
  );
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
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

function CloudIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
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

export default function SummitHistoryGrid({ peaks }: { peaks: SummitPeak[] }) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? peaks : peaks.slice(0, DEFAULT_VISIBLE);

  return (
    <>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        {visible.map((peak, index) => (
          <article
            key={peak.id}
            className="group card-hover bg-[var(--color-surface-subtle)]/30 rounded-2xl overflow-hidden border border-[var(--color-border-app)] animate-fade-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="relative h-36 overflow-hidden">
              <Image
                src="/hero.png"
                alt=""
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute top-3 right-3">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon
                      key={i}
                      className={`w-4 h-4 ${i < peak.rating ? 'text-[var(--color-amber-glow)]' : 'text-white/30'}`}
                      filled={i < peak.rating}
                    />
                  ))}
                </div>
              </div>
              <div className="absolute bottom-3 left-3 right-3">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 rounded-lg bg-white/20 backdrop-blur-sm text-xs font-medium text-white flex items-center gap-1">
                    <CheckCircleIcon className="w-3 h-3" />
                    Summited
                  </span>
                </div>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-brand-primary)] transition-colors">
                {peak.name}
              </h3>
              <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                <span className="font-mono text-[var(--color-brand-primary)]">{peak.elevation}</span>
                <span className="mx-2">•</span>
                {peak.region}
              </p>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--color-border-app)]">
                <span className="text-xs text-[var(--color-text-secondary)] flex items-center gap-1">
                  <CalendarIcon className="w-3.5 h-3.5" />
                  {peak.completedDate}
                </span>
                <span className="text-xs text-[var(--color-text-secondary)] flex items-center gap-1">
                  <CloudIcon className="w-3.5 h-3.5" />
                  {peak.weather}
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="p-4 bg-[var(--color-surface-subtle)]/30 flex items-center justify-between">
        <p className="text-sm text-[var(--color-text-secondary)]">
          Showing <span className="font-semibold">{visible.length}</span> of{" "}
          <span className="font-semibold">{peaks.length}</span> summits
        </p>
        {peaks.length > DEFAULT_VISIBLE && (
          <button
            onClick={() => setShowAll((v) => !v)}
            className="text-sm font-semibold text-[var(--color-brand-primary)] hover:underline flex items-center gap-2 group"
          >
            {showAll ? "Show Less" : "View All History"}
            <ArrowRightIcon className={`w-4 h-4 transition-transform ${showAll ? "rotate-90" : "group-hover:translate-x-1"}`} />
          </button>
        )}
      </div>
    </>
  );
}
