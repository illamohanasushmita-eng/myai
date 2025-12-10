import { NextRequest, NextResponse } from 'next/server';

// Brand Finder Response Interface
interface BrandFinderResponse {
  brand: string;
  offline_stores: Array<{
    name: string;
    distance_km: number;
    address: string;
    lat: number;
    lon: number;
  }>;
  online_links: {
    flipkart: string;
    amazon: string;
    myntra: string;
    ajio: string;
    nykaa: string;
    meesho: string;
    snapdeal: string;
    tatacliq: string;
  };
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

// Generate online shopping links for a brand
function generateOnlineLinks(brandName: string): BrandFinderResponse['online_links'] {
  const encodedBrand = encodeURIComponent(brandName);
  
  return {
    flipkart: `https://www.flipkart.com/search?q=${encodedBrand}`,
    amazon: `https://www.amazon.in/s?k=${encodedBrand}`,
    myntra: `https://www.myntra.com/${encodedBrand.toLowerCase()}`,
    ajio: `https://www.ajio.com/search/?text=${encodedBrand}`,
    nykaa: `https://www.nykaa.com/search/result/?q=${encodedBrand}`,
    meesho: `https://www.meesho.com/search?q=${encodedBrand}`,
    snapdeal: `https://www.snapdeal.com/search?keyword=${encodedBrand}`,
    tatacliq: `https://www.tatacliq.com/search/?searchCategory=all&text=${encodedBrand}`,
  };
}

// Extract brand name from user message
function extractBrandName(message: string): string | null {
  // Common brand names with proper capitalization (can be expanded)
  const commonBrands: { [key: string]: string } = {
    'puma': 'Puma',
    'zudio': 'Zudio',
    'h&m': 'H&M',
    'nykaa': 'Nykaa',
    'adidas': 'Adidas',
    'boat': 'boAt',
    'apple': 'Apple',
    'nike': 'Nike',
    'zara': 'Zara',
    'uniqlo': 'Uniqlo',
    'levis': "Levi's",
    'levi\'s': "Levi's",
    'gap': 'Gap',
    'forever 21': 'Forever 21',
    'mango': 'Mango',
    'bershka': 'Bershka',
    'pull&bear': 'Pull&Bear',
    'stradivarius': 'Stradivarius',
    'massimo dutti': 'Massimo Dutti',
    'gucci': 'Gucci',
    'prada': 'Prada',
    'louis vuitton': 'Louis Vuitton',
    'chanel': 'Chanel',
    'dior': 'Dior',
    'versace': 'Versace',
    'armani': 'Armani',
    'burberry': 'Burberry',
    'fendi': 'Fendi',
    'givenchy': 'Givenchy',
    'balenciaga': 'Balenciaga',
    'samsung': 'Samsung',
    'oneplus': 'OnePlus',
    'xiaomi': 'Xiaomi',
    'realme': 'Realme',
    'oppo': 'Oppo',
    'vivo': 'Vivo',
    'asus': 'Asus',
    'dell': 'Dell',
    'hp': 'HP',
    'lenovo': 'Lenovo',
    'acer': 'Acer',
    'sony': 'Sony',
    'lg': 'LG',
    'panasonic': 'Panasonic',
    'philips': 'Philips',
    'bosch': 'Bosch',
    'whirlpool': 'Whirlpool',
    'godrej': 'Godrej',
    'voltas': 'Voltas',
    'blue star': 'Blue Star',
    'carrier': 'Carrier',
    'daikin': 'Daikin',
    'hitachi': 'Hitachi',
    'starbucks': 'Starbucks',
    'mcdonald\'s': "McDonald's",
    'mcdonalds': "McDonald's",
    'kfc': 'KFC',
    'subway': 'Subway',
    'dominos': "Domino's",
    'domino\'s': "Domino's",
    'pizza hut': 'Pizza Hut',
    'burger king': 'Burger King',
    'costa coffee': 'Costa Coffee',
    'cafe coffee day': 'Cafe Coffee Day',
    'ccd': 'Cafe Coffee Day',
    'reliance': 'Reliance',
    'jio': 'Jio',
    'airtel': 'Airtel',
    'vodafone': 'Vodafone',
    'bata': 'Bata',
    'woodland': 'Woodland',
    'reebok': 'Reebok',
    'decathlon': 'Decathlon',
  };

  const lowerMessage = message.toLowerCase().trim();

  // Check for exact brand matches (prioritize longer matches first)
  const sortedBrands = Object.keys(commonBrands).sort((a, b) => b.length - a.length);

  for (const brand of sortedBrands) {
    if (lowerMessage.includes(brand)) {
      return commonBrands[brand];
    }
  }

  // If no match, return the message as-is (user might have typed exact brand name)
  // Clean up the message
  const cleaned = message.trim();
  if (cleaned.length > 0) {
    return cleaned;
  }

  return null;
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    const { searchParams } = new URL(request.url);
    const brandQuery = searchParams.get('brand');
    const message = searchParams.get('message');
    const latitude = parseFloat(searchParams.get('latitude') || '0');
    const longitude = parseFloat(searchParams.get('longitude') || '0');
    const radius = parseInt(searchParams.get('radius') || '5000'); // Default 5km

    console.log('[BRAND-FINDER] === NEW REQUEST ===');
    console.log('[BRAND-FINDER] Parameters:', {
      brandQuery,
      message,
      latitude,
      longitude,
      radius,
    });

    // Extract brand name from message or use direct brand query
    let brandName = brandQuery;
    if (!brandName && message) {
      brandName = extractBrandName(message);
      console.log(`[BRAND-FINDER] Extracted brand name: "${brandName}" from message: "${message}"`);
    }

    if (!brandName) {
      console.log('[BRAND-FINDER] ERROR: No brand name provided');
      return NextResponse.json({
        success: false,
        error: 'No brand name detected in the message. Please specify a brand name.',
      }, { status: 400 });
    }

    if (!latitude || !longitude || latitude === 0 || longitude === 0) {
      console.log('[BRAND-FINDER] ERROR: Invalid location coordinates');
      return NextResponse.json({
        success: false,
        error: 'Valid location (latitude and longitude) is required.',
      }, { status: 400 });
    }

    console.log(`[BRAND-FINDER] ✓ Searching for brand: "${brandName}" near (${latitude}, ${longitude}) within ${radius}m (${radius/1000}km)`);

    // Generate online shopping links
    const onlineLinks = generateOnlineLinks(brandName);
    console.log('[BRAND-FINDER] ✓ Generated online shopping links');

    // Search for offline stores using Overpass API
    console.log('[BRAND-FINDER] Starting Overpass API search...');
    const offlineStores = await searchOfflineStores(brandName, latitude, longitude, radius);
    console.log(`[BRAND-FINDER] ✓ Overpass API search completed: ${offlineStores.length} stores found`);

    const response: BrandFinderResponse = {
      brand: brandName,
      offline_stores: offlineStores,
      online_links: onlineLinks,
    };

    const duration = Date.now() - startTime;
    const message_text = offlineStores.length > 0
      ? `Found ${offlineStores.length} offline store(s) for ${brandName} within ${radius / 1000}km`
      : `No offline stores found for ${brandName} within ${radius / 1000}km. Try increasing the search radius or check online links!`;

    console.log(`[BRAND-FINDER] ✓ Request completed in ${duration}ms`);
    console.log('[BRAND-FINDER] === END REQUEST ===\n');

    return NextResponse.json({
      success: true,
      data: response,
      message: message_text,
      debug: {
        duration_ms: duration,
        search_radius_km: radius / 1000,
        stores_found: offlineStores.length,
      }
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('[BRAND-FINDER] ❌ ERROR:', error);
    if (error instanceof Error) {
      console.error('[BRAND-FINDER] Error message:', error.message);
      console.error('[BRAND-FINDER] Error stack:', error.stack);
    }
    console.log(`[BRAND-FINDER] Request failed after ${duration}ms`);
    console.log('[BRAND-FINDER] === END REQUEST (ERROR) ===\n');

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to search for brand',
      debug: {
        duration_ms: duration,
      }
    }, { status: 500 });
  }
}

