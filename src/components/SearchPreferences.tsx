/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MapPin, Navigation, Utensils, Hotel, Globe, Search, ArrowRight, User, LogOut, Check, Compass, Shield } from "lucide-react";
import { CUISINES, ALL_COUNTRIES, UserProfile } from "../types";
import BackButton from "./BackButton";

interface SearchPreferencesProps {
  user: UserProfile;
  onLogout: () => void;
  onSearch: (searchData: {
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
  }) => void;
  onAdminClick?: () => void;
  onBack?: () => void;
}

export default function SearchPreferences({ user, onLogout, onSearch, onAdminClick, onBack }: SearchPreferencesProps) {
  // Wizard Steps: 0 = Location, 1 = Cuisine, 2 = Preference
  const [step, setStep] = useState(0);

  // Step 0: Location states
  const locType = "manual";

  // Cascading Manual selection states
  const [selectedCountryId, setSelectedCountryId] = useState("malaysia");
  const [selectedStateId, setSelectedStateId] = useState("");
  const [selectedCityId, setSelectedCityId] = useState("");
  const [selectedArea, setSelectedArea] = useState("");

  // Step 1: Cuisine selection state (Default Malaysia style)
  const [selectedCuisine, setSelectedCuisine] = useState("Malaysia");

  // Step 2: Preference state
  const [searchPref, setSearchPref] = useState<"hotels" | "restaurants">("restaurants");

  // Find cascading data
  const currentCountry = ALL_COUNTRIES.find(c => c.id === selectedCountryId);
  const currentState = currentCountry?.states.find(s => s.id === selectedStateId);
  const currentCity = currentState?.cities.find(ct => ct.id === selectedCityId);

  const isFirstRender = useRef(true);

  // Step-aware Back Handler (Steps 2 -> 1 -> 0 -> onBack)
  const handleStepBack = () => {
    if (step === 2) {
      setStep(1);
    } else if (step === 1) {
      setStep(0);
    } else if (onBack) {
      onBack();
    }
  };

  const backLabel = step === 2 
    ? "Back to Cuisine" 
    : step === 1 
    ? "Back to Location" 
    : "Back";

  // Reset nested states on parent change to avoid automatic selections
  useEffect(() => {
    if (isFirstRender.current) {
      return;
    }
    setSelectedStateId("");
    setSelectedCityId("");
    setSelectedArea("");
  }, [selectedCountryId]);

  useEffect(() => {
    if (isFirstRender.current) {
      return;
    }
    setSelectedCityId("");
    setSelectedArea("");
  }, [selectedStateId]);

  useEffect(() => {
    if (isFirstRender.current) {
      return;
    }
    setSelectedArea("");
  }, [selectedCityId]);

  useEffect(() => {
    isFirstRender.current = false;
  }, []);

  const handleNextStep = () => {
    if (step < 2) {
      setStep(step + 1);
    } else {
      // Trigger final search
      const locationPayload = {
        type: "manual" as const,
        country: currentCountry?.name || "Malaysia",
        state: currentState?.name || "Negeri Sembilan",
        city: currentCity?.name || "Nilai",
        area: selectedArea || "Bandar Baru Nilai"
      };

      onSearch({
        cuisine: selectedCuisine,
        preference: searchPref,
        location: locationPayload
      });
    }
  };

  return (
    <div className="min-h-screen w-full bg-mesh-dark text-white pb-20" id="prefs_container">
      {/* Premium Header */}
      <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-xl border-b border-slate-900 px-6 py-4" id="prefs_header">
        <div className="max-w-7xl mx-auto flex items-center justify-between" id="prefs_header_inner">
          <div className="flex items-center space-x-3" id="prefs_logo_group">
            <div className="p-2 bg-amber-500 text-slate-950 rounded-xl font-bold flex items-center justify-center" id="prefs_logo_badge">
              <Compass className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold font-display tracking-tight">
              FOOD & STAY <span className="text-amber-400">HUB</span>
            </span>
          </div>

          <div className="flex items-center space-x-4" id="prefs_user_meta">
            {user.role === "admin" && onAdminClick && (
              <button
                onClick={onAdminClick}
                className="text-xs bg-amber-500 hover:bg-amber-600 text-slate-950 px-3.5 py-1.5 rounded-xl font-bold transition-all duration-200 cursor-pointer flex items-center space-x-1"
                id="admin_panel_nav_btn"
              >
                <Shield className="h-3.5 w-3.5" />
                <span>Admin Panel</span>
              </button>
            )}

            <div className="hidden sm:flex items-center space-x-2 bg-slate-900 border border-slate-800 px-3.5 py-1.5 rounded-xl text-xs" id="user_pill">
              <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse" />
              <span className="text-slate-300">Welcome, </span>
              <span className="text-white font-semibold">{user.name}</span>
            </div>
            <button 
              onClick={onLogout}
              className="text-xs bg-slate-900 hover:bg-red-500/10 hover:text-red-400 border border-slate-800 hover:border-red-500/20 px-3.5 py-1.5 rounded-xl font-medium transition-all duration-200 cursor-pointer flex items-center space-x-1"
              id="logout_btn"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 pt-8" id="prefs_main">
        
        {/* Top-Left Back Navigation */}
        <div className="flex items-center justify-start mb-6">
          <BackButton 
            onClick={handleStepBack} 
            label={backLabel} 
            variant="dark" 
            id="search_pref_back_btn" 
          />
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center space-x-4 mb-8" id="step_indicator">
          {[0, 1, 2].map((i) => {
            const labels = ["Location Setup", "Cuisine & Style", "Accommodations or Dining"];
            return (
              <div key={i} className="flex items-center space-x-2" id={`step_bubble_${i}`}>
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    step === i 
                      ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 scale-110" 
                      : step > i 
                      ? "bg-teal-500 text-white" 
                      : "bg-slate-900 text-slate-500 border border-slate-800"
                  }`}
                >
                  {step > i ? <Check className="h-4 w-4" /> : i + 1}
                </div>
                <span className={`text-xs font-medium hidden md:inline ${step === i ? "text-amber-400 font-semibold" : "text-slate-400"}`}>
                  {labels[i]}
                </span>
                {i < 2 && <div className="w-8 h-0.5 bg-slate-800" />}
              </div>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="step0"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
              id="step0_pane"
            >
              <div className="text-center space-y-2 mb-4" id="step0_header">
                <h2 className="text-2xl font-bold font-display text-white">Select Your Destination Location</h2>
                <p className="text-sm text-slate-400 max-w-lg mx-auto">
                  Select your desired country, state, city, and area to filter specific culinary and accommodation results.
                </p>
              </div>

              {/* Inner Mode Configs */}
              <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6" id="loc_mode_panel">
                <div className="space-y-5" id="manual_dropdowns_container">
                  <h3 className="text-sm font-semibold text-slate-300 border-b border-slate-800 pb-2 mb-3">
                    Select Location Coordinates to Query
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" id="dropdown_grid_1">
                    {/* Country Dropdown */}
                    <div className="space-y-1.5" id="drop_country_box">
                      <label className="text-xs text-slate-400 font-medium">Country</label>
                      <select
                        value={selectedCountryId}
                        onChange={(e) => setSelectedCountryId(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                      >
                        {ALL_COUNTRIES.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* State Dropdown */}
                    <div className="space-y-1.5" id="drop_state_box">
                      <label className="text-xs text-slate-400 font-medium">State / Province</label>
                      <select
                        value={selectedStateId}
                        onChange={(e) => setSelectedStateId(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                      >
                        <option value="">-- Select State --</option>
                        {currentCountry?.states.map((s) => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" id="dropdown_grid_2">
                    {/* City Dropdown */}
                    <div className="space-y-1.5" id="drop_city_box">
                      <label className="text-xs text-slate-400 font-medium">City</label>
                      <select
                        value={selectedCityId}
                        onChange={(e) => setSelectedCityId(e.target.value)}
                        disabled={!selectedStateId}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-amber-500 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <option value="">-- Select City --</option>
                        {currentState?.cities.map((ct) => (
                          <option key={ct.id} value={ct.id}>{ct.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Area Dropdown */}
                    <div className="space-y-1.5" id="drop_area_box">
                      <label className="text-xs text-slate-400 font-medium">Specific Area / Town</label>
                      <select
                        value={selectedArea}
                        onChange={(e) => {
                          setSelectedArea(e.target.value);
                        }}
                        disabled={!selectedCityId}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-amber-500 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <option value="">-- Select Area --</option>
                        {currentCity?.areas.map((a) => (
                          <option key={a} value={a}>{a}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {selectedCountryId === "malaysia" && selectedStateId && selectedCityId && selectedArea && (
                    <div className="p-3 bg-amber-500/5 border border-amber-500/10 text-amber-300 text-[11px] rounded-xl flex items-start space-x-2" id="state_cap_msg">
                      <div className="mt-0.5">ℹ️</div>
                      <p>We filter precisely inside your selected Malaysia region ({selectedArea}, {currentCity?.name}, {currentState?.name}). Results will exclude unrelated states to adhere strictly to your destination preferences.</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-4" id="step0_footer_actions">
                <button
                  onClick={handleNextStep}
                  disabled={!selectedStateId || !selectedCityId || !selectedArea}
                  className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-bold px-8 py-3.5 rounded-xl text-sm transition-all cursor-pointer flex items-center space-x-2 shadow-lg shadow-amber-500/10"
                  id="loc_step_next"
                >
                  <span>Select Cuisine Category</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
              id="step1_pane"
            >
              <div className="text-center space-y-2 mb-4" id="step1_header">
                <h2 className="text-2xl font-bold font-display text-white">Select Cuisine Style or Country Preference</h2>
                <p className="text-sm text-slate-400 max-w-lg mx-auto">
                  Find hotels and eateries presenting cuisine, hospitality styles, or themed environments reflecting these nations.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3" id="cuisine_grid">
                {CUISINES.map((cuisine) => {
                  const isSelected = selectedCuisine === cuisine;
                  return (
                    <button
                      key={cuisine}
                      onClick={() => {
                        setSelectedCuisine(cuisine);
                      }}
                      className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer relative overflow-hidden group ${
                        isSelected 
                          ? "bg-slate-900 border-amber-500 text-amber-400 shadow-md shadow-amber-500/5" 
                          : "bg-slate-950 border-slate-850 hover:border-slate-750 text-slate-300 hover:text-white"
                      }`}
                      id={`cuisine_btn_${cuisine.replace(/ /g, "_")}`}
                    >
                      <div className="flex flex-col h-full justify-between space-y-4" id="cuisine_card_body">
                        <div className="flex justify-between items-start" id="cuisine_card_header">
                          <div className={`p-1.5 rounded-lg text-xs font-bold ${isSelected ? "bg-amber-500/10 text-amber-400" : "bg-white/5 text-slate-400"}`} id="cuisine_type">
                            <Globe className="h-3.5 w-3.5" />
                          </div>
                          {isSelected && (
                            <div className="w-4.5 h-4.5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center" id="cuisine_check">
                              <Check className="h-3 w-3 stroke-[3]" />
                            </div>
                          )}
                        </div>
                        <span className="text-xs font-semibold font-display tracking-tight break-words">{cuisine}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-between pt-6 border-t border-slate-900" id="step1_footer_actions">
                <button
                  onClick={() => setStep(0)}
                  className="bg-slate-900 hover:bg-slate-850 border border-slate-800 text-white font-semibold px-6 py-3.5 rounded-xl text-sm transition-all cursor-pointer"
                  id="cuisine_step_prev"
                >
                  Back to Location
                </button>
                <button
                  onClick={handleNextStep}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-8 py-3.5 rounded-xl text-sm transition-all cursor-pointer flex items-center space-x-2 shadow-lg shadow-amber-500/10"
                  id="cuisine_step_next"
                >
                  <span>Select Search Preference</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
              id="step2_pane"
            >
              <div className="text-center space-y-2 mb-4" id="step2_header">
                <h2 className="text-2xl font-bold font-display text-white">What Are You Looking For?</h2>
                <p className="text-sm text-slate-400 max-w-lg mx-auto">
                  Find high-quality lodging, resorts, and hotels, or exquisite dining spots in your chosen location.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" id="preference_cards_grid">
                {/* Hotels Preference Option */}
                <button
                  onClick={() => setSearchPref("hotels")}
                  className={`p-6 rounded-3xl border text-left transition-all duration-300 cursor-pointer relative overflow-hidden group flex flex-col justify-between h-56 ${
                    searchPref === "hotels"
                      ? "bg-slate-900 border-amber-500 text-amber-400 shadow-xl"
                      : "bg-slate-950 border-slate-850 hover:border-slate-800 text-slate-300"
                  }`}
                  id="pref_hotels_card"
                >
                  <div className="space-y-2" id="hotel_text_sec">
                    <div className={`p-3 rounded-2xl inline-flex ${searchPref === "hotels" ? "bg-amber-500/10 text-amber-400" : "bg-white/5 text-slate-400"}`}>
                      <Hotel className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-bold font-display mt-2 text-white">Hotels & Accommodations</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Search premium hotels, luxury resorts, boutique guest houses, and cozy lodging tailored to your destination area.
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-xs font-semibold mt-4" id="hotel_footer">
                    <span>Option 1: Hotels</span>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${searchPref === "hotels" ? "bg-amber-500 border-amber-500 text-slate-950" : "border-slate-700"}`}>
                      {searchPref === "hotels" && <Check className="h-3 w-3 stroke-[3]" />}
                    </div>
                  </div>
                </button>

                {/* Restaurants Preference Option */}
                <button
                  onClick={() => setSearchPref("restaurants")}
                  className={`p-6 rounded-3xl border text-left transition-all duration-300 cursor-pointer relative overflow-hidden group flex flex-col justify-between h-56 ${
                    searchPref === "restaurants"
                      ? "bg-slate-900 border-amber-500 text-amber-400 shadow-xl"
                      : "bg-slate-950 border-slate-850 hover:border-slate-800 text-slate-300"
                  }`}
                  id="pref_restaurants_card"
                >
                  <div className="space-y-2" id="rest_text_sec">
                    <div className={`p-3 rounded-2xl inline-flex ${searchPref === "restaurants" ? "bg-amber-500/10 text-amber-400" : "bg-white/5 text-slate-400"}`}>
                      <Utensils className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-bold font-display mt-2 text-white">Restaurants & Cafes</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Explore beautiful restaurants, artisan cafes, dining outlets, and local street food stalls matching your cuisine category.
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-xs font-semibold mt-4" id="rest_footer">
                    <span>Option 2: Restaurants</span>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${searchPref === "restaurants" ? "bg-amber-500 border-amber-500 text-slate-950" : "border-slate-700"}`}>
                      {searchPref === "restaurants" && <Check className="h-3 w-3 stroke-[3]" />}
                    </div>
                  </div>
                </button>
              </div>

              {/* Confirm Filter Summary */}
              <div className="p-4 bg-slate-900/60 border border-slate-850 rounded-2xl text-xs space-y-2" id="filter_summary_box">
                <div className="text-slate-400 uppercase tracking-wider text-[10px] font-bold font-mono">Current Query Blueprint</div>
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-slate-300" id="summary_pills">
                  <div>
                    📍 Location: <span className="text-white font-semibold">
                    {selectedArea && currentCity ? `${selectedArea}, ${currentCity.name}` : "No Location Selected"}
                    </span>
                  </div>
                  <div>
                    🍜 Style: <span className="text-white font-semibold">{selectedCuisine}</span>
                  </div>
                  <div>
                    🔍 Seeking: <span className="text-white font-semibold">{searchPref === "hotels" ? "Lodging & Accommodations" : "Eateries & Bistros"}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-6 border-t border-slate-900" id="step2_footer_actions">
                <button
                  onClick={() => setStep(1)}
                  className="bg-slate-900 hover:bg-slate-850 border border-slate-800 text-white font-semibold px-6 py-3.5 rounded-xl text-sm transition-all cursor-pointer"
                  id="pref_step_prev"
                >
                  Back to Cuisine
                </button>
                <button
                  onClick={handleNextStep}
                  className="bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-600 hover:to-amber-500 text-slate-950 font-bold px-10 py-4 rounded-xl text-sm transition-all cursor-pointer flex items-center space-x-3 shadow-xl shadow-amber-500/20"
                  id="pref_step_next"
                >
                  <Search className="h-4.5 w-4.5" />
                  <span>Discover via Google Maps</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
