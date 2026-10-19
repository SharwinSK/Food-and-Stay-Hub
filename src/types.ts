/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface UserProfile {
  id: string;
  uid?: string;
  name: string;
  email: string;
  photoURL?: string;
  createdAt: string;
  role?: 'admin' | 'user' | 'business';
  travelPersonality?: 'Food Explorer' | 'Budget Explorer' | 'Cultural Explorer' | 'Family Traveler' | 'Luxury Connoisseur';
  location?: {
    type: 'manual' | 'gps';
    country?: string;
    state?: string;
    city?: string;
    area?: string;
    coords?: {
      latitude: number;
      longitude: number;
    };
  };
  preferredCuisine?: string;
  searchPreference?: 'hotels' | 'restaurants';
  savedPlaces?: string[];
  savedExperiences?: string[];
  tripPreferences?: TripPreferenceData;
  passportData?: FoodPassportData;
}

// ----------------------------------------------------
// Restaurant / Hotel, Menu Ingredients, Orders & Cart
// ----------------------------------------------------

export interface RegisteredRestaurant {
  id: string;
  name: string;
  type: 'Restaurant' | 'Hotel';
  cuisineType: string;
  address: string;
  city: string;
  contactPhone: string;
  description: string;
  coverPhotoUrl: string;
  ownerId: string;
  latitude?: number;
  longitude?: number;
  createdAt: string | number;
}

export interface DishIngredient {
  id: string;
  name: string;
  quantityGrams: number; // default amount in grams
  pricePerGram: number; // price per gram in currency (e.g. RM)
  minGrams: number; // lowest allowed customization grams
  maxGrams: number; // highest allowed customization grams
  adjustable: boolean; // if false, cannot be altered
}

export interface MenuItemDoc {
  id: string;
  restaurantId: string;
  name: string;
  category: string;
  description: string;
  photoUrl: string;
  basePrice: number;
  ingredients: DishIngredient[];
  createdAt?: string | number;
}

export interface CustomizedIngredientRecord {
  ingredientId?: string;
  name: string;
  defaultGrams: number;
  chosenGrams: number;
  pricePerGram: number;
  diffGrams: number; // chosenGrams - defaultGrams
  adjustable: boolean;
}

export interface CartItem {
  cartId: string;
  menuItemId: string;
  restaurantId: string;
  restaurantName: string;
  dishName: string;
  photoUrl: string;
  orderType: 'Standard' | 'Customized';
  basePrice: number;
  finalPrice: number; // calculated with adjusted ingredients
  quantity: number;
  ingredientsUsed: CustomizedIngredientRecord[];
}

export type OrderStatus = 'Pending' | 'Accepted' | 'Preparing' | 'Ready' | 'Completed';
export type PaymentMethod = 'cash' | 'bank_transfer';
export type PaymentStatus = 'pending' | 'pending_verification' | 'verified' | 'paid';

export interface OrderDoc {
  id: string;
  orderNumber?: string;
  customerId: string;
  customerName: string;
  customerEmail?: string;
  restaurantId: string;
  restaurantName: string;
  dishName: string;
  orderType: 'Standard' | 'Customized';
  ingredientsUsed: CustomizedIngredientRecord[];
  quantity: number;
  finalPrice: number;
  status: OrderStatus;
  createdAt: string | number;
  
  // Delivery Step fields
  deliveryService?: 'Restaurant Delivery' | 'Grab' | string;
  deliveryDistanceKm?: number;
  deliveryFee?: number;
  deliveryAddress?: string;
  deliveryLocation?: {
    latitude: number;
    longitude: number;
    formattedAddress?: string;
  };

  // Payment Step fields
  paymentMethod?: PaymentMethod;
  paymentStatus?: PaymentStatus;
}