// Search for offline stores using Overpass API
async function searchOfflineStores(
  brandName: string,
  latitude: number,
  longitude: number,
  radius: number
): Promise<BrandFinderResponse['offline_stores']> {
  try {
    // Normalize brand name for better matching
    const normalizedBrand = brandName.trim();
    const brandLower = normalizedBrand.toLowerCase();

    // Build comprehensive Overpass query
    // Search for: brand tag (exact and case-insensitive), name tag (case-insensitive), and operator tag
    const overpassQuery = `
      [out:json][timeout:25];
      (
        // Exact brand match (case-sensitive)
        node["brand"="${normalizedBrand}"](around:${radius},${latitude},${longitude});
        way["brand"="${normalizedBrand}"](around:${radius},${latitude},${longitude});
        relation["brand"="${normalizedBrand}"](around:${radius},${latitude},${longitude});

        // Case-insensitive brand match
        node["brand"~"^${normalizedBrand}$",i](around:${radius},${latitude},${longitude});
        way["brand"~"^${normalizedBrand}$",i](around:${radius},${latitude},${longitude});
        relation["brand"~"^${normalizedBrand}$",i](around:${radius},${latitude},${longitude});

        // Name contains brand (case-insensitive)
        node["name"~"${normalizedBrand}",i](around:${radius},${latitude},${longitude});
        way["name"~"${normalizedBrand}",i](around:${radius},${latitude},${longitude});
        relation["name"~"${normalizedBrand}",i](around:${radius},${latitude},${longitude});

        // Operator tag (for franchises)
        node["operator"~"${normalizedBrand}",i](around:${radius},${latitude},${longitude});
        way["operator"~"${normalizedBrand}",i](around:${radius},${latitude},${longitude});
        relation["operator"~"${normalizedBrand}",i](around:${radius},${latitude},${longitude});
      );
      out center;
      out body;
    `;

    console.log('[BRAND-FINDER] Overpass Query:', overpassQuery);
    console.log(`[BRAND-FINDER] Searching for: "${normalizedBrand}" near (${latitude}, ${longitude}) within ${radius}m`);

    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `data=${encodeURIComponent(overpassQuery)}`,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[BRAND-FINDER] Overpass API HTTP error:', response.status, errorText);
      throw new Error(`Overpass API returned status ${response.status}`);
    }

    const data = await response.json();
    const elements = data.elements || [];

    console.log(`[BRAND-FINDER] Received ${elements.length} raw elements from Overpass API`);

    // Process and filter results
    const stores: BrandFinderResponse['offline_stores'] = [];
    const seenLocations = new Set<string>();

    for (const element of elements) {
      // Get coordinates - handle both nodes and ways/relations
      let lat = element.lat;
      let lon = element.lon;

      // For ways and relations, use center coordinates
      if (!lat && !lon && element.center) {
        lat = element.center.lat;
        lon = element.center.lon;
      }

      // Skip if no coordinates available
      if (!lat || !lon) {
        console.log('[BRAND-FINDER] Skipping element without coordinates:', element.type, element.id);
        continue;
      }

      const tags = element.tags || {};

      // Get the best name for the store
      const name = tags.name || tags.brand || tags.operator || normalizedBrand;

      // Verify this is actually related to the brand we're searching for
      const brandMatch = tags.brand?.toLowerCase().includes(brandLower) ||
                        tags.name?.toLowerCase().includes(brandLower) ||
                        tags.operator?.toLowerCase().includes(brandLower);

      if (!brandMatch) {
        console.log('[BRAND-FINDER] Skipping non-matching element:', name);
        continue;
      }

      // Calculate distance
      const distance = calculateDistance(latitude, longitude, lat, lon);

      // Skip if outside radius (with small buffer for rounding)
      if (distance > (radius / 1000) * 1.1) {
        console.log(`[BRAND-FINDER] Skipping element outside radius: ${distance.toFixed(2)}km > ${(radius/1000).toFixed(2)}km`);
        continue;
      }

      // Create unique location key to avoid duplicates
      const locationKey = `${lat.toFixed(5)},${lon.toFixed(5)}`;
      if (seenLocations.has(locationKey)) {
        console.log('[BRAND-FINDER] Skipping duplicate location:', locationKey);
        continue;
      }
      seenLocations.add(locationKey);

      // Build address from OSM tags
      const addressParts = [
        tags['addr:housenumber'],
        tags['addr:street'],
        tags['addr:suburb'] || tags['addr:neighbourhood'],
        tags['addr:city'] || tags['addr:town'],
        tags['addr:state'],
        tags['addr:postcode'],
      ].filter(Boolean);

      const address = addressParts.length > 0
        ? addressParts.join(', ')
        : tags.address || 'Address not available';

      // Add store type info if available
      const storeType = tags.shop || tags.amenity || tags.building || '';
      const fullName = storeType ? `${name} (${storeType})` : name;

      stores.push({
        name: fullName,
        distance_km: parseFloat(distance.toFixed(2)),
        address: address,
        lat: lat,
        lon: lon,
      });

      console.log(`[BRAND-FINDER] Added store: ${fullName} at ${distance.toFixed(2)}km`);
    }

    // Sort by distance (nearest first)
    stores.sort((a, b) => a.distance_km - b.distance_km);

    console.log(`[BRAND-FINDER] Final result: ${stores.length} unique stores found`);
    if (stores.length > 0) {
      console.log('[BRAND-FINDER] Nearest store:', stores[0].name, 'at', stores[0].distance_km, 'km');
    }

    return stores;

  } catch (error) {
    console.error('[BRAND-FINDER] Error searching offline stores:', error);
    if (error instanceof Error) {
      console.error('[BRAND-FINDER] Error details:', error.message, error.stack);
    }
    return [];
  }
}

