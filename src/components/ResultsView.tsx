/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Star, Phone, Clock, MapPin, ExternalLink, RefreshCw, Sparkles, Filter, LogOut, Map as MapIcon, List as ListIcon } from "lucide-react";
import { PlaceResult } from "../types";
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow, useAdvancedMarkerRef } from "@vis.gl/react-google-maps";
import FreeLeafletMap from "./FreeLeafletMap";
import BackButton from "./BackButton";

interface ResultsViewProps {
  cuisine: string;
  preference: "hotels" | "restaurants";
  location: {
    type: "manual" | "gps";
    country?: string;
    state?: string;
    city?: string;
    area?: string;
    coords?: { latitude: number; longitude: number };
  };
  places: PlaceResult[];
  loading: boolean;
  isMock: boolean;
  isSmartFallback?: boolean;
  searchError?: string | null;
  onBack: () => void;
  onRefresh: () => void;
  onLogout?: () => void;
}

const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  // Negeri Sembilan
  "nilai": { lat: 2.8125, lng: 101.7978 },
  "seremban": { lat: 2.7258, lng: 101.9424 },
  "port_dickson": { lat: 2.5229, lng: 101.7951 },
  // Selangor
  "petaling_jaya": { lat: 3.1073, lng: 101.6067 },
  "shah_alam": { lat: 3.0738, lng: 101.5183 },
  "subang_jaya": { lat: 3.0487, lng: 101.5851 },
  "klang": { lat: 3.0449, lng: 101.4456 },
  // Kuala Lumpur
  "kl_city": { lat: 3.1390, lng: 101.6869 },
  // Penang
  "george_town": { lat: 5.4141, lng: 100.3288 },
  "bayan_lepas": { lat: 5.2951, lng: 100.2598 },
  "butterworth": { lat: 5.3942, lng: 100.3664 },
  // Johor
  "johor_bahru": { lat: 1.4927, lng: 103.7414 },
  "batu_pahat": { lat: 1.8550, lng: 102.9300 },
  "muar": { lat: 2.0442, lng: 102.5689 },
  // Kedah
  "alor_setar": { lat: 6.1210, lng: 100.3601 },
  "sungai_petani": { lat: 5.6439, lng: 100.4912 },
  "langkawi": { lat: 6.3500, lng: 99.8000 },
  // Kelantan
  "kota_bharu": { lat: 6.1254, lng: 102.2386 },
  "tanah_merah": { lat: 5.8115, lng: 102.1466 },
  // Melaka
  "melaka_city": { lat: 2.1896, lng: 102.2501 },
  "alor_gajah": { lat: 2.3833, lng: 102.2083 },
  // Pahang
  "kuantan": { lat: 3.8077, lng: 103.3260 },
  "temerloh": { lat: 3.4478, lng: 102.4173 },
  // Perak
  "ipoh": { lat: 4.5975, lng: 101.0901 },
  "taiping": { lat: 4.8500, lng: 100.7333 },
  "teluk_intan": { lat: 4.0259, lng: 101.0213 },
  // Perlis
  "kangar": { lat: 6.4414, lng: 100.1986 },
  "padang_besar": { lat: 6.6617, lng: 100.3228 },
  // Terengganu
  "kuala_terengganu": { lat: 5.3302, lng: 103.1408 },
  "kemaman": { lat: 4.2167, lng: 103.4167 },
  // Sabah
  "kota_kinabalu": { lat: 5.9804, lng: 116.0735 },
  "sandakan": { lat: 5.8402, lng: 118.1170 },
  "tawau": { lat: 4.2448, lng: 117.8912 },
  // Sarawak
  "kuching": { lat: 1.5533, lng: 110.3592 },
  "miri": { lat: 4.3995, lng: 113.9914 },
  "sibu": { lat: 2.2873, lng: 111.8305 },
  // Putrajaya
  "putrajaya_city": { lat: 2.9264, lng: 101.6964 },
  // Labuan
  "victoria": { lat: 5.2767, lng: 115.2417 },
  // China
  "guangzhou": { lat: 23.1291, lng: 113.2644 },
  "shenzhen": { lat: 22.5431, lng: 114.0579 },
  "beijing_city": { lat: 39.9042, lng: 116.4074 },
  // India
  "mumbai": { lat: 19.0760, lng: 72.8777 },
  "pune": { lat: 18.5204, lng: 73.8567 },
  "delhi_city": { lat: 28.6139, lng: 77.2090 },
  // Japan
  "tokyo_city": { lat: 35.6762, lng: 139.6503 },
  "osaka_city": { lat: 34.6937, lng: 135.5022 }
};

