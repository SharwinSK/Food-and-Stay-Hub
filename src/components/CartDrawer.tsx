/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from "react";
import { 
  X, 
  Trash2, 
  ShoppingBag, 
  ChefHat, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  MapPin, 
  Truck, 
  Bike, 
  Banknote, 
  Building2, 
  Clock 
} from "lucide-react";
import { CartItem, OrderDoc, RegisteredRestaurant, PaymentMethod, PaymentStatus } from "../types";
import { useAuth } from "../contexts/AuthContext";
import { createOrder, fetchRestaurantById } from "../lib/localDataService";
import DeliveryLocationPicker, { ConfirmedDeliveryLocation } from "./DeliveryLocationPicker";
import DeliveryServiceSelector, { SelectedDeliveryOption } from "./DeliveryServiceSelector";
import PaymentMethodSelector from "./PaymentMethodSelector";
import BackButton from "./BackButton";

export type CheckoutStep = "cart" | "location" | "service" | "payment" | "success";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onRemoveItem: (cartId: string) => void;
  onClearCart: () => void;
  onOrderPlaced: (newOrders: OrderDoc[]) => void;
  currentStep?: CheckoutStep;
  onStepChange?: (step: CheckoutStep) => void;
  confirmedLocation?: ConfirmedDeliveryLocation | null;
  onLocationConfirmed?: (location: ConfirmedDeliveryLocation) => void;
  onNavigateHome?: () => void;
  onViewOrders?: () => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onRemoveItem,
  onClearCart,
  onOrderPlaced,
  currentStep: propStep,
  onStepChange,
  confirmedLocation: propLocation,
  onLocationConfirmed,
  onNavigateHome,
  onViewOrders
}: CartDrawerProps) {
  const { userProfile } = useAuth();
  
  const [internalStep, setInternalStep] = useState<CheckoutStep>("cart");
  const currentStep = propStep !== undefined ? propStep : internalStep;

  const [internalLocation, setInternalLocation] = useState<ConfirmedDeliveryLocation | null>(null);
  const confirmedLocation = propLocation !== undefined ? propLocation : internalLocation;

  const [placingOrder, setPlacingOrder] = useState(false);
  const [placedOrders, setPlacedOrders] = useState<OrderDoc[]>([]);
  const [selectedDelivery, setSelectedDelivery] = useState<SelectedDeliveryOption | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>("cash");
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<PaymentStatus>("pending");
  const [restaurantData, setRestaurantData] = useState<RegisteredRestaurant | null>(null);
  const [orderError, setOrderError] = useState<string | null>(null);

  // Keep this prop referentially stable. Recreating it during every checkout
  // render would retrigger the delivery distance effect indefinitely.
  const restaurantLocation = useMemo(() => ({
    latitude: restaurantData?.latitude ?? 2.8125,
    longitude: restaurantData?.longitude ?? 101.7978,
    name: restaurantData?.name,
    address: restaurantData?.address
  }), [
    restaurantData?.latitude,
    restaurantData?.longitude,
    restaurantData?.name,
    restaurantData?.address
  ]);

  const handleStepChange = (nextStep: CheckoutStep) => {
    setOrderError(null);
    if (onStepChange) {
      onStepChange(nextStep);
    } else {
      setInternalStep(nextStep);
    }
  };

  const handleStepBack = () => {
    if (currentStep === "payment") {
      handleStepChange("service");
    } else if (currentStep === "service") {
      handleStepChange("location");
    } else if (currentStep === "location") {
      handleStepChange("cart");
    } else if (currentStep === "cart") {
      onClose();
    } else if (currentStep === "success") {
      handleCloseDrawer();
    }
  };

  const handleCloseDrawer = () => {
    handleStepChange("cart");
    onClose();
  };

  const handleSuccessViewOrders = () => {
    handleCloseDrawer();
    if (onViewOrders) {
      onViewOrders();
    }
  };

  // Fetch restaurant coordinates for the cart items
  useEffect(() => {
    if (cartItems.length > 0) {
      const restId = cartItems[0].restaurantId;
      fetchRestaurantById(restId).then((r) => {
        if (r) {
          setRestaurantData(r);
        } else {
          setRestaurantData({
            id: restId,
            name: cartItems[0].restaurantName,
            type: "Restaurant",
            cuisineType: "Local",
            address: "Local Restaurant Kitchen",
            city: "Nilai",
            contactPhone: "",
            description: "",
            coverPhotoUrl: "",
            ownerId: "seed",
            latitude: 2.8125,
            longitude: 101.7978,
            createdAt: Date.now()
          });
        }
      });
    }
  }, [cartItems]);

  if (!isOpen) return null;

  const subtotalAmount = cartItems.reduce((sum, item) => sum + item.finalPrice * item.quantity, 0);

  const handleLocationConfirmed = (location: ConfirmedDeliveryLocation) => {
    if (onLocationConfirmed) {
      onLocationConfirmed(location);
    } else {
      setInternalLocation(location);
    }
    handleStepChange("service");
  };

  // When Delivery Service is chosen, proceed to Payment step
  const handleDeliveryServiceChosen = (deliveryOption: SelectedDeliveryOption) => {
    setSelectedDelivery(deliveryOption);
    handleStepChange("payment");
  };

  // Place order with confirmed delivery and payment details
  const handleFinalCheckout = async (paymentMethod: PaymentMethod, paymentStatus: PaymentStatus) => {
    if (cartItems.length === 0) return;
    if (!confirmedLocation) {
      setOrderError("Please confirm your delivery location before placing your order.");
      return;
    }

    const delivery = selectedDelivery || {
      service: "Restaurant Delivery" as const,
      distanceKm: 3.5,
      fee: 17.50
    };

    setPlacingOrder(true);
    setSelectedPaymentMethod(paymentMethod);
    setSelectedPaymentStatus(paymentStatus);

    console.log("[CartDrawer] Final Checkout:", {
      confirmedLocation,
      deliveryOption: delivery,
      paymentMethod,
      paymentStatus
    });

    try {
      const customerId = userProfile?.uid || userProfile?.id || "guest-customer";
      const customerName = userProfile?.name || "Valued Customer";
      const customerEmail = userProfile?.email || "";

      // Compute total delivery fee or distribute per order
      const deliveryFee = delivery.fee;
      const deliveryService = delivery.service;
      const deliveryDistanceKm = delivery.distanceKm;

      const createdOrders: OrderDoc[] = [];

      // If multiple items, assign delivery details to each order
      for (let i = 0; i < cartItems.length; i++) {
        const item = cartItems[i];
        // Only charge the delivery fee once on the first item in the cart or split evenly
        const itemDeliveryFee = i === 0 ? deliveryFee : 0;

        const order = await createOrder({
          customerId,
          customerName,
          customerEmail,
          restaurantId: item.restaurantId,
          restaurantName: item.restaurantName,
          dishName: item.dishName,
          orderType: item.orderType,
          ingredientsUsed: item.ingredientsUsed,
          quantity: item.quantity,
          finalPrice: item.finalPrice * item.quantity + itemDeliveryFee,
          status: "Pending",
          deliveryService,
          deliveryDistanceKm,
          deliveryFee,
          deliveryAddress: confirmedLocation.formattedAddress,
          deliveryLocation: {
            latitude: confirmedLocation.latitude,
            longitude: confirmedLocation.longitude,
            formattedAddress: confirmedLocation.formattedAddress
          },
          paymentMethod,
          paymentStatus
        });
        createdOrders.push(order);
      }

      setPlacedOrders(createdOrders);
      handleStepChange("success");
      onClearCart();
      onOrderPlaced(createdOrders);
    } catch (err) {
      console.error("Order placement error:", err);
      setOrderError("Unable to submit order to the kitchen right now. Please verify your details and try again.");
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between border-l border-stone-200 animate-slideLeft overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-100 flex items-center justify-between gap-2">
          <div className="flex items-center space-x-2.5">
            <BackButton
              onClick={handleStepBack}
              label={
                currentStep === "cart"
                  ? "Back to Menu"
                  : currentStep === "location"
                  ? "Back to Cart"
                  : currentStep === "service"
                  ? "Back to Location"
                  : currentStep === "payment"
                  ? "Back to Delivery"
                  : "Close"
              }
              id="cart_header_back_btn"
              className="py-1 px-2.5 text-xs"
            />
            <div className="flex items-center space-x-1.5">
              <ShoppingBag className="h-4 w-4 text-amber-600 hidden sm:block" />
              <h2 className="text-sm sm:text-base font-bold font-serif text-stone-900 truncate">
                {currentStep === "cart"
                  ? "Your Dining Cart"
                  : currentStep === "location"
                  ? "Delivery Location"
                  : currentStep === "service"
                  ? "Delivery Service"
                  : currentStep === "payment"
                  ? "Payment Method"
                  : "Order Confirmation"}
              </h2>
            </div>
            {currentStep === "cart" && (
              <span className="text-xs bg-stone-100 text-stone-700 font-bold px-2 py-0.5 rounded-full">
                {cartItems.length}
              </span>
            )}
          </div>
          <button
            onClick={handleCloseDrawer}
            className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
            title="Close Drawer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body based on step */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          
          {/* Order Error Notification */}
          {orderError && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start space-x-2 text-rose-800 text-xs animate-fadeIn">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold">Order submission failed</p>
                <p className="text-[11px] text-rose-700">{orderError}</p>
              </div>
            </div>
          )}
          
          {/* STEP 5: SUCCESS */}
          {currentStep === "success" ? (
            <div className="py-8 text-center space-y-5 animate-fadeIn">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-xl font-bold font-serif text-stone-900">Order Placed Successfully!</h3>
                <p className="text-xs text-stone-500 max-w-xs mx-auto">
                  Your customized recipes have been transmitted to the restaurant kitchen and assigned for live delivery.
                </p>
                {placedOrders.length > 0 && (
                  <div className="pt-2">
                    <span className="text-[11px] font-bold text-stone-700 bg-stone-100 px-3 py-1 rounded-full">
                      Ref: #{placedOrders.map(o => o.orderNumber || o.id.substring(0, 6)).join(", #")}
                    </span>
                  </div>
                )}
              </div>

              {/* Payment Method Details Summary Card (Requirement 4) */}
              <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200/80 text-left space-y-2 text-xs">
                <div className="flex items-center justify-between font-bold text-stone-800 border-b border-stone-200/60 pb-2">
                  <span className="flex items-center space-x-1.5">
                    {selectedPaymentMethod === "cash" ? (
                      <Banknote className="h-4 w-4 text-amber-600" />
                    ) : (
                      <Building2 className="h-4 w-4 text-blue-600" />
                    )}
                    <span>Payment: {selectedPaymentMethod === "cash" ? "Cash on Delivery" : "Bank Transfer"}</span>
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    selectedPaymentStatus === "pending_verification"
                      ? "bg-blue-50 text-blue-800 border-blue-200"
                      : "bg-amber-50 text-amber-800 border-amber-200"
                  }`}>
                    {selectedPaymentStatus === "pending_verification" ? "Pending Verification" : "Pending (Cash)"}
                  </span>
                </div>

                <div className="space-y-1.5 text-[11px] text-stone-600 pt-0.5">
                  {selectedPaymentMethod === "cash" ? (
                    <p className="text-stone-700">
                      Please prepare cash payment for handover upon delivery or pickup.
                    </p>
                  ) : (
                    <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200/70 text-amber-900 space-y-1">
                      <div className="flex items-start space-x-1.5">
                        <AlertCircle className="h-3.5 w-3.5 text-amber-700 shrink-0 mt-0.5" />
                        <span className="font-semibold text-xs leading-relaxed">
                          Your order is confirmed — please complete the transfer if not done, the restaurant will verify your payment.
                        </span>
                      </div>
                      <p className="text-[10px] text-amber-800 pl-5">
                        Bank: Maybank &bull; A/C: 1234 5678 9012 (Sample test transfer)
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Delivery Details Summary Card */}
              {confirmedLocation && selectedDelivery && (
                <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200/80 text-left space-y-2 text-xs">
                  <div className="flex items-center justify-between font-bold text-stone-800 border-b border-stone-200/60 pb-2">
                    <span className="flex items-center space-x-1.5">
                      {selectedDelivery.service === "Grab" ? (
                        <Bike className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <Truck className="h-4 w-4 text-amber-600" />
                      )}
                      <span>{selectedDelivery.service}</span>
                    </span>
                    <span className="text-amber-800">Fee: RM {selectedDelivery.fee.toFixed(2)}</span>
                  </div>

                  <div className="space-y-1 text-[11px] text-stone-600">
                    <p>
                      <strong>Destination:</strong> {confirmedLocation.formattedAddress}
                    </p>
                    <p>
                      <strong>Trip Distance:</strong> {selectedDelivery.distanceKm} km
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-2 pt-2">
                <button
                  onClick={handleSuccessViewOrders}
                  className="w-full px-6 py-3.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-600 transition-all cursor-pointer shadow-md flex items-center justify-center space-x-2"
                  id="order_success_view_orders_btn"
                >
                  <Clock className="h-4 w-4" />
                  <span>View My Orders & Track Live Status</span>
                </button>
                <button
                  onClick={handleCloseDrawer}
                  className="w-full px-6 py-3 rounded-xl bg-stone-100 text-stone-700 font-semibold text-xs hover:bg-stone-200 transition-all cursor-pointer flex items-center justify-center space-x-2"
                  id="order_success_continue_menu_btn"
                >
                  <span>Continue Browsing Menu</span>
                </button>
              </div>
            </div>
          ) : currentStep === "location" ? (
            /* STEP 2: DELIVERY LOCATION */
            <DeliveryLocationPicker
              initialLocation={confirmedLocation}
              onConfirmLocation={handleLocationConfirmed}
              onBackToCart={() => handleStepChange("cart")}
            />
          ) : currentStep === "service" && confirmedLocation ? (
            /* STEP 3: DELIVERY SERVICE SELECTION */
            <DeliveryServiceSelector
              customerLocation={confirmedLocation}
              restaurantLocation={restaurantLocation}
              subtotal={subtotalAmount}
              onSelectOption={setSelectedDelivery}
              onBackToLocation={() => handleStepChange("location")}
              onPlaceOrder={handleDeliveryServiceChosen}
              isSubmitting={placingOrder}
            />
          ) : currentStep === "payment" && confirmedLocation && selectedDelivery ? (
            /* STEP 4: PAYMENT METHOD SELECTION */
            <PaymentMethodSelector
              subtotal={subtotalAmount}
              deliveryOption={selectedDelivery}
              onBackToService={() => handleStepChange("service")}
              onProceedToOrder={handleFinalCheckout}
              isSubmitting={placingOrder}
            />
          ) : (
            /* STEP 1: CART ITEMS REVIEW */
            <div className="space-y-4">
              {cartItems.length === 0 ? (
                <div className="py-16 text-center space-y-3">
                  <ShoppingBag className="h-10 w-10 text-stone-300 mx-auto" />
                  <p className="text-sm font-bold text-stone-700">Your cart is empty</p>
                  <p className="text-xs text-stone-400">Add dishes with standard or custom ingredients from any restaurant menu.</p>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div
                    key={item.cartId}
                    className="bg-stone-50 rounded-2xl p-4 border border-stone-200/80 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start space-x-3">
                        <img src={item.photoUrl} alt={item.dishName} className="w-12 h-12 rounded-xl object-cover border border-stone-200" />
                        <div>
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 uppercase">
                            {item.orderType}
                          </span>
                          <h4 className="text-xs font-bold text-stone-900 mt-0.5">{item.dishName} &times; {item.quantity}</h4>
                          <span className="text-[10px] text-stone-500 block">{item.restaurantName}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => onRemoveItem(item.cartId)}
                        className="text-stone-400 hover:text-red-600 p-1 cursor-pointer"
                        title="Remove item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Recipe details */}
                    <div className="bg-white p-2.5 rounded-xl border border-stone-200/60 text-[11px] space-y-1">
                      {item.ingredientsUsed.map((ing, idx) => (
                        <div key={idx} className="flex items-center justify-between text-stone-600">
                          <span>{ing.name}</span>
                          <span className="font-semibold text-stone-800">
                            {ing.chosenGrams}g
                            {ing.diffGrams !== 0 && (
                              <span className={`ml-1 text-[10px] ${ing.diffGrams > 0 ? "text-emerald-600" : "text-rose-600"}`}>
                                ({ing.diffGrams > 0 ? `+${ing.diffGrams}g` : `${ing.diffGrams}g`})
                              </span>
                            )}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-stone-200 text-xs font-bold">
                      <span className="text-stone-500">Subtotal:</span>
                      <span className="text-amber-700 font-mono">RM {(item.finalPrice * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

        </div>

        {/* Footer for Step 1 (Cart Review) */}
        {currentStep === "cart" && cartItems.length > 0 && (
          <div className="p-5 sm:p-6 border-t border-stone-100 bg-stone-50 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-600 uppercase tracking-wider">Items Subtotal:</span>
              <span className="text-xl font-black text-amber-700">RM {subtotalAmount.toFixed(2)}</span>
            </div>

            <button
              type="button"
              onClick={() => handleStepChange("location")}
              className="w-full py-3 px-4 rounded-2xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 flex items-center justify-center space-x-2 transition-all cursor-pointer"
            >
              <span>Proceed to Delivery Location</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
