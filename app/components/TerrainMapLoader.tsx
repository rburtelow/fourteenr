"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import type TerrainMapType from "./TerrainMap";

const TerrainMap = dynamic(() => import("./TerrainMap"), {
  ssr: false,
  loading: () => (
    <div className="relative h-full bg-gradient-to-br from-[var(--color-brand-primary)] to-[var(--color-brand-accent)]">
      <div className="absolute inset-0 topo-pattern opacity-20" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <svg
            className="w-10 h-10 text-white/80 mx-auto mb-2"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <p className="text-white/70 text-sm font-medium">Loading Map...</p>
        </div>
      </div>
    </div>
  ),
});

export default function TerrainMapLoader(
  props: ComponentProps<typeof TerrainMapType>
) {
  return <TerrainMap {...props} />;
}
