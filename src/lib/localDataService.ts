/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  RegisteredRestaurant, 
  MenuItemDoc, 
  OrderDoc, 
  OrderStatus,
  PaymentStatus
} from "../types";

// Browser-local persistence. This keeps the standalone app independent of
// Firebase while preserving restaurants, menus, and orders across reloads.
const LOCAL_STORAGE_RESTAURANTS_KEY = "food_stay_hub_restaurants";
const LOCAL_STORAGE_MENUS_KEY = "food_stay_hub_menus";
const LOCAL_STORAGE_ORDERS_KEY = "food_stay_hub_orders";

// Seed default sample restaurants so the customer flow is never empty
export const DEFAULT_SEED_RESTAURANTS: RegisteredRestaurant[] = [
  {
    id: "rest_selera_kampung",
    name: "Selera Kampung Heritage Kitchen",
    type: "Restaurant",
    cuisineType: "Malaysia",
    address: "Lot 14, Jalan Besar, Bandar Baru Nilai",
    city: "Nilai",
    contactPhone: "+60 12-345 6789",
    description: "Traditional Negeri Sembilan smoked meats and signature authentic Nasi Lemak made with freshly squeezed coconut milk and customizable sambal.",
    coverPhotoUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80",
    ownerId: "demo-owner-456",
    latitude: 2.8125,
    longitude: 101.7978,
    createdAt: Date.now() - 1000000
  },
  {
    id: "rest_grand_safari_hotel",
    name: "Grand Palm Suites & Dining",
    type: "Hotel",
    cuisineType: "Pakistani",
    address: "22, Persiaran Seremban Utama",
    city: "Seremban",
    contactPhone: "+60 6-765 4321",
    description: "Luxury boutique hotel featuring rooftop Claypot Dum Biryani, Mughlai BBQ platters, and room service.",
    coverPhotoUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80",
    ownerId: "demo-owner-456",
    latitude: 2.7258,
    longitude: 101.9424,
    createdAt: Date.now() - 2000000
  },
  {
    id: "rest_penang_flavour",
    name: "Penang Noodle House & Homestay",
    type: "Restaurant",
    cuisineType: "Chinese",
    address: "88, Chulia Heritage Walk",
    city: "George Town",
    contactPhone: "+60 4-261 8899",
    description: "Famous wok-hei Char Kway Teow and prawn noodles with customizable duck egg, cockles, and beansprouts.",
    coverPhotoUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80",
    ownerId: "demo-owner-789",
    latitude: 5.4141,
    longitude: 100.3288,
    createdAt: Date.now() - 3000000
  }
];