const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  "";
const hasValidKey = Boolean(API_KEY) && API_KEY !== "YOUR_API_KEY" && API_KEY !== "";

// Helper marker component to enable individual anchors for InfoWindows
function PlaceMarker({ place, isSelected, onClick, onClose }: {
  key?: string;
  place: PlaceResult;
  isSelected: boolean;
  onClick: () => void;
  onClose: () => void;
}) {
  const [markerRef, marker] = useAdvancedMarkerRef();

  return (
    <>
      <AdvancedMarker 
        ref={markerRef} 
        position={{ lat: place.latitude, lng: place.longitude }} 
        onClick={onClick}
        title={place.name}
      >
        <Pin 
          background={place.type === "hotel" ? "#3b82f6" : "#f59e0b"} 
          borderColor="#ffffff"
          glyphColor="#ffffff" 
        />
      </AdvancedMarker>
      {isSelected && (
        <InfoWindow anchor={marker} onCloseClick={onClose}>
          <div className="p-2 max-w-[200px] text-slate-900 space-y-1.5 text-xs">
            <h4 className="font-bold text-slate-950 leading-tight">{place.name}</h4>
            <p className="text-[11px] text-slate-600 line-clamp-2">{place.description}</p>
            <div className="flex items-center space-x-1 text-amber-600 font-bold">
              <span>★ {place.rating || "4.5"}</span>
              <span className="text-slate-400 font-normal">({place.reviewsCount})</span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium truncate">{place.address}</p>
            <div className="pt-1.5 border-t border-slate-200 flex justify-end">
              <a 
                href={place.mapsUri || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name + " " + place.address)}`} 
                target="_blank" 
                rel="noreferrer"
                className="text-[10px] font-bold text-amber-600 hover:text-amber-750 flex items-center space-x-1 transition-colors"
              >
                <span>View on Google Maps &rarr;</span>
              </a>
            </div>
          </div>
        </InfoWindow>
      )}
    </>
  );
}

export default function ResultsView({
  cuisine,
  preference,
  location,
  places,
  loading,
  isMock,
  isSmartFallback,
  searchError,
  onBack,
  onRefresh,
  onLogout
}: ResultsViewProps) {
  const [ratingFilter, setRatingFilter] = useState<number>(0);
  const [distanceFilter, setDistanceFilter] = useState<number>(10);
  const [mapAuthFailed, setMapAuthFailed] = useState<boolean>(false);

  useEffect(() => {
    // Save previous global callback
    const prevAuthFailure = (window as any).gm_authFailure;

    // Set custom handler for invalid keys / API authentication failure
    (window as any).gm_authFailure = () => {
      console.warn("Google Maps authentication failed (InvalidKeyMapError or similar). Falling back to Free Leaflet Map.");
      setMapAuthFailed(true);
      if (prevAuthFailure) {
        try {
          prevAuthFailure();
        } catch (e) {
          // ignore
        }
      }
    };

    return () => {
      (window as any).gm_authFailure = prevAuthFailure;
    };
  }, []);

  // Map settings state
  const getInitialCenter = () => {
    if (location.type === "gps" && location.coords) {
      return { lat: location.coords.latitude, lng: location.coords.longitude };
    }
    const cityKey = location.city ? location.city.toLowerCase().replace(/ /g, "_") : "";
    return CITY_COORDS[cityKey] || { lat: 2.8125, lng: 101.7978 };
  };

  const initialCenter = getInitialCenter();
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>(initialCenter);
  const [mapZoom, setMapZoom] = useState<number>(13);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  
  // Mobile active tab view toggle
  const [activeTab, setActiveTab] = useState<"list" | "map">("list");

  const getCuisinePhoto = (item: PlaceResult, index: number) => {
    if (item.type === "hotel") {
      const hotelPhotos = [
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=600&q=80"
      ];
      return hotelPhotos[index % hotelPhotos.length];
    } else {
      const foodPhotos: Record<string, string[]> = {
        "Malaysia": [
          "https://images.unsplash.com/photo-1590137876181-2a5a7e340308?auto=format&fit=crop&w=600&q=80",
          "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80"
        ],
        "Chinese": [
          "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=600&q=80",
          "https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=600&q=80"
        ],
        "Indian": [
          "https://images.unsplash.com/photo-1585938338392-50a599d02177?auto=format&fit=crop&w=600&q=80",
          "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80"
        ],
        "Arab Countries": [
          "https://images.unsplash.com/photo-1541518763669-27fef04b14ea?auto=format&fit=crop&w=600&q=80",
          "https://images.unsplash.com/photo-1582576163090-09d3b6f8a969?auto=format&fit=crop&w=600&q=80"
        ],
        "Pakistani": [
          "https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=600&q=80",
          "https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&w=600&q=80"
        ]
      };

      const key = cuisine in foodPhotos ? cuisine : "Malaysia";
      const photosList = foodPhotos[key] || foodPhotos["Malaysia"];
      return photosList[index % photosList.length];
    }
  };

  const handleOpenGoogleMapsUrl = (e: React.MouseEvent, mapsUri?: string, name?: string) => {
    e.stopPropagation(); // prevent card click mapping trigger
    const url = mapsUri || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name || "")}`;
    const link = document.createElement("a");
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSelectPlace = (place: PlaceResult) => {
    setSelectedPlaceId(place.id);
    setMapCenter({ lat: place.latitude, lng: place.longitude });
    setMapZoom(16);
    // On mobile viewports, automatically switch to map tab to show the marker
    if (window.innerWidth < 1024) {
      setActiveTab("map");
    }
  };

  const locationLabel = location.type === "gps" 
    ? "Detected Location" 
    : `${location.area || "Nilai"}, ${location.city || "Nilai"}, ${location.state || "Negeri Sembilan"}`;

  const filteredPlaces = places.filter(place => {
    if (ratingFilter > 0 && (place.rating || 0) < ratingFilter) return false;
    return true;
  });

  return (
    <div className="min-h-screen w-full bg-mesh-dark text-white pb-24" id="results_container">
      {/* Search Header Info */}
      <div className="max-w-7xl mx-auto px-6 pt-8 pb-4 flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-900 gap-4" id="results_meta_bar">
        <div className="space-y-1.5" id="results_meta_text">
          <div className="mb-2">
            <BackButton onClick={onBack} label="Back to Search Map" variant="dark" id="results_back_action" />
          </div>
          <div className="flex flex-wrap items-center gap-2" id="results_heading">
            <h1 className="text-xl sm:text-2xl font-bold font-display tracking-tight text-white capitalize">
              Grounded Results for <span className="text-amber-400">{cuisine}</span> {preference}
            </h1>
            <span className="text-xs bg-slate-900 text-slate-400 px-3 py-1 rounded-full border border-slate-800">
              {filteredPlaces.length} locations found
            </span>
          </div>
          <p className="text-xs text-slate-400 flex items-center space-x-1">
            <MapPin className="h-3.5 w-3.5 text-amber-500" />
            <span>Area scope: <span className="text-slate-200 font-semibold">{locationLabel}</span></span>
          </p>
        </div>

        <div className="flex items-center space-x-3" id="results_header_buttons">
          <button 
            onClick={onRefresh}
            disabled={loading}
            className="p-2.5 bg-slate-950 hover:bg-slate-900 text-slate-300 hover:text-white border border-slate-880 rounded-xl transition-all cursor-pointer flex items-center space-x-2 text-xs"
            id="results_refresh_btn"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh Grounds</span>
          </button>

          {onLogout && (
            <button 
              onClick={onLogout}
              className="p-2.5 bg-slate-950 hover:bg-red-500/10 hover:text-red-400 border border-slate-880 hover:border-red-500/20 text-slate-300 hover:text-red-400 rounded-xl transition-all cursor-pointer flex items-center space-x-1.5 text-xs"
              id="results_logout_btn"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          )}
          
          {isMock && (
            <div className="flex items-center space-x-1 text-[10px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl" id="demo_grounds_pill">
              <Sparkles className="h-3.5 w-3.5" />
              <span>OFFLINE FALLBACK</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Results Board */}
      <div className="max-w-7xl mx-auto px-6 pt-6 grid grid-cols-1 lg:grid-cols-4 gap-8" id="results_board">
        
        {/* Left Filters Sidebar */}
        <div className="space-y-6 lg:col-span-1" id="filters_sidebar">
          <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-5 space-y-5" id="filters_card">
            <div className="flex items-center space-x-2 border-b border-slate-800 pb-3" id="filters_header">
              <Filter className="h-4.5 w-4.5 text-amber-400" />
              <h3 className="text-sm font-bold font-display uppercase tracking-wider">Refine Options</h3>
            </div>

            {/* Rating Filter Slider */}
            <div className="space-y-2" id="filter_rating">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Minimum Rating</span>
                <span className="text-amber-400 font-semibold">{ratingFilter > 0 ? `★ ${ratingFilter}+` : "Any"}</span>
              </div>
              <div className="flex gap-1" id="star_rating_selectors">
                {[0, 3.5, 4.0, 4.5].map((stars) => (
                  <button
                    key={stars}
                    onClick={() => setRatingFilter(stars)}
                    className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                      ratingFilter === stars 
                        ? "bg-amber-500 text-slate-950 border-amber-500" 
                        : "bg-slate-950 text-slate-400 border-slate-850 hover:border-slate-800"
                    }`}
                  >
                    {stars === 0 ? "All" : `${stars}★`}
                  </button>
                ))}
              </div>
            </div>

            {/* Distance Filter slider */}
            <div className="space-y-2" id="filter_distance">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Proximity / Distance</span>
                <span className="text-white font-semibold">{distanceFilter} km</span>
              </div>
              <input
                type="range"
                min="2"
                max="30"
                step="2"
                value={distanceFilter}
                onChange={(e) => setDistanceFilter(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>Nearby (2km)</span>
                <span>Max Destination (30km)</span>
              </div>
            </div>

            <div className="p-3.5 bg-slate-950 border border-slate-850 rounded-xl text-center space-y-1.5" id="maps_sync_tip">
              <div className="text-[10px] text-slate-400 font-mono">MAPS INTERACTIVE</div>
              <p className="text-[11px] text-slate-500 leading-normal">
                Selecting any result card highlights its coordinates dynamically on the live-sync interactive map panel.
              </p>
            </div>
          </div>
        </div>

        {/* Right Split Board: List and Map */}
        <div className="lg:col-span-3 flex flex-col space-y-4" id="right_split_board">
          
          {/* Mobile View Switcher */}
          <div className="flex lg:hidden bg-slate-950/80 p-1.5 rounded-xl border border-slate-850" id="mobile_view_switcher">
            <button
              onClick={() => setActiveTab("list")}
              className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
                activeTab === "list" 
                  ? "bg-amber-500 text-slate-950 shadow-lg" 
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <ListIcon className="h-4 w-4" />
              <span>List View ({filteredPlaces.length})</span>
            </button>
            <button
              onClick={() => setActiveTab("map")}
              className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
                activeTab === "map" 
                  ? "bg-amber-500 text-slate-950 shadow-lg" 
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <MapIcon className="h-4 w-4" />
              <span>Interactive Map</span>
            </button>
          </div>

          {isSmartFallback && !loading && (
            <div className="p-4 bg-teal-500/5 border border-teal-500/15 rounded-2xl flex items-start space-x-3 text-slate-300" id="smart_fallback_msg_box">
              <Sparkles className="h-4.5 w-4.5 text-teal-400 shrink-0 mt-0.5 animate-pulse" />
              <div className="space-y-1 text-xs">
                <h4 className="font-bold text-teal-400">Live AI Smart Search Enabled</h4>
                <p className="text-slate-400 leading-relaxed">
                  Due to Google Maps Grounding rate limits on your API key, standard search was used to load real physical locations in <b>{location.city || "the region"}</b>.
                </p>
              </div>
            </div>
          )}

          {isMock && !loading && (
            <div className="p-4 bg-amber-500/5 border border-amber-500/15 rounded-2xl flex items-start space-x-3 text-slate-300" id="offline_fallback_msg_box">
              <Sparkles className="h-4.5 w-4.5 text-amber-500 shrink-0 mt-0.5 animate-pulse" />
              <div className="space-y-1 text-xs">
                <h4 className="font-bold text-amber-400">Offline Fallback Mode Active</h4>
                <p className="text-slate-400 leading-relaxed">
                  The system is currently displaying beautiful seed data. 
                  {searchError && <span className="block text-red-400 font-mono text-[10px] mt-1">Error: {searchError}</span>}
                </p>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 space-y-4" id="loading_spinner_sec">
              <RefreshCw className="h-10 w-10 text-amber-500 animate-spin" />
              <p className="text-sm text-slate-400 font-medium">Querying live Google Maps Grounding data...</p>
            </div>
          ) : filteredPlaces.length === 0 ? (
            <div className="text-center py-20 border border-slate-850 rounded-2xl bg-slate-950/20 space-y-3" id="no_results_sec">
              <div className="text-3xl" id="no_results_icon">🔍</div>
              <h3 className="text-lg font-bold font-display text-white">No Matches Found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No places match your minimum rating filter in {locationLabel}. Try modifying the filters.
              </p>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-6 items-stretch w-full" id="split_workspace">
              
              {/* Places List (Left on Desktop, toggled on mobile) */}
              <div 
                className={`w-full lg:w-[48%] space-y-4 max-h-[75vh] overflow-y-auto pr-1 scrollbar-thin ${
                  activeTab === "list" ? "block" : "hidden lg:block"
                }`} 
                id="places_list_scroll_container"
              >
                {filteredPlaces.map((place, index) => (
                  <div
                    key={place.id}
                    onClick={() => handleSelectPlace(place)}
                    className={`bg-slate-900/30 border p-4.5 rounded-2xl flex flex-col sm:flex-row gap-4 relative overflow-hidden group hover:bg-slate-900/50 cursor-pointer transition-all duration-300 ${
                      selectedPlaceId === place.id 
                        ? "border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.15)] bg-slate-900/60" 
                        : "border-slate-850 hover:border-slate-750"
                    }`}
                    id={`place_card_${place.id}`}
                  >
                    {/* Thumbnail */}
                    <div className="w-full sm:w-28 h-24 rounded-xl bg-slate-950 overflow-hidden relative shrink-0" id={`thumbnail_box_${place.id}`}>
                      <img 
                        src={getCuisinePhoto(place, index)} 
                        alt={place.name} 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
                      <div className="absolute top-2 left-2 bg-slate-950/80 backdrop-blur-md px-1.5 py-0.5 rounded text-[9px] font-mono font-bold text-amber-400 uppercase" id={`pref_badge_${place.id}`}>
                        {place.type}
                      </div>
                    </div>

                    {/* Meta Body */}
                    <div className="flex-grow flex flex-col justify-between space-y-2 min-w-0" id={`body_specs_${place.id}`}>
                      <div>
                        <div className="flex items-start justify-between gap-1.5" id={`heading_and_rating_${place.id}`}>
                          <h3 className="text-base font-bold font-display text-white leading-snug group-hover:text-amber-400 transition-colors truncate">
                            {place.name}
                          </h3>
                          <div className="flex items-center space-x-1 shrink-0 bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded font-bold text-xs" id={`star_pill_${place.id}`}>
                            <Star className="h-3 w-3 fill-amber-400 stroke-amber-400" />
                            <span>{place.rating || "4.5"}</span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-400 leading-normal line-clamp-2 mt-1" id={`desc_text_${place.id}`}>
                          {place.description}
                        </p>
                      </div>

                      {/* Info lines */}
                      <div className="space-y-1.5 text-[11px] text-slate-400 border-t border-slate-850 pt-2" id={`specs_footer_grid_${place.id}`}>
                        <div className="flex items-center space-x-1.5 min-w-0" id={`address_spec_${place.id}`}>
                          <MapPin className="h-3 w-3 text-amber-500 shrink-0" />
                          <span className="truncate">{place.address}</span>
                        </div>
                        <div className="flex items-center justify-between gap-2 pb-1">
                          <span className="truncate text-teal-400 flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {place.phone || "No listed contact"}
                          </span>
                          <span className="text-amber-400 font-mono text-[10px] shrink-0">
                            {place.type === "hotel" ? "🏨 Accommodation" : "🍲 Dining"}
                          </span>
                        </div>

                        {/* Direct Map and External Link Actions */}
                        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-850/50" id={`card_action_row_${place.id}`}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectPlace(place);
                            }}
                            className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg flex items-center space-x-1 transition-all border cursor-pointer ${
                              selectedPlaceId === place.id
                                ? "bg-amber-500 text-slate-950 border-amber-500 font-extrabold shadow-sm"
                                : "bg-slate-950/40 text-slate-300 border-slate-850 hover:bg-slate-900 hover:text-white"
                            }`}
                            id={`show_map_btn_${place.id}`}
                          >
                            <MapIcon className="h-3 w-3" />
                            <span>{selectedPlaceId === place.id ? "Selected on Map" : "Show on Map"}</span>
                          </button>

                          <button
                            onClick={(e) => handleOpenGoogleMapsUrl(e, place.mapsUri, place.name)}
                            className="text-[10px] font-bold text-slate-300 hover:text-amber-400 bg-slate-950/40 hover:bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-850 transition-all cursor-pointer flex items-center space-x-1"
                            id={`open_gmaps_btn_${place.id}`}
                          >
                            <ExternalLink className="h-3 w-3" />
                            <span>Open Google Maps</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Map Column (Right on Desktop, toggled on mobile) */}
              <div 
                className={`w-full lg:w-[52%] h-[400px] lg:h-[75vh] sticky top-6 rounded-2xl overflow-hidden shadow-2xl border border-slate-850 shrink-0 ${
                  activeTab === "map" ? "block" : "hidden lg:block"
                }`} 
                id="results_map_column"
              >
                {hasValidKey && !mapAuthFailed ? (
                  <APIProvider apiKey={API_KEY} version="weekly">
                    <Map
                      center={mapCenter}
                      zoom={mapZoom}
                      onCenterChanged={(e) => setMapCenter(e.detail.center)}
                      onZoomChanged={(e) => setMapZoom(e.detail.zoom)}
                      mapId="DEMO_MAP_ID"
                      internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                      style={{ width: '100%', height: '100%' }}
                    >
                      {filteredPlaces.map((place) => (
                        <PlaceMarker
                          key={place.id}
                          place={place}
                          isSelected={selectedPlaceId === place.id}
                          onClick={() => {
                            setSelectedPlaceId(place.id);
                            setMapCenter({ lat: place.latitude, lng: place.longitude });
                          }}
                          onClose={() => setSelectedPlaceId(null)}
                        />
                      ))}
                    </Map>
                  </APIProvider>
                ) : (
                  <FreeLeafletMap
                    places={filteredPlaces}
                    center={mapCenter}
                    zoom={mapZoom}
                    selectedPlaceId={selectedPlaceId}
                    onSelectPlace={(id) => {
                      setSelectedPlaceId(id);
                      if (id) {
                        const place = filteredPlaces.find((p) => p.id === id);
                        if (place) {
                          setMapCenter({ lat: place.latitude, lng: place.longitude });
                        }
                      }
                    }}
                  />
                )}
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
