// Shared, client-safe utilities for @-mention tagging of peaks, trailheads, and users.
// Mentions are stored inline in plain text columns as a markdown-style token:
//   @[Mount Elbert](peak:mount-elbert)
//   @[Brainard Lake TH](trailhead:brainard-lake)
//   @[Rob Burtelow](user:robert)   <- identifier is the unique screen_name (drives /u/[username])

export type MentionKind = "peak" | "trailhead" | "user";

// Matches @[label](kind:identifier). Labels may not contain ] and identifiers may not contain ).
// Use a fresh RegExp wherever a stateful (global) match is needed to avoid lastIndex bugs.
export const MENTION_REGEX = /@\[([^\]]+)\]\((peak|trailhead|user):([^)]+)\)/g;

export type MentionSegment =
  | { type: "text"; value: string }
  | { type: "mention"; kind: MentionKind; identifier: string; label: string };

export interface MentionRef {
  kind: MentionKind;
  identifier: string;
}

/**
 * Build a storage token for a mention. Labels have any `]` stripped and identifiers any `)`
 * stripped so the token can always be parsed back unambiguously.
 */
export function buildMentionToken({
  kind,
  identifier,
  label,
}: {
  kind: MentionKind;
  identifier: string;
  label: string;
}): string {
  const safeLabel = label.replace(/[[\]]/g, "").trim();
  const safeId = identifier.replace(/[()]/g, "").trim();
  return `@[${safeLabel}](${kind}:${safeId})`;
}

/**
 * Split text into ordered segments of plain text and mentions, for rendering.
 */
export function parseMentionSegments(text: string): MentionSegment[] {
  if (!text) return [];
  const segments: MentionSegment[] = [];
  const regex = new RegExp(MENTION_REGEX.source, "g");
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: "text", value: text.slice(lastIndex, match.index) });
    }
    segments.push({
      type: "mention",
      label: match[1],
      kind: match[2] as MentionKind,
      identifier: match[3],
    });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    segments.push({ type: "text", value: text.slice(lastIndex) });
  }

  return segments;
}

/**
 * Extract a deduped list of mention references from text.
 */
export function extractMentions(text: string): MentionRef[] {
  const seen = new Set<string>();
  const refs: MentionRef[] = [];
  const regex = new RegExp(MENTION_REGEX.source, "g");
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    const kind = match[2] as MentionKind;
    const identifier = match[3];
    const key = `${kind}:${identifier}`;
    if (!seen.has(key)) {
      seen.add(key);
      refs.push({ kind, identifier });
    }
  }

  return refs;
}

/**
 * Replace mention tokens with their plain labels (users prefixed with @).
 * Use where rendered links would be invalid, e.g. inside another anchor.
 */
export function mentionsToPlainText(text: string): string {
  if (!text) return text;
  const regex = new RegExp(MENTION_REGEX.source, "g");
  return text.replace(regex, (_full, label, kind) =>
    kind === "user" ? `@${label}` : label,
  );
}

/**
 * The destination href for a rendered mention.
 */
export function mentionHref(kind: MentionKind, identifier: string): string {
  switch (kind) {
    case "peak":
      return `/peaks/${identifier}`;
    case "trailhead":
      return `/trailheads/${identifier}`;
    case "user":
      return `/u/${identifier}`;
  }
}