export const DEFAULT_SEED_MENUS: MenuItemDoc[] = [
  {
    id: "dish_nasi_lemak_special",
    restaurantId: "rest_selera_kampung",
    name: "Royal Sambal Nasi Lemak",
    category: "Main Course",
    description: "Fragrant pandan coconut rice served with crispy ikan bilis, toasted peanuts, cucumber slices, and slow-simmered caramelised sambal.",
    photoUrl: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&auto=format&fit=crop&q=80",
    basePrice: 12.00,
    ingredients: [
      { id: "ing_rice", name: "Scented Coconut Rice", quantityGrams: 200, pricePerGram: 0.02, minGrams: 150, maxGrams: 400, adjustable: true },
      { id: "ing_sambal", name: "Secret Slow-Cooked Sambal", quantityGrams: 50, pricePerGram: 0.05, minGrams: 20, maxGrams: 120, adjustable: true },
      { id: "ing_anchovy", name: "Crispy Anchovies (Ikan Bilis)", quantityGrams: 30, pricePerGram: 0.08, minGrams: 10, maxGrams: 80, adjustable: true },
      { id: "ing_peanuts", name: "Roasted Peanuts", quantityGrams: 25, pricePerGram: 0.04, minGrams: 0, maxGrams: 60, adjustable: true },
      { id: "ing_egg", name: "Hard Boiled Egg", quantityGrams: 50, pricePerGram: 0.04, minGrams: 50, maxGrams: 50, adjustable: false },
      { id: "ing_ayam_goreng", name: "Spiced Fried Chicken", quantityGrams: 120, pricePerGram: 0.06, minGrams: 0, maxGrams: 250, adjustable: true }
    ],
    createdAt: Date.now() - 500000
  },
  {
    id: "dish_daging_salai",
    restaurantId: "rest_selera_kampung",
    name: "Smoked Beef Masak Lemak Cili Api",
    category: "Specialties",
    description: "Authentic Negeri Sembilan smoked beef cooked in rich turmeric and fiery bird's eye chili coconut gravy.",
    photoUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80",
    basePrice: 18.50,
    ingredients: [
      { id: "ing_beef", name: "Smoked Beef Slices (Daging Salai)", quantityGrams: 150, pricePerGram: 0.09, minGrams: 100, maxGrams: 300, adjustable: true },
      { id: "ing_gravy", name: "Spicy Turmeric Coconut Gravy", quantityGrams: 180, pricePerGram: 0.03, minGrams: 100, maxGrams: 300, adjustable: true },
      { id: "ing_chili", name: "Crushed Bird's Eye Chili (Cili Padi)", quantityGrams: 15, pricePerGram: 0.08, minGrams: 0, maxGrams: 40, adjustable: true },
      { id: "ing_pucuk_ubi", name: "Tapioca Leaves (Pucuk Ubi)", quantityGrams: 40, pricePerGram: 0.03, minGrams: 0, maxGrams: 100, adjustable: true }
    ],
    createdAt: Date.now() - 400000
  },
  {
    id: "dish_dum_biryani",
    restaurantId: "rest_grand_safari_hotel",
    name: "Mutton Dum Hyderabadi Biryani",
    category: "Main Course",
    description: "Aromatic long-grain basmati rice layered with tender mutton marinated in yogurt, saffron, and whole spices.",
    photoUrl: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600&auto=format&fit=crop&q=80",
    basePrice: 22.00,
    ingredients: [
      { id: "ing_basmati", name: "Saffron Basmati Rice", quantityGrams: 220, pricePerGram: 0.03, minGrams: 150, maxGrams: 400, adjustable: true },
      { id: "ing_mutton", name: "Tender Spiced Mutton", quantityGrams: 140, pricePerGram: 0.10, minGrams: 80, maxGrams: 300, adjustable: true },
      { id: "ing_onions", name: "Fried Crispy Onions (Birista)", quantityGrams: 25, pricePerGram: 0.04, minGrams: 0, maxGrams: 70, adjustable: true },
      { id: "ing_raita", name: "Cooling Cucumber Mint Raita", quantityGrams: 60, pricePerGram: 0.03, minGrams: 30, maxGrams: 150, adjustable: true }
    ],
    createdAt: Date.now() - 300000
  },
  {
    id: "dish_char_kway_teow",
    restaurantId: "rest_penang_flavour",
    name: "Supreme Duck Egg Char Kway Teow",
    category: "Noodles",
    description: "Flat rice noodles stir-fried over intense charcoal heat with juicy prawns, cockles, lap cheong, and chives.",
    photoUrl: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&auto=format&fit=crop&q=80",
    basePrice: 14.50,
    ingredients: [
      { id: "ing_noodles", name: "Flat Rice Noodles (Kway Teow)", quantityGrams: 180, pricePerGram: 0.02, minGrams: 120, maxGrams: 350, adjustable: true },
      { id: "ing_prawns", name: "Tiger Prawns", quantityGrams: 70, pricePerGram: 0.12, minGrams: 30, maxGrams: 180, adjustable: true },
      { id: "ing_cockles", name: "Fresh Cockles (Kerang)", quantityGrams: 40, pricePerGram: 0.09, minGrams: 0, maxGrams: 100, adjustable: true },
      { id: "ing_sprouts", name: "Crisp Bean Sprouts", quantityGrams: 50, pricePerGram: 0.02, minGrams: 0, maxGrams: 120, adjustable: true },
      { id: "ing_chives", name: "Garlic Chives", quantityGrams: 20, pricePerGram: 0.03, minGrams: 0, maxGrams: 50, adjustable: true }
    ],
    createdAt: Date.now() - 200000
  }
];

// Local data helpers

export async function fetchAllRestaurants(): Promise<RegisteredRestaurant[]> {
  const stored = localStorage.getItem(LOCAL_STORAGE_RESTAURANTS_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (parsed.length > 0) return parsed;
    } catch {}
  }

  // Write default seed to local storage
  localStorage.setItem(LOCAL_STORAGE_RESTAURANTS_KEY, JSON.stringify(DEFAULT_SEED_RESTAURANTS));
  return DEFAULT_SEED_RESTAURANTS;
}

export async function fetchUserRestaurants(ownerId: string): Promise<RegisteredRestaurant[]> {
  const all = await fetchAllRestaurants();
  return all.filter(r => r.ownerId === ownerId);
}

export async function fetchRestaurantById(restaurantId: string): Promise<RegisteredRestaurant | null> {
  const all = await fetchAllRestaurants();
  return all.find(r => r.id === restaurantId) || null;
}

