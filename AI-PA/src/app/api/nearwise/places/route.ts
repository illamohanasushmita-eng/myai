import { NextRequest, NextResponse } from 'next/server';
import { getBrandByName, type Brand } from '@/lib/brands-database';
import { getAvailablePlatforms, type DeliveryPlatform } from '@/lib/food-delivery-platforms';

// Serialized platform interface (no functions, for JSON serialization)
interface SerializedPlatform {
  id: string;
  name: string;
  logo: string;
  color: string;
}

// Types
interface Place {
  id: string;
  name: string;
  category: string;
  distance: number;
  rating: number;
  address: string;
  latitude: number;
  longitude: number;
  openingHours?: string;
  phone?: string;
  isNew?: boolean;
  trending?: boolean;
  tags?: string[];
  website?: string;
  hasOnlineStore?: boolean;
  storeType?: string; // e.g., 'Clothing', 'Shoes', 'Accessories'
  brandInfo?: Brand;
  // New fields for offers and social engagement
  hasOffer?: boolean;
  offerText?: string;
  offerExpiration?: string; // ISO date string
  socialEngagement?: number; // Total engagement from social posts
  createdDate?: string; // OSM creation date (if available)
  isTrending?: boolean; // High recent social engagement
  // Food delivery integration
  deliveryPlatforms?: SerializedPlatform[]; // Changed from DeliveryPlatform[] to SerializedPlatform[]
  isRestaurant?: boolean;
}

// Calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Check if a place is a restaurant/food establishment
function isRestaurantPlace(tags: any): boolean {
  const amenity = tags.amenity || '';
  return ['restaurant', 'cafe', 'fast_food', 'bar', 'pub', 'food_court', 'ice_cream', 'bistro', 'biergarten'].includes(amenity);
}

// Map OSM amenity types to our categories
function mapOSMCategory(tags: any): string {
  const amenity = tags.amenity || '';
  const shop = tags.shop || '';

  // Fashion categories
  if (['clothes', 'fashion', 'boutique', 'tailor'].includes(shop)) return 'clothing';
  if (shop === 'shoes') return 'shoes';
  if (['jewelry', 'accessories', 'watches', 'bags'].includes(shop)) return 'accessories';
  if (['sports', 'outdoor'].includes(shop)) return 'sportswear';
  if (shop === 'department_store') return 'department';

  // Existing categories
  if (shop === 'mall' || tags.building === 'retail') return 'mall';
  if (shop && !['clothes', 'fashion', 'boutique', 'tailor', 'shoes', 'jewelry', 'accessories', 'watches', 'bags', 'sports', 'outdoor', 'department_store', 'mall'].includes(shop)) return 'shop';

  // All food and beverage establishments
  if (['restaurant', 'cafe', 'fast_food', 'bar', 'pub', 'food_court', 'ice_cream', 'bistro', 'biergarten'].includes(amenity)) {
    return 'restaurant';
  }

  return 'other';
}

// Get store type label for display
function getStoreTypeLabel(category: string): string {
  const labels: Record<string, string> = {
    'clothing': 'Clothing',
    'shoes': 'Shoes',
    'accessories': 'Accessories',
    'sportswear': 'Sportswear',
    'luxury': 'Luxury',
    'department': 'Department Store',
    'shop': 'Shop',
    'mall': 'Mall',
    'restaurant': 'Restaurant',
    'food': 'Food & Beverage',
    'grocery': 'Grocery',
    'electronics': 'Electronics',
  };
  return labels[category] || 'Store';
}

// Generate a simple rating (mock for now, can be enhanced with real data)
function generateRating(tags: any): number {
  // Base rating
  let rating = 3.5;
  
  // Boost rating if it has certain tags
  if (tags.name) rating += 0.3;
  if (tags.phone) rating += 0.2;
  if (tags.website) rating += 0.2;
  if (tags.opening_hours) rating += 0.3;
  
  // Cap at 5.0
  return Math.min(5.0, Math.round(rating * 10) / 10);
}

// Helper: Detect new opening keywords in place name/description
function detectNewOpening(text: string): boolean {
  const keywords = [
    'grand opening', 'now open', 'new location', 'opening soon',
    'just opened', 'coming soon', 'newly opened', 'opening day',
    'opening celebration', 'opening week', 'opening event', 'we\'re open',
    'officially open', 'soft opening', 'new store', 'recently opened'
  ];
  const lowerText = text.toLowerCase();
  return keywords.some(keyword => lowerText.includes(keyword));
}

