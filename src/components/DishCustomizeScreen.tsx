/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { 
  ArrowLeft, 
  Minus, 
  Plus, 
  SlidersHorizontal, 
  Utensils, 
  ShoppingBag, 
  Check, 
  Sparkles, 
  Lock, 
  Info,
  Scale
} from "lucide-react";
import { 
  MenuItemDoc, 
  RegisteredRestaurant, 
  CartItem, 
  CustomizedIngredientRecord 
} from "../types";
import BackButton from "./BackButton";

export interface SavedDishCustomization {
  orderType: "Standard" | "Customized";
  customGrams: Record<string, number>;
  quantity: number;
}

interface DishCustomizeScreenProps {
  dish: MenuItemDoc;
  restaurant: RegisteredRestaurant;
  onBack: () => void;
  onAddToCart: (item: CartItem) => void;
  savedCustomization?: SavedDishCustomization;
  onSaveCustomization?: (dishId: string, custom: SavedDishCustomization) => void;
}

export default function DishCustomizeScreen({ 
  dish, 
  restaurant, 
  onBack, 
  onAddToCart,
  savedCustomization,
  onSaveCustomization
}: DishCustomizeScreenProps) {
  const [orderType, setOrderType] = useState<"Standard" | "Customized">(
    savedCustomization?.orderType || "Standard"
  );
  
  // Custom grams state per ingredient
  const [customGrams, setCustomGrams] = useState<Record<string, number>>(() => {
    if (savedCustomization?.customGrams) {
      return { ...savedCustomization.customGrams };
    }
    const initial: Record<string, number> = {};
    dish.ingredients.forEach(ing => {
      initial[ing.id] = ing.quantityGrams;
    });
    return initial;
  });

  const [quantity, setQuantity] = useState<number>(savedCustomization?.quantity || 1);
  const [addedAnimation, setAddedAnimation] = useState(false);

  // Synchronize customization state so going back keeps adjustments intact
  React.useEffect(() => {
    if (onSaveCustomization) {
      onSaveCustomization(dish.id, {
        orderType,
        customGrams,
        quantity
      });
    }
  }, [dish.id, orderType, customGrams, quantity, onSaveCustomization]);

  // Stepper handlers
  const handleGramsChange = (ingredientId: string, delta: number, min: number, max: number) => {
    setCustomGrams(prev => {
      const current = prev[ingredientId] || 0;
      const next = Math.max(min, Math.min(max, current + delta));
      return { ...prev, [ingredientId]: next };
    });
  };

  // Recalculate live total price
  // Total = Base Price + sum( (current_grams - default_grams) * price_per_gram )
  const calculatedUnitPrice = useMemo(() => {
    if (orderType === "Standard") {
      return dish.basePrice;
    }

    let deltaTotal = 0;
    dish.ingredients.forEach(ing => {
      if (ing.adjustable) {
        const chosen = customGrams[ing.id] ?? ing.quantityGrams;
        const diff = chosen - ing.quantityGrams;
        deltaTotal += diff * ing.pricePerGram;
      }
    });

    const finalUnit = Math.max(dish.basePrice * 0.7, dish.basePrice + deltaTotal);
    return Math.round(finalUnit * 100) / 100;
  }, [orderType, customGrams, dish]);

  const totalPrice = Math.round(calculatedUnitPrice * quantity * 100) / 100;

  const handleAdd = () => {
    const ingredientsUsed: CustomizedIngredientRecord[] = dish.ingredients.map(ing => {
      const chosen = orderType === "Customized" && ing.adjustable 
        ? (customGrams[ing.id] ?? ing.quantityGrams) 
        : ing.quantityGrams;

      return {
        ingredientId: ing.id,
        name: ing.name,
        defaultGrams: ing.quantityGrams,
        chosenGrams: chosen,
        pricePerGram: ing.pricePerGram,
        diffGrams: chosen - ing.quantityGrams,
        adjustable: ing.adjustable
      };
    });

    const cartItem: CartItem = {
      cartId: `cart_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      menuItemId: dish.id,
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      dishName: dish.name,
      photoUrl: dish.photoUrl,
      orderType,
      basePrice: dish.basePrice,
      finalPrice: calculatedUnitPrice,
      quantity,
      ingredientsUsed
    };

    onAddToCart(cartItem);
    setAddedAnimation(true);
    setTimeout(() => {
      setAddedAnimation(false);
      onBack();
    }, 800);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      
      {/* Top-Left Back Navigation */}
      <div className="flex items-center justify-start">
        <BackButton onClick={onBack} label={`Back to ${restaurant.name}`} id="dish_back_btn" />
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-3xl border border-stone-200/90 shadow-xl overflow-hidden">
        
        {/* Dish Hero */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 sm:p-8 bg-stone-50/70 border-b border-stone-200">
          <div className="md:col-span-1 h-48 sm:h-56 rounded-2xl overflow-hidden border border-stone-200 bg-stone-200">
            <img src={dish.photoUrl} alt={dish.name} className="w-full h-full object-cover" />
          </div>
          <div className="md:col-span-2 space-y-3 flex flex-col justify-center">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded bg-amber-100 text-amber-900 uppercase">
                {dish.category}
              </span>
              <span className="text-xs text-stone-500 font-semibold">
                {restaurant.name}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-serif text-stone-900">
              {dish.name}
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              {dish.description}
            </p>
            <div className="pt-2">
              <span className="text-xs text-stone-500 block">Base Chef Price</span>
              <span className="text-2xl font-black text-amber-700">RM {Number(dish.basePrice).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Customization Body */}
        <div className="p-6 sm:p-8 space-y-8">
          
          {/* Step 1: Select Recipe Mode */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-stone-800 uppercase tracking-wider block">
              Step 1: Choose Recipe Mode
            </label>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Option A: Standard */}
              <div
                onClick={() => setOrderType("Standard")}
                className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex items-start space-x-3.5 ${
                  orderType === "Standard"
                    ? "border-amber-500 bg-amber-50/40 shadow-sm"
                    : "border-stone-200 hover:border-stone-300 bg-stone-50/40"
                }`}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                  orderType === "Standard" ? "border-amber-600 bg-amber-600 text-white" : "border-stone-300"
                }`}>
                  {orderType === "Standard" && <Check className="h-3 w-3" />}
                </div>
                <div className="space-y-1">
                  <span className="text-sm font-bold text-stone-900 block">Standard Chef Recipe</span>
                  <p className="text-xs text-stone-500">
                    The dish exactly as formulated by the restaurant chef with original ingredient gram weights.
                  </p>
                  <span className="text-xs font-bold text-amber-700 block pt-1">
                    RM {Number(dish.basePrice).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Option B: Customize */}
              <div
                onClick={() => setOrderType("Customized")}
                className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex items-start space-x-3.5 ${
                  orderType === "Customized"
                    ? "border-amber-500 bg-amber-50/40 shadow-sm"
                    : "border-stone-200 hover:border-stone-300 bg-stone-50/40"
                }`}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                  orderType === "Customized" ? "border-amber-600 bg-amber-600 text-white" : "border-stone-300"
                }`}>
                  {orderType === "Customized" && <Check className="h-3 w-3" />}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold text-stone-900">Custom Ingredient Recipe</span>
                    <span className="text-[10px] bg-amber-500 text-slate-950 font-bold px-2 py-0.5 rounded">
                      Live Gram Stepper
                    </span>
                  </div>
                  <p className="text-xs text-stone-500">
                    Adjust exact gram quantities of sambal, meat, rice, or sauce. The price adjusts live based on your portion.
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* Step 2: Custom Ingredients Steppers */}
          {orderType === "Customized" && (
            <div className="space-y-4 pt-4 border-t border-stone-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold font-serif text-stone-900">
                    Step 2: Adjust Ingredient Grams
                  </h3>
                  <p className="text-xs text-stone-500">
                    Use the steppers below to add more or less of each ingredient within the chef's allowed limits.
                  </p>
                </div>
                <div className="inline-flex items-center space-x-1 text-xs text-amber-700 bg-amber-50 px-3 py-1 rounded-xl border border-amber-200">
                  <Scale className="h-3.5 w-3.5" />
                  <span>Gram-Level Precision</span>
                </div>
              </div>

              <div className="space-y-3">
                {dish.ingredients.map((ing) => {
                  const currentGrams = customGrams[ing.id] ?? ing.quantityGrams;
                  const diff = currentGrams - ing.quantityGrams;
                  const ingredientCost = currentGrams * ing.pricePerGram;

                  return (
                    <div
                      key={ing.id}
                      className="p-4 bg-stone-50 rounded-2xl border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-sm text-stone-900">{ing.name}</span>
                          {!ing.adjustable && (
                            <span className="inline-flex items-center space-x-1 text-[10px] bg-stone-200 text-stone-600 px-2 py-0.5 rounded font-medium">
                              <Lock className="h-3 w-3" />
                              <span>Fixed Base</span>
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-stone-500">
                          Default: {ing.quantityGrams}g &bull; Rate: RM {ing.pricePerGram.toFixed(2)}/g 
                          {ing.adjustable && ` (Allowed: ${ing.minGrams}g - ${ing.maxGrams}g)`}
                        </p>
                      </div>

                      {/* Stepper Controls */}
                      {ing.adjustable ? (
                        <div className="flex items-center space-x-4 self-end sm:self-center">
                          <div className="flex items-center space-x-2 bg-white px-2 py-1 rounded-xl border border-stone-200 shadow-xs">
                            <button
                              type="button"
                              onClick={() => handleGramsChange(ing.id, -10, ing.minGrams, ing.maxGrams)}
                              disabled={currentGrams <= ing.minGrams}
                              className="w-7 h-7 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold flex items-center justify-center transition-colors cursor-pointer disabled:opacity-30"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>

                            <span className="w-16 text-center font-mono font-bold text-xs text-stone-900">
                              {currentGrams}g
                            </span>

                            <button
                              type="button"
                              onClick={() => handleGramsChange(ing.id, 10, ing.minGrams, ing.maxGrams)}
                              disabled={currentGrams >= ing.maxGrams}
                              className="w-7 h-7 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold flex items-center justify-center transition-colors cursor-pointer disabled:opacity-30"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          {/* Ingredient Subtotal / Diff */}
                          <div className="text-right min-w-[70px]">
                            <span className="text-xs font-bold text-stone-900 block">
                              RM {ingredientCost.toFixed(2)}
                            </span>
                            {diff !== 0 && (
                              <span className={`text-[10px] font-bold ${diff > 0 ? "text-emerald-700" : "text-rose-700"}`}>
                                {diff > 0 ? `+${diff}g` : `${diff}g`}
                              </span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs font-bold text-stone-500 bg-stone-200/60 px-3 py-1.5 rounded-xl">
                          Fixed {ing.quantityGrams}g (Chef Recipe)
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Sticky Checkout Bar / Actions */}
          <div className="pt-6 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            
            {/* Quantity Selector & Live Total */}
            <div className="flex items-center space-x-6 w-full sm:w-auto justify-between sm:justify-start">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-stone-600">Quantity:</span>
                <div className="flex items-center space-x-1.5 bg-stone-100 p-1 rounded-xl border border-stone-200">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-7 h-7 rounded-lg bg-white text-stone-800 font-bold flex items-center justify-center shadow-xs cursor-pointer"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="w-8 text-center font-bold text-xs">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-7 h-7 rounded-lg bg-white text-stone-800 font-bold flex items-center justify-center shadow-xs cursor-pointer"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-stone-500 uppercase font-bold block">Total Price</span>
                <span className="text-2xl font-black text-amber-700">RM {totalPrice.toFixed(2)}</span>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              type="button"
              onClick={handleAdd}
              disabled={addedAnimation}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-2 transition-all cursor-pointer"
            >
              {addedAnimation ? (
                <>
                  <Check className="h-4 w-4" />
                  <span>Added to Cart!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="h-4 w-4" />
                  <span>Add to Cart (RM {totalPrice.toFixed(2)})</span>
                </>
              )}
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}
