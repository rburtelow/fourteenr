"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

// Satellite (hybrid = imagery + labels) basemap with the recorded GPS track
// drawn on top. Used both as a non-interactive card thumbnail and as the
// interactive map inside the hike detail modal.

const KEY = process.env.NEXT_PUBLIC_MAPTILER_KEY;
const TRACK_COLOR = "#11D432"; // brand-highlight — high contrast on satellite
const START_COLOR = "#11D432";
const END_COLOR = "#E8A838"; // amber-glow — marks the finish

export function hasMapSupport(path: [number, number][]): boolean {
  return !!KEY && path.length >= 2;
}

function makeMarker(color: string): HTMLDivElement {
  const el = document.createElement("div");
  el.style.width = "14px";
  el.style.height = "14px";
  el.style.borderRadius = "9999px";
  el.style.background = color;
  el.style.border = "2px solid #ffffff";
  el.style.boxShadow = "0 1px 3px rgba(0,0,0,0.4)";
  return el;
}

interface HikeTrackMapProps {
  path: [number, number][];
  interactive?: boolean;
  className?: string;
  /** Delay creating the WebGL map until the element scrolls near the viewport. */
  lazy?: boolean;
}

export default function HikeTrackMap({ path, interactive = false, className = "", lazy = false }: HikeTrackMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [visible, setVisible] = useState(!lazy);

  // Lazily flip `visible` when the card nears the viewport.
  useEffect(() => {
    if (!lazy || visible || !containerRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [lazy, visible]);

  useEffect(() => {
    if (!visible || !containerRef.current || !KEY || path.length < 2) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: `https://api.maptiler.com/maps/hybrid/style.json?key=${KEY}`,
      interactive,
      attributionControl: false,
    });
    mapRef.current = map;
    map.on("error", (e) => console.error("[HikeTrackMap] MapLibre error:", e.error));

    if (interactive) {
      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    }
    map.addControl(new maplibregl.AttributionControl({ compact: true }));

    map.on("load", () => {
      const coordinates = path.map(([lng, lat]) => [lng, lat] as [number, number]);

      map.addSource("track", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: { type: "LineString", coordinates },
        },
      });
      map.addLayer({
        id: "track-casing",
        type: "line",
        source: "track",
        layout: { "line-join": "round", "line-cap": "round" },
        paint: { "line-color": "#ffffff", "line-width": interactive ? 7 : 5, "line-opacity": 0.85 },
      });
      map.addLayer({
        id: "track-line",
        type: "line",
        source: "track",
        layout: { "line-join": "round", "line-cap": "round" },
        paint: { "line-color": TRACK_COLOR, "line-width": interactive ? 4 : 3 },
      });

      new maplibregl.Marker({ element: makeMarker(START_COLOR) }).setLngLat(coordinates[0]).addTo(map);
      new maplibregl.Marker({ element: makeMarker(END_COLOR) })
        .setLngLat(coordinates[coordinates.length - 1])
        .addTo(map);

      const bounds = coordinates.reduce(
        (b, c) => b.extend(c),
        new maplibregl.LngLatBounds(coordinates[0], coordinates[0])
      );
      map.fitBounds(bounds, {
        padding: interactive ? 56 : 22,
        animate: false,
        maxZoom: 15,
      });

      setLoaded(true);
    });

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
      setLoaded(false);
    };
  }, [visible, path, interactive]);

  return (
    <div className={`hike-track-map relative ${className}`}>
      <div ref={containerRef} className="w-full h-full" />
      {!loaded && (
        <div className="absolute inset-0 bg-[var(--color-surface-subtle)] animate-pulse pointer-events-none" />
      )}
    </div>
  );
}
