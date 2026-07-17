import { type ReactNode } from "react";

const variants = {
  green: "bg-emerald-100 text-emerald-800",
  red: "bg-red-100 text-red-800",
  yellow: "bg-amber-100 text-amber-800",
  blue: "bg-blue-100 text-blue-800",
  gray: "bg-gray-100 text-gray-600",
  purple: "bg-purple-100 text-purple-800",
} as const;

type PillVariant = keyof typeof variants;

interface PillProps {
  children: ReactNode;
  variant?: PillVariant;
  className?: string;
}

export default function Pill({ children, variant = "gray", className = "" }: PillProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
