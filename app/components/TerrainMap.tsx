"use client";

import { useRef, useEffect, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

interface TerrainMapProps {
  peak: {
    name: string;
    latitude: number;
    longitude: number;
    elevation: number;
  };
  trailheads: Array<{
    name: string;
    slug: string;
    latitude: number;
    longitude: number;
    elevation_ft: number | null;
    road_type: string | null;
  }>;
  className?: string;
}

export default function TerrainMap({
  peak,
  trailheads,
  className = "",
}: TerrainMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const key = process.env.NEXT_PUBLIC_MAPTILER_KEY;

  useEffect(() => {
    setMapLoaded(false);
    if (!mapContainerRef.current || !key) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: `https://api.maptiler.com/maps/outdoor-v2/style.json?key=${key}`,
      center: [peak.longitude, peak.latitude],
      zoom: 12,
      pitch: 60,
      bearing: -20,
      maxZoom: 15,
      maxPitch: 85,
    });

    mapRef.current = map;

    map.on("error", (e) => {
      console.error("[TerrainMap] MapLibre error:", e.error);
    });

    map.addControl(
      new maplibregl.NavigationControl({ visualizePitch: true }),
      "top-right"
    );

    map.on("load", () => {
      if (!mapRef.current) return;

      // Add 3D terrain after style is fully loaded
      if (!map.getSource("terrain")) {
        map.addSource("terrain", {
          type: "raster-dem",
          url: `https://api.maptiler.com/tiles/terrain-rgb-v2/tiles.json?key=${key}`,
          tileSize: 256,
        });
      }
      map.setTerrain({ source: "terrain", exaggeration: 1.3 });

      // Peak summit marker
      const peakEl = document.createElement("div");
      peakEl.className = "peak-marker";
      peakEl.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#064E3B" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 21l4-10 4 10"/><path d="M2 21h20"/><path d="M12 3l3 7H9l3-7z"/></svg>`;

      new maplibregl.Marker({ element: peakEl })
        .setLngLat([peak.longitude, peak.latitude])
        .setPopup(
          new maplibregl.Popup({ offset: 20, className: "fourteenr-popup" }).setHTML(
            `<div class="popup-content">
              <strong>${peak.name}</strong>
              <span>${peak.elevation.toLocaleString()} ft</span>
            </div>`
          )
        )
        .addTo(map);

      // Trailhead markers
      trailheads.forEach((th) => {
        const el = document.createElement("div");
        el.className = "trailhead-marker";
        el.textContent = "TH";

        new maplibregl.Marker({ element: el })
          .setLngLat([th.longitude, th.latitude])
          .setPopup(
            new maplibregl.Popup({ offset: 16, className: "fourteenr-popup" }).setHTML(
              `<div class="popup-content">
                <strong>${th.name}</strong>
                ${th.elevation_ft ? `<span>${th.elevation_ft.toLocaleString()} ft</span>` : ""}
                ${th.road_type ? `<span class="road-type">${th.road_type.replace(/_/g, " ")}</span>` : ""}
              </div>`
            )
          )
          .addTo(map);
      });

      // Fit bounds to include all points — fit flat first so centering is accurate,
      // then apply pitch/bearing separately to avoid perspective-shift off-center.
      if (trailheads.length > 0) {
        const bounds = new maplibregl.LngLatBounds();
        bounds.extend([peak.longitude, peak.latitude]);
        trailheads.forEach((th) => bounds.extend([th.longitude, th.latitude]));
        map.fitBounds(bounds, {
          padding: 80,
          pitch: 0,
          bearing: 0,
          maxZoom: 13,
          animate: false,
        });
        map.easeTo({ pitch: 60, bearing: -20, duration: 800 });
      }

      setMapLoaded(true);
    });

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [key, peak.latitude, peak.longitude, peak.elevation, peak.name, trailheads]);

  if (!key) {
    return (
      <div className={`relative ${className} bg-gradient-to-br from-[var(--color-brand-primary)] to-[var(--color-brand-accent)] flex items-center justify-center`}>
        <p className="text-white/70 text-sm">Map unavailable</p>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Map container */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Loading placeholder — fades out when map loads */}
      <div
        className={`absolute inset-0 transition-opacity duration-500 pointer-events-none ${
          mapLoaded ? "opacity-0" : "opacity-100"
        } bg-gradient-to-br from-[var(--color-brand-primary)] to-[var(--color-brand-accent)]`}
      >
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
    </div>
  );
}