// Helper: Detect promotion keywords in place name/description
function detectPromotion(text: string): boolean {
  const keywords = [
    'sale', 'discount', 'offer', 'deal', 'promo', 'coupon', '% off',
    'special', 'limited time', 'flash sale', 'clearance', 'save',
    'buy one get one', 'bogo', 'free shipping', 'exclusive',
    'promotion', 'bargain', 'reduced', 'markdown', 'special offer'
  ];
  const lowerText = text.toLowerCase();
  return keywords.some(keyword => lowerText.includes(keyword));
}

// Check if place is "new" based on OSM metadata and keywords
function isNewPlace(tags: any, metadata?: any): boolean {
  // Check OSM timestamp if available (places created in last 60 days)
  if (metadata?.timestamp) {
    const createdDate = new Date(metadata.timestamp);
    const now = new Date();
    const daysSinceCreation = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceCreation <= 60) {
      return true;
    }
  }

  // Check for new opening keywords in name or description
  const name = tags.name || '';
  const description = tags.description || '';
  if (detectNewOpening(name) || detectNewOpening(description)) {
    return true;
  }

  // Fallback: randomly mark some places as new for testing
  return Math.random() < 0.1; // 10% chance
}

// Check if place is "trending" (mock implementation)
function isTrendingPlace(tags: any): boolean {
  // In a real implementation, you'd check social media mentions, reviews, etc.
  return Math.random() < 0.15; // 15% chance
}

// Check if place has promotional offer
function hasPromotionalOffer(tags: any): boolean {
  const name = tags.name || '';
  const description = tags.description || '';
  return detectPromotion(name) || detectPromotion(description);
}

// Enrich places with social media data
async function enrichPlacesWithSocialData(
  places: Place[],
  latitude: number,
  longitude: number,
  radius: number
): Promise<Place[]> {
  try {
    // Fetch social media posts for the same location
    const socialResponse = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002'}/api/nearwise/social?latitude=${latitude}&longitude=${longitude}&radius=${radius}&platform=all`,
      { cache: 'no-store' }
    );

    if (!socialResponse.ok) {
      console.log('[NEARWISE-PLACES] Could not fetch social data for enrichment');
      return places;
    }

    const socialData = await socialResponse.json();
    const socialPosts = socialData.posts || [];

    // Match social posts to places by business name and location
    const enrichedPlaces = places.map(place => {
      // Find social posts that match this place
      const matchingPosts = socialPosts.filter((post: any) => {
        // Match by business name (case-insensitive, partial match)
        const nameMatch = post.businessName?.toLowerCase().includes(place.name.toLowerCase()) ||
                         place.name.toLowerCase().includes(post.businessName?.toLowerCase());

        // Match by proximity (within 0.5km)
        const distanceMatch = post.location &&
                             Math.abs(post.location.distance - place.distance) < 0.5;

        return nameMatch || distanceMatch;
      });

      if (matchingPosts.length === 0) {
        return place;
      }

      // Calculate total social engagement
      const totalEngagement = matchingPosts.reduce((sum: number, post: any) => {
        return sum + (post.engagement?.likes || 0) +
               (post.engagement?.comments || 0) +
               (post.engagement?.shares || 0);
      }, 0);

      // Check if any matching posts have offers
      const offerPosts = matchingPosts.filter((post: any) => post.isPromotion);
      const hasOfferFromSocial = offerPosts.length > 0;

      // Get the most recent offer
      let offerText = place.offerText;
      let offerExpiration = place.offerExpiration;
      if (hasOfferFromSocial && offerPosts[0]) {
        offerText = offerPosts[0].content?.substring(0, 100) + '...';
        offerExpiration = offerPosts[0].offerExpiration;
      }

      // Check if any matching posts indicate new opening
      const hasNewOpeningPost = matchingPosts.some((post: any) => post.isNewOpening);

      // Determine if trending (high engagement threshold: 500+)
      const isTrending = totalEngagement > 500;

      return {
        ...place,
        socialEngagement: totalEngagement,
        hasOffer: place.hasOffer || hasOfferFromSocial,
        offerText: offerText,
        offerExpiration: offerExpiration,
        isNew: place.isNew || hasNewOpeningPost,
        isTrending: isTrending,
      };
    });

    console.log('[NEARWISE-PLACES] Enriched', enrichedPlaces.filter(p => p.socialEngagement && p.socialEngagement > 0).length, 'places with social data');

    return enrichedPlaces;
  } catch (error) {
    console.error('[NEARWISE-PLACES] Error enriching places with social data:', error);
    return places;
  }
}

