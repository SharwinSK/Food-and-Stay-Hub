/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import TopNavbar from "./components/TopNavbar";
import HomeDashboard from "./components/HomeDashboard";
import BrowseRestaurants from "./components/BrowseRestaurants";
import RestaurantMenuPage from "./components/RestaurantMenuPage";
import DishCustomizeScreen, { SavedDishCustomization } from "./components/DishCustomizeScreen";
import CustomerOrdersPage from "./components/CustomerOrdersPage";
import BusinessManagementPortal from "./components/BusinessManagementPortal";
import RestaurantRegistrationForm from "./components/RestaurantRegistrationForm";
import SearchPreferences from "./components/SearchPreferences";
import ResultsView from "./components/ResultsView";
import AdminDashboard from "./components/AdminDashboard";
import CartDrawer, { CheckoutStep } from "./components/CartDrawer";
import AIAssistantWidget from "./components/AIAssistantWidget";
import { ConfirmedDeliveryLocation } from "./components/DeliveryLocationPicker";
import { 
  RegisteredRestaurant, 
  MenuItemDoc, 
  CartItem, 
  OrderDoc, 
  PlaceResult 
} from "./types";

interface NavigationEntry {
  view: string;
  restaurant?: RegisteredRestaurant | null;
  dish?: MenuItemDoc | null;
}

