/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Source: Google Maps Platform Code Assist
// Mandatory usage attribution ID for Google Maps Platform tracking
export const GMP_ATTRIBUTION_ID = "gmp_mcp_codeassist_v1_aistudio";

let cachedApiKey: string | null = null;
let scriptLoadingPromise: Promise<boolean> | null = null;

/**
 * Retrieves the Google Maps API Key from environment or backend config
 */
export async function getGoogleMapsApiKey(): Promise<string> {
  if (cachedApiKey) return cachedApiKey;

  // Check client env vars first
  const envKey = 
    (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY ||
    (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
    (typeof process !== "undefined" ? (process.env?.GOOGLE_MAPS_API_KEY || process.env?.GOOGLE_MAPS_PLATFORM_KEY) : "");

  if (envKey && envKey.trim().length > 0 && !envKey.includes("MY_GOOGLE_MAPS")) {
    cachedApiKey = envKey.trim();
    return cachedApiKey;
  }

  // Fetch from server endpoint
  try {
    const res = await fetch("/api/config/maps");
    if (res.ok) {
      const data = await res.json();
      if (data.apiKey && data.apiKey.trim().length > 0 && !data.apiKey.includes("MY_GOOGLE_MAPS")) {
        cachedApiKey = data.apiKey.trim();
        return cachedApiKey;
      }
    }
  } catch (err) {
    console.warn("Could not fetch maps config from server:", err);
  }

  return "";
}

/**
 * Loads the Google Maps JavaScript SDK dynamically
 */
export async function loadGoogleMapsScript(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if ((window as any).google?.maps) return true;
  if (scriptLoadingPromise) return scriptLoadingPromise;

  scriptLoadingPromise = new Promise(async (resolve) => {
    try {
      const apiKey = await getGoogleMapsApiKey();
      const existingScript = document.getElementById("google-maps-sdk-script");
      if (existingScript) {
        if ((window as any).google?.maps) {
          resolve(true);
          return;
        }
        existingScript.addEventListener("load", () => resolve(true));
        existingScript.addEventListener("error", () => resolve(false));
        return;
      }

      const script = document.createElement("script");
      script.id = "google-maps-sdk-script";
      const keyParam = apiKey ? `&key=${encodeURIComponent(apiKey)}` : "";
      script.src = `https://maps.googleapis.com/maps/api/js?libraries=places,routes,marker,geometry&v=weekly${keyParam}`;
      script.async = true;
      script.defer = true;

      script.onload = () => {
        resolve(true);
      };

      script.onerror = () => {
        console.warn("Google Maps JavaScript API script failed to load. Will fallback to interactive Leaflet/Haversine mode.");
        resolve(false);
      };

      document.head.appendChild(script);
    } catch (err) {
      console.warn("Failed to initialize Google Maps script:", err);
      resolve(false);
    }
  });

  return scriptLoadingPromise;
}

/**
 * Calculates Haversine straight-line distance in kilometers
 */
export function calculateHaversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const dist = R * c;
  return Math.max(0.5, Math.round(dist * 10) / 10);
}

/**
 * Calculates distance between customer and restaurant (using backend Routes / Distance Matrix API if available, else Haversine fallback)
 */
export async function calculateDeliveryDistance(
  customerLat: number,
  customerLng: number,
  restaurantLat: number,
  restaurantLng: number
): Promise<{ distanceKm: number; method: string }> {
  try {
    const res = await fetch("/api/delivery/distance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        originLat: customerLat,
        originLng: customerLng,
        destLat: restaurantLat,
        destLng: restaurantLng
      })
    });

    if (res.ok) {
      const data = await res.json();
      if (typeof data.distanceKm === "number") {
        return {
          distanceKm: data.distanceKm,
          method: data.method || "api"
        };
      }
    }
  } catch (err) {
    console.warn("Server delivery distance endpoint failed, falling back to Haversine straight-line:", err);
  }

  const straightLine = calculateHaversineKm(customerLat, customerLng, restaurantLat, restaurantLng);
  return {
    distanceKm: straightLine,
    method: "straight_line"
  };
}

/**
 * Reverse geocoding helper via Google Maps Geocoder if available, with OSM fallback
 */
export async function reverseGeocodeCoords(
  lat: number,
  lng: number
): Promise<string> {
  if ((window as any).google?.maps?.Geocoder) {
    try {
      const geocoder = new (window as any).google.maps.Geocoder();
      const addr = await new Promise<string | null>((resolve) => {
        geocoder.geocode({ location: { lat, lng } }, (results: any[], status: string) => {
          if (status === "OK" && results && results[0]) {
            resolve(results[0].formatted_address);
          } else {
            resolve(null);
          }
        });
      });
      if (addr) return addr;
    } catch (e) {
      // ignore
    }
  }

  // Fallback to OpenStreetMap Nominatim
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      { headers: { "Accept-Language": "en" } }
    );
    if (res.ok) {
      const data = await res.json();
      if (data && data.display_name) {
        return data.display_name;
      }
    }
  } catch (err) {
    // ignore
  }

  return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
}

/**
 * Address suggestion search fallback using OpenStreetMap / Photon
 */
export async function searchAddressSuggestions(query: string): Promise<Array<{ label: string; lat: number; lng: number }>> {
  if (!query || query.trim().length < 2) return [];
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`,
      { headers: { "Accept-Language": "en" } }
    );
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        return data.map((item: any) => ({
          label: item.display_name,
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon)
        }));
      }
    }
  } catch (err) {
    // ignore
  }
  return [];
}
