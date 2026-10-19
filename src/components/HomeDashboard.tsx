/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from "react";
import { 
  UtensilsCrossed, 
  Store, 
  Building2, 
  ArrowRight, 
  Sparkles, 
  ChefHat, 
  Compass, 
  Clock, 
  Layers, 
  SlidersHorizontal,
  PlusCircle,
  ShoppingBag
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { fetchUserRestaurants } from "../lib/localDataService";
import { RegisteredRestaurant } from "../types";

interface HomeDashboardProps {
  onNavigate: (view: string) => void;
}

export default function HomeDashboard({ onNavigate }: HomeDashboardProps) {
  const { userProfile } = useAuth();
  const [ownedRestaurants, setOwnedRestaurants] = useState<RegisteredRestaurant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOwned() {
      if (userProfile?.id || userProfile?.uid) {
        const id = userProfile.uid || userProfile.id;
        const list = await fetchUserRestaurants(id);
        setOwnedRestaurants(list);
      }
      setLoading(false);
    }
    loadOwned();
  }, [userProfile]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-12">
      
      {/* Hero Welcome Banner */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300/60 text-xs font-bold tracking-wide">
          <Sparkles className="h-3.5 w-3.5 text-amber-600" />
          <span>Unified Hospitality & Dining Hub</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black font-serif text-[#1A1A1A] tracking-tight">
          Welcome, {userProfile?.name || "Traveler"}
        </h1>
        <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
          Order tailored dishes with live recipe ingredient customization, or register and manage your restaurant and hotel menu right from your account.
        </p>
      </div>

      {/* Two Entry Points Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        
        {/* Card 1: Order Food */}
        <div
          onClick={() => onNavigate("order_food")}
          className="group relative bg-white rounded-3xl p-8 sm:p-10 border border-stone-200/90 hover:border-amber-400 shadow-xl shadow-stone-200/50 hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-300 flex flex-col justify-between cursor-pointer hover:-translate-y-1"
        >
          <div className="space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-600 border border-amber-500/20 flex items-center justify-center group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-slate-950 transition-all duration-300">
              <UtensilsCrossed className="h-8 w-8" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <h2 className="text-2xl font-bold font-serif text-[#1A1A1A]">
                  Order Food
                </h2>
                <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Custom Recipe
                </span>
              </div>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Browse authentic local restaurants and customize exact ingredient gram weights, from extra sambal to reduced oil, with live price calculation.
              </p>
            </div>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-stone-100 text-stone-700 text-xs font-semibold">
                <SlidersHorizontal className="h-3 w-3 text-amber-600" />
                <span>Adjust Grams</span>
              </span>
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-stone-100 text-stone-700 text-xs font-semibold">
                <Clock className="h-3 w-3 text-amber-600" />
                <span>Live Status</span>
              </span>
            </div>
          </div>

          <div className="pt-8 flex items-center justify-between border-t border-stone-100 mt-6">
            <span className="text-xs font-bold text-amber-700 group-hover:text-amber-800 flex items-center space-x-1">
              <span>Start Browsing Dishes</span>
            </span>
            <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-700 group-hover:bg-amber-500 group-hover:text-slate-950 flex items-center justify-center transition-colors">
              <ArrowRight className="h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </div>

        {/* Card 2: Register & Manage Restaurant / Hotel */}
        <div
          onClick={() => {
            if (ownedRestaurants.length > 0) {
              onNavigate("manage_business");
            } else {
              onNavigate("register_business");
            }
          }}
          className="group relative bg-white rounded-3xl p-8 sm:p-10 border border-stone-200/90 hover:border-amber-400 shadow-xl shadow-stone-200/50 hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-300 flex flex-col justify-between cursor-pointer hover:-translate-y-1"
        >
          <div className="space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-600 border border-amber-500/20 flex items-center justify-center group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-slate-950 transition-all duration-300">
              <Store className="h-8 w-8" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <h2 className="text-2xl font-bold font-serif text-[#1A1A1A]">
                  Register Your Restaurant / Hotel
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Add your business, upload custom dishes with gram-level ingredient recipes, set pricing rules, and manage incoming kitchen orders in real-time.
              </p>
            </div>

            {/* Owner status badge */}
            <div className="pt-2">
              {loading ? (
                <span className="text-xs text-stone-400">Loading business status...</span>
              ) : ownedRestaurants.length > 0 ? (
                <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold shadow-xs">
                  <Building2 className="h-4 w-4 text-amber-600" />
                  <span>You have {ownedRestaurants.length} {ownedRestaurants.length === 1 ? "property" : "properties"} registered</span>
                </div>
              ) : (
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-stone-100 text-stone-700 text-xs font-semibold">
                  <PlusCircle className="h-3 w-3 text-amber-600" />
                  <span>Open to all registered accounts</span>
                </div>
              )}
            </div>
          </div>

          <div className="pt-8 flex items-center justify-between border-t border-stone-100 mt-6">
            <span className="text-xs font-bold text-amber-700 group-hover:text-amber-800 flex items-center space-x-1">
              <span>{ownedRestaurants.length > 0 ? "Open Management Dashboard" : "Register Business Now"}</span>
            </span>
            <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-700 group-hover:bg-amber-500 group-hover:text-slate-950 flex items-center justify-center transition-colors">
              <ArrowRight className="h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </div>

      </div>

      {/* Quick Navigation Footer Row */}
      <div className="max-w-4xl mx-auto bg-stone-100/70 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-600 border border-stone-200">
        <div className="flex items-center space-x-2 font-medium">
          <Compass className="h-4 w-4 text-amber-600 shrink-0" />
          <span>Looking for regional travel discovery and map grounded search?</span>
        </div>
        <button
          onClick={() => onNavigate("location_search")}
          className="font-bold text-amber-700 hover:text-amber-800 hover:underline cursor-pointer"
        >
          Open Location & Map Search &rarr;
        </button>
      </div>

    </div>
  );
}