export interface TripPreferenceData {
  destination: {
    country: string;
    state: string;
    city: string;
    area: string;
  };
  duration: string; // e.g., "1 Day", "2 Days", "3 Days", "1 Week"
  budget: number; // in RM
  peopleCount: string; // e.g., "Solo", "Couple", "Family (4)", "Group"
  cuisine: string;
  foodPreference: string; // e.g. "Street Food", "Traditional", "Fine Dining", "Halal", "Vegetarian"
  accommodationPreference: string; // e.g. "Homestay", "Boutique Hotel", "Luxury Resort", "Budget Inn"
  travelStyle: 'Budget Explorer' | 'Food Lover' | 'Family Trip' | 'Couple' | 'Business Traveler' | 'Cultural Explorer' | 'Luxury Experience' | 'Adventure Traveler';
  interests: string[];
}

export interface FoodItem {
  id: string;
  name: string;
  cuisine: string;
  originCountry: string;
  originRegion?: string;
  shortHistory: string;
  culturalSignificance: string;
  ingredients: string[];
  typicalPreparation: string;
  whenEaten: string;
  servingStyle: string;
  photoUrl: string;
  avgPriceRM: number;
  spiceLevel: 'Mild' | 'Medium' | 'Spicy' | 'Very Spicy';
  dietaryCategory: 'Vegetarian' | 'Non-Vegetarian' | 'Halal' | 'Seafood' | 'No preference';
  mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack' | 'Dessert';
}

export interface PlaceResult {
  id: string;
  name: string;
  type: 'hotel' | 'restaurant' | 'cafe' | 'homestay' | 'vendor';
  address: string;
  phone?: string;
  openingHours?: string;
  rating?: number;
  reviewsCount?: number;
  reviews?: string[];
  photoUrl?: string;
  mapsUri?: string;
  cuisineType?: string;
  description?: string;
  latitude: number;
  longitude: number;
  
  // Hospitality & Food Culture Extensions
  authenticityScore?: number; // 0 - 100
  bestDish?: string;
  priceRange?: 'RM ($)' | 'RM-RM ($$)' | 'RM-RM-RM ($$$)' | 'RM-RM-RM-RM ($$$$)';
  familyFriendly?: boolean;
  halalStatus?: boolean;
  vegetarianOptions?: boolean;
  popularTime?: string;
  whyVisit?: string;
  foodStory?: FoodItem;
  isHiddenGem?: boolean;
  badges?: string[]; // e.g. "Family Owned", "Traditional Recipe", "Local Favourite"
  whyLocalsLoveIt?: string;
  whatToTry?: string;
  
  // Hotel + Food Connection
  nearbyFood?: string[];
  recommendedBreakfast?: string;
  nearbyTrailId?: string;
  estimatedFoodBudgetRM?: number;
  
  // Owner profile details
  businessOwnerId?: string;
}

export interface FoodTrailStop {
  stopNumber: number;
  title: string; // e.g. "Stop 1: Traditional Breakfast"
  placeName: string;
  recommendedItem: string;
  category: string;
  mapsUri: string;
  estCostRM: number;
  photoUrl?: string;
  description?: string;
}

export interface FoodTrail {
  id: string;
  name: string;
  region: string;
  description: string;
  stops: FoodTrailStop[];
  totalDistanceKm: number;
  estimatedCostRM: number;
  stopsCount: number;
  estimatedTimeHours: number;
  cuisine: string;
  difficulty: 'Easy Walk' | 'Moderate Scenic' | 'Full Day Tour';
  recommendedAudience: string;
  photoUrl: string;
}

export interface LocalExperience {
  id: string;
  title: string;
  category: 'Cultural Experiences' | 'Local Markets' | 'Traditional Shops' | 'Heritage Places' | 'Local Activities' | 'Nature Experiences' | 'Photography Spots';
  locationName: string;
  city: string;
  state: string;
  description: string;
  estCostRM: number;
  foodConnection: string;
  stayConnection?: string;
  mapsUri: string;
  photoUrl: string;
}

export interface DayItineraryItem {
  time: string;
  activity: string;
  placeName: string;
  category: string;
  costRM: number;
  mapsUri: string;
  description: string;
}

