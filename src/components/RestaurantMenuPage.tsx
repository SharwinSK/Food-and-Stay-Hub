/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  MapPin, 
  Phone, 
  Utensils, 
  SlidersHorizontal, 
  ChefHat, 
  Sparkles, 
  ChevronRight,
  Plus
} from "lucide-react";
import { RegisteredRestaurant, MenuItemDoc } from "../types";
import { fetchMenuItemsByRestaurant } from "../lib/localDataService";
import BackButton from "./BackButton";

interface RestaurantMenuPageProps {
  restaurant: RegisteredRestaurant;
  onBack: () => void;
  onSelectDish: (dish: MenuItemDoc) => void;
}

export default function RestaurantMenuPage({ restaurant, onBack, onSelectDish }: RestaurantMenuPageProps) {
  const [menuItems, setMenuItems] = useState<MenuItemDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    async function load() {
      setLoading(true);
      const list = await fetchMenuItemsByRestaurant(restaurant.id);
      setMenuItems(list);
      setLoading(false);
    }
    load();
  }, [restaurant.id]);

  const categories = ["All", ...Array.from(new Set(menuItems.map(m => m.category).filter(Boolean)))];

  const filteredDishes = menuItems.filter(dish => {
    if (selectedCategory === "All") return true;
    return dish.category === selectedCategory;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      
      {/* Top-Left Back Navigation */}
      <div className="flex items-center justify-start">
        <BackButton onClick={onBack} label="Back to Restaurants" id="menu_back_btn" />
      </div>

      {/* Restaurant Header Hero */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-md overflow-hidden">
        <div className="h-56 sm:h-72 w-full relative bg-stone-900">
          <img
            src={restaurant.coverPhotoUrl}
            alt={restaurant.name}
            className="w-full h-full object-cover opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/40 to-transparent flex flex-col justify-between p-6 sm:p-8">
            <button
              onClick={onBack}
              className="self-start inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white text-xs font-bold transition-all cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Restaurants</span>
            </button>

            <div className="space-y-2 text-white">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold px-2.5 py-1 rounded bg-amber-500 text-slate-950 uppercase">
                  {restaurant.type}
                </span>
                <span className="text-xs font-semibold text-amber-200">
                  {restaurant.cuisineType} Cuisine
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black font-serif tracking-tight">
                {restaurant.name}
              </h1>
              <p className="text-xs sm:text-sm text-stone-300 max-w-2xl">
                {restaurant.description}
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-stone-300 pt-1">
                <span className="flex items-center space-x-1">
                  <MapPin className="h-3.5 w-3.5 text-amber-400" />
                  <span>{restaurant.address}, {restaurant.city}</span>
                </span>
                {restaurant.contactPhone && (
                  <span className="flex items-center space-x-1">
                    <Phone className="h-3.5 w-3.5 text-amber-400" />
                    <span>{restaurant.contactPhone}</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              selectedCategory === cat
                ? "bg-amber-500 text-slate-950 shadow-sm"
                : "bg-white text-stone-700 border border-stone-200 hover:bg-stone-100"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Dishes Grid */}
      {loading ? (
        <div className="text-center py-16 text-stone-400 text-xs">Loading delicious dishes...</div>
      ) : filteredDishes.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-stone-300 space-y-3">
          <ChefHat className="h-10 w-10 text-stone-300 mx-auto" />
          <p className="text-sm font-bold text-stone-800">No dishes available in this category</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredDishes.map((dish) => (
            <div
              key={dish.id}
              onClick={() => onSelectDish(dish)}
              className="group bg-white rounded-3xl border border-stone-200/90 shadow-md hover:shadow-xl hover:border-amber-400 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 cursor-pointer transition-all duration-300"
            >
              <div className="flex items-start space-x-4">
                <img
                  src={dish.photoUrl}
                  alt={dish.name}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border border-stone-200 shrink-0 group-hover:scale-105 transition-transform duration-300"
                />
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-stone-100 text-stone-700 uppercase">
                    {dish.category}
                  </span>
                  <h3 className="text-base font-bold font-serif text-stone-900 group-hover:text-amber-700 transition-colors">
                    {dish.name}
                  </h3>
                  <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                    {dish.description}
                  </p>
                  
                  <div className="flex items-center space-x-3 pt-1">
                    <span className="text-sm font-black text-amber-700">
                      RM {Number(dish.basePrice).toFixed(2)}
                    </span>
                    <span className="inline-flex items-center space-x-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      <SlidersHorizontal className="h-3 w-3" />
                      <span>{dish.ingredients.filter(i => i.adjustable).length} Custom Ingredients</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-amber-500 group-hover:bg-amber-600 text-slate-950 font-bold text-xs shrink-0 flex items-center justify-center space-x-1.5 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
              >
                <span>Order Dish</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