export async function createRestaurant(data: Omit<RegisteredRestaurant, "id">): Promise<RegisteredRestaurant> {
  const newId = `rest_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const restaurant: RegisteredRestaurant = {
    ...data,
    id: newId,
    createdAt: Date.now()
  };

  const current = await fetchAllRestaurants();
  const updated = [restaurant, ...current.filter(r => r.id !== newId)];
  localStorage.setItem(LOCAL_STORAGE_RESTAURANTS_KEY, JSON.stringify(updated));

  return restaurant;
}

export async function fetchMenuItemsByRestaurant(restaurantId: string): Promise<MenuItemDoc[]> {
  const stored = localStorage.getItem(LOCAL_STORAGE_MENUS_KEY);
  let allMenus: MenuItemDoc[] = DEFAULT_SEED_MENUS;
  if (stored) {
    try {
      allMenus = JSON.parse(stored);
    } catch {}
  } else {
    localStorage.setItem(LOCAL_STORAGE_MENUS_KEY, JSON.stringify(DEFAULT_SEED_MENUS));
  }

  return allMenus.filter(m => m.restaurantId === restaurantId);
}

export async function createMenuItem(data: Omit<MenuItemDoc, "id">): Promise<MenuItemDoc> {
  const newId = `dish_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const menuItem: MenuItemDoc = {
    ...data,
    id: newId,
    createdAt: Date.now()
  };

  const stored = localStorage.getItem(LOCAL_STORAGE_MENUS_KEY);
  const current: MenuItemDoc[] = stored ? JSON.parse(stored) : DEFAULT_SEED_MENUS;
  const updated = [menuItem, ...current];
  localStorage.setItem(LOCAL_STORAGE_MENUS_KEY, JSON.stringify(updated));

  return menuItem;
}

export async function deleteMenuItem(menuItemId: string): Promise<void> {
  const stored = localStorage.getItem(LOCAL_STORAGE_MENUS_KEY);
  if (stored) {
    const current: MenuItemDoc[] = JSON.parse(stored);
    const updated = current.filter(m => m.id !== menuItemId);
    localStorage.setItem(LOCAL_STORAGE_MENUS_KEY, JSON.stringify(updated));
  }
}

// ---------------- Orders Management ----------------

export async function createOrder(data: Omit<OrderDoc, "id" | "createdAt">): Promise<OrderDoc> {
  const newId = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const orderNumber = `FSH-${Math.floor(100000 + Math.random() * 900000)}`;
  const order: OrderDoc = {
    ...data,
    id: newId,
    orderNumber,
    createdAt: Date.now()
  };

  const stored = localStorage.getItem(LOCAL_STORAGE_ORDERS_KEY);
  const current: OrderDoc[] = stored ? JSON.parse(stored) : [];
  const updated = [order, ...current];
  localStorage.setItem(LOCAL_STORAGE_ORDERS_KEY, JSON.stringify(updated));

  return order;
}

export async function fetchRestaurantOrders(restaurantId: string): Promise<OrderDoc[]> {
  const stored = localStorage.getItem(LOCAL_STORAGE_ORDERS_KEY);
  if (stored) {
    try {
      const current: OrderDoc[] = JSON.parse(stored);
      return current.filter(o => o.restaurantId === restaurantId).sort((a, b) => Number(b.createdAt) - Number(a.createdAt));
    } catch {}
  }
  return [];
}

export async function fetchCustomerOrders(customerId: string): Promise<OrderDoc[]> {
  const stored = localStorage.getItem(LOCAL_STORAGE_ORDERS_KEY);
  if (stored) {
    try {
      const current: OrderDoc[] = JSON.parse(stored);
      return current.filter(o => o.customerId === customerId).sort((a, b) => Number(b.createdAt) - Number(a.createdAt));
    } catch {}
  }
  return [];
}

export async function updateOrderStatus(orderId: string, newStatus: OrderStatus): Promise<void> {
  const stored = localStorage.getItem(LOCAL_STORAGE_ORDERS_KEY);
  if (stored) {
    try {
      const current: OrderDoc[] = JSON.parse(stored);
      const updated = current.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
      localStorage.setItem(LOCAL_STORAGE_ORDERS_KEY, JSON.stringify(updated));
    } catch {}
  }
}

export async function updateOrderPaymentStatus(orderId: string, newPaymentStatus: PaymentStatus): Promise<void> {
  const stored = localStorage.getItem(LOCAL_STORAGE_ORDERS_KEY);
  if (stored) {
    try {
      const current: OrderDoc[] = JSON.parse(stored);
      const updated = current.map(o => o.id === orderId ? { ...o, paymentStatus: newPaymentStatus } : o);
      localStorage.setItem(LOCAL_STORAGE_ORDERS_KEY, JSON.stringify(updated));
    } catch {}
  }
}