function MainApp() {
  const { userProfile, signOut } = useAuth();

  // Navigation State with History Stack
  const [history, setHistory] = useState<NavigationEntry[]>([{ view: "home" }]);

  const currentEntry = history[history.length - 1] || { view: "home" };
  const currentView = currentEntry.view;
  const selectedRestaurant = currentEntry.restaurant ?? null;
  const selectedDish = currentEntry.dish ?? null;
  const previousEntry = history.length > 1 ? history[history.length - 2] : null;

  const navigateTo = (view: string, restaurant?: RegisteredRestaurant | null, dish?: MenuItemDoc | null) => {
    setHistory((prev) => {
      const top = prev[prev.length - 1];
      if (
        top &&
        top.view === view &&
        top.restaurant?.id === restaurant?.id &&
        top.dish?.id === dish?.id
      ) {
        return prev;
      }
      return [
        ...prev,
        {
          view,
          restaurant: restaurant !== undefined ? restaurant : (view === "home" ? null : top?.restaurant),
          dish: dish !== undefined ? dish : (view === "home" || view === "order_food" ? null : top?.dish)
        }
      ];
    });
  };

  const navigateBack = () => {
    setHistory((prev) => {
      if (prev.length > 1) {
        return prev.slice(0, -1);
      }
      return [{ view: "home" }];
    });
  };

  const getBackLabel = () => {
    if (!previousEntry) return "Back";
    switch (previousEntry.view) {
      case "home":
        return "Back to Home";
      case "order_food":
        return "Back to Restaurants";
      case "restaurant_menu":
        return previousEntry.restaurant?.name ? `Back to ${previousEntry.restaurant.name}` : "Back to Menu";
      case "dish_customize":
        return "Back to Customization";
      case "manage_business":
        return "Back to Properties";
      case "location_search":
        return "Back to Search Map";
      case "my_orders":
        return "Back to Orders";
      case "results_view":
        return "Back to Results";
      default:
        return "Back";
    }
  };

  // Cart & Checkout Flow State
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>("cart");
  const [confirmedDeliveryLocation, setConfirmedDeliveryLocation] = useState<ConfirmedDeliveryLocation | null>(null);
  const [savedCustomizations, setSavedCustomizations] = useState<Record<string, SavedDishCustomization>>({});

  // Map / Grounded Search Integration State
  const [searchParams, setSearchParams] = useState<any>(null);
  const [places, setPlaces] = useState<PlaceResult[]>([]);
  const [loadingPlaces, setLoadingPlaces] = useState(false);
  const [isMock, setIsMock] = useState(false);
  const [isSmartFallback, setIsSmartFallback] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Cart operations
  const handleAddToCart = (item: CartItem) => {
    setCartItems((prev) => [...prev, item]);
    setCheckoutStep("cart");
    setIsCartOpen(true);
  };

  const handleRemoveCartItem = (cartId: string) => {
    setCartItems((prev) => prev.filter((i) => i.cartId !== cartId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  // Search by Map / Region execution
  const handleExecuteSearch = async (searchData: any) => {
    setSearchParams(searchData);
    navigateTo("results_view");
    setLoadingPlaces(true);
    setSearchError(null);

    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(searchData)
      });

      const data = await res.json();
      if (res.ok) {
        setPlaces(data.places || []);
        setIsMock(Boolean(data.isMock));
        setIsSmartFallback(Boolean(data.isSmartFallback));
      } else {
        setSearchError(data.error || "Failed to find matching locations. Please try another query.");
        setPlaces([]);
      }
    } catch (err) {
      console.error("Search execution failed:", err);
      setSearchError("Network connection failure. Please check your connection and try again.");
      setPlaces([]);
    } finally {
      setLoadingPlaces(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#1A1A1A] flex flex-col font-sans selection:bg-amber-100 selection:text-amber-900">
      
      {/* Top Sticky Header */}
      <TopNavbar
        currentView={currentView}
        onNavigate={(view) => {
          navigateTo(view, null, null);
        }}
        cartCount={cartItems.reduce((acc, curr) => acc + curr.quantity, 0)}
        onOpenCart={() => {
          if (checkoutStep === "success") {
            setCheckoutStep("cart");
          }
          setIsCartOpen(true);
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        
        {/* 1. Home Dashboard with two prominent action cards */}
        {currentView === "home" && (
          <HomeDashboard
            onNavigate={(view) => {
              navigateTo(view, null, null);
            }}
          />
        )}

        {/* 2. Order Food flow */}
        {currentView === "order_food" && (
          <BrowseRestaurants
            onSelectRestaurant={(rest) => {
              navigateTo("restaurant_menu", rest, null);
            }}
            onBack={navigateBack}
            backLabel={getBackLabel()}
          />
        )}

        {/* 2b. Restaurant Menu */}
        {currentView === "restaurant_menu" && selectedRestaurant && (
          <RestaurantMenuPage
            restaurant={selectedRestaurant}
            onBack={navigateBack}
            onSelectDish={(dish) => {
              navigateTo("dish_customize", selectedRestaurant, dish);
            }}
          />
        )}

        {/* 2c. Dish Customization (Standard vs Customized) */}
        {currentView === "dish_customize" && selectedDish && selectedRestaurant && (
          <DishCustomizeScreen
            dish={selectedDish}
            restaurant={selectedRestaurant}
            onBack={navigateBack}
            onAddToCart={handleAddToCart}
            savedCustomization={savedCustomizations[selectedDish.id]}
            onSaveCustomization={(dishId, custom) => {
              setSavedCustomizations((prev) => ({ ...prev, [dishId]: custom }));
            }}
          />
        )}

        {/* 3. My Orders Tracking Page */}
        {currentView === "my_orders" && (
          <CustomerOrdersPage
            onNavigateToExplore={() => navigateTo("order_food", null, null)}
            onBack={navigateBack}
            backLabel={getBackLabel()}
          />
        )}

        {/* 4. Business Management Portal (Manage owned properties & live kitchen orders) */}
        {currentView === "manage_business" && (
          <BusinessManagementPortal
            onBack={navigateBack}
            backLabel={getBackLabel()}
          />
        )}

        {/* 4b. Explicit Register Business Form */}
        {currentView === "register_business" && (
          <RestaurantRegistrationForm
            onSuccess={() => navigateTo("manage_business")}
            onCancel={navigateBack}
            onBackToHome={navigateBack}
          />
        )}

        {/* 5. Regional Location & Map Search */}
        {currentView === "location_search" && userProfile && (
          <SearchPreferences
            user={userProfile}
            onLogout={signOut}
            onSearch={handleExecuteSearch}
            onBack={navigateBack}
            onAdminClick={() => navigateTo("admin")}
          />
        )}

        {/* 5b. Results View */}
        {currentView === "results_view" && searchParams && (
          <ResultsView
            cuisine={searchParams.cuisine}
            preference={searchParams.preference}
            location={searchParams.location}
            places={places}
            loading={loadingPlaces}
            isMock={isMock}
            isSmartFallback={isSmartFallback}
            searchError={searchError}
            onBack={navigateBack}
            onRefresh={() => handleExecuteSearch(searchParams)}
            onLogout={signOut}
          />
        )}

        {/* 6. Admin Dashboard */}
        {currentView === "admin" && userProfile && (
          <AdminDashboard
            token={`session_${userProfile.id || userProfile.uid}`}
            currentUser={userProfile}
            onBack={navigateBack}
            backLabel={getBackLabel()}
            onLogout={signOut}
          />
        )}

      </main>

      {/* Cart Drawer Modal */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
        currentStep={checkoutStep}
        onStepChange={setCheckoutStep}
        confirmedLocation={confirmedDeliveryLocation}
        onLocationConfirmed={setConfirmedDeliveryLocation}
        onOrderPlaced={(orders) => {
          navigateTo("my_orders");
        }}
        onViewOrders={() => {
          setIsCartOpen(false);
          navigateTo("my_orders");
        }}
        onNavigateHome={() => {
          setIsCartOpen(false);
          navigateTo("home", null, null);
        }}
      />

      {/* Floating AI Assistant Chat Widget (Available on every screen after login) */}
      <AIAssistantWidget />

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <MainApp />
      </ProtectedRoute>
    </AuthProvider>
  );
}
