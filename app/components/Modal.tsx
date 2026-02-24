"use client";

import { useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

export default function Modal({ isOpen, onClose, title, children, size = "md" }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";

      // Focus first focusable element
      requestAnimationFrame(() => {
        const focusable = dialogRef.current?.querySelector<HTMLElement>(
          'input, textarea, select, button, [tabindex]:not([tabindex="-1"])'
        );
        focusable?.focus();
      });
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
      previousFocusRef.current?.focus();
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Dialog */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative w-full ${sizeClasses[size]} bg-white rounded-t-2xl sm:rounded-2xl border border-[var(--color-border-app)] shadow-xl max-h-[90vh] overflow-y-auto animate-slide-up sm:animate-fade-up`}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-[var(--color-border-app)] px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <h2 className="text-lg font-bold text-[var(--color-text-primary)]">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-subtle)] transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>,
    document.body
  );
}
