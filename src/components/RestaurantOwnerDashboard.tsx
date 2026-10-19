/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Trash2, 
  Sliders, 
  Utensils, 
  ShoppingBag, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  DollarSign, 
  ChefHat, 
  Store, 
  Layers, 
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Edit2,
  MapPin,
  Truck,
  Bike,
  ExternalLink,
  Banknote,
  Building2
} from "lucide-react";
import { 
  RegisteredRestaurant, 
  MenuItemDoc, 
  DishIngredient, 
  OrderDoc, 
  OrderStatus,
  PaymentMethod,
  PaymentStatus
} from "../types";
import { 
  fetchMenuItemsByRestaurant, 
  createMenuItem, 
  deleteMenuItem, 
  fetchRestaurantOrders, 
  updateOrderStatus,
  updateOrderPaymentStatus
} from "../lib/localDataService";
import BackButton from "./BackButton";

interface RestaurantOwnerDashboardProps {
  restaurant: RegisteredRestaurant;
  onBack: () => void;
  onBackToHome?: () => void;
}

export default function RestaurantOwnerDashboard({ restaurant, onBack, onBackToHome }: RestaurantOwnerDashboardProps) {
  const [activeTab, setActiveTab] = useState<"menu" | "orders">("menu");

  // Menu State
  const [menuItems, setMenuItems] = useState<MenuItemDoc[]>([]);
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [showAddDishModal, setShowAddDishModal] = useState(false);

  // New Dish Form State
  const [dishName, setDishName] = useState("");
  const [category, setCategory] = useState("Main Course");
  const [dishDescription, setDishDescription] = useState("");
  const [dishPhotoUrl, setDishPhotoUrl] = useState("https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80");
  const [basePrice, setBasePrice] = useState<number>(15.00);
  const [ingredients, setIngredients] = useState<DishIngredient[]>([
    { id: "ing_1", name: "Main Protein / Rice", quantityGrams: 200, pricePerGram: 0.04, minGrams: 100, maxGrams: 400, adjustable: true },
    { id: "ing_2", name: "Signature Sauce / Sambal", quantityGrams: 50, pricePerGram: 0.06, minGrams: 20, maxGrams: 120, adjustable: true }
  ]);

  // Orders State
  const [orders, setOrders] = useState<OrderDoc[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);

  // Load Menu and Orders
  const loadData = async () => {
    setLoadingMenu(true);
    setLoadingOrders(true);
    const [menus, ords] = await Promise.all([
      fetchMenuItemsByRestaurant(restaurant.id),
      fetchRestaurantOrders(restaurant.id)
    ]);
    setMenuItems(menus);
    setOrders(ords);
    setLoadingMenu(false);
    setLoadingOrders(false);
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(() => {
      fetchRestaurantOrders(restaurant.id).then(setOrders);
    }, 10000); // Polling incoming orders
    return () => clearInterval(interval);
  }, [restaurant.id]);

  // Ingredient Helpers
  const addIngredientRow = () => {
    const newId = `ing_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;
    setIngredients([
      ...ingredients,
      {
        id: newId,
        name: "",
        quantityGrams: 50,
        pricePerGram: 0.05,
        minGrams: 0,
        maxGrams: 150,
        adjustable: true
      }
    ]);
  };

  const updateIngredientRow = (index: number, updates: Partial<DishIngredient>) => {
    const updated = [...ingredients];
    updated[index] = { ...updated[index], ...updates };
    setIngredients(updated);
  };

  const removeIngredientRow = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleCreateDish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dishName.trim()) return;

    try {
      const created = await createMenuItem({
        restaurantId: restaurant.id,
        name: dishName,
        category,
        description: dishDescription,
        photoUrl: dishPhotoUrl,
        basePrice: Number(basePrice) || 10,
        ingredients: ingredients.filter(ing => ing.name.trim().length > 0),
        createdAt: Date.now()
      });

      setMenuItems([created, ...menuItems]);
      setShowAddDishModal(false);
      // Reset form
      setDishName("");
      setDishDescription("");
      setBasePrice(15.00);
      setIngredients([
        { id: "ing_1", name: "Main Protein / Rice", quantityGrams: 200, pricePerGram: 0.04, minGrams: 100, maxGrams: 400, adjustable: true }
      ]);
    } catch (err) {
      console.error("Dish creation failed:", err);
    }
  };

  const handleDeleteDish = async (id: string) => {
    try {
      await deleteMenuItem(id);
      setMenuItems(menuItems.filter(m => m.id !== id));
      setConfirmingDeleteId(null);
    } catch (err) {
      console.error("Failed to delete dish:", err);
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    await updateOrderStatus(orderId, newStatus);
    setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
  };

  const handleUpdatePaymentStatus = async (orderId: string, newPaymentStatus: PaymentStatus) => {
    await updateOrderPaymentStatus(orderId, newPaymentStatus);
    setOrders(orders.map(o => o.id === orderId ? { ...o, paymentStatus: newPaymentStatus } : o));
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      
      {/* Top Bar Navigation & Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm">
        <div className="space-y-2">
          <div className="flex items-center space-x-3 mb-1">
            <BackButton onClick={onBack} label="Back to Properties" id="owner_back_props_btn" />
            {onBackToHome && (
              <button
                type="button"
                onClick={onBackToHome}
                className="inline-flex items-center space-x-1 text-xs text-stone-500 hover:text-stone-800 transition-colors cursor-pointer"
                title="Go directly to Home Dashboard"
              >
                <span>&bull; Home Dashboard</span>
              </button>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl sm:text-3xl font-black font-serif text-[#1A1A1A]">
              {restaurant.name}
            </h1>
            <span className="text-[10px] bg-amber-100 text-amber-900 border border-amber-300 font-bold px-2.5 py-0.5 rounded-full uppercase">
              {restaurant.type}
            </span>
          </div>
          <p className="text-xs text-stone-600">
            {restaurant.address}, {restaurant.city} &bull; {restaurant.cuisineType} Cuisine &bull; {restaurant.contactPhone}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-stone-100 p-1.5 rounded-2xl border border-stone-200 self-start md:self-auto">
          <button
            onClick={() => setActiveTab("menu")}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 ${
              activeTab === "menu"
                ? "bg-white text-stone-900 shadow-sm"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            <Utensils className="h-4 w-4 text-amber-600" />
            <span>Menu & Recipes ({menuItems.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 ${
              activeTab === "orders"
                ? "bg-white text-stone-900 shadow-sm"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            <ShoppingBag className="h-4 w-4 text-amber-600" />
            <span>Live Orders ({orders.length})</span>
          </button>
        </div>
      </div>

      {/* ===================== TAB A: MENU MANAGEMENT ===================== */}
      {activeTab === "menu" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold font-serif text-[#1A1A1A]">Menu Dishes & Ingredient Customization Rules</h2>
              <p className="text-xs text-stone-600">Define default ingredient gram quantities, prices per gram, and custom limits for each recipe.</p>
            </div>
            <button
              onClick={() => setShowAddDishModal(true)}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-4 py-2.5 rounded-2xl text-xs flex items-center space-x-2 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Add New Dish</span>
            </button>
          </div>

          {loadingMenu ? (
            <div className="text-center py-12 text-stone-400 text-xs">Loading menu items...</div>
          ) : menuItems.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-stone-300 space-y-4">
              <ChefHat className="h-12 w-12 text-stone-300 mx-auto" />
              <div className="space-y-1">
                <p className="text-base font-bold text-stone-800">No dishes on the menu yet</p>
                <p className="text-xs text-stone-500">Click "Add New Dish" above to create your first customizable recipe.</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {menuItems.map((dish) => (
                <div 
                  key={dish.id} 
                  className="bg-white rounded-3xl border border-stone-200/90 shadow-md p-6 space-y-5 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start space-x-3.5">
                        <img 
                          src={dish.photoUrl} 
                          alt={dish.name} 
                          className="w-16 h-16 rounded-2xl object-cover border border-stone-200 shrink-0" 
                        />
                        <div>
                          <span className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md uppercase">
                            {dish.category}
                          </span>
                          <h3 className="text-base font-bold text-stone-900 mt-1">{dish.name}</h3>
                          <span className="text-sm font-black text-amber-700">RM {Number(dish.basePrice).toFixed(2)}</span>
                        </div>
                      </div>

                      {confirmingDeleteId === dish.id ? (
                        <div className="flex items-center space-x-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleDeleteDish(dish.id)}
                            className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold rounded-lg cursor-pointer transition-all"
                          >
                            Delete
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmingDeleteId(null)}
                            className="px-2 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 text-[11px] font-bold rounded-lg cursor-pointer transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmingDeleteId(dish.id)}
                          className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                          title="Delete Dish"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                      {dish.description}
                    </p>

                    {/* Ingredients Table */}
                    <div className="bg-stone-50 rounded-2xl p-3.5 border border-stone-200/80 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-bold text-stone-700 uppercase tracking-wider border-b border-stone-200 pb-1.5">
                        <span>Recipe Ingredients ({dish.ingredients.length})</span>
                        <span>Customization</span>
                      </div>
                      <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                        {dish.ingredients.map((ing) => (
                          <div key={ing.id} className="flex items-center justify-between text-xs py-1 border-b border-stone-100 last:border-0">
                            <div>
                              <span className="font-semibold text-stone-800">{ing.name}</span>
                              <span className="text-[10px] text-stone-500 block">
                                Default: {ing.quantityGrams}g &bull; (RM{ing.pricePerGram}/g)
                              </span>
                            </div>
                            <div className="text-right">
                              {ing.adjustable ? (
                                <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded border border-emerald-200">
                                  {ing.minGrams}g - {ing.maxGrams}g
                                </span>
                              ) : (
                                <span className="text-[10px] bg-stone-200 text-stone-600 font-semibold px-2 py-0.5 rounded">
                                  Fixed Base
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 text-[11px] text-stone-500 flex items-center justify-between border-t border-stone-100">
                    <span>Dish ID: {dish.id.substring(0, 10)}...</span>
                    <span className="text-emerald-700 font-semibold flex items-center space-x-1">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>Active on Customer Menu</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===================== TAB B: INCOMING ORDERS ===================== */}
      {activeTab === "orders" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold font-serif text-[#1A1A1A]">Kitchen Orders & Recipe Breakdown</h2>
              <p className="text-xs text-stone-600">Review incoming customer orders with highlighted gram adjustments for instant culinary preparation.</p>
            </div>
            <button
              onClick={loadData}
              className="text-xs font-bold text-amber-700 hover:text-amber-800 underline cursor-pointer"
            >
              Refresh Orders
            </button>
          </div>

          {loadingOrders ? (
            <div className="text-center py-12 text-stone-400 text-xs">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-stone-300 space-y-4">
              <ShoppingBag className="h-12 w-12 text-stone-300 mx-auto" />
              <div className="space-y-1">
                <p className="text-base font-bold text-stone-800">No incoming orders yet</p>
                <p className="text-xs text-stone-500">Orders placed by customers from the "Order Food" screen will appear here in real-time.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const isExpanded = expandedOrderId === order.id;
                const statusColors: Record<OrderStatus, string> = {
                  Pending: "bg-amber-100 text-amber-900 border-amber-300",
                  Accepted: "bg-blue-100 text-blue-900 border-blue-300",
                  Preparing: "bg-purple-100 text-purple-900 border-purple-300",
                  Ready: "bg-teal-100 text-teal-900 border-teal-300",
                  Completed: "bg-emerald-100 text-emerald-900 border-emerald-300"
                };

                return (
                  <div 
                    key={order.id} 
                    className="bg-white rounded-3xl border border-stone-200/90 shadow-sm overflow-hidden transition-all"
                  >
                    {/* Order summary bar */}
                    <div 
                      onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                      className="p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer hover:bg-stone-50/70"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2.5">
                          <span className="font-mono text-xs font-bold text-stone-500">#{order.orderNumber || order.id.substring(0, 8)}</span>
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase ${statusColors[order.status] || "bg-stone-100 text-stone-800 border-stone-300"}`}>
                            {order.status}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            order.orderType === "Customized" ? "bg-amber-500 text-slate-950" : "bg-stone-100 text-stone-700"
                          }`}>
                            {order.orderType}
                          </span>
                          {order.deliveryService && (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center space-x-1 ${
                              order.deliveryService === "Grab"
                                ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                                : "bg-amber-100 text-amber-900 border border-amber-300"
                            }`}>
                              {order.deliveryService === "Grab" ? <Bike className="h-3 w-3" /> : <Truck className="h-3 w-3" />}
                              <span>{order.deliveryService}</span>
                            </span>
                          )}

                          {/* Payment Method Badge */}
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center space-x-1 ${
                            order.paymentMethod === "bank_transfer"
                              ? "bg-blue-100 text-blue-900 border border-blue-300"
                              : "bg-stone-100 text-stone-800 border border-stone-300"
                          }`}>
                            {order.paymentMethod === "bank_transfer" ? <Building2 className="h-3 w-3" /> : <Banknote className="h-3 w-3" />}
                            <span>{order.paymentMethod === "bank_transfer" ? "Bank Transfer" : "Cash"}</span>
                          </span>

                          {/* Payment Status Badge */}
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center space-x-1 ${
                            order.paymentStatus === "verified" || order.paymentStatus === "paid"
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-300"
                              : order.paymentStatus === "pending_verification"
                              ? "bg-blue-50 text-blue-900 border border-blue-300"
                              : "bg-amber-50 text-amber-900 border border-amber-300"
                          }`}>
                            <span>
                              {order.paymentStatus === "verified"
                                ? "Transfer Verified"
                                : order.paymentStatus === "paid"
                                ? "Cash Paid"
                                : order.paymentStatus === "pending_verification"
                                ? "Verify Transfer"
                                : "Cash Pending"}
                            </span>
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-stone-900">{order.dishName} &times; {order.quantity}</h3>
                        <p className="text-xs text-stone-500">
                          Customer: <strong className="text-stone-800">{order.customerName}</strong> &bull; Ordered {new Date(Number(order.createdAt)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {order.deliveryDistanceKm !== undefined && (
                            <span> &bull; <strong className="text-stone-700">{order.deliveryDistanceKm} km delivery</strong></span>
                          )}
                        </p>
                      </div>

                      <div className="flex items-center space-x-4 self-end sm:self-center">
                        <div className="text-right">
                          <span className="text-base font-black text-amber-700 block">RM {Number(order.finalPrice).toFixed(2)}</span>
                          <span className="text-[10px] text-stone-500">{order.ingredientsUsed.length} recipe ingredients</span>
                        </div>
                        <div className="p-2 text-stone-400">
                          {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                        </div>
                      </div>
                    </div>

                    {/* Expandable Recipe and Action Drawer */}
                    {isExpanded && (
                      <div className="p-5 sm:p-6 bg-stone-50 border-t border-stone-100 space-y-6">
                        
                        {/* Recipe Preparation Details */}
                        <div className="space-y-3">
                          <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center space-x-2">
                            <ChefHat className="h-4 w-4 text-amber-600" />
                            <span>Kitchen Recipe Breakdown</span>
                          </h4>

                          {order.orderType === "Standard" ? (
                            <div className="bg-white p-4 rounded-2xl border border-stone-200 space-y-2">
                              <p className="text-xs text-stone-600 font-medium">Standard Dish Recipe (As Defined):</p>
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {order.ingredientsUsed.map((ing, idx) => (
                                  <div key={idx} className="p-2.5 bg-stone-50 rounded-xl border border-stone-200/60 text-xs">
                                    <span className="font-bold text-stone-800 block">{ing.name}</span>
                                    <span className="text-stone-500 text-[11px]">{ing.chosenGrams}g</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="bg-white p-4 rounded-2xl border border-amber-200/70 space-y-2 shadow-xs">
                              <p className="text-xs text-amber-900 font-bold">
                                Customized Customer Recipe — Please inspect the gram changes:
                              </p>
                              <div className="space-y-2">
                                {order.ingredientsUsed.map((ing, idx) => {
                                  const diff = ing.diffGrams || 0;
                                  const isIncreased = diff > 0;
                                  const isDecreased = diff < 0;

                                  return (
                                    <div 
                                      key={idx} 
                                      className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                                        isIncreased 
                                          ? "bg-emerald-50/80 border-emerald-200 text-emerald-950" 
                                          : isDecreased 
                                          ? "bg-rose-50/80 border-rose-200 text-rose-950" 
                                          : "bg-stone-50 border-stone-200 text-stone-800"
                                      }`}
                                    >
                                      <div>
                                        <span className="font-bold block">{ing.name}</span>
                                        <span className="text-[11px] opacity-75">
                                          Default: {ing.defaultGrams}g &rarr; Target: <strong>{ing.chosenGrams}g</strong>
                                        </span>
                                      </div>

                                      <div className="font-mono font-bold text-xs">
                                        {isIncreased && (
                                          <span className="inline-flex items-center text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                                            +{diff}g (EXTRA)
                                          </span>
                                        )}
                                        {isDecreased && (
                                          <span className="inline-flex items-center text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                                            {diff}g (LESS)
                                          </span>
                                        )}
                                        {!isIncreased && !isDecreased && (
                                          <span className="text-stone-500 text-[10px]">STANDARD</span>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Delivery & Dispatch Details */}
                        <div className="space-y-2.5 pt-2 border-t border-stone-200">
                          <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center space-x-2">
                            {order.deliveryService === "Grab" ? (
                              <Bike className="h-4 w-4 text-emerald-600" />
                            ) : (
                              <Truck className="h-4 w-4 text-amber-600" />
                            )}
                            <span>Delivery & Dispatch Information</span>
                          </h4>

                          <div className="bg-white p-4 rounded-2xl border border-stone-200 space-y-3 text-xs">
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-2.5">
                              <div className="flex items-center space-x-2">
                                <span className="text-stone-500 font-medium">Service:</span>
                                <span className="font-bold text-stone-900 bg-stone-100 px-2.5 py-0.5 rounded-md">
                                  {order.deliveryService || "Standard Delivery"}
                                </span>
                              </div>

                              {order.deliveryDistanceKm !== undefined && (
                                <div className="flex items-center space-x-2">
                                  <span className="text-stone-500 font-medium">Trip Distance:</span>
                                  <span className="font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-md">
                                    {order.deliveryDistanceKm} km
                                  </span>
                                </div>
                              )}

                              {order.deliveryFee !== undefined && (
                                <div className="flex items-center space-x-2">
                                  <span className="text-stone-500 font-medium">Delivery Fee:</span>
                                  <span className="font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-md">
                                    RM {Number(order.deliveryFee).toFixed(2)}
                                  </span>
                                </div>
                              )}
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px]">
                              <div className="flex items-start space-x-2 text-stone-700">
                                <MapPin className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                                <div>
                                  <span className="font-bold block">Customer Destination:</span>
                                  <span className="text-stone-600">
                                    {order.deliveryAddress || "Customer pinned doorstep location"}
                                  </span>
                                  {order.deliveryLocation && (
                                    <span className="text-[10px] text-stone-400 block font-mono">
                                      ({order.deliveryLocation.latitude.toFixed(5)}, {order.deliveryLocation.longitude.toFixed(5)})
                                    </span>
                                  )}
                                </div>
                              </div>

                              {order.deliveryLocation ? (
                                <a
                                  href={`https://www.google.com/maps/search/?api=1&query=${order.deliveryLocation.latitude},${order.deliveryLocation.longitude}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold transition-all shrink-0 self-start sm:self-center"
                                >
                                  <ExternalLink className="h-3.5 w-3.5 text-amber-700" />
                                  <span>View on Google Maps</span>
                                </a>
                              ) : order.deliveryAddress ? (
                                <a
                                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.deliveryAddress)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold transition-all shrink-0 self-start sm:self-center"
                                >
                                  <ExternalLink className="h-3.5 w-3.5 text-amber-700" />
                                  <span>View on Google Maps</span>
                                </a>
                              ) : null}
                            </div>
                          </div>
                        </div>

                        {/* Payment Verification Box */}
                        <div className="bg-white rounded-2xl p-4 border border-stone-200 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              {order.paymentMethod === "bank_transfer" ? (
                                <Building2 className="h-4 w-4 text-blue-600" />
                              ) : (
                                <Banknote className="h-4 w-4 text-emerald-600" />
                              )}
                              <h5 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                                Payment Details: {order.paymentMethod === "bank_transfer" ? "Bank Transfer (Maybank / DuitNow QR)" : "Cash on Delivery / Pickup"}
                              </h5>
                            </div>
                            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                              order.paymentStatus === "verified" || order.paymentStatus === "paid"
                                ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                : order.paymentStatus === "pending_verification"
                                ? "bg-blue-100 text-blue-900 border-blue-300"
                                : "bg-amber-100 text-amber-900 border-amber-300"
                            }`}>
                              Status: {order.paymentStatus === "pending_verification" 
                                ? "Pending Transfer Verification" 
                                : order.paymentStatus === "verified"
                                ? "Verified"
                                : order.paymentStatus === "paid"
                                ? "Paid"
                                : "Pending Cash"}
                            </span>
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs pt-1 border-t border-stone-100">
                            <p className="text-stone-600 text-[11px]">
                              {order.paymentMethod === "bank_transfer"
                                ? order.paymentStatus === "verified"
                                  ? "Bank transfer receipt verified by restaurant."
                                  : "Customer submitted 'Share Receipt'. Please check your bank statement or QR notification for RM " + Number(order.finalPrice).toFixed(2) + "."
                                : order.paymentStatus === "paid"
                                ? "Cash payment collected from customer."
                                : "Expect cash collection of RM " + Number(order.finalPrice).toFixed(2) + " upon delivery/handover."}
                            </p>

                            <div className="flex items-center space-x-2 shrink-0">
                              {order.paymentMethod === "bank_transfer" && order.paymentStatus !== "verified" && (
                                <button
                                  type="button"
                                  onClick={() => handleUpdatePaymentStatus(order.id, "verified")}
                                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center space-x-1.5"
                                >
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                  <span>Verify Transfer</span>
                                </button>
                              )}

                              {order.paymentMethod === "cash" && order.paymentStatus !== "paid" && (
                                <button
                                  type="button"
                                  onClick={() => handleUpdatePaymentStatus(order.id, "paid")}
                                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center space-x-1.5"
                                >
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                  <span>Mark Cash Paid</span>
                                </button>
                              )}

                              {(order.paymentStatus === "verified" || order.paymentStatus === "paid") && (
                                <span className="inline-flex items-center space-x-1 text-emerald-700 font-bold text-xs bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                  <span>Payment Settled</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Status Update Controls */}
                        <div className="pt-3 border-t border-stone-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <span className="text-xs font-bold text-stone-700">Update Kitchen Status:</span>
                          <div className="flex flex-wrap gap-2">
                            {(["Pending", "Accepted", "Preparing", "Ready", "Completed"] as OrderStatus[]).map((st) => (
                              <button
                                key={st}
                                onClick={() => handleUpdateStatus(order.id, st)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                  order.status === st
                                    ? "bg-stone-900 text-white shadow-sm"
                                    : "bg-white text-stone-700 border border-stone-200 hover:bg-stone-100"
                                }`}
                              >
                                {st}
                              </button>
                            ))}
                          </div>
                        </div>

                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ===================== ADD DISH MODAL ===================== */}
      {showAddDishModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div>
                <h3 className="text-xl font-bold font-serif text-[#1A1A1A]">Add New Dish with Custom Ingredients</h3>
                <p className="text-xs text-stone-500">Specify base price and granular ingredient constraints.</p>
              </div>
              <button 
                onClick={() => setShowAddDishModal(false)}
                className="text-stone-400 hover:text-stone-700 text-sm font-bold p-1 cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateDish} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-stone-700 block">Dish Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Signature Rendang Rice"
                    value={dishName}
                    onChange={(e) => setDishName(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-stone-700 block">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  >
                    <option value="Main Course">Main Course</option>
                    <option value="Specialties">Specialties</option>
                    <option value="Noodles">Noodles</option>
                    <option value="Breakfast">Breakfast</option>
                    <option value="Snacks & Sides">Snacks & Sides</option>
                    <option value="Drinks & Desserts">Drinks & Desserts</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-stone-700 block">Base Price (RM) *</label>
                  <input
                    type="number"
                    step="0.10"
                    required
                    min="1"
                    value={basePrice}
                    onChange={(e) => setBasePrice(parseFloat(e.target.value))}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-semibold text-stone-700 block">Dish Photo URL</label>
                  <input
                    type="url"
                    value={dishPhotoUrl}
                    onChange={(e) => setDishPhotoUrl(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-stone-700 block">Description</label>
                <textarea
                  rows={2}
                  placeholder="Describe flavors, spices, and ingredients..."
                  value={dishDescription}
                  onChange={(e) => setDishDescription(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                />
              </div>

              {/* Ingredients Builder Section */}
              <div className="space-y-3 pt-2 border-t border-stone-100">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                    Customizable Ingredients & Gram Rules
                  </label>
                  <button
                    type="button"
                    onClick={addIngredientRow}
                    className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center space-x-1 cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Ingredient</span>
                  </button>
                </div>

                <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                  {ingredients.map((ing, idx) => (
                    <div key={ing.id || idx} className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <input
                          type="text"
                          placeholder="Ingredient Name (e.g. Sambal, Beef)"
                          value={ing.name}
                          onChange={(e) => updateIngredientRow(idx, { name: e.target.value })}
                          className="flex-1 px-3 py-1.5 text-xs font-semibold rounded-lg border border-stone-200 bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => removeIngredientRow(idx)}
                          className="text-stone-400 hover:text-red-600 p-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        <div>
                          <span className="text-[10px] text-stone-500 block">Default (g)</span>
                          <input
                            type="number"
                            value={ing.quantityGrams}
                            onChange={(e) => updateIngredientRow(idx, { quantityGrams: Number(e.target.value) })}
                            className="w-full px-2 py-1 rounded border border-stone-200 bg-white text-xs"
                          />
                        </div>
                        <div>
                          <span className="text-[10px] text-stone-500 block">Price / g (RM)</span>
                          <input
                            type="number"
                            step="0.01"
                            value={ing.pricePerGram}
                            onChange={(e) => updateIngredientRow(idx, { pricePerGram: Number(e.target.value) })}
                            className="w-full px-2 py-1 rounded border border-stone-200 bg-white text-xs"
                          />
                        </div>
                        <div>
                          <span className="text-[10px] text-stone-500 block">Min (g)</span>
                          <input
                            type="number"
                            value={ing.minGrams}
                            onChange={(e) => updateIngredientRow(idx, { minGrams: Number(e.target.value) })}
                            className="w-full px-2 py-1 rounded border border-stone-200 bg-white text-xs"
                          />
                        </div>
                        <div>
                          <span className="text-[10px] text-stone-500 block">Max (g)</span>
                          <input
                            type="number"
                            value={ing.maxGrams}
                            onChange={(e) => updateIngredientRow(idx, { maxGrams: Number(e.target.value) })}
                            className="w-full px-2 py-1 rounded border border-stone-200 bg-white text-xs"
                          />
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 pt-1">
                        <input
                          type="checkbox"
                          id={`adj_${idx}`}
                          checked={ing.adjustable}
                          onChange={(e) => updateIngredientRow(idx, { adjustable: e.target.checked })}
                          className="rounded text-amber-600 focus:ring-amber-500"
                        />
                        <label htmlFor={`adj_${idx}`} className="text-[11px] text-stone-600 font-medium cursor-pointer">
                          Customer can adjust grams (Uncheck if fixed base like bun/plate)
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowAddDishModal(false)}
                  className="px-4 py-2 rounded-xl border border-stone-200 text-stone-700 text-xs font-bold hover:bg-stone-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/20 cursor-pointer"
                >
                  Save Dish & Recipe
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