export interface DayItinerary {
  id: string;
  title: string;
  location: string;
  budgetRM: number;
  cuisine: string;
  interests: string[];
  availableTime: string;
  items: DayItineraryItem[];
  totalCostRM: number;
}

export interface LocalOffer {
  id: string;
  businessName: string;
  title: string;
  discountBadge: string; // e.g. "10% OFF", "RM5 Lunch Special"
  description: string;
  expiryDate: string;
  couponCode?: string;
  category: string;
  location: string;
}

export interface BusinessProfile {
  id: string;
  ownerEmail: string;
  businessName: string;
  category: 'restaurant' | 'hotel' | 'cafe' | 'homestay' | 'vendor';
  cuisine: string;
  location: string;
  city: string;
  phone: string;
  openingHours: string;
  description: string;
  photos: string[];
  menu: { name: string; priceRM: number; description: string }[];
  priceRange: string;
  facilities: string[];
  activeOffers: LocalOffer[];
  views: number;
  savedCount: number;
  rating: number;
  popularDish: string;
}

export interface AchievementBadge {
  id: string;
  title: string;
  description: string;
  iconName: string;
  unlocked: boolean;
  progress: number; // e.g. 5/5
  maxProgress: number;
}

export interface FoodPassportData {
  countriesExplored: string[];
  citiesExplored: string[];
  foodsDiscovered: string[];
  restaurantsVisited: string[];
  trailsCompleted: string[];
  achievements: AchievementBadge[];
}

export interface ManualLocationData {
  countries: {
    id: string;
    name: string;
    states: {
      id: string;
      name: string;
      cities: {
        id: string;
        name: string;
        areas: string[];
      }[];
    }[];
  }[];
}

export const CUISINES = [
  "Malaysia",
  "Chinese",
  "Indian",
  "Arab Countries",
  "Pakistani",
  "Bangladeshi",
  "Indonesian",
  "Thai",
  "Japanese",
  "Korean",
  "Vietnamese",
  "Turkish",
  "Iranian"
];

