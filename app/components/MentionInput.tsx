"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import {
  MENTION_REGEX,
  buildMentionToken,
  type MentionKind,
} from "@/lib/mentions";
import { searchMentions, type MentionSuggestion } from "@/app/community/mention-actions";

interface MentionInputProps {
  value: string; // markup string (stored content)
  onChange: (markup: string) => void;
  placeholder?: string;
  rows?: number;
  maxLength?: number;
  disabled?: boolean;
  className?: string;
  /** Called on Enter (no shift) when the suggestion dropdown is closed. */
  onSubmit?: () => void;
  /** Restrict which entity kinds appear in the dropdown. Defaults to all three. */
  kinds?: MentionKind[];
  autoFocus?: boolean;
  /** Class applied to the relative wrapper (e.g. for flex sizing). */
  wrapperClassName?: string;
  /** When set, a hidden input mirrors the markup value for native form submission. */
  name?: string;
  id?: string;
}

interface Token {
  dS: number;
  dE: number;
  mS: number;
  mE: number;
}

// Build the plaintext projection of a markup string plus a map of token spans.
function buildTokens(markup: string): { display: string; tokens: Token[] } {
  const tokens: Token[] = [];
  const re = new RegExp(MENTION_REGEX.source, "g");
  let display = "";
  let mCursor = 0;
  let dCursor = 0;
  let m: RegExpExecArray | null;

  while ((m = re.exec(markup)) !== null) {
    const plainBefore = markup.slice(mCursor, m.index);
    display += plainBefore;
    dCursor += plainBefore.length;

    const label = m[1];
    const dS = dCursor;
    const dE = dCursor + label.length;
    tokens.push({ dS, dE, mS: m.index, mE: m.index + m[0].length });

    display += label;
    dCursor = dE;
    mCursor = m.index + m[0].length;
  }
  display += markup.slice(mCursor);
  return { display, tokens };
}

// Map a display-string index to the corresponding markup index. When the index
// falls inside a token, snap to the token's start (side="start") or end ("end").
function displayToMarkup(d: number, tokens: Token[], side: "start" | "end"): number {
  let extra = 0;
  for (const t of tokens) {
    if (d <= t.dS) break;
    if (d >= t.dE) {
      extra += t.mE - t.mS - (t.dE - t.dS);
      continue;
    }
    return side === "start" ? t.mS : t.mE;
  }
  return d + extra;
}

const KIND_LABEL: Record<MentionKind, string> = {
  peak: "Peaks",
  trailhead: "Trailheads",
  user: "People",
};

// Render the display text with mention ranges wrapped in tinted chips. Used as the
// backdrop behind a transparent textarea so chips line up with the editable text.
// Chips carry no padding/margin so character positions stay identical to the textarea.
function renderHighlighted(display: string, tokens: Token[]): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let cursor = 0;
  tokens.forEach((t, i) => {
    if (t.dS > cursor) {
      nodes.push(<span key={`t${i}`}>{display.slice(cursor, t.dS)}</span>);
    }
    nodes.push(
      <span
        key={`m${i}`}
        className="rounded-[4px] bg-[var(--color-brand-primary)]/15 font-medium text-[var(--color-brand-primary)]"
        style={{ boxDecorationBreak: "clone", WebkitBoxDecorationBreak: "clone" }}
      >
        {display.slice(t.dS, t.dE)}
      </span>,
    );
    cursor = t.dE;
  });
  if (cursor < display.length) {
    nodes.push(<span key="tail">{display.slice(cursor)}</span>);
  }
  // Zero-width char keeps the backdrop's final line in sync when text ends in a newline.
  nodes.push("​");
  return nodes;
}

