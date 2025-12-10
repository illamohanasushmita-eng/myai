// Mall Store Directory Data Structures and Mock Data

export interface StoreOffer {
  id: string;
  title: string;
  description: string;
  discountPercentage?: number;
  discountText?: string; // e.g., "Buy 1 Get 1 Free", "Flat ₹500 Off"
  validFrom: string; // ISO date string
  validUntil: string; // ISO date string
  termsAndConditions: string[];
  offerCode?: string; // Promo code if applicable
  category: 'discount' | 'bogo' | 'seasonal' | 'clearance' | 'new_arrival' | 'exclusive';
  imageUrl?: string;
  isFeatured?: boolean; // Featured/best offer
}

export interface MallStore {
  id: string;
  name: string;
  category: string; // e.g., "Fashion", "Electronics", "Food & Beverage"
  floor: string; // e.g., "Ground Floor", "1st Floor", "2nd Floor"
  location: string; // Specific location within floor, e.g., "Wing A, Shop 101"
  description?: string;
  logo?: string;
  phone?: string;
  openingHours?: string;
  website?: string;
  offers: StoreOffer[];
  rating?: number;
  isNew?: boolean;
  isTrending?: boolean;
}

export interface Mall {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  totalStores: number;
  floors: string[];
  openingHours: string;
  phone?: string;
  website?: string;
  stores: MallStore[];
}

// Helper function to check if offer is valid
export function isOfferValid(offer: StoreOffer): boolean {
  const now = new Date();
  const validFrom = new Date(offer.validFrom);
  const validUntil = new Date(offer.validUntil);
  return now >= validFrom && now <= validUntil;
}

// Helper function to get days remaining for an offer
export function getDaysRemaining(validUntil: string): number {
  const now = new Date();
  const endDate = new Date(validUntil);
  const diffTime = endDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
}

// Helper function to count active offers for a store
export function getActiveOffersCount(store: MallStore): number {
  return store.offers.filter(isOfferValid).length;
}

// Helper function to get featured offer for a store
export function getFeaturedOffer(store: MallStore): StoreOffer | undefined {
  const activeOffers = store.offers.filter(isOfferValid);
  const featured = activeOffers.find(offer => offer.isFeatured);
  return featured || activeOffers[0]; // Return featured or first active offer
}

// Helper function to get stores by mall ID (for now returns mock data)
export function getStoresByMallId(mallId: string): MallStore[] {
  // In a real implementation, this would fetch from an API or database
  // For now, return all mock stores
  return mockMallStores;
}

// Helper function to get store by ID
export function getStoreById(storeId: string): MallStore | undefined {
  return mockMallStores.find(store => store.id === storeId);
}

