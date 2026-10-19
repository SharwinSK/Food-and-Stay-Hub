/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  ShoppingBag, 
  Clock, 
  ChefHat, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  ChevronDown, 
  ChevronUp,
  Store,
  RefreshCw,
  Truck,
  Bike,
  MapPin,
  Banknote,
  Building2,
  AlertCircle
} from "lucide-react";
import { OrderDoc, OrderStatus } from "../types";
import { useAuth } from "../contexts/AuthContext";
import { fetchCustomerOrders } from "../lib/localDataService";
import BackButton from "./BackButton";

interface CustomerOrdersPageProps {
  onNavigateToExplore: () => void;
  onBack?: () => void;
  backLabel?: string;
}

export default function CustomerOrdersPage({ onNavigateToExplore, onBack, backLabel }: CustomerOrdersPageProps) {
  const { userProfile } = useAuth();
  const [orders, setOrders] = useState<OrderDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const loadOrders = async () => {
    setLoading(true);
    const customerId = userProfile?.uid || userProfile?.id || "guest-customer";
    const list = await fetchCustomerOrders(customerId);
    setOrders(list);
    setLoading(false);
  };

  useEffect(() => {
    loadOrders();
    const interval = setInterval(() => {
      const customerId = userProfile?.uid || userProfile?.id || "guest-customer";
      fetchCustomerOrders(customerId).then(setOrders);
    }, 10000);
    return () => clearInterval(interval);
  }, [userProfile]);

  const statusColors: Record<OrderStatus, string> = {
    Pending: "bg-amber-100 text-amber-900 border-amber-300",
    Accepted: "bg-blue-100 text-blue-900 border-blue-300",
    Preparing: "bg-purple-100 text-purple-900 border-purple-300",
    Ready: "bg-teal-100 text-teal-900 border-teal-300",
    Completed: "bg-emerald-100 text-emerald-900 border-emerald-300"
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      
      {/* Top-Left Back Navigation */}
      <div className="flex items-center justify-start">
        <BackButton onClick={onBack || onNavigateToExplore} label={backLabel || "Back"} id="orders_back_btn" />
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-amber-800 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
            <Clock className="h-3.5 w-3.5 text-amber-600" />
            <span>Order History & Real-Time Tracking</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-serif text-[#1A1A1A]">
            My Dining Orders
          </h1>
          <p className="text-xs sm:text-sm text-stone-600">
            Track status updates and review your customized recipe ingredient breakdowns.
          </p>
        </div>

        <button
          onClick={loadOrders}
          className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 text-xs font-bold hover:bg-stone-50 transition-all self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="text-center py-16 text-stone-400 text-xs">Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-stone-300 space-y-4">
          <ShoppingBag className="h-12 w-12 text-stone-300 mx-auto" />
          <div className="space-y-1">
            <p className="text-base font-bold text-stone-800">You have no active or past orders</p>
            <p className="text-xs text-stone-500">Order customized dishes from local restaurants and track them here.</p>
          </div>
          <button
            onClick={onNavigateToExplore}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/20 cursor-pointer"
          >
            Explore Restaurants Now
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isExpanded = expandedId === order.id;

            return (
              <div
                key={order.id}
                className="bg-white rounded-3xl border border-stone-200/90 shadow-sm overflow-hidden"
              >
                {/* Main Card Header */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : order.id)}
                  className="p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer hover:bg-stone-50/70"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2.5">
                      <span className="font-mono text-xs font-bold text-stone-500">
                        #{order.orderNumber || order.id.substring(0, 8)}
                      </span>
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
                            ? "Paid"
                            : order.paymentStatus === "pending_verification"
                            ? "Verifying Payment"
                            : "Cash Pending"}
                        </span>
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-stone-900">
                      {order.dishName} &times; {order.quantity}
                    </h3>
                    <p className="text-xs text-stone-500 flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span>{order.restaurantName}</span>
                      <span>&bull;</span>
                      <span>Placed on {new Date(Number(order.createdAt)).toLocaleDateString()} at {new Date(Number(order.createdAt)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {order.deliveryDistanceKm !== undefined && (
                        <>
                          <span>&bull;</span>
                          <span className="font-semibold text-stone-700">{order.deliveryDistanceKm} km</span>
                        </>
                      )}
                    </p>
                  </div>

                  <div className="flex items-center space-x-4 self-end sm:self-center">
                    <div className="text-right">
                      <span className="text-base font-black text-amber-700 block">
                        RM {Number(order.finalPrice).toFixed(2)}
                      </span>
                      <span className="text-[10px] text-stone-400">
                        {order.ingredientsUsed.length} recipe ingredients
                      </span>
                    </div>
                    <div className="p-2 text-stone-400">
                      {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Details Drawer */}
                {isExpanded && (
                  <div className="p-5 sm:p-6 bg-stone-50 border-t border-stone-100 space-y-4">
                    <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center space-x-2">
                      <ChefHat className="h-4 w-4 text-amber-600" />
                      <span>Ingredient Customization Summary</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {order.ingredientsUsed.map((ing, idx) => (
                        <div
                          key={idx}
                          className="bg-white p-3 rounded-xl border border-stone-200/70 flex items-center justify-between text-xs"
                        >
                          <span className="font-semibold text-stone-800">{ing.name}</span>
                          <span className="font-mono font-bold text-stone-900">
                            {ing.chosenGrams}g
                            {ing.diffGrams !== 0 && (
                              <span className={`ml-1 text-[10px] ${ing.diffGrams > 0 ? "text-emerald-700" : "text-rose-700"}`}>
                                ({ing.diffGrams > 0 ? `+${ing.diffGrams}g` : `${ing.diffGrams}g`})
                              </span>
                            )}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Delivery Trip info */}
                    {(order.deliveryService || order.deliveryAddress) && (
                      <div className="p-3.5 bg-white rounded-xl border border-stone-200/80 space-y-2 text-xs">
                        <div className="flex items-center justify-between font-semibold text-stone-800 border-b border-stone-100 pb-1.5">
                          <span className="flex items-center space-x-1.5">
                            {order.deliveryService === "Grab" ? (
                              <Bike className="h-4 w-4 text-emerald-600" />
                            ) : (
                              <Truck className="h-4 w-4 text-amber-600" />
                            )}
                            <span>{order.deliveryService || "Delivery Option"}</span>
                          </span>
                          {order.deliveryFee !== undefined && (
                            <span className="text-amber-800">
                              Delivery Fee: RM {Number(order.deliveryFee).toFixed(2)}
                            </span>
                          )}
                        </div>

                        {order.deliveryAddress && (
                          <div className="flex items-start space-x-1.5 text-[11px] text-stone-600">
                            <MapPin className="h-3.5 w-3.5 text-rose-500 shrink-0 mt-0.5" />
                            <span>Destination: <strong>{order.deliveryAddress}</strong></span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Payment Info Card */}
                    <div className="bg-white rounded-2xl p-4 border border-stone-200/80 space-y-2 text-xs">
                      <div className="flex items-center justify-between font-bold text-stone-800 border-b border-stone-100 pb-2">
                        <span className="flex items-center space-x-1.5">
                          {order.paymentMethod === "bank_transfer" ? (
                            <Building2 className="h-4 w-4 text-blue-600" />
                          ) : (
                            <Banknote className="h-4 w-4 text-amber-600" />
                          )}
                          <span>Payment Method: {order.paymentMethod === "bank_transfer" ? "Bank Transfer (Maybank / DuitNow QR)" : "Cash on Delivery / Pickup"}</span>
                        </span>
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                          order.paymentStatus === "verified" || order.paymentStatus === "paid"
                            ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                            : order.paymentStatus === "pending_verification"
                            ? "bg-blue-100 text-blue-900 border-blue-300"
                            : "bg-amber-100 text-amber-900 border-amber-300"
                        }`}>
                          {order.paymentStatus === "verified"
                            ? "Verified"
                            : order.paymentStatus === "paid"
                            ? "Paid"
                            : order.paymentStatus === "pending_verification"
                            ? "Pending Verification"
                            : "Cash Pending"}
                        </span>
                      </div>

                      <div className="text-[11px] text-stone-600">
                        {order.paymentMethod === "bank_transfer" ? (
                          order.paymentStatus === "verified" ? (
                            <p className="text-emerald-700 font-medium">
                              &bull; Bank transfer verified by the restaurant kitchen.
                            </p>
                          ) : (
                            <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200/80 text-amber-900 flex items-start space-x-2">
                              <AlertCircle className="h-3.5 w-3.5 text-amber-700 shrink-0 mt-0.5" />
                              <span className="font-semibold text-xs leading-relaxed">
                                Your order is confirmed — please complete the transfer if not done, the restaurant will verify your payment.
                              </span>
                            </div>
                          )
                        ) : (
                          <p className="text-stone-700">
                            &bull; Please prepare exact cash of <strong>RM {Number(order.finalPrice).toFixed(2)}</strong> for handover upon delivery or collection.
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="pt-1 flex items-center justify-between text-xs">
                      <span className="text-stone-500 font-medium">Order Reference: #{order.orderNumber || order.id.substring(0, 8)}</span>
                      <span className="text-stone-500">
                        Kitchen Status: <strong className="text-stone-800">{order.status}</strong>
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
