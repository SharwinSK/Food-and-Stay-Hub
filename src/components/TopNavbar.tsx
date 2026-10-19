/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { UtensilsCrossed, Building, LogOut, ShoppingBag, Store, User, Compass, Menu, X } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

interface TopNavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  cartCount?: number;
  onOpenCart?: () => void;
}

export default function TopNavbar({ currentView, onNavigate, cartCount = 0, onOpenCart }: TopNavbarProps) {
  const { userProfile, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleMobileNav = (view: string) => {
    setMobileMenuOpen(false);
    onNavigate(view);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-stone-200/80 px-4 sm:px-8 py-3.5 shadow-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo */}
        <div 
          onClick={() => onNavigate("home")} 
          className="flex items-center space-x-2.5 cursor-pointer select-none group"
        >
          <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
            <UtensilsCrossed className="h-5 w-5" />
          </div>
          <div>
            <span className="font-serif font-black text-lg text-stone-900 tracking-tight block leading-tight">
              FOOD & STAY HUB
            </span>
            <span className="text-[10px] text-amber-600 font-bold uppercase tracking-wider block">
              Hospitality & Custom Dining
            </span>
          </div>
        </div>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center space-x-1">
          <button
            onClick={() => onNavigate("home")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              currentView === "home" ? "bg-stone-900 text-white" : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
            }`}
          >
            Home Dashboard
          </button>
          <button
            onClick={() => onNavigate("order_food")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              currentView === "order_food" || currentView === "restaurant_menu" || currentView === "dish_customize"
                ? "bg-amber-500 text-stone-950 font-bold"
                : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
            }`}
          >
            Order Food
          </button>
          <button
            onClick={() => onNavigate("my_orders")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              currentView === "my_orders" ? "bg-stone-900 text-white" : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
            }`}
          >
            My Orders
          </button>
          <button
            onClick={() => onNavigate("manage_business")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              currentView === "manage_business" || currentView === "register_business"
                ? "bg-stone-900 text-white"
                : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
            }`}
          >
            Manage Restaurant / Hotel
          </button>
          <button
            onClick={() => onNavigate("location_search")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              currentView === "location_search" ? "bg-stone-900 text-white" : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
            }`}
          >
            Search by Map
          </button>
          {userProfile?.role === "admin" && (
            <button
              onClick={() => onNavigate("admin")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                currentView === "admin" ? "bg-amber-600 text-white font-bold" : "text-amber-700 hover:text-amber-900 hover:bg-amber-50"
              }`}
            >
              Admin Panel
            </button>
          )}
        </nav>

        {/* Right actions: Cart, User Profile & Log Out */}
        <div className="flex items-center space-x-3">
          
          {/* Cart Icon */}
          <button
            onClick={onOpenCart}
            className="relative p-2 rounded-xl text-stone-700 hover:bg-amber-50 hover:text-amber-700 transition-all cursor-pointer"
            title="View Cart"
          >
            <ShoppingBag className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-500 text-stone-950 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                {cartCount}
              </span>
            )}
          </button>

          {/* User badge */}
          {userProfile && (
            <div className="flex items-center space-x-2.5 pl-2 border-l border-stone-200">
              <div className="w-8 h-8 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 font-bold text-xs uppercase overflow-hidden">
                {userProfile.photoURL ? (
                  <img src={userProfile.photoURL} alt={userProfile.name} className="w-full h-full object-cover" />
                ) : (
                  userProfile.name?.charAt(0) || <User className="h-4 w-4" />
                )}
              </div>
              <div className="hidden sm:block text-left">
                <span className="text-xs font-bold text-stone-800 block leading-none truncate max-w-[120px]">
                  {userProfile.name}
                </span>
                <span className="text-[10px] text-stone-600 block leading-tight mt-0.5 capitalize">
                  {userProfile.role || "Member"}
                </span>
              </div>

              {/* Logout Button */}
              <button
                onClick={signOut}
                className="p-1.5 rounded-lg text-stone-600 hover:text-red-600 hover:bg-red-50 transition-all ml-1 cursor-pointer"
                title="Log Out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(prev => !prev)}
            className="md:hidden p-2 rounded-xl text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
            aria-label="Toggle Navigation Menu"
            title="Menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-stone-200 mt-3 pt-3 pb-2 space-y-1 animate-fadeIn">
          <button
            onClick={() => handleMobileNav("home")}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer ${
              currentView === "home" ? "bg-stone-900 text-white" : "text-stone-700 hover:bg-stone-100"
            }`}
          >
            Home Dashboard
          </button>
          <button
            onClick={() => handleMobileNav("order_food")}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer ${
              currentView === "order_food" || currentView === "restaurant_menu" || currentView === "dish_customize"
                ? "bg-amber-500 text-stone-950 font-bold"
                : "text-stone-700 hover:bg-stone-100"
            }`}
          >
            Order Food
          </button>
          <button
            onClick={() => handleMobileNav("my_orders")}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer ${
              currentView === "my_orders" ? "bg-stone-900 text-white" : "text-stone-700 hover:bg-stone-100"
            }`}
          >
            My Orders
          </button>
          <button
            onClick={() => handleMobileNav("manage_business")}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer ${
              currentView === "manage_business" || currentView === "register_business"
                ? "bg-stone-900 text-white"
                : "text-stone-700 hover:bg-stone-100"
            }`}
          >
            Manage Restaurant / Hotel
          </button>
          <button
            onClick={() => handleMobileNav("location_search")}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer ${
              currentView === "location_search" ? "bg-stone-900 text-white" : "text-stone-700 hover:bg-stone-100"
            }`}
          >
            Search by Map
          </button>
          {userProfile?.role === "admin" && (
            <button
              onClick={() => handleMobileNav("admin")}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer ${
                currentView === "admin" ? "bg-amber-600 text-white font-bold" : "text-amber-800 hover:bg-amber-50"
              }`}
            >
              Admin Panel
            </button>
          )}
        </div>
      )}
    </header>
  );
}
