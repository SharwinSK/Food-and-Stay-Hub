/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Store, 
  Building2, 
  Search, 
  MapPin, 
  Phone, 
  ArrowRight, 
  Utensils, 
  Filter, 
  Sparkles,
  SlidersHorizontal,
  ChevronRight
} from "lucide-react";
import { RegisteredRestaurant } from "../types";
import { fetchAllRestaurants } from "../lib/localDataService";
import BackButton from "./BackButton";

interface BrowseRestaurantsProps {
  onSelectRestaurant: (restaurant: RegisteredRestaurant) => void;
  onBack: () => void;
  backLabel?: string;
}

export default function BrowseRestaurants({ onSelectRestaurant, onBack, backLabel }: BrowseRestaurantsProps) {
  const [restaurants, setRestaurants] = useState<RegisteredRestaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("All");
  const [cuisineFilter, setCuisineFilter] = useState<string>("All");
  const [cityFilter, setCityFilter] = useState<string>("All");

  useEffect(() => {
    async function load() {
      setLoading(true);
      const list = await fetchAllRestaurants();
      setRestaurants(list);
      setLoading(false);
    }
    load();
  }, []);

  const cuisinesList = ["All", ...Array.from(new Set(restaurants.map(r => r.cuisineType).filter(Boolean)))];
  const citiesList = ["All", ...Array.from(new Set(restaurants.map(r => r.city).filter(Boolean)))];

  const filtered = restaurants.filter((rest) => {
    const matchSearch = 
      rest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rest.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rest.cuisineType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rest.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchType = typeFilter === "All" || rest.type === typeFilter;
    const matchCuisine = cuisineFilter === "All" || rest.cuisineType === cuisineFilter;
    const matchCity = cityFilter === "All" || rest.city.toLowerCase() === cityFilter.toLowerCase();

    return matchSearch && matchType && matchCuisine && matchCity;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      
      {/* Top-Left Back Navigation */}
      <div className="flex items-center justify-start">
        <BackButton onClick={onBack} label={backLabel || "Back"} id="browse_back_btn" />
      </div>

      {/* Header Banner */}
      <div className="space-y-3">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold">
          <Utensils className="h-3.5 w-3.5 text-amber-600" />
          <span>Browse Restaurants & Dining Stays</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black font-serif text-[#1A1A1A]">
          Order from Authentic Kitchens
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 max-w-2xl">
          Select any registered restaurant or hotel to browse their signature dishes. You can order standard chef recipes or adjust ingredient gram weights to your exact taste.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200 shadow-sm space-y-4">
        <div className="relative">
          <Search className="h-4 w-4 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by restaurant name, city, cuisine (e.g. Nasi Lemak, Biryani, Nilai)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 text-sm rounded-2xl border border-stone-200 bg-stone-50/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all placeholder:text-stone-400"
          />
        </div>

        {/* Pills Filters */}
        <div className="flex flex-wrap items-center gap-3 pt-1">
          {/* Type Filter */}
          <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200">
            {["All", "Restaurant", "Hotel"].map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  typeFilter === t
                    ? "bg-white text-stone-900 shadow-xs"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                {t === "All" ? "All Places" : t === "Restaurant" ? "Restaurants" : "Hotels"}
              </button>
            ))}
          </div>

          {/* City Filter */}
          {citiesList.length > 1 && (
            <div className="flex items-center space-x-1.5 bg-stone-50 px-2 py-1 rounded-xl border border-stone-200">
              <MapPin className="h-3.5 w-3.5 text-amber-600" />
              <select
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="bg-transparent text-xs font-semibold text-stone-700 focus:outline-none cursor-pointer pr-2"
              >
                <option value="All">All Cities</option>
                {citiesList.filter(c => c !== "All").map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
          )}

          {/* Cuisine Chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            {cuisinesList.map((c) => (
              <button
                key={c}
                onClick={() => setCuisineFilter(c)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  cuisineFilter === c
                    ? "bg-amber-500 text-slate-950 font-bold shadow-xs"
                    : "bg-stone-50 text-stone-600 border border-stone-200 hover:bg-stone-100"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Restaurant List Grid */}
      {loading ? (
        <div className="text-center py-16 text-stone-400 text-xs">Loading authentic eateries...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-stone-300 space-y-3">
          <Store className="h-10 w-10 text-stone-300 mx-auto" />
          <p className="text-sm font-bold text-stone-800">No restaurants match your search</p>
          <p className="text-xs text-stone-500">Try clearing filters or search for another city.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((rest) => (
            <div
              key={rest.id}
              onClick={() => onSelectRestaurant(rest)}
              className="group bg-white rounded-3xl border border-stone-200/90 shadow-md hover:shadow-xl hover:border-amber-400 transition-all duration-300 overflow-hidden flex flex-col justify-between cursor-pointer"
            >
              <div>
                {/* Cover Image */}
                <div className="h-44 w-full relative overflow-hidden bg-stone-100">
                  <img
                    src={rest.coverPhotoUrl}
                    alt={rest.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 flex items-center space-x-2">
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-stone-950/80 text-white backdrop-blur-sm uppercase">
                      {rest.type}
                    </span>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 shadow-xs">
                      {rest.cuisineType} Cuisine
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-3">
                  <h3 className="text-lg font-bold font-serif text-stone-900 group-hover:text-amber-700 transition-colors">
                    {rest.name}
                  </h3>

                  <div className="flex items-center space-x-1.5 text-xs text-stone-500">
                    <MapPin className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                    <span className="truncate">{rest.address}, {rest.city}</span>
                  </div>

                  <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                    {rest.description}
                  </p>
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-6 pt-0 border-t border-stone-100 flex items-center justify-between text-xs mt-3">
                <span className="text-[11px] font-semibold text-stone-500">
                  {rest.contactPhone || "Available for orders"}
                </span>
                <span className="font-bold text-amber-700 flex items-center space-x-1 group-hover:translate-x-1 transition-transform">
                  <span>View Menu</span>
                  <ChevronRight className="h-4 w-4" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