// Mock data for testing
export const mockMallStores: MallStore[] = [
  {
    id: 'store-1',
    name: 'Zara',
    category: 'Fashion',
    floor: 'Ground Floor',
    location: 'Wing A, Shop G-12',
    description: 'International fashion brand offering trendy clothing for men, women, and kids',
    phone: '+91-22-1234-5678',
    openingHours: 'Mon-Sun: 10:00 AM - 10:00 PM',
    website: 'https://www.zara.com',
    rating: 4.5,
    isTrending: true,
    offers: [
      {
        id: 'offer-1-1',
        title: 'End of Season Sale',
        description: 'Get up to 50% off on selected winter collection items',
        discountPercentage: 50,
        discountText: 'Up to 50% Off',
        validFrom: '2025-11-01T00:00:00Z',
        validUntil: '2025-12-31T23:59:59Z',
        termsAndConditions: [
          'Valid on selected items only',
          'Cannot be combined with other offers',
          'While stocks last',
          'No exchange or refund on sale items'
        ],
        category: 'seasonal',
        isFeatured: true,
      },
      {
        id: 'offer-1-2',
        title: 'New Arrivals - 20% Off',
        description: 'Exclusive discount on new spring collection',
        discountPercentage: 20,
        discountText: 'Flat 20% Off',
        validFrom: '2025-11-01T00:00:00Z',
        validUntil: '2025-12-31T23:59:59Z',
        offerCode: 'SPRING20',
        termsAndConditions: [
          'Use code SPRING20 at checkout',
          'Valid on new arrivals only',
          'Minimum purchase of ₹2000 required'
        ],
        category: 'new_arrival',
      },
      {
        id: 'offer-1-3',
        title: 'Student Discount',
        description: 'Special 15% discount for students with valid ID',
        discountPercentage: 15,
        discountText: '15% Off for Students',
        validFrom: '2025-11-01T00:00:00Z',
        validUntil: '2026-12-31T23:59:59Z',
        termsAndConditions: [
          'Valid student ID required',
          'Cannot be combined with sale items',
          'Valid on regular priced items only'
        ],
        category: 'exclusive',
      },
    ],
  },
  {
    id: 'store-2',
    name: 'H&M',
    category: 'Fashion',
    floor: 'Ground Floor',
    location: 'Wing B, Shop G-25',
    description: 'Swedish fashion retailer offering affordable and sustainable fashion',
    phone: '+91-22-2345-6789',
    openingHours: 'Mon-Sun: 10:00 AM - 10:00 PM',
    website: 'https://www.hm.com',
    rating: 4.3,
    offers: [
      {
        id: 'offer-2-1',
        title: 'Buy 2 Get 1 Free',
        description: 'Buy any 2 items and get the 3rd item absolutely free',
        discountText: 'Buy 2 Get 1 Free',
        validFrom: '2025-11-01T00:00:00Z',
        validUntil: '2025-12-31T23:59:59Z',
        termsAndConditions: [
          'Lowest priced item will be free',
          'Valid on all items',
          'Cannot be combined with other offers'
        ],
        category: 'bogo',
        isFeatured: true,
      },
    ],
  },
  {
    id: 'store-3',
    name: 'Apple Store',
    category: 'Electronics',
    floor: '1st Floor',
    location: 'Wing A, Shop 1-08',
    description: 'Official Apple retail store for iPhones, iPads, MacBooks, and accessories',
    phone: '+91-22-3456-7890',
    openingHours: 'Mon-Sun: 10:00 AM - 9:00 PM',
    website: 'https://www.apple.com',
    rating: 4.8,
    isNew: true,
    offers: [
      {
        id: 'offer-3-1',
        title: 'Trade-In Offer',
        description: 'Get up to ₹50,000 off on new iPhone when you trade in your old device',
        discountText: 'Up to ₹50,000 Off',
        validFrom: '2025-11-01T00:00:00Z',
        validUntil: '2025-12-31T23:59:59Z',
        termsAndConditions: [
          'Trade-in value depends on device condition',
          'Valid on iPhone 15 series only',
          'Device must be in working condition'
        ],
        category: 'exclusive',
        isFeatured: true,
      },
      {
        id: 'offer-3-2',
        title: 'Student Pricing',
        description: 'Save on Mac and iPad with education pricing',
        discountPercentage: 10,
        discountText: 'Education Discount',
        validFrom: '2025-11-01T00:00:00Z',
        validUntil: '2026-12-31T23:59:59Z',
        termsAndConditions: [
          'Valid student/teacher ID required',
          'Applicable on Mac and iPad only',
          'One device per academic year'
        ],
        category: 'exclusive',
      },
    ],
  },
  {
    id: 'store-4',
    name: 'Starbucks',
    category: 'Food & Beverage',
    floor: 'Ground Floor',
    location: 'Food Court, FC-03',
    description: 'Premium coffee chain serving handcrafted beverages and fresh food',
    phone: '+91-22-4567-8901',
    openingHours: 'Mon-Sun: 8:00 AM - 11:00 PM',
    website: 'https://www.starbucks.in',
    rating: 4.4,
    offers: [
      {
        id: 'offer-4-1',
        title: 'Happy Hours',
        description: 'Buy 1 Get 1 Free on all Frappuccinos between 3 PM - 6 PM',
        discountText: 'BOGO on Frappuccinos',
        validFrom: '2025-11-01T00:00:00Z',
        validUntil: '2025-12-31T23:59:59Z',
        termsAndConditions: [
          'Valid between 3 PM - 6 PM only',
          'Applicable on all Frappuccino sizes',
          'Dine-in only'
        ],
        category: 'bogo',
        isFeatured: true,
      },
    ],
  },
  {
    id: 'store-5',
    name: 'Nike',
    category: 'Sports & Fitness',
    floor: '1st Floor',
    location: 'Wing B, Shop 1-22',
    description: 'Leading sports brand offering athletic footwear, apparel, and equipment',
    phone: '+91-22-5678-9012',
    openingHours: 'Mon-Sun: 10:00 AM - 10:00 PM',
    website: 'https://www.nike.com',
    rating: 4.6,
    isTrending: true,
    offers: [
      {
        id: 'offer-5-1',
        title: 'Clearance Sale',
        description: 'Up to 40% off on selected footwear and apparel',
        discountPercentage: 40,
        discountText: 'Up to 40% Off',
        validFrom: '2025-11-01T00:00:00Z',
        validUntil: '2025-12-31T23:59:59Z',
        termsAndConditions: [
          'Valid on selected items only',
          'While stocks last',
          'No returns on clearance items'
        ],
        category: 'clearance',
        isFeatured: true,
      },
      {
        id: 'offer-5-2',
        title: 'Nike Membership Exclusive',
        description: 'Extra 10% off for Nike Members',
        discountPercentage: 10,
        discountText: '10% Off for Members',
        validFrom: '2025-11-01T00:00:00Z',
        validUntil: '2026-12-31T23:59:59Z',
        offerCode: 'NIKEMEMBER',
        termsAndConditions: [
          'Valid Nike membership required',
          'Use code NIKEMEMBER at checkout',
          'Cannot be combined with sale items'
        ],
        category: 'exclusive',
      },
    ],
  },
  {
    id: 'store-6',
    name: 'Sephora',
    category: 'Beauty & Cosmetics',
    floor: '2nd Floor',
    location: 'Wing A, Shop 2-15',
    description: 'Premium beauty retailer offering makeup, skincare, and fragrances',
    phone: '+91-22-6789-0123',
    openingHours: 'Mon-Sun: 10:00 AM - 10:00 PM',
    website: 'https://www.sephora.in',
    rating: 4.7,
    offers: [
      {
        id: 'offer-6-1',
        title: 'Beauty Insider Sale',
        description: 'Get 20% off on all products for Beauty Insider members',
        discountPercentage: 20,
        discountText: '20% Off for Members',
        validFrom: '2025-11-01T00:00:00Z',
        validUntil: '2025-12-31T23:59:59Z',
        offerCode: 'INSIDER20',
        termsAndConditions: [
          'Valid Beauty Insider membership required',
          'Use code INSIDER20 at checkout',
          'Excludes select brands'
        ],
        category: 'exclusive',
        isFeatured: true,
      },
    ],
  },
];