export const MALAYSIAN_LOCATIONS = {
  id: "malaysia",
  name: "Malaysia",
  states: [
    {
      id: "johor",
      name: "Johor",
      cities: [
        { id: "johor_bahru", name: "Johor Bahru", areas: ["Tebrau", "Larkin", "Tampoi", "Bukit Indah", "Skudai", "Mount Austin"] },
        { id: "batu_pahat", name: "Batu Pahat", areas: ["Bandar Penggaram", "Taman Banang", "Taman Bukit Pasir"] },
        { id: "muar", name: "Muar", areas: ["Bandar Maharani", "Tanjung Emas", "Sg. Abong"] }
      ]
    },
    {
      id: "kedah",
      name: "Kedah",
      cities: [
        { id: "alor_setar", name: "Alor Setar", areas: ["Anak Bukit", "Mergong", "Jalan Pegawai", "Tandop"] },
        { id: "sungai_petani", name: "Sungai Petani", areas: ["Bandar Laguna Merbok", "Taman Ria", "Amanjaya", "Taman Sejati Indah"] },
        { id: "langkawi", name: "Langkawi", areas: ["Kuah", "Pantai Cenang", "Padang Matsirat", "Pantai Tengah"] }
      ]
    },
    {
      id: "kelantan",
      name: "Kelantan",
      cities: [
        { id: "kota_bharu", name: "Kota Bharu", areas: ["Kubang Kerian", "Pengkalan Chepa", "Panji", "Lundang"] },
        { id: "tanah_merah", name: "Tanah Merah", areas: ["Bandar Tanah Merah", "Batang Merbau", "Bukit Panau"] }
      ]
    },
    {
      id: "kuala_lumpur",
      name: "Kuala Lumpur (W.P.)",
      cities: [
        { id: "kl_city", name: "Kuala Lumpur", areas: ["KLCC", "Bukit Bintang", "Bangsar", "Mont Kiara", "Cheras", "Setapak", "Kepong", "OUG"] }
      ]
    },
    {
      id: "labuan",
      name: "Labuan (W.P.)",
      cities: [
        { id: "victoria", name: "Victoria", areas: ["Bandar Labuan", "Layang-Layangan", "Kampung Jawa", "Rancha-Rancha"] }
      ]
    },
    {
      id: "melaka",
      name: "Melaka",
      cities: [
        { id: "melaka_city", name: "Melaka City", areas: ["Jonker Street", "Bandar Hilir", "Klebang", "Ayer Keroh", "Malim Jaya"] },
        { id: "alor_gajah", name: "Alor Gajah", areas: ["Masjid Tanah", "Tampin", "Simpang Ampat", "Rembia"] }
      ]
    },
    {
      id: "negeri_sembilan",
      name: "Negeri Sembilan",
      cities: [
        { id: "nilai", name: "Nilai", areas: ["Bandar Baru Nilai", "Nilai 3", "Putra Nilai", "Nilai Impian", "MesaMall"] },
        { id: "seremban", name: "Seremban", areas: ["Seremban 2", "Rasah", "Senawang", "Seremban Town", "Sikamat"] },
        { id: "port_dickson", name: "Port Dickson", areas: ["Teluk Kemang", "PD Town", "Batu 4", "Lukut", "Selesa Homes"] }
      ]
    },
    {
      id: "pahang",
      name: "Pahang",
      cities: [
        { id: "kuantan", name: "Kuantan", areas: ["Teluk Cempedak", "Beserah", "Tanjung Lumpur", "Indera Mahkota", "Semambu"] },
        { id: "temerloh", name: "Temerloh", areas: ["Bandar Temerloh", "Mentakab", "Songsang"] }
      ]
    },
    {
      id: "penang",
      name: "Penang",
      cities: [
        { id: "george_town", name: "George Town", areas: ["Gurney Drive", "Chulia Street", "Tanjung Tokong", "Pulau Tikus", "Jelutong"] },
        { id: "bayan_lepas", name: "Bayan Lepas", areas: ["Queensbay", "Bayan Baru", "Sungai Ara", "Batu Maung"] },
        { id: "butterworth", name: "Butterworth", areas: ["Seberang Jaya", "Bagan Ajam", "Raja Uda", "Bukit Mertajam Town"] }
      ]
    },
    {
      id: "perak",
      name: "Perak",
      cities: [
        { id: "ipoh", name: "Ipoh", areas: ["Canning Garden", "Ipoh Garden", "Tambun", "Menglembu", "Bercham", "Pasir Pinji"] },
        { id: "taiping", name: "Taiping", areas: ["Kamunting", "Lake Gardens", "Simpang", "Pokok Assam"] },
        { id: "teluk_intan", name: "Teluk Intan", areas: ["Bandar Teluk Intan", "Jalan Baru", "Anson Heights"] }
      ]
    },
    {
      id: "perlis",
      name: "Perlis",
      cities: [
        { id: "kangar", name: "Kangar", areas: ["Jejawi", "Sena", "Kayang", "Kuala Perlis Town"] },
        { id: "padang_besar", name: "Padang Besar", areas: ["Bandar Padang Besar", "Arau Town", "Chuping"] }
      ]
    },
    {
      id: "putrajaya",
      name: "Putrajaya (W.P.)",
      cities: [
        { id: "putrajaya_city", name: "Putrajaya", areas: ["Presint 1", "Presint 2", "Presint 4", "Presint 8", "Presint 9", "Presint 15", "Alamanda"] }
      ]
    },
    {
      id: "sabah",
      name: "Sabah",
      cities: [
        { id: "kota_kinabalu", name: "Kota Kinabalu", areas: ["Luyang", "Tanjung Aru", "Inanam", "Likas", "Penampang", "Kepayan"] },
        { id: "sandakan", name: "Sandakan", areas: ["Bandar Utama", "Batu 4", "Harbour City", "Mile 8"] },
        { id: "tawau", name: "Tawau", areas: ["Bandar Sri Indah", "Apas Road", "Kuhara", "Tanjung"] }
      ]
    },
    {
      id: "sarawak",
      name: "Sarawak",
      cities: [
        { id: "kuching", name: "Kuching", areas: ["Tabuan Jaya", "Petra Jaya", "Padungan", "Batu Kawa", "Satok", "Stampin"] },
        { id: "miri", name: "Miri", areas: ["Lutong", "Piasau", "Marina ParkCity", "Bakaram", "Taman Tunku"] },
        { id: "sibu", name: "Sibu", areas: ["Bandar Sibu", "Sungai Merah", "Ulu Sungai Merah", "Rejang Esplanade"] }
      ]
    },
    {
      id: "selangor",
      name: "Selangor",
      cities: [
        { id: "petaling_jaya", name: "Petaling Jaya", areas: ["Damansara", "SS2", "Kelana Jaya", "Sunway", "Bandar Utama", "Ara Damansara"] },
        { id: "shah_alam", name: "Shah Alam", areas: ["Seksyen 7", "Seksyen 13", "Glenmarie", "Setia Alam", "Kota Kemuning"] },
        { id: "subang_jaya", name: "Subang Jaya", areas: ["SS15", "USJ", "Bandar Sunway", "Taipan", "Subang Heights"] },
        { id: "klang", name: "Klang", areas: ["Bandar Bukit Tinggi", "Bandar Botanic", "Taman Sri Andalas", "Port Klang", "Meru"] }
      ]
    },
    {
      id: "terengganu",
      name: "Terengganu",
      cities: [
        { id: "kuala_terengganu", name: "Kuala Terengganu", areas: ["Batu Burok", "Gong Badak", "Pulau Duyong", "Ladang", "Seberang Takir"] },
        { id: "kemaman", name: "Kemaman", areas: ["Chukai Town", "Kijal", "Teluk Kalong", "Kerteh"] }
      ]
    }
  ]
};

