"use client";

import Link from "next/link";
import { parseMentionSegments, mentionHref, type MentionKind } from "@/lib/mentions";

interface MentionTextProps {
  content: string;
  className?: string;
}

const CHIP_CLASS =
  "inline-flex items-center gap-0.5 rounded-md bg-[var(--color-brand-primary)]/10 px-1.5 py-0.5 font-medium text-[var(--color-brand-primary)] align-baseline whitespace-nowrap hover:bg-[var(--color-brand-primary)]/20 transition-colors";

function chipLabel(kind: MentionKind, label: string): string {
  return kind === "user" ? `@${label}` : label;
}

function MentionChipIcon({ kind }: { kind: MentionKind }) {
  const cls = "h-[1em] w-[1em] shrink-0";
  if (kind === "peak") {
    return (
      <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 20l5-10 4 5 3-6 4 11H4z" />
      </svg>
    );
  }
  if (kind === "trailhead") {
    return (
      <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    );
  }
  // user
  return (
    <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 20c0-3.314 3.582-6 8-6s8 2.686 8 6" />
    </svg>
  );
}

/**
 * Renders post/comment/report text, turning @-mention tokens into chip links
 * with a kind icon (mountain / pin / person). Plain text (no tokens) renders
 * identically to a normal text node, with whitespace preserved. Drop-in
 * replacement for `{content}` inside a `whitespace-pre-wrap` container.
 */
export default function MentionText({ content, className }: MentionTextProps) {
  const segments = parseMentionSegments(content);

  return (
    <span className={className}>
      {segments.map((seg, i) => {
        if (seg.type === "text") {
          return <span key={i}>{seg.value}</span>;
        }
        return (
          <Link
            key={i}
            href={mentionHref(seg.kind, seg.identifier)}
            className={CHIP_CLASS}
            // Stop clicks from bubbling to parent card/link handlers.
            onClick={(e) => e.stopPropagation()}
          >
            <MentionChipIcon kind={seg.kind} />
            {chipLabel(seg.kind, seg.label)}
          </Link>
        );
      })}
    </span>
  );
}