// Generate mock places data as fallback
function generateMockPlaces(latitude: number, longitude: number, radius: number, category: string): Place[] {
  const mockPlaces: Place[] = [
    // Fashion Brands
    {
      id: 'mock-fashion-1',
      name: 'Zara',
      category: 'clothing',
      distance: 0.7,
      rating: 4.6,
      address: '100 Fashion Avenue',
      latitude: latitude + 0.006,
      longitude: longitude - 0.004,
      openingHours: 'Mo-Su 10:00-21:00',
      phone: '+1234567800',
      isNew: false,
      trending: true,
      website: 'https://www.zara.com',
      hasOnlineStore: true,
      storeType: 'Clothing',
      hasOffer: true,
      offerText: 'Flash sale! Up to 50% off selected items this weekend only!',
      offerExpiration: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      socialEngagement: 1250,
      isTrending: true,
    },
    {
      id: 'mock-fashion-2',
      name: 'Nike',
      category: 'shoes',
      distance: 1.1,
      rating: 4.8,
      address: '200 Sports Plaza',
      latitude: latitude + 0.009,
      longitude: longitude + 0.007,
      openingHours: 'Mo-Su 09:00-21:00',
      phone: '+1234567801',
      isNew: false,
      trending: true,
      website: 'https://www.nike.com',
      hasOnlineStore: true,
      storeType: 'Shoes',
    },
    {
      id: 'mock-fashion-3',
      name: 'H&M',
      category: 'clothing',
      distance: 0.9,
      rating: 4.4,
      address: '150 Fashion Street',
      latitude: latitude - 0.007,
      longitude: longitude + 0.005,
      openingHours: 'Mo-Su 10:00-20:00',
      phone: '+1234567802',
      isNew: true,
      trending: false,
      website: 'https://www.hm.com',
      hasOnlineStore: true,
      storeType: 'Clothing',
      hasOffer: false,
      socialEngagement: 320,
      isTrending: false,
      createdDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
    },
    {
      id: 'mock-fashion-4',
      name: 'Foot Locker',
      category: 'shoes',
      distance: 1.3,
      rating: 4.5,
      address: '300 Sneaker Lane',
      latitude: latitude + 0.011,
      longitude: longitude - 0.008,
      openingHours: 'Mo-Sa 10:00-21:00',
      phone: '+1234567803',
      isNew: false,
      trending: true,
      website: 'https://www.footlocker.com',
      hasOnlineStore: true,
      storeType: 'Shoes',
    },
    {
      id: 'mock-fashion-5',
      name: 'Sunglass Hut',
      category: 'accessories',
      distance: 0.6,
      rating: 4.3,
      address: '50 Accessories Way',
      latitude: latitude - 0.005,
      longitude: longitude - 0.004,
      openingHours: 'Mo-Su 10:00-20:00',
      phone: '+1234567804',
      isNew: false,
      trending: false,
      website: 'https://www.sunglasshut.com',
      hasOnlineStore: true,
      storeType: 'Accessories',
    },
    {
      id: 'mock-fashion-6',
      name: "Macy's",
      category: 'department',
      distance: 2.0,
      rating: 4.7,
      address: '500 Department Store Blvd',
      latitude: latitude + 0.016,
      longitude: longitude + 0.012,
      openingHours: 'Mo-Su 10:00-22:00',
      phone: '+1234567805',
      isNew: false,
      trending: true,
      website: 'https://www.macys.com',
      hasOnlineStore: true,
      storeType: 'Department Store',
    },
    {
      id: 'mock-fashion-7',
      name: 'Lululemon',
      category: 'sportswear',
      distance: 1.4,
      rating: 4.9,
      address: '250 Athletic Avenue',
      latitude: latitude - 0.011,
      longitude: longitude + 0.009,
      openingHours: 'Mo-Su 10:00-20:00',
      phone: '+1234567806',
      isNew: true,
      trending: true,
      website: 'https://www.lululemon.com',
      hasOnlineStore: true,
      storeType: 'Sportswear',
    },
    {
      id: 'mock-fashion-8',
      name: 'Adidas',
      category: 'shoes',
      distance: 1.6,
      rating: 4.7,
      address: '350 Sports Center',
      latitude: latitude + 0.013,
      longitude: longitude - 0.010,
      openingHours: 'Mo-Su 09:00-21:00',
      phone: '+1234567807',
      isNew: false,
      trending: false,
      website: 'https://www.adidas.com',
      hasOnlineStore: true,
      storeType: 'Shoes',
    },

    // Existing brands
    {
      id: 'mock-1',
      name: 'Central Shopping Mall',
      category: 'mall',
      distance: 1.2,
      rating: 4.5,
      address: 'Main Street, City Center',
      latitude: latitude + 0.01,
      longitude: longitude + 0.01,
      openingHours: 'Mo-Su 10:00-22:00',
      phone: '+1234567890',
      isNew: false,
      trending: true,
    },
    {
      id: 'mock-2',
      name: 'Walmart Supercenter',
      category: 'grocery',
      distance: 0.8,
      rating: 4.2,
      address: '123 Market Road',
      latitude: latitude + 0.008,
      longitude: longitude - 0.005,
      openingHours: 'Mo-Su 08:00-21:00',
      phone: '+1234567891',
      isNew: false,
      trending: false,
      website: 'https://www.walmart.com',
      hasOnlineStore: true,
      storeType: 'Grocery',
    },
    {
      id: 'mock-3',
      name: 'Starbucks Coffee',
      category: 'restaurant',
      distance: 0.5,
      rating: 4.7,
      address: '456 Food Street',
      latitude: latitude - 0.004,
      longitude: longitude - 0.003,
      openingHours: 'Mo-Su 06:00-22:00',
      phone: '+1234567892',
      isNew: true,
      trending: true,
      website: 'https://www.starbucks.com',
      hasOnlineStore: true,
      storeType: 'Food & Beverage',
      hasOffer: true,
      offerText: 'Grand opening celebration! Free coffee samples all week!',
      offerExpiration: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      socialEngagement: 2100,
      isTrending: true,
      createdDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    },
    {
      id: 'mock-4',
      name: 'Target',
      category: 'grocery',
      distance: 2.1,
      rating: 4.3,
      address: '789 Shopping Avenue',
      latitude: latitude + 0.015,
      longitude: longitude - 0.012,
      openingHours: 'Mo-Sa 09:00-20:00',
      phone: '+1234567893',
      isNew: false,
      trending: false,
      website: 'https://www.target.com',
      hasOnlineStore: true,
      storeType: 'Grocery',
    },
    {
      id: 'mock-5',
      name: "McDonald's",
      category: 'restaurant',
      distance: 1.2,
      rating: 4.1,
      address: '321 Fast Food Lane',
      latitude: latitude - 0.012,
      longitude: longitude + 0.008,
      openingHours: 'Mo-Su 07:00-23:00',
      phone: '+1234567894',
      isNew: false,
      trending: true,
      website: 'https://www.mcdonalds.com',
      hasOnlineStore: true,
      storeType: 'Food & Beverage',
    },
    {
      id: 'mock-6',
      name: 'Best Buy',
      category: 'electronics',
      distance: 1.8,
      rating: 4.4,
      address: '555 Electronics Blvd',
      latitude: latitude + 0.013,
      longitude: longitude + 0.010,
      openingHours: 'Mo-Sa 10:00-21:00',
      phone: '+1234567895',
      isNew: true,
      trending: false,
      website: 'https://www.bestbuy.com',
      hasOnlineStore: true,
      storeType: 'Electronics',
    },
    {
      id: 'mock-7',
      name: 'Subway',
      category: 'restaurant',
      distance: 0.9,
      rating: 4.0,
      address: '222 Sandwich Street',
      latitude: latitude - 0.007,
      longitude: longitude - 0.006,
      openingHours: 'Mo-Su 08:00-22:00',
      phone: '+1234567896',
      isNew: false,
      trending: false,
      website: 'https://www.subway.com',
      hasOnlineStore: true,
      storeType: 'Food & Beverage',
    },
    {
      id: 'mock-8',
      name: 'Costco Wholesale',
      category: 'grocery',
      distance: 3.5,
      rating: 4.6,
      address: '888 Wholesale Way',
      latitude: latitude + 0.025,
      longitude: longitude - 0.020,
      openingHours: 'Mo-Fr 10:00-20:30',
      phone: '+1234567897',
      isNew: false,
      trending: true,
      website: 'https://www.costco.com',
      hasOnlineStore: true,
      storeType: 'Grocery',
    },
  ];

  // Filter by category
  let filtered = mockPlaces;
  if (category !== 'all') {
    filtered = mockPlaces.filter(p => p.category === category);
  }

  // Filter by radius
  filtered = filtered.filter(p => p.distance <= radius);

  return filtered;
}

