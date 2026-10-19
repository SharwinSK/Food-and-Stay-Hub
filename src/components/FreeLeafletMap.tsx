/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from "react";
import { PlaceResult } from "../types";

interface FreeLeafletMapProps {
  places: PlaceResult[];
  center: { lat: number; lng: number };
  zoom: number;
  selectedPlaceId: string | null;
  onSelectPlace: (placeId: string | null) => void;
}

export default function FreeLeafletMap({
  places,
  center,
  zoom,
  selectedPlaceId,
  onSelectPlace
}: FreeLeafletMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<Record<string, any>>({});

  useEffect(() => {
    // 1. Ensure Leaflet CSS is loaded in head
    let cssLink = document.getElementById("leaflet-css") as HTMLLinkElement;
    if (!cssLink) {
      cssLink = document.createElement("link");
      cssLink.id = "leaflet-css";
      cssLink.rel = "stylesheet";
      cssLink.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(cssLink);
    }

    let active = true;

    const initMap = () => {
      if (!active) return;
      const L = (window as any).L;
      if (!L || !containerRef.current) return;

      // Clean up previous map if exists
      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch (e) {
          console.error("Error removing old Leaflet map", e);
        }
        mapRef.current = null;
      }

      // Initialize map with zoom disabled or custom configurations
      const map = L.map(containerRef.current, {
        zoomControl: false
      }).setView([center.lat, center.lng], zoom);

      mapRef.current = map;

      // Add zoom control at bottom right to avoid visual clutter
      L.control.zoom({ position: "bottomright" }).addTo(map);

      // Voyager elegant dark/light theme tiles that blend beautifully with the application styling
      L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(map);

      // Add marker layers
      const markers: Record<string, any> = {};
      
      places.forEach((place) => {
        const isSelected = place.id === selectedPlaceId;
        const color = place.type === "hotel" ? "#3b82f6" : "#f59e0b";
        
        // Custom SVG icon for pins matching the tailwind theme
        const svgIcon = `
          <svg width="28" height="38" viewBox="0 0 28 38" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 0C6.27 0 0 6.27 0 14C0 24.5 14 38 14 38C14 38 28 24.5 28 14C28 6.27 21.73 0 14 0Z" fill="${color}" stroke="#ffffff" stroke-width="2"/>
            <circle cx="14" cy="14" r="5" fill="#ffffff" />
          </svg>
        `;

        const icon = L.divIcon({
          html: svgIcon,
          iconSize: [28, 38],
          iconAnchor: [14, 38],
          popupAnchor: [0, -38],
          className: "custom-leaflet-pin"
        });

        const marker = L.marker([place.latitude, place.longitude], { icon })
          .addTo(map)
          .on("click", () => {
            onSelectPlace(place.id);
          });

        // Beautifully-styled HTML popup matching tailwind UI
        const popupContent = `
          <div style="font-family: sans-serif; color: #0f172a; padding: 4px; min-width: 180px;">
            <h4 style="margin: 0 0 4px 0; font-weight: 700; font-size: 13px; color: #020617; line-height: 1.3;">${place.name}</h4>
            <p style="margin: 0 0 6px 0; font-size: 11px; color: #475569; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.4;">${place.description}</p>
            <div style="display: flex; align-items: center; gap: 4px; font-weight: 700; font-size: 11px; color: #d97706;">
              <span>★ ${place.rating || "4.5"}</span>
              <span style="font-weight: 400; color: #94a3b8;">(${place.reviewsCount})</span>
            </div>
            <p style="margin: 4px 0 6px 0; font-size: 10px; color: #64748b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${place.address}</p>
            <div style="border-top: 1px solid #e2e8f0; padding-top: 6px; display: flex; justify-content: flex-end;">
              <a 
                href="${place.mapsUri || 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(place.name + ' ' + place.address)}" 
                target="_blank" 
                rel="noreferrer"
                style="font-size: 10px; font-weight: 700; color: #d97706; text-decoration: none; display: flex; align-items: center; gap: 2px;"
              >
                Open Google Maps &rarr;
              </a>
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);
        markers[place.id] = marker;

        if (isSelected) {
          setTimeout(() => {
            if (active) {
              marker.openPopup();
            }
          }, 100);
        }
      });

      markersRef.current = markers;
    };

    // 2. Load Leaflet script dynamically
    let jsScript = document.getElementById("leaflet-js") as HTMLScriptElement;
    if (!jsScript) {
      jsScript = document.createElement("script");
      jsScript.id = "leaflet-js";
      jsScript.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      jsScript.onload = initMap;
      document.body.appendChild(jsScript);
    } else if ((window as any).L) {
      initMap();
    } else {
      const handleLoad = () => {
        initMap();
      };
      jsScript.addEventListener("load", handleLoad);
      return () => {
        active = false;
        jsScript.removeEventListener("load", handleLoad);
        if (mapRef.current) {
          try {
            mapRef.current.remove();
          } catch (e) {
            console.error("Error removing old Leaflet map", e);
          }
          mapRef.current = null;
        }
      };
    }

    return () => {
      active = false;
      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch (e) {
          console.error("Error removing old Leaflet map", e);
        }
        mapRef.current = null;
      }
    };
  }, [places]);

  // Handle center / zoom and active marker popups dynamically
  useEffect(() => {
    const map = mapRef.current;
    if (map) {
      map.setView([center.lat, center.lng], zoom, { animate: true });
    }

    if (selectedPlaceId && markersRef.current[selectedPlaceId]) {
      markersRef.current[selectedPlaceId].openPopup();
    }
  }, [center, zoom, selectedPlaceId]);

  return (
    <div className="w-full h-full relative" style={{ background: "#0f172a" }}>
      <div ref={containerRef} className="w-full h-full" />
      
      {/* Interactive visual fallback ribbon */}
      <div className="absolute top-3 left-3 bg-slate-950/90 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-slate-800 text-[10px] text-amber-400 font-mono font-bold flex items-center space-x-1 shadow-lg z-[1000]">
        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        <span>FREE MAP RENDERING UNLOCKED</span>
      </div>
    </div>
  );
}
