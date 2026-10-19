/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import { 
  MapPin, 
  Navigation, 
  Search, 
  CheckCircle2, 
  ArrowRight, 
  Loader2, 
  AlertCircle
} from "lucide-react";
import BackButton from "./BackButton";
import { 
  loadGoogleMapsScript, 
  reverseGeocodeCoords, 
  searchAddressSuggestions 
} from "../lib/googleMaps";

export interface ConfirmedDeliveryLocation {
  latitude: number;
  longitude: number;
  formattedAddress: string;
}

interface DeliveryLocationPickerProps {
  initialLocation?: ConfirmedDeliveryLocation | null;
  onConfirmLocation: (location: ConfirmedDeliveryLocation) => void;
  onBackToCart: () => void;
}

export default function DeliveryLocationPicker({
  initialLocation,
  onConfirmLocation,
  onBackToCart
}: DeliveryLocationPickerProps) {
  // Primary state for delivery location
  const [selectedLat, setSelectedLat] = useState<number | null>(
    initialLocation?.latitude !== undefined ? initialLocation.latitude : 2.8125
  );
  const [selectedLng, setSelectedLng] = useState<number | null>(
    initialLocation?.longitude !== undefined ? initialLocation.longitude : 101.7978
  );
  const [addressText, setAddressText] = useState<string>(
    initialLocation?.formattedAddress || "Nilai Town Center, Negeri Sembilan"
  );

  const [geocoding, setGeocoding] = useState(false);
  const [locatingUser, setLocatingUser] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<Array<{ label: string; lat: number; lng: number }>>([]);
  const [isSearchingSuggestions, setIsSearchingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Synchronized ref so event callbacks and click handlers always have current state
  const locationRef = useRef<{ latitude: number; longitude: number; formattedAddress: string }>({
    latitude: initialLocation?.latitude !== undefined ? initialLocation.latitude : 2.8125,
    longitude: initialLocation?.longitude !== undefined ? initialLocation.longitude : 101.7978,
    formattedAddress: initialLocation?.formattedAddress || "Nilai Town Center, Negeri Sembilan"
  });

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const googleMapRef = useRef<any>(null);
  const googleMarkerRef = useRef<any>(null);
  const leafletMapRef = useRef<any>(null);
  const leafletMarkerRef = useRef<any>(null);

  // Master update function to ensure state, refs, maps, and logs are 100% unified
  const updateDeliveryLocation = useCallback((
    lat: number,
    lng: number,
    address: string,
    source: "autocomplete" | "geolocation" | "pin_drag" | "map_click" | "preset" | "suggestion" | "init",
    zoomLevel?: number
  ) => {
    // 1. Update refs immediately
    locationRef.current = {
      latitude: lat,
      longitude: lng,
      formattedAddress: address
    };

    // 2. Update React states
    setSelectedLat(lat);
    setSelectedLng(lng);
    setAddressText(address);

    // 3. Move Google Map and Marker if active
    if (googleMapRef.current && googleMarkerRef.current) {
      const latLng = new (window as any).google.maps.LatLng(lat, lng);
      googleMarkerRef.current.setPosition(latLng);
      if (source !== "pin_drag") {
        googleMapRef.current.setCenter(latLng);
        if (zoomLevel) googleMapRef.current.setZoom(zoomLevel);
      }
    }

    // 4. Move Leaflet Map and Marker if active
    if (leafletMapRef.current && leafletMarkerRef.current) {
      leafletMarkerRef.current.setLatLng([lat, lng]);
      if (source !== "pin_drag") {
        leafletMapRef.current.setView([lat, lng], zoomLevel || 15);
      }
    }

    // 5. Explicit Debug Console Log (as required by Prompt 7, Item 6)
    console.log(`[DeliveryLocationPicker] Location updated via [${source}]:`, {
      latitude: lat,
      longitude: lng,
      formattedAddress: address
    });
  }, []);

  // Synchronize when initialLocation is passed or restored from previous confirmation
  useEffect(() => {
    if (initialLocation && initialLocation.latitude !== undefined && initialLocation.longitude !== undefined) {
      updateDeliveryLocation(
        initialLocation.latitude,
        initialLocation.longitude,
        initialLocation.formattedAddress,
        "preset"
      );
    }
  }, [initialLocation, updateDeliveryLocation]);

  // Initialize Map (Google Maps first with Leaflet/OSM fallback)
  useEffect(() => {
    let isMounted = true;
    const initialLat = locationRef.current.latitude;
    const initialLng = locationRef.current.longitude;

    const initLeaflet = () => {
      if (!isMounted || !mapContainerRef.current) return;
      const L = (window as any).L;
      if (!L) return;

      if (leafletMapRef.current) {
        try {
          leafletMapRef.current.remove();
        } catch (e) {
          // ignore
        }
        leafletMapRef.current = null;
      }

      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        attributionControl: false
      }).setView([locationRef.current.latitude, locationRef.current.longitude], 14);

      leafletMapRef.current = map;

      L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
        maxZoom: 19
      }).addTo(map);

      const svgIcon = `
        <svg width="32" height="42" viewBox="0 0 32 42" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 0C7.16 0 0 7.16 0 16C0 28 16 42 16 42C16 42 32 28 32 16C32 7.16 24.84 0 16 0Z" fill="#ef4444" stroke="#ffffff" stroke-width="2"/>
          <circle cx="16" cy="16" r="6" fill="#ffffff" />
        </svg>
      `;
      const pinIcon = L.divIcon({
        html: svgIcon,
        iconSize: [32, 42],
        iconAnchor: [16, 42],
        className: "custom-delivery-pin"
      });

      const marker = L.marker([locationRef.current.latitude, locationRef.current.longitude], {
        icon: pinIcon,
        draggable: true
      }).addTo(map);
      leafletMarkerRef.current = marker;

      // Leaflet dragend
      marker.on("dragend", async () => {
        const pos = marker.getLatLng();
        if (pos) {
          setGeocoding(true);
          const addr = await reverseGeocodeCoords(pos.lat, pos.lng);
          const finalAddr = addr || `${pos.lat.toFixed(5)}, ${pos.lng.toFixed(5)}`;
          updateDeliveryLocation(pos.lat, pos.lng, finalAddr, "pin_drag");
          setGeocoding(false);
        }
      });

      // Leaflet map click
      map.on("click", async (e: any) => {
        if (e.latlng) {
          marker.setLatLng(e.latlng);
          setGeocoding(true);
          const addr = await reverseGeocodeCoords(e.latlng.lat, e.latlng.lng);
          const finalAddr = addr || `${e.latlng.lat.toFixed(5)}, ${e.latlng.lng.toFixed(5)}`;
          updateDeliveryLocation(e.latlng.lat, e.latlng.lng, finalAddr, "map_click");
          setGeocoding(false);
        }
      });
    };

    const loadLeafletAssets = () => {
      let cssLink = document.getElementById("leaflet-css") as HTMLLinkElement;
      if (!cssLink) {
        cssLink = document.createElement("link");
        cssLink.id = "leaflet-css";
        cssLink.rel = "stylesheet";
        cssLink.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(cssLink);
      }

      if ((window as any).L) {
        initLeaflet();
      } else {
        let jsScript = document.getElementById("leaflet-js") as HTMLScriptElement;
        if (!jsScript) {
          jsScript = document.createElement("script");
          jsScript.id = "leaflet-js";
          jsScript.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
          jsScript.onload = initLeaflet;
          document.body.appendChild(jsScript);
        } else {
          jsScript.addEventListener("load", initLeaflet);
        }
      }
    };

    loadGoogleMapsScript().then((loaded) => {
      if (!isMounted) return;

      if (loaded && (window as any).google?.maps && mapContainerRef.current) {
        try {
          const map = new (window as any).google.maps.Map(mapContainerRef.current, {
            center: { lat: initialLat, lng: initialLng },
            zoom: 14,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            zoomControl: true,
            gestureHandling: "greedy"
          });
          googleMapRef.current = map;

          const marker = new (window as any).google.maps.Marker({
            position: { lat: initialLat, lng: initialLng },
            map: map,
            draggable: true,
            animation: (window as any).google.maps.Animation.DROP,
            title: "Drag to set delivery doorstep location"
          });
          googleMarkerRef.current = marker;

          // Google Maps dragend listener
          marker.addListener("dragend", async () => {
            const pos = marker.getPosition();
            if (pos) {
              const lat = pos.lat();
              const lng = pos.lng();
              setGeocoding(true);
              const addr = await reverseGeocodeCoords(lat, lng);
              const finalAddr = addr || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
              updateDeliveryLocation(lat, lng, finalAddr, "pin_drag");
              setGeocoding(false);
            }
          });

          // Google Maps map click listener
          map.addListener("click", async (e: any) => {
            if (e.latLng) {
              const lat = e.latLng.lat();
              const lng = e.latLng.lng();
              marker.setPosition(e.latLng);
              setGeocoding(true);
              const addr = await reverseGeocodeCoords(lat, lng);
              const finalAddr = addr || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
              updateDeliveryLocation(lat, lng, finalAddr, "map_click");
              setGeocoding(false);
            }
          });

          // Setup Places Autocomplete on the input
          if (searchInputRef.current && (window as any).google.maps.places) {
            const autocomplete = new (window as any).google.maps.places.Autocomplete(
              searchInputRef.current,
              { fields: ["formatted_address", "geometry", "name"] }
            );

            autocomplete.addListener("place_changed", () => {
              const place = autocomplete.getPlace();
              if (place.geometry && place.geometry.location) {
                const lat = place.geometry.location.lat();
                const lng = place.geometry.location.lng();
                const formatted = place.formatted_address || place.name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
                setShowSuggestions(false);
                updateDeliveryLocation(lat, lng, formatted, "autocomplete", 16);
              }
            });
          }
        } catch (err) {
          console.warn("Failed to initialize Google Maps in location picker, switching to Leaflet:", err);
          loadLeafletAssets();
        }
      } else {
        loadLeafletAssets();
      }
    });

    return () => {
      isMounted = false;
      if (leafletMapRef.current) {
        try {
          leafletMapRef.current.remove();
        } catch (e) {
          // ignore
        }
        leafletMapRef.current = null;
      }
    };
  }, [updateDeliveryLocation]);

  // Handle typing in the search box
  const handleInputChange = (text: string) => {
    setAddressText(text);
    locationRef.current.formattedAddress = text;

    if (text.trim().length >= 3) {
      setIsSearchingSuggestions(true);
      searchAddressSuggestions(text).then((results) => {
        setSuggestions(results);
        setIsSearchingSuggestions(false);
        setShowSuggestions(results.length > 0);
      });
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Handle suggestion selection from fallback list
  const handleSelectSuggestion = (sug: { label: string; lat: number; lng: number }) => {
    setShowSuggestions(false);
    updateDeliveryLocation(sug.lat, sug.lng, sug.label, "suggestion", 16);
  };

  // Handle "Use My Current Location" (Browser Geolocation)
  const handleUseCurrentLocation = () => {
    setLocationError(null);
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser. Please search or pick a location on the map.");
      return;
    }

    setLocatingUser(true);
    setShowSuggestions(false);
    setAddressText("Detecting your exact GPS coordinates...");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        setGeocoding(true);
        const addr = await reverseGeocodeCoords(lat, lng);
        const finalAddress = addr || `My Current Location (${lat.toFixed(5)}, ${lng.toFixed(5)})`;
        
        updateDeliveryLocation(lat, lng, finalAddress, "geolocation", 16);
        setGeocoding(false);
        setLocatingUser(false);
      },
      (err) => {
        console.warn("Geolocation error:", err);
        setLocationError("Unable to detect current GPS location. Please search your address or tap on the map.");
        setAddressText(locationRef.current.formattedAddress || "Nilai Town Center, Negeri Sembilan");
        setLocatingUser(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Quick preset chips
  const handlePresetSelect = (name: string, lat: number, lng: number) => {
    setShowSuggestions(false);
    updateDeliveryLocation(lat, lng, name, "preset", 15);
  };

  // Check if valid location is ready
  const isLocationConfirmed = selectedLat !== null && selectedLng !== null && addressText.trim().length > 0;

  // Handle Confirm Location button click
  const handleConfirm = () => {
    // Read directly from locationRef to guarantee the most recent user action is captured
    const lat = locationRef.current.latitude ?? selectedLat;
    const lng = locationRef.current.longitude ?? selectedLng;
    const formattedAddress = (locationRef.current.formattedAddress || addressText || "").trim();

    if (lat === null || lng === null || !formattedAddress) {
      console.warn("[DeliveryLocationPicker] Incomplete location details on confirm:", { lat, lng, formattedAddress });
      return;
    }

    const payload: ConfirmedDeliveryLocation = {
      latitude: lat,
      longitude: lng,
      formattedAddress
    };

    // Explicit verification console log for debug & audit (Prompt 7 Item 6)
    console.log("[DeliveryLocationPicker] CONFIRMED FINAL DELIVERY LOCATION:", payload);

    onConfirmLocation(payload);
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Title & Instructions */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">
            Delivery Step 1 of 2
          </span>
          <h3 className="text-base font-bold font-serif text-stone-900">
            Set Your Delivery Location
          </h3>
        </div>
        <BackButton
          onClick={onBackToCart}
          label="Back to Cart"
          id="location_back_to_cart_btn"
        />
      </div>

      {/* Autocomplete Search Bar */}
      <div className="space-y-2 relative">
        <div className="relative">
          <Search className="h-4 w-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search street, landmark, or area..."
            value={addressText}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={() => {
              if (suggestions.length > 0) setShowSuggestions(true);
            }}
            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500"
          />
          {isSearchingSuggestions && (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-600 absolute right-3.5 top-1/2 -translate-y-1/2" />
          )}
        </div>

        {/* Live Search Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white rounded-xl shadow-xl border border-stone-200 overflow-hidden max-h-48 overflow-y-auto">
            {suggestions.map((sug, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectSuggestion(sug)}
                className="w-full px-3.5 py-2 text-left text-xs text-stone-700 hover:bg-amber-50 hover:text-amber-900 border-b border-stone-100 last:border-0 flex items-start space-x-2 cursor-pointer transition-colors"
              >
                <MapPin className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
                <span className="line-clamp-1">{sug.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* GPS Button and Preset chips */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={locatingUser}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
          >
            {locatingUser ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-700" />
            ) : (
              <Navigation className="h-3.5 w-3.5 text-amber-700" />
            )}
            <span>Use My Current Location</span>
          </button>

          {/* Quick preset chips */}
          <div className="flex items-center space-x-1.5 text-[11px] text-stone-500">
            <span>Presets:</span>
            <button
              type="button"
              onClick={() => handlePresetSelect("Nilai Town Center, Negeri Sembilan", 2.8125, 101.7978)}
              className="px-2 py-0.5 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium cursor-pointer"
            >
              Nilai
            </button>
            <button
              type="button"
              onClick={() => handlePresetSelect("Seremban Gateway, Negeri Sembilan", 2.7258, 101.9424)}
              className="px-2 py-0.5 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium cursor-pointer"
            >
              Seremban
            </button>
            <button
              type="button"
              onClick={() => handlePresetSelect("KLCC, Kuala Lumpur", 3.1579, 101.7116)}
              className="px-2 py-0.5 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium cursor-pointer"
            >
              KLCC
            </button>
          </div>
        </div>
      </div>

      {/* Geolocation Warning Banner */}
      {locationError && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-2 text-rose-800 text-xs animate-fadeIn">
          <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold">{locationError}</span>
          </div>
          <button
            type="button"
            onClick={() => setLocationError(null)}
            className="text-stone-400 hover:text-stone-700 font-bold ml-1"
          >
            ×
          </button>
        </div>
      )}

      {/* Interactive Map Display */}
      <div className="relative rounded-2xl overflow-hidden border border-stone-300 shadow-inner bg-stone-100 h-64 sm:h-72 w-full">
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Floating Instruction overlay */}
        <div className="absolute top-2 left-2 right-2 pointer-events-none z-10">
          <div className="bg-stone-900/85 backdrop-blur-xs text-white text-[11px] px-3 py-1.5 rounded-lg shadow-sm flex items-center justify-between">
            <span className="flex items-center space-x-1.5">
              <MapPin className="h-3.5 w-3.5 text-amber-400" />
              <span>Drag the red pin or tap the map to position your doorstep</span>
            </span>
            {geocoding && <Loader2 className="h-3 w-3 animate-spin text-amber-300" />}
          </div>
        </div>
      </div>

      {/* Confirmed Pin Summary Banner */}
      {selectedLat !== null && selectedLng !== null ? (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start space-x-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <span className="font-bold text-emerald-950 block">Destination Selected:</span>
            <p className="text-emerald-900 font-medium truncate mt-0.5">
              {addressText || `${selectedLat.toFixed(5)}, ${selectedLng.toFixed(5)}`}
            </p>
            <span className="text-[10px] text-emerald-700 font-mono">
              Coordinates: {selectedLat.toFixed(5)}, {selectedLng.toFixed(5)}
            </span>
          </div>
        </div>
      ) : (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center space-x-2 text-xs text-amber-900">
          <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
          <span>Please search your address or tap the map to place your delivery pin.</span>
        </div>
      )}

      {/* Action Button: Proceed to Delivery Service selection */}
      <button
        type="button"
        onClick={handleConfirm}
        disabled={!isLocationConfirmed}
        className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span>Confirm Location & Select Delivery Service</span>
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}