// Cache implementation
interface CacheEntry {
  data: any;
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_DURATION = 20 * 60 * 1000; // 20 minutes in milliseconds

function getCacheKey(latitude: number, longitude: number, radius: number, category: string, brandName: string): string {
  return `${latitude.toFixed(4)}-${longitude.toFixed(4)}-${radius}-${category}-${brandName}`;
}

function getCachedData(key: string): any | null {
  const entry = cache.get(key);
  if (!entry) return null;

  const now = Date.now();
  if (now - entry.timestamp > CACHE_DURATION) {
    cache.delete(key);
    return null;
  }

  return entry.data;
}

function setCachedData(key: string, data: any): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
  });
}

export async function GET(request: NextRequest) {
  try {
    console.log('[NEARWISE-PLACES] Starting places fetch...');

    const { searchParams } = new URL(request.url);
    const latitude = parseFloat(searchParams.get('latitude') || '0');
    const longitude = parseFloat(searchParams.get('longitude') || '0');
    const radius = parseFloat(searchParams.get('radius') || '10');
    const category = searchParams.get('category') || 'all';
    const brandName = searchParams.get('brand') || '';
    const noCache = searchParams.get('nocache') === 'true';

    if (!latitude || !longitude) {
      return NextResponse.json(
        { error: 'latitude and longitude parameters are required' },
        { status: 400 }
      );
    }

    console.log('[NEARWISE-PLACES] Fetching places:', { latitude, longitude, radius, category, brandName });

    // Check cache first (unless nocache is specified)
    if (!noCache) {
      const cacheKey = getCacheKey(latitude, longitude, radius, category, brandName);
      const cachedData = getCachedData(cacheKey);

      if (cachedData) {
        console.log('[NEARWISE-PLACES] Cache hit! Returning cached data');
        return NextResponse.json({
          ...cachedData,
          fromCache: true,
        });
      }
      console.log('[NEARWISE-PLACES] Cache miss, fetching fresh data');
    }

    // Detect country for food delivery platform availability (simplified - coordinate-based only)
    let countryCode = 'US'; // Default fallback
    let availableDeliveryPlatforms: any[] = [];

    // Use coordinate-based detection (faster, no external API calls)
    if (latitude >= 8 && latitude <= 35 && longitude >= 68 && longitude <= 97) {
      countryCode = 'IN';
    } else if (latitude >= 25 && latitude <= 50 && longitude >= -125 && longitude <= -65) {
      countryCode = 'US';
    } else if (latitude >= 50 && latitude <= 60 && longitude >= -8 && longitude <= 2) {
      countryCode = 'GB';
    } else if (latitude >= -45 && latitude <= -10 && longitude >= 110 && longitude <= 155) {
      countryCode = 'AU'; // Australia
    } else if (latitude >= 35 && latitude <= 45 && longitude >= 130 && longitude <= 145) {
      countryCode = 'JP'; // Japan
    }

    availableDeliveryPlatforms = getAvailablePlatforms(countryCode);
    console.log('[NEARWISE-PLACES] Detected country:', countryCode, 'from coordinates');
    console.log('[NEARWISE-PLACES] Available delivery platforms:', availableDeliveryPlatforms.map((p: any) => p.name).join(', '));

    // Build Overpass API query - optimized for performance
    const radiusMeters = radius * 1000; // Convert km to meters

    // Calculate bounding box (more efficient than radius for large areas)
    const latDelta = (radius / 111.32); // 1 degree latitude ≈ 111.32 km
    const lonDelta = (radius / (111.32 * Math.cos(latitude * Math.PI / 180)));
    const bbox = `${latitude - latDelta},${longitude - lonDelta},${latitude + latDelta},${longitude + lonDelta}`;

    // Optimized query to reduce timeout issues
    let overpassQuery = '';

    // If brand name is specified, search for it specifically
    if (brandName) {
      const brandRegex = brandName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escape special chars

      // Search in both name and brand tags across all relevant categories
      if (category === 'shop' || category === 'all' || category === 'clothing' || category === 'shoes' || category === 'accessories' || category === 'sportswear' || category === 'department') {
        overpassQuery += `
          node["shop"]["name"~"${brandRegex}",i](${bbox});
          node["shop"]["brand"~"${brandRegex}",i](${bbox});
        `;
      }

      if (category === 'mall' || category === 'all') {
        overpassQuery += `
          node["shop"="mall"]["name"~"${brandRegex}",i](${bbox});
          node["shop"="mall"]["brand"~"${brandRegex}",i](${bbox});
        `;
      }

      if (category === 'restaurant' || category === 'all') {
        overpassQuery += `
          node["amenity"~"restaurant|cafe|fast_food|bar|pub|food_court|ice_cream|bistro|biergarten"]["name"~"${brandRegex}",i](${bbox});
          node["amenity"~"restaurant|cafe|fast_food|bar|pub|food_court|ice_cream|bistro|biergarten"]["brand"~"${brandRegex}",i](${bbox});
        `;
      }
    } else {
      // Query without brand filter - optimized for specific categories
      if (category === 'clothing') {
        overpassQuery += `node["shop"~"clothes|fashion|boutique|tailor"](${bbox});`;
      } else if (category === 'shoes') {
        overpassQuery += `node["shop"="shoes"](${bbox});`;
      } else if (category === 'accessories') {
        overpassQuery += `node["shop"~"jewelry|accessories|watches|bags"](${bbox});`;
      } else if (category === 'sportswear') {
        overpassQuery += `node["shop"~"sports|outdoor"](${bbox});`;
      } else if (category === 'department') {
        overpassQuery += `node["shop"="department_store"](${bbox});`;
      } else if (category === 'shop') {
        // Only general shops, exclude fashion categories to avoid duplicates
        overpassQuery += `node["shop"]["shop"!~"clothes|fashion|boutique|tailor|shoes|jewelry|accessories|watches|bags|sports|outdoor|department_store|mall"](${bbox});`;
      } else if (category === 'mall') {
        overpassQuery += `node["shop"="mall"](${bbox});`;
      } else if (category === 'restaurant') {
        // Include ALL food and beverage establishments
        overpassQuery += `node["amenity"~"restaurant|cafe|fast_food|bar|pub|food_court|ice_cream|bistro|biergarten"](${bbox});`;
      } else if (category === 'all') {
        // For 'all', limit to most common categories to prevent timeout
        // Use smaller radius for 'all' queries
        const limitedRadius = Math.min(radius, 10); // Max 10km for 'all' category
        const limitedRadiusMeters = limitedRadius * 1000;
        overpassQuery += `
          node["shop"](around:${limitedRadiusMeters},${latitude},${longitude});
          node["amenity"~"restaurant|cafe|fast_food|bar|pub|food_court|ice_cream|bistro|biergarten"](around:${limitedRadiusMeters},${latitude},${longitude});
        `;
      }
    }

    const fullQuery = `
      [out:json][timeout:12];
      (
        ${overpassQuery}
      );
      out body meta;
      >;
      out skel qt;
    `;

    console.log('[NEARWISE-PLACES] Querying Overpass API...');
    console.log('[NEARWISE-PLACES] Query:', fullQuery.substring(0, 200) + '...');

    // Query Overpass API with timeout (15 seconds to allow server 12 seconds + network time)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    let overpassData: any;
    let usingMockData = false;

    try {
      const overpassResponse = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `data=${encodeURIComponent(fullQuery)}`,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!overpassResponse.ok) {
        const statusText = overpassResponse.statusText || 'Unknown error';
        console.warn(`[NEARWISE-PLACES] Overpass API returned ${overpassResponse.status} ${statusText}, using mock data`);

        // Provide specific error messages for common status codes
        let errorMessage = 'Overpass API error';
        if (overpassResponse.status === 504) {
          errorMessage = 'Overpass API timeout (504 Gateway Timeout)';
        } else if (overpassResponse.status === 429) {
          errorMessage = 'Overpass API rate limit exceeded (429 Too Many Requests)';
        } else if (overpassResponse.status === 500) {
          errorMessage = 'Overpass API server error (500 Internal Server Error)';
        }

        throw new Error(`${errorMessage}: ${overpassResponse.status}`);
      }

      overpassData = await overpassResponse.json();

      // Validate response structure
      if (!overpassData || !Array.isArray(overpassData.elements)) {
        console.warn('[NEARWISE-PLACES] Invalid Overpass API response structure, using mock data');
        throw new Error('Invalid Overpass API response structure');
      }
    } catch (error: any) {
      clearTimeout(timeoutId);

      // Determine error type for better logging
      const errorType = error.name === 'AbortError' ? 'Request timeout' :
                       error.message.includes('fetch') ? 'Network error' :
                       error.message;

      console.warn('[NEARWISE-PLACES] Overpass API failed, using mock data:', errorType);

      // Use mock data as fallback
      let mockPlaces = generateMockPlaces(latitude, longitude, radius, category);

      // Filter by brand name if specified
      if (brandName) {
        const brandLower = brandName.toLowerCase();
        mockPlaces = mockPlaces.filter(p =>
          p.name.toLowerCase().includes(brandLower)
        );
      }

      usingMockData = true;

      const categorized = {
        shop: mockPlaces.filter(p => p.category === 'shop'),
        mall: mockPlaces.filter(p => p.category === 'mall'),
        restaurant: mockPlaces.filter(p => p.category === 'restaurant'),
        clothing: mockPlaces.filter(p => p.category === 'clothing'),
        shoes: mockPlaces.filter(p => p.category === 'shoes'),
        accessories: mockPlaces.filter(p => p.category === 'accessories'),
        sportswear: mockPlaces.filter(p => p.category === 'sportswear'),
        department: mockPlaces.filter(p => p.category === 'department'),
        new: mockPlaces.filter(p => p.isNew),
        trending: mockPlaces.filter(p => p.trending),
        offers: mockPlaces.filter(p => p.hasOffer),
        all: mockPlaces,
      };

      const responseData = {
        success: true,
        location: { latitude, longitude },
        radius,
        category,
        brandName,
        count: mockPlaces.length,
        places: mockPlaces,
        categorized,
        usingMockData: true,
        message: 'Using sample data. The Overpass API is currently unavailable or slow. Please try again later.',
      };

      // Cache the mock data response
      if (!noCache) {
        const cacheKey = getCacheKey(latitude, longitude, radius, category, brandName);
        setCachedData(cacheKey, responseData);
      }

      return NextResponse.json(responseData);
    }
    console.log('[NEARWISE-PLACES] Overpass API returned:', overpassData.elements?.length || 0, 'elements');

    // Process and format the results with validation
    const places: Place[] = overpassData.elements
      .filter((element: any) => {
        // Validate element has required data
        if (!element.tags || !element.tags.name) return false;

        // Validate coordinates
        const lat = element.lat || element.center?.lat;
        const lon = element.lon || element.center?.lon;
        if (!lat || !lon || isNaN(lat) || isNaN(lon)) {
          console.warn('[NEARWISE-PLACES] Skipping element with invalid coordinates:', element.id);
          return false;
        }

        // Validate coordinate ranges
        if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
          console.warn('[NEARWISE-PLACES] Skipping element with out-of-range coordinates:', element.id);
          return false;
        }

        return true;
      })
      .map((element: any) => {
        const lat = element.lat || element.center?.lat;
        const lon = element.lon || element.center?.lon;
        const distance = calculateDistance(latitude, longitude, lat, lon);
        const placeName = element.tags.name || 'Unnamed Place';
        const placeCategory = mapOSMCategory(element.tags);

        // Try to get brand information from database
        const brandInfo = getBrandByName(placeName);

        // Format address with better fallback
        let address = element.tags['addr:full'] || '';
        if (!address) {
          const street = element.tags['addr:street'] || '';
          const houseNumber = element.tags['addr:housenumber'] || '';
          const city = element.tags['addr:city'] || '';
          const postcode = element.tags['addr:postcode'] || '';

          const parts = [houseNumber, street, city, postcode].filter(p => p);
          address = parts.length > 0 ? parts.join(', ') : 'Address not available';
        }

        // Check for new opening and promotional offers
        const isNew = isNewPlace(element.tags, element);
        const hasOffer = hasPromotionalOffer(element.tags);

        // Extract offer text if promotional keywords found
        let offerText: string | undefined;
        if (hasOffer) {
          const name = element.tags.name || '';
          const description = element.tags.description || '';
          offerText = description || name;
        }

        // Generate offer expiration (7 days from now for detected offers)
        const offerExpiration = hasOffer
          ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
          : undefined;

        // Check if this is a restaurant and add delivery platforms
        const isRestaurant = isRestaurantPlace(element.tags);
        // Serialize platforms (remove functions for JSON serialization)
        const deliveryPlatforms = isRestaurant
          ? availableDeliveryPlatforms.map(p => ({
              id: p.id,
              name: p.name,
              logo: p.logo,
              color: p.color,
            }))
          : undefined;

        return {
          id: `osm-${element.type}-${element.id}`,
          name: placeName,
          category: placeCategory,
          distance: Math.round(distance * 100) / 100, // Round to 2 decimal places
          rating: generateRating(element.tags),
          address: address,
          latitude: lat,
          longitude: lon,
          openingHours: element.tags.opening_hours || undefined,
          phone: element.tags.phone || element.tags['contact:phone'] || undefined,
          isNew: isNew,
          trending: isTrendingPlace(element.tags),
          tags: Object.keys(element.tags).filter(key =>
            !key.startsWith('addr:') &&
            !['name', 'phone', 'opening_hours'].includes(key)
          ),
          // Add brand information if available
          website: brandInfo?.website || element.tags.website || element.tags['contact:website'] || undefined,
          hasOnlineStore: brandInfo?.website ? true : false, // If brand has website, assume online store
          storeType: brandInfo ? getStoreTypeLabel(brandInfo.category) : getStoreTypeLabel(placeCategory),
          brandInfo: brandInfo,
          // New fields for offers and engagement
          hasOffer: hasOffer,
          offerText: offerText,
          offerExpiration: offerExpiration,
          createdDate: element.timestamp || undefined,
          isTrending: isTrendingPlace(element.tags),
          socialEngagement: 0, // Will be enriched by social media cross-reference
          // Food delivery integration
          isRestaurant: isRestaurant,
          deliveryPlatforms: deliveryPlatforms,
        };
      })
      .filter((place: Place) => {
        // Additional validation after mapping
        if (place.distance > radius) return false;
        if (place.distance < 0) {
          console.warn('[NEARWISE-PLACES] Skipping place with negative distance:', place.name);
          return false;
        }
        return true;
      })
      .sort((a: Place, b: Place) => a.distance - b.distance) // Sort by distance
      .slice(0, 50); // Limit to 50 results

    console.log('[NEARWISE-PLACES] Processed places:', places.length);

    // Enrich places with social media data
    const enrichedPlaces = await enrichPlacesWithSocialData(places, latitude, longitude, radius);

    // Log statistics for debugging
    if (enrichedPlaces.length > 0) {
      const avgDistance = enrichedPlaces.reduce((sum, p) => sum + p.distance, 0) / enrichedPlaces.length;
      console.log('[NEARWISE-PLACES] Average distance:', avgDistance.toFixed(2), 'km');
      console.log('[NEARWISE-PLACES] Closest place:', enrichedPlaces[0].name, 'at', enrichedPlaces[0].distance, 'km');
      console.log('[NEARWISE-PLACES] Farthest place:', enrichedPlaces[enrichedPlaces.length - 1].name, 'at', enrichedPlaces[enrichedPlaces.length - 1].distance, 'km');
    }

    // Categorize places
    const categorized = {
      shop: enrichedPlaces.filter(p => p.category === 'shop'),
      mall: enrichedPlaces.filter(p => p.category === 'mall'),
      restaurant: enrichedPlaces.filter(p => p.category === 'restaurant'),
      clothing: enrichedPlaces.filter(p => p.category === 'clothing'),
      shoes: enrichedPlaces.filter(p => p.category === 'shoes'),
      accessories: enrichedPlaces.filter(p => p.category === 'accessories'),
      sportswear: enrichedPlaces.filter(p => p.category === 'sportswear'),
      department: enrichedPlaces.filter(p => p.category === 'department'),
      new: enrichedPlaces.filter(p => p.isNew),
      trending: enrichedPlaces.filter(p => p.isTrending || p.trending),
      offers: enrichedPlaces.filter(p => p.hasOffer),
      all: enrichedPlaces,
    };

    const responseData = {
      success: true,
      location: { latitude, longitude },
      radius,
      category,
      brandName,
      count: enrichedPlaces.length,
      places: category === 'all' ? enrichedPlaces : categorized[category as keyof typeof categorized] || enrichedPlaces,
      categorized,
      usingMockData: false,
    };

    // Cache the successful response
    if (!noCache) {
      const cacheKey = getCacheKey(latitude, longitude, radius, category, brandName);
      setCachedData(cacheKey, responseData);
      console.log('[NEARWISE-PLACES] Data cached successfully');
    }

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('[NEARWISE-PLACES] ========== ERROR ==========');
    console.error('[NEARWISE-PLACES] Error type:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('[NEARWISE-PLACES] Error message:', error instanceof Error ? error.message : String(error));
    console.error('[NEARWISE-PLACES] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('[NEARWISE-PLACES] ============================');

    return NextResponse.json(
      {
        error: 'Failed to fetch places',
        details: error instanceof Error ? error.message : 'Unknown error',
        errorType: error instanceof Error ? error.constructor.name : typeof error
      },
      { status: 500 }
    );
  }
}