export default function MentionInput({
  value,
  onChange,
  placeholder,
  rows = 3,
  maxLength,
  disabled,
  className,
  onSubmit,
  kinds,
  autoFocus,
  wrapperClassName,
  name,
  id,
}: MentionInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const pendingCaretRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  const { display, tokens } = useMemo(() => buildTokens(value), [value]);

  // Active @-query state
  const [queryActive, setQueryActive] = useState(false);
  const [query, setQuery] = useState("");
  const atDisplayIndexRef = useRef(0);
  const queryEndDisplayRef = useRef(0);
  const [dropdownRect, setDropdownRect] = useState<{ top: number; left: number; width: number } | null>(null);

  const [suggestions, setSuggestions] = useState<MentionSuggestion[]>([]);
  const [highlight, setHighlight] = useState(0);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reqIdRef = useRef(0);

  // Restore caret after controlled re-render
  useLayoutEffect(() => {
    if (pendingCaretRef.current !== null && textareaRef.current) {
      const pos = pendingCaretRef.current;
      textareaRef.current.setSelectionRange(pos, pos);
      pendingCaretRef.current = null;
    }
  });

  // Debounced suggestion fetch
  useEffect(() => {
    if (!queryActive) {
      setSuggestions([]);
      return;
    }
    const trimmed = query.trim();
    if (trimmed.length === 0) {
      setSuggestions([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const reqId = ++reqIdRef.current;
    debounceRef.current = setTimeout(async () => {
      const results = await searchMentions(trimmed, kinds);
      if (reqId !== reqIdRef.current) return; // stale
      // People first so user matches stay visible above the (capped) peak/trailhead lists.
      const flat = [...results.users, ...results.peaks, ...results.trailheads];
      setSuggestions(flat);
      setHighlight(0);
      setLoading(false);
    }, 250);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, queryActive, kinds]);

  const closeDropdown = useCallback(() => {
    setQueryActive(false);
    setQuery("");
    setSuggestions([]);
    setHighlight(0);
  }, []);

  // Detect an active @-query from the display text before the caret.
  const detectQuery = useCallback((displayText: string, caret: number) => {
    const before = displayText.slice(0, caret);
    // @ must start the string or follow whitespace; query is words separated by single spaces.
    const match = before.match(/(?:^|\s)@([\p{L}\p{N}_]*(?:\s[\p{L}\p{N}_]+)*)$/u);
    if (!match) {
      closeDropdown();
      return;
    }
    const q = match[1] ?? "";
    atDisplayIndexRef.current = caret - q.length - 1;
    queryEndDisplayRef.current = caret;
    setQuery(q);
    setQueryActive(true);
  }, [closeDropdown]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newDisplay = e.target.value;
    const caret = e.target.selectionStart ?? newDisplay.length;
    const oldDisplay = display;

    // Diff old vs new display: common prefix / suffix.
    const minLen = Math.min(oldDisplay.length, newDisplay.length);
    let p = 0;
    while (p < minLen && oldDisplay[p] === newDisplay[p]) p++;
    let s = 0;
    while (
      s < minLen - p &&
      oldDisplay[oldDisplay.length - 1 - s] === newDisplay[newDisplay.length - 1 - s]
    ) {
      s++;
    }
    const dStart = p;
    const dEnd = oldDisplay.length - s;
    const inserted = newDisplay.slice(p, newDisplay.length - s);

    const mStart = displayToMarkup(dStart, tokens, "start");
    const mEnd = displayToMarkup(dEnd, tokens, "end");
    const newMarkup = value.slice(0, mStart) + inserted + value.slice(mEnd);

    if (maxLength !== undefined && newMarkup.length > maxLength) return;

    pendingCaretRef.current = caret;
    onChange(newMarkup);
    detectQuery(newDisplay, caret);
  };

  const selectSuggestion = useCallback(
    (s: MentionSuggestion) => {
      const token = buildMentionToken({ kind: s.kind, identifier: s.identifier, label: s.label });
      const mA = displayToMarkup(atDisplayIndexRef.current, tokens, "start");
      const mEnd = displayToMarkup(queryEndDisplayRef.current, tokens, "end");
      const insertText = token + " ";
      const newMarkup = value.slice(0, mA) + insertText + value.slice(mEnd);
      // New caret in display = start of mention + label length + trailing space.
      pendingCaretRef.current = atDisplayIndexRef.current + s.label.length + 1;
      onChange(newMarkup);
      closeDropdown();
    },
    [tokens, value, onChange, closeDropdown],
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const dropdownOpen = queryActive && suggestions.length > 0;
    if (dropdownOpen) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlight((h) => (h + 1) % suggestions.length);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlight((h) => (h - 1 + suggestions.length) % suggestions.length);
        return;
      }
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        selectSuggestion(suggestions[highlight]);
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        closeDropdown();
        return;
      }
    }

    if (e.key === "Enter" && !e.shiftKey && onSubmit && !dropdownOpen) {
      e.preventDefault();
      onSubmit();
    }
  };

  // Track caret moves (click / arrow) to re-detect or dismiss the query.
  const handleSelect = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    if (!queryActive) return;
    const caret = e.currentTarget.selectionStart ?? 0;
    detectQuery(display, caret);
  };

  // Close on outside click
  useEffect(() => {
    if (!queryActive) return;
    const onDocMouseDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        closeDropdown();
      }
    };
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, [queryActive, closeDropdown]);

  const showDropdown = queryActive && (loading || suggestions.length > 0 || query.trim().length > 0);

  // Recompute fixed position whenever the dropdown becomes visible
  useLayoutEffect(() => {
    if (showDropdown && containerRef.current) {
      const r = containerRef.current.getBoundingClientRect();
      setDropdownRect({ top: r.bottom + window.scrollY, left: r.left + window.scrollX, width: r.width });
    }
  }, [showDropdown]);

  const syncScroll = () => {
    if (backdropRef.current && textareaRef.current) {
      backdropRef.current.scrollTop = textareaRef.current.scrollTop;
      backdropRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  return (
    <div ref={containerRef} className={`relative ${wrapperClassName ?? ""}`}>
      {/* Highlight backdrop: mirrors the textarea text and draws mention chips behind it. */}
      <div
        ref={backdropRef}
        aria-hidden="true"
        className={`${className ?? ""} pointer-events-none absolute inset-0 overflow-hidden whitespace-pre-wrap [overflow-wrap:anywhere]`}
      >
        {renderHighlighted(display, tokens)}
      </div>
      <textarea
        ref={textareaRef}
        id={id}
        value={display}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onSelect={handleSelect}
        onScroll={syncScroll}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        autoFocus={autoFocus}
        className={`relative ${className ?? ""}`}
        style={{
          background: "transparent",
          color: "transparent",
          caretColor: "var(--color-text-primary)",
        }}
      />
      {name && <input type="hidden" name={name} value={value} />}

      {showDropdown && dropdownRect && typeof document !== "undefined" && createPortal(
        <div
          style={{
            position: "absolute",
            top: dropdownRect.top + 4,
            left: dropdownRect.left,
            width: dropdownRect.width,
            zIndex: 9999,
          }}
          className="max-h-72 overflow-y-auto rounded-xl border border-[var(--color-border-app)] bg-white shadow-lg shadow-black/5"
        >
          {loading && suggestions.length === 0 && (
            <div className="px-4 py-3 text-sm text-[var(--color-text-secondary)]">Searching&hellip;</div>
          )}
          {!loading && suggestions.length === 0 && query.trim().length > 0 && (
            <div className="px-4 py-3 text-sm text-[var(--color-text-secondary)]">
              No matches for &ldquo;{query.trim()}&rdquo;
            </div>
          )}
          <SuggestionList
            suggestions={suggestions}
            highlight={highlight}
            onHover={setHighlight}
            onSelect={selectSuggestion}
          />
        </div>,
        document.body
      )}
    </div>
  );
}

function SuggestionList({
  suggestions,
  highlight,
  onHover,
  onSelect,
}: {
  suggestions: MentionSuggestion[];
  highlight: number;
  onHover: (i: number) => void;
  onSelect: (s: MentionSuggestion) => void;
}) {
  let lastKind: MentionKind | null = null;
  return (
    <ul className="py-1">
      {suggestions.map((s, i) => {
        const showHeader = s.kind !== lastKind;
        lastKind = s.kind;
        return (
          <li key={`${s.kind}:${s.identifier}`}>
            {showHeader && (
              <div className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
                {KIND_LABEL[s.kind]}
              </div>
            )}
            <button
              type="button"
              // Use onMouseDown so selection fires before the textarea blurs.
              onMouseDown={(e) => {
                e.preventDefault();
                onSelect(s);
              }}
              onMouseEnter={() => onHover(i)}
              className={`flex w-full items-center gap-3 px-3 py-2 text-left transition-colors ${
                i === highlight ? "bg-[var(--color-surface-subtle)]" : "hover:bg-[var(--color-surface-subtle)]"
              }`}
            >
              <MentionIcon suggestion={s} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-[var(--color-text-primary)]">
                  {s.label}
                </span>
                {s.secondary && (
                  <span className="block truncate text-xs text-[var(--color-text-secondary)]">
                    {s.secondary}
                  </span>
                )}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function MentionIcon({ suggestion }: { suggestion: MentionSuggestion }) {
  if (suggestion.kind === "user") {
    return suggestion.avatarUrl ? (
      <Image
        src={suggestion.avatarUrl}
        alt={suggestion.label}
        width={28}
        height={28}
        className="h-7 w-7 flex-shrink-0 rounded-lg object-cover"
      />
    ) : (
      <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--color-brand-primary)] to-[var(--color-brand-accent)] text-xs font-semibold text-white">
        {(suggestion.label[0] ?? "?").toUpperCase()}
      </span>
    );
  }
  return (
    <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--color-surface-subtle)] text-[var(--color-brand-primary)]">
      {suggestion.kind === "peak" ? (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 20l5-10 4 5 3-6 4 11H4z" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      )}
    </span>
  );
}