export const OTHER_LOCATIONS = [
  {
    id: "china",
    name: "China",
    states: [
      {
        id: "guangdong",
        name: "Guangdong",
        cities: [
          { id: "guangzhou", name: "Guangzhou", areas: ["Tianhe", "Yuexiu", "Haizhu"] },
          { id: "shenzhen", name: "Shenzhen", areas: ["Futian", "Nanshan", "Luohu"] }
        ]
      },
      {
        id: "beijing_state",
        name: "Beijing",
        cities: [
          { id: "beijing_city", name: "Beijing", areas: ["Chaoyang", "Dongcheng", "Haidian"] }
        ]
      }
    ]
  },
  {
    id: "india",
    name: "India",
    states: [
      {
        id: "maharashtra",
        name: "Maharashtra",
        cities: [
          { id: "mumbai", name: "Mumbai", areas: ["Colaba", "Andheri", "Bandra"] },
          { id: "pune", name: "Pune", areas: ["Koregaon Park", "Kothrud", "Hinjawadi"] }
        ]
      },
      {
        id: "delhi_state",
        name: "Delhi",
        cities: [
          { id: "delhi_city", name: "New Delhi", areas: ["Connaught Place", "Saket", "Karol Bagh"] }
        ]
      }
    ]
  },
  {
    id: "japan",
    name: "Japan",
    states: [
      {
        id: "tokyo_prefecture",
        name: "Tokyo",
        cities: [
          { id: "tokyo_city", name: "Tokyo", areas: ["Shinjuku", "Shibuya", "Ginza", "Akihabara"] }
        ]
      },
      {
        id: "osaka_prefecture",
        name: "Osaka",
        cities: [
          { id: "osaka_city", name: "Osaka", areas: ["Namba", "Umeda", "Shinsaibashi"] }
        ]
      }
    ]
  }
];

export const ALL_COUNTRIES = [MALAYSIAN_LOCATIONS, ...OTHER_LOCATIONS];
