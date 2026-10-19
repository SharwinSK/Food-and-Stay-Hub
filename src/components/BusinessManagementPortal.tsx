/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Building2, 
  Store, 
  Plus, 
  ArrowRight, 
  MapPin, 
  Phone, 
  Utensils, 
  Clock, 
  ShoppingBag,
  ChefHat
} from "lucide-react";
import { RegisteredRestaurant } from "../types";
import { useAuth } from "../contexts/AuthContext";
import { fetchUserRestaurants } from "../lib/localDataService";
import RestaurantOwnerDashboard from "./RestaurantOwnerDashboard";
import RestaurantRegistrationForm from "./RestaurantRegistrationForm";
import BackButton from "./BackButton";

interface BusinessManagementPortalProps {
  onBack?: () => void;
  backLabel?: string;
}

export default function BusinessManagementPortal({ onBack, backLabel }: BusinessManagementPortalProps) {
  const { userProfile } = useAuth();
  const [restaurants, setRestaurants] = useState<RegisteredRestaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRestaurant, setSelectedRestaurant] = useState<RegisteredRestaurant | null>(null);
  const [showRegisterForm, setShowRegisterForm] = useState(false);

  const loadUserProperties = async () => {
    setLoading(true);
    const ownerId = userProfile?.uid || userProfile?.id || "guest-owner";
    const list = await fetchUserRestaurants(ownerId);
    setRestaurants(list);
    setLoading(false);
  };

  useEffect(() => {
    loadUserProperties();
  }, [userProfile]);

  // If a restaurant is selected, show its deep management dashboard (menu & kitchen orders)
  if (selectedRestaurant) {
    return (
      <RestaurantOwnerDashboard
        restaurant={selectedRestaurant}
        onBack={() => {
          setSelectedRestaurant(null);
          loadUserProperties();
        }}
        onBackToHome={onBack}
      />
    );
  }

  // If adding a new property
  if (showRegisterForm) {
    return (
      <RestaurantRegistrationForm
        onSuccess={(newId) => {
          setShowRegisterForm(false);
          loadUserProperties();
        }}
        onCancel={() => setShowRegisterForm(false)}
        onBackToHome={onBack}
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      
      {/* Top-Left Back Navigation */}
      {onBack && (
        <div className="flex items-center justify-start">
          <BackButton onClick={onBack} label={backLabel || "Back"} id="business_back_btn" />
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-amber-800 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
            <Store className="h-3.5 w-3.5 text-amber-600" />
            <span>Hospitality Property Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-serif text-[#1A1A1A]">
            My Restaurants & Hotels
          </h1>
          <p className="text-xs sm:text-sm text-stone-600">
            Select a property to update dishes, customize ingredient gram rules, or view real-time kitchen orders.
          </p>
        </div>

        <button
          onClick={() => setShowRegisterForm(true)}
          className="px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center space-x-2 shadow-md shadow-amber-500/20 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Register New Property</span>
        </button>
      </div>

      {/* Property Cards Grid */}
      {loading ? (
        <div className="text-center py-16 text-stone-400 text-xs">Loading registered properties...</div>
      ) : restaurants.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-stone-300 space-y-4">
          <Building2 className="h-12 w-12 text-stone-300 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-stone-800">No properties registered under this account yet</h3>
            <p className="text-xs text-stone-500">
              Register your restaurant or hotel to upload custom recipes, set price-per-gram rules, and manage incoming orders.
            </p>
          </div>
          <button
            onClick={() => setShowRegisterForm(true)}
            className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/20 cursor-pointer"
          >
            Register Business Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurants.map((prop) => (
            <div
              key={prop.id}
              onClick={() => setSelectedRestaurant(prop)}
              className="group bg-white rounded-3xl border border-stone-200/90 shadow-md hover:shadow-xl hover:border-amber-400 overflow-hidden flex flex-col justify-between cursor-pointer transition-all duration-300"
            >
              <div>
                <div className="h-44 w-full relative bg-stone-100 overflow-hidden">
                  <img
                    src={prop.coverPhotoUrl}
                    alt={prop.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 flex items-center space-x-2">
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-stone-950/80 text-white uppercase">
                      {prop.type}
                    </span>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 font-bold">
                      {prop.cuisineType}
                    </span>
                  </div>
                </div>

                <div className="p-6 space-y-3">
                  <h3 className="text-lg font-bold font-serif text-stone-900 group-hover:text-amber-700 transition-colors">
                    {prop.name}
                  </h3>

                  <div className="flex items-center space-x-1.5 text-xs text-stone-500">
                    <MapPin className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                    <span className="truncate">{prop.address}, {prop.city}</span>
                  </div>

                  <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                    {prop.description}
                  </p>
                </div>
              </div>

              <div className="p-6 pt-0 border-t border-stone-100 flex items-center justify-between text-xs mt-3">
                <span className="text-[11px] font-bold text-amber-700">Manage Menu & Orders</span>
                <div className="w-8 h-8 rounded-full bg-stone-100 group-hover:bg-amber-500 group-hover:text-slate-950 flex items-center justify-center transition-colors">
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
