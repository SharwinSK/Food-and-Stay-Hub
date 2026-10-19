/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { Building2, Store, Phone, MapPin, AlignLeft, Image as ImageIcon, ArrowRight, Loader2, CheckCircle, Navigation } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { createRestaurant } from "../lib/localDataService";
import { CUISINES } from "../types";
import { loadGoogleMapsScript } from "../lib/googleMaps";
import BackButton from "./BackButton";

interface RestaurantRegistrationFormProps {
  onSuccess: (newRestaurantId: string) => void;
  onCancel: () => void;
  onBackToHome?: () => void;
}

export default function RestaurantRegistrationForm({ onSuccess, onCancel, onBackToHome }: RestaurantRegistrationFormProps) {
  const { userProfile } = useAuth();
  
  const [name, setName] = useState("");
  const [type, setType] = useState<"Restaurant" | "Hotel">("Restaurant");
  const [cuisineType, setCuisineType] = useState("Malaysia");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [description, setDescription] = useState("");
  const [coverPhotoUrl, setCoverPhotoUrl] = useState("https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80");
  const [latitude, setLatitude] = useState<number | undefined>(undefined);
  const [longitude, setLongitude] = useState<number | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mapsLoaded, setMapsLoaded] = useState(false);

  const addressInputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);

  // Initialize Google Maps Places Autocomplete
  useEffect(() => {
    let isMounted = true;
    loadGoogleMapsScript().then((loaded) => {
      if (!isMounted || !loaded) return;
      setMapsLoaded(true);

      if (addressInputRef.current && (window as any).google?.maps?.places) {
        try {
          const autocomplete = new (window as any).google.maps.places.Autocomplete(
            addressInputRef.current,
            {
              fields: ["formatted_address", "geometry", "name", "address_components"],
              types: ["establishment", "geocode"]
            }
          );

          autocomplete.addListener("place_changed", () => {
            const place = autocomplete.getPlace();
            if (place.geometry && place.geometry.location) {
              const lat = place.geometry.location.lat();
              const lng = place.geometry.location.lng();
              setLatitude(lat);
              setLongitude(lng);

              if (place.formatted_address) {
                setAddress(place.formatted_address);
              }

              // Extract City/Locality from address components
              if (place.address_components) {
                let foundCity = "";
                for (const comp of place.address_components) {
                  if (
                    comp.types.includes("locality") ||
                    comp.types.includes("administrative_area_level_2") ||
                    comp.types.includes("sublocality_level_1")
                  ) {
                    foundCity = comp.long_name;
                    break;
                  }
                }
                if (foundCity) {
                  setCity(foundCity);
                }
              }
            }
          });

          autocompleteRef.current = autocomplete;
        } catch (err) {
          console.warn("Failed to attach Google Places Autocomplete:", err);
        }
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleUseCurrentLocation = () => {
    setError(null);
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setLatitude(lat);
        setLongitude(lng);
        if (!address) {
          setAddress(`Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
        }
      },
      (err) => {
        console.warn("Geolocation error:", err);
        setError("Could not retrieve current GPS position. Please enter your address manually.");
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !address.trim() || !city.trim()) {
      setError("Please fill in the business name, address, and city.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const ownerId = userProfile?.uid || userProfile?.id || "guest-owner";

      // If lat/lng was not captured by autocomplete, derive approximate default coordinates based on city or default to Nilai/KL
      let finalLat = latitude;
      let finalLng = longitude;

      if (finalLat === undefined || finalLng === undefined) {
        // Approximate city coordinates fallback
        const lowerCity = city.toLowerCase();
        if (lowerCity.includes("seremban")) {
          finalLat = 2.7258;
          finalLng = 101.9424;
        } else if (lowerCity.includes("nilai")) {
          finalLat = 2.8125;
          finalLng = 101.7978;
        } else if (lowerCity.includes("kuala lumpur") || lowerCity.includes("kl")) {
          finalLat = 3.1390;
          finalLng = 101.6869;
        } else if (lowerCity.includes("george town") || lowerCity.includes("penang")) {
          finalLat = 5.4141;
          finalLng = 100.3288;
        } else if (lowerCity.includes("johor")) {
          finalLat = 1.4927;
          finalLng = 103.7414;
        } else {
          finalLat = 2.8125;
          finalLng = 101.7978;
        }
      }

      const created = await createRestaurant({
        name,
        type,
        cuisineType,
        address,
        city,
        contactPhone,
        description,
        coverPhotoUrl,
        ownerId,
        latitude: finalLat,
        longitude: finalLng,
        createdAt: Date.now()
      });

      onSuccess(created.id);
    } catch (err: any) {
      console.error("Restaurant creation error:", err);
      setError("Failed to register property. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      
      {/* Top-Left Back Navigation */}
      <div className="flex items-center justify-start">
        <BackButton 
          onClick={onCancel || onBackToHome || (() => {})} 
          label={onCancel ? "Back to Properties" : "Back"} 
          id="register_back_btn" 
        />
      </div>

      {/* Header */}
      <div className="space-y-2 text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl font-black font-serif text-[#1A1A1A]">
          Register Your Restaurant or Hotel
        </h1>
        <p className="text-xs sm:text-sm text-stone-600">
          List your hospitality business, establish your brand, and publish signature dishes with customizable recipes for customers.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl">
          {error}
        </div>
      )}

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-9 border border-stone-200/90 shadow-xl space-y-6">
        
        {/* Business Type Select */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-stone-800 uppercase tracking-wider block">
            Business Type
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setType("Restaurant")}
              className={`p-4 rounded-2xl border flex items-center justify-center space-x-2.5 font-bold text-xs transition-all cursor-pointer ${
                type === "Restaurant"
                  ? "bg-amber-500 text-slate-950 border-amber-500 shadow-md shadow-amber-500/20"
                  : "bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100"
              }`}
            >
              <Store className="h-4 w-4" />
              <span>Restaurant & Eatery</span>
            </button>
            <button
              type="button"
              onClick={() => setType("Hotel")}
              className={`p-4 rounded-2xl border flex items-center justify-center space-x-2.5 font-bold text-xs transition-all cursor-pointer ${
                type === "Hotel"
                  ? "bg-amber-500 text-slate-950 border-amber-500 shadow-md shadow-amber-500/20"
                  : "bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100"
              }`}
            >
              <Building2 className="h-4 w-4" />
              <span>Hotel & Dining Suites</span>
            </button>
          </div>
        </div>

        {/* Business Name & Cuisine */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700 block">Business Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Warung Rasa Ibu"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all placeholder:text-stone-400"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700 block">Primary Cuisine / Style</label>
            <select
              value={cuisineType}
              onChange={(e) => setCuisineType(e.target.value)}
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all text-stone-800"
            >
              {CUISINES.map((c) => (
                <option key={c} value={c}>
                  {c} Cuisine
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Address & City */}
        <div className="space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-stone-700 block">
                  Address (Google Places Search) *
                </label>
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  className="text-[11px] font-bold text-amber-700 hover:text-amber-800 flex items-center space-x-1 cursor-pointer"
                >
                  <Navigation className="h-3 w-3" />
                  <span>Use GPS Location</span>
                </button>
              </div>
              <div className="relative">
                <MapPin className="h-4 w-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  ref={addressInputRef}
                  type="text"
                  required
                  placeholder="Type address or search venue..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all placeholder:text-stone-400"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700 block">City *</label>
              <input
                type="text"
                required
                placeholder="e.g. Nilai / KL"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all placeholder:text-stone-400"
              />
            </div>
          </div>

          {/* Coordinate status tag */}
          {latitude !== undefined && longitude !== undefined && (
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs">
              <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
              <span>Location pinned: <strong>{latitude.toFixed(4)}, {longitude.toFixed(4)}</strong></span>
            </div>
          )}
        </div>

        {/* Contact Phone & Photo URL */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700 block">Contact Phone / WhatsApp</label>
            <div className="relative">
              <Phone className="h-4 w-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                placeholder="+60 12-345 6789"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all placeholder:text-stone-400"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700 block">Cover Photo URL</label>
            <div className="relative">
              <ImageIcon className="h-4 w-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={coverPhotoUrl}
                onChange={(e) => setCoverPhotoUrl(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all placeholder:text-stone-400 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-stone-700 block">Short Description</label>
          <div className="relative">
            <AlignLeft className="h-4 w-4 text-stone-400 absolute left-3.5 top-3" />
            <textarea
              rows={3}
              placeholder="Tell guests about your specialty recipes, dining atmosphere, and culinary heritage..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all placeholder:text-stone-400"
            />
          </div>
        </div>

        {/* Photo Preview */}
        {coverPhotoUrl && (
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-stone-500 block">Cover Photo Preview</label>
            <div className="h-40 w-full rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 relative">
              <img src={coverPhotoUrl} alt="Cover Preview" className="w-full h-full object-cover" />
            </div>
          </div>
        )}

        {/* Submit Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-stone-100">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl border border-stone-200 text-stone-700 text-xs font-bold hover:bg-stone-100 transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition-all shadow-md shadow-amber-500/20 flex items-center space-x-2 cursor-pointer disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Registering...</span>
              </>
            ) : (
              <>
                <span>Complete Registration & Open Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>

      </form>

    </div>
  );
}
