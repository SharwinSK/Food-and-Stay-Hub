/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Truck, 
  Bike, 
  MapPin, 
  CheckCircle2, 
  ArrowLeft, 
  ArrowRight,
  Loader2, 
  ShieldCheck, 
  Receipt, 
  Route 
} from "lucide-react";
import BackButton from "./BackButton";
import { ConfirmedDeliveryLocation } from "./DeliveryLocationPicker";
import { calculateDeliveryDistance } from "../lib/googleMaps";

export type DeliveryServiceType = "Restaurant Delivery" | "Grab";

export interface SelectedDeliveryOption {
  service: DeliveryServiceType;
  distanceKm: number;
  fee: number;
}

interface DeliveryServiceSelectorProps {
  customerLocation: ConfirmedDeliveryLocation;
  restaurantLocation: { latitude: number; longitude: number; name?: string; address?: string };
  subtotal: number;
  onSelectOption: (option: SelectedDeliveryOption) => void;
  onBackToLocation: () => void;
  onPlaceOrder: (option: SelectedDeliveryOption) => void;
  isSubmitting: boolean;
}

export default function DeliveryServiceSelector({
  customerLocation,
  restaurantLocation,
  subtotal,
  onSelectOption,
  onBackToLocation,
  onPlaceOrder,
  isSubmitting
}: DeliveryServiceSelectorProps) {
  const [distanceKm, setDistanceKm] = useState<number>(3.5);
  const [calculating, setCalculating] = useState(true);
  const [calculationMethod, setCalculationMethod] = useState<string>("calculating");
  const [selectedService, setSelectedService] = useState<DeliveryServiceType>("Restaurant Delivery");

  // Calculate distance on mount or when locations change
  useEffect(() => {
    let isMounted = true;
    setCalculating(true);

    const cLat = customerLocation.latitude;
    const cLng = customerLocation.longitude;
    const rLat = restaurantLocation.latitude ?? 2.8125;
    const rLng = restaurantLocation.longitude ?? 101.7978;

    calculateDeliveryDistance(cLat, cLng, rLat, rLng).then((res) => {
      if (!isMounted) return;
      console.log(`[DeliveryServiceSelector] Distance calculated using customer coordinates (${cLat}, ${cLng}) -> Restaurant (${rLat}, ${rLng}):`, {
        distanceKm: res.distanceKm,
        method: res.method,
        destinationAddress: customerLocation.formattedAddress
      });
      setDistanceKm(res.distanceKm);
      setCalculationMethod(res.method);
      setCalculating(false);

      const computedFee = selectedService === "Restaurant Delivery" 
        ? Math.round(5 * res.distanceKm * 100) / 100 
        : Math.round(7 * res.distanceKm * 100) / 100;

      onSelectOption({
        service: selectedService,
        distanceKm: res.distanceKm,
        fee: computedFee
      });
    });

    return () => {
      isMounted = false;
    };
  }, [
    customerLocation.latitude,
    customerLocation.longitude,
    restaurantLocation.latitude,
    restaurantLocation.longitude
  ]);

  // Fee Formulas according to Prompt 6:
  // 1. Restaurant Delivery = RM 5 × distance in km
  // 2. Grab = RM 7 × distance in km
  const restaurantDeliveryFee = Math.round(5 * distanceKm * 100) / 100;
  const grabDeliveryFee = Math.round(7 * distanceKm * 100) / 100;

  const currentFee = selectedService === "Restaurant Delivery" ? restaurantDeliveryFee : grabDeliveryFee;
  const finalTotal = Math.round((subtotal + currentFee) * 100) / 100;

  const handleServiceChange = (service: DeliveryServiceType) => {
    setSelectedService(service);
    const fee = service === "Restaurant Delivery" ? restaurantDeliveryFee : grabDeliveryFee;
    onSelectOption({
      service,
      distanceKm,
      fee
    });
  };

  const handleConfirmOrder = () => {
    const fee = selectedService === "Restaurant Delivery" ? restaurantDeliveryFee : grabDeliveryFee;
    onPlaceOrder({
      service: selectedService,
      distanceKm,
      fee
    });
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">
            Checkout Step 2 of 3
          </span>
          <h3 className="text-base font-bold font-serif text-stone-900">
            Choose Delivery Service
          </h3>
        </div>
        <BackButton
          onClick={onBackToLocation}
          label="Back to Location"
          id="service_back_to_location_btn"
        />
      </div>

      {/* Route & Distance Banner */}
      <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-2 text-xs">
        <div className="flex items-center justify-between text-stone-700 font-semibold border-b border-stone-200/60 pb-2">
          <div className="flex items-center space-x-1.5">
            <Route className="h-4 w-4 text-amber-600" />
            <span>Delivery Trip Route</span>
          </div>
          {calculating ? (
            <span className="inline-flex items-center space-x-1 text-stone-400 font-normal text-[11px]">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>Calculating...</span>
            </span>
          ) : (
            <span className="font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
              {distanceKm} km distance
            </span>
          )}
        </div>

        <div className="space-y-1 text-stone-600 text-[11px]">
          <div className="flex items-start space-x-2">
            <span className="text-stone-400 font-bold shrink-0">From:</span>
            <span className="truncate">{restaurantLocation.name || "Restaurant Kitchen"} ({restaurantLocation.address || "Local Kitchen"})</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-stone-400 font-bold shrink-0">To:</span>
            <span className="truncate">{customerLocation.formattedAddress}</span>
          </div>
        </div>
      </div>

      {/* Selectable Delivery Service Cards (Radio-style) */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-stone-800 uppercase tracking-wider block">
          Select Delivery Provider:
        </label>

        {/* Option 1: Restaurant Delivery */}
        <div
          onClick={() => handleServiceChange("Restaurant Delivery")}
          className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
            selectedService === "Restaurant Delivery"
              ? "border-amber-500 bg-amber-50/50 shadow-sm shadow-amber-500/10"
              : "border-stone-200 bg-white hover:border-stone-300"
          }`}
        >
          <div className="flex items-center space-x-3.5">
            <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
              selectedService === "Restaurant Delivery"
                ? "border-amber-600 bg-amber-500 text-white"
                : "border-stone-300 bg-white"
            }`}>
              {selectedService === "Restaurant Delivery" && (
                <div className="w-2 h-2 rounded-full bg-slate-950" />
              )}
            </div>

            <div className="p-2 rounded-xl bg-amber-100 text-amber-900">
              <Truck className="h-5 w-5" />
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <h4 className="text-sm font-bold text-stone-900">Restaurant Delivery</h4>
                <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">Standard</span>
              </div>
              <p className="text-[11px] text-stone-500">
                Rate: RM 5.00 / km &bull; {distanceKm} km
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-base font-black text-amber-800 block">
              RM {restaurantDeliveryFee.toFixed(2)}
            </span>
            <span className="text-[10px] text-stone-400">delivery fee</span>
          </div>
        </div>

        {/* Option 2: Grab */}
        <div
          onClick={() => handleServiceChange("Grab")}
          className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
            selectedService === "Grab"
              ? "border-emerald-500 bg-emerald-50/50 shadow-sm shadow-emerald-500/10"
              : "border-stone-200 bg-white hover:border-stone-300"
          }`}
        >
          <div className="flex items-center space-x-3.5">
            <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
              selectedService === "Grab"
                ? "border-emerald-600 bg-emerald-500 text-white"
                : "border-stone-300 bg-white"
            }`}>
              {selectedService === "Grab" && (
                <div className="w-2 h-2 rounded-full bg-white" />
              )}
            </div>

            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-900">
              <Bike className="h-5 w-5" />
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <h4 className="text-sm font-bold text-stone-900">Grab</h4>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">Express Rider</span>
              </div>
              <p className="text-[11px] text-stone-500">
                Rate: RM 7.00 / km &bull; {distanceKm} km
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-base font-black text-emerald-800 block">
              RM {grabDeliveryFee.toFixed(2)}
            </span>
            <span className="text-[10px] text-stone-400">delivery fee</span>
          </div>
        </div>
      </div>

      {/* Live Order Summary */}
      <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2.5">
        <div className="flex items-center space-x-1.5 text-xs font-bold text-stone-800 uppercase tracking-wider">
          <Receipt className="h-3.5 w-3.5 text-stone-500" />
          <span>Updated Order Total</span>
        </div>

        <div className="space-y-1.5 text-xs text-stone-600 pt-1">
          <div className="flex items-center justify-between">
            <span>Items Subtotal:</span>
            <span className="font-semibold text-stone-800">RM {subtotal.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Delivery Fee ({selectedService}):</span>
            <span className="font-semibold text-amber-700">+ RM {currentFee.toFixed(2)}</span>
          </div>
          <div className="pt-2 border-t border-stone-200 flex items-center justify-between text-sm">
            <span className="font-bold text-stone-900">Final Total:</span>
            <span className="text-lg font-black text-amber-700">RM {finalTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Proceed to Payment Button */}
      <button
        type="button"
        onClick={handleConfirmOrder}
        disabled={isSubmitting || calculating}
        className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-60"
        id="proceed_to_payment_btn"
      >
        <span>Proceed to Payment (RM {finalTotal.toFixed(2)})</span>
        <ArrowRight className="h-4 w-4" />
      </button>

    </div>
  );
}
