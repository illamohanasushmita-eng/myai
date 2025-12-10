// Food Delivery Platform Integration
// Generates deep links and checks availability for various food delivery platforms

export interface DeliveryPlatform {
  id: string;
  name: string;
  logo: string;
  color: string;
  countries: string[]; // ISO country codes where platform is available
  generateUrl: (restaurantName: string, address: string, latitude: number, longitude: number, city: string) => string;
  isAvailable: (country: string) => boolean;
}

// Helper: Slugify restaurant name for URLs
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim();
}

// Helper: Extract city slug from address
function getCitySlug(city: string, address: string): string {
  // Try to extract city from address if city is "Unknown"
  if (city === 'Unknown' || !city) {
    const addressParts = address.split(',');
    if (addressParts.length > 1) {
      return slugify(addressParts[addressParts.length - 2].trim());
    }
  }
  return slugify(city);
}

// Food Delivery Platforms Configuration
export const deliveryPlatforms: DeliveryPlatform[] = [
  {
    id: 'swiggy',
    name: 'Swiggy',
    logo: '🍔', // Can be replaced with actual logo URL
    color: '#FC8019',
    countries: ['IN'], // India
    generateUrl: (restaurantName, address, latitude, longitude, city) => {
      const slug = slugify(restaurantName);
      const citySlug = getCitySlug(city, address);
      // Swiggy URL format: https://www.swiggy.com/restaurants/[restaurant-name]-[area]-[city]-[id]
      // Since we don't have the ID, we'll use search URL with coordinates
      return `https://www.swiggy.com/search?lat=${latitude}&lng=${longitude}&query=${encodeURIComponent(restaurantName)}`;
    },
    isAvailable: (country) => country === 'IN',
  },
  {
    id: 'zomato',
    name: 'Zomato',
    logo: '🍕', // Can be replaced with actual logo URL
    color: '#E23744',
    countries: ['IN', 'AE', 'AU', 'BR', 'CA', 'CL', 'CZ', 'ID', 'IE', 'IT', 'LB', 'MY', 'NZ', 'PH', 'PL', 'PT', 'QA', 'SG', 'SK', 'TR', 'GB', 'US', 'ZA'],
    generateUrl: (restaurantName, address, latitude, longitude, city) => {
      const slug = slugify(restaurantName);
      const citySlug = getCitySlug(city, address);
      // Zomato URL format: https://www.zomato.com/[city]/[restaurant-name]-[area]
      // Using search URL with coordinates for better accuracy
      return `https://www.zomato.com/search?q=${encodeURIComponent(restaurantName)}&lat=${latitude}&lon=${longitude}`;
    },
    isAvailable: (country) => ['IN', 'AE', 'AU', 'US', 'GB', 'CA'].includes(country),
  },
  {
    id: 'ubereats',
    name: 'Uber Eats',
    logo: '🚗', // Can be replaced with actual logo URL
    color: '#06C167',
    countries: ['US', 'CA', 'GB', 'AU', 'NZ', 'FR', 'ES', 'IT', 'NL', 'BE', 'SE', 'NO', 'DK', 'FI', 'PL', 'PT', 'IE', 'AT', 'CH', 'JP', 'TW', 'HK', 'MX', 'BR', 'CL', 'CR', 'EC', 'SV', 'GT', 'PA', 'ZA', 'KE'],
    generateUrl: (restaurantName, address, latitude, longitude, city) => {
      // Uber Eats URL format: https://www.ubereats.com/search?q=[restaurant-name]&pl=[latitude],[longitude]
      return `https://www.ubereats.com/search?q=${encodeURIComponent(restaurantName)}&pl=${latitude}%2C${longitude}`;
    },
    isAvailable: (country) => ['US', 'CA', 'GB', 'AU', 'FR', 'ES', 'IT', 'NL', 'JP', 'MX', 'BR'].includes(country),
  },
  {
    id: 'doordash',
    name: 'DoorDash',
    logo: '🚪', // Can be replaced with actual logo URL
    color: '#FF3008',
    countries: ['US', 'CA', 'AU', 'JP'],
    generateUrl: (restaurantName, address, latitude, longitude, city) => {
      // DoorDash URL format: https://www.doordash.com/search/?query=[restaurant-name]&lat=[latitude]&lng=[longitude]
      return `https://www.doordash.com/search/?query=${encodeURIComponent(restaurantName)}&lat=${latitude}&lng=${longitude}`;
    },
    isAvailable: (country) => ['US', 'CA', 'AU', 'JP'].includes(country),
  },
  {
    id: 'grubhub',
    name: 'Grubhub',
    logo: '🍽️', // Can be replaced with actual logo URL
    color: '#F63440',
    countries: ['US'],
    generateUrl: (restaurantName, address, latitude, longitude, city) => {
      // Grubhub URL format: https://www.grubhub.com/search?searchTerm=[restaurant-name]&latitude=[latitude]&longitude=[longitude]
      return `https://www.grubhub.com/search?searchTerm=${encodeURIComponent(restaurantName)}&latitude=${latitude}&longitude=${longitude}`;
    },
    isAvailable: (country) => country === 'US',
  },
  {
    id: 'deliveroo',
    name: 'Deliveroo',
    logo: '🦘', // Can be replaced with actual logo URL
    color: '#00CCBC',
    countries: ['GB', 'FR', 'IE', 'ES', 'IT', 'AU', 'NL', 'BE', 'SG', 'HK', 'AE', 'KW'],
    generateUrl: (restaurantName, address, latitude, longitude, city) => {
      // Deliveroo URL format: https://deliveroo.co.uk/restaurants/[city]/[restaurant-name]
      // Using search for better accuracy
      return `https://deliveroo.co.uk/restaurants?query=${encodeURIComponent(restaurantName)}&lat=${latitude}&lng=${longitude}`;
    },
    isAvailable: (country) => ['GB', 'FR', 'IE', 'ES', 'IT', 'AU', 'NL', 'BE', 'SG', 'HK', 'AE'].includes(country),
  },
  {
    id: 'foodpanda',
    name: 'foodpanda',
    logo: '🐼', // Can be replaced with actual logo URL
    color: '#D70F64',
    countries: ['SG', 'HK', 'TH', 'MY', 'PH', 'TW', 'BD', 'KH', 'MM', 'LA', 'PK', 'RO', 'BG'],
    generateUrl: (restaurantName, address, latitude, longitude, city) => {
      // foodpanda URL format varies by country
      // Using search URL
      return `https://www.foodpanda.com/search?q=${encodeURIComponent(restaurantName)}&lat=${latitude}&lng=${longitude}`;
    },
    isAvailable: (country) => ['SG', 'HK', 'TH', 'MY', 'PH', 'TW', 'BD', 'PK'].includes(country),
  },
  {
    id: 'justeat',
    name: 'Just Eat',
    logo: '🍴', // Can be replaced with actual logo URL
    color: '#FF8000',
    countries: ['GB', 'IE', 'FR', 'ES', 'IT', 'DK', 'NO', 'NZ', 'CA'],
    generateUrl: (restaurantName, address, latitude, longitude, city) => {
      // Just Eat URL format: https://www.just-eat.co.uk/restaurants-[restaurant-name]-[postcode]
      // Using search for better accuracy
      return `https://www.just-eat.co.uk/search?q=${encodeURIComponent(restaurantName)}`;
    },
    isAvailable: (country) => ['GB', 'IE', 'FR', 'ES', 'IT', 'DK', 'NO', 'NZ', 'CA'].includes(country),
  },
];

// Get available platforms for a specific country
export function getAvailablePlatforms(countryCode: string): DeliveryPlatform[] {
  return deliveryPlatforms.filter(platform => platform.isAvailable(countryCode));
}

// Detect country from coordinates (simplified - in production, use reverse geocoding)
export async function detectCountryFromCoordinates(latitude: number, longitude: number): Promise<string> {
  try {
    // Use OpenWeather Geocoding API to get country code with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

    const response = await fetch(
      `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=72f5c4b9ba0b32305cc8d8e3a1ee58c4`,
      { signal: controller.signal }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`OpenWeather API returned ${response.status}`);
    }

    const data = await response.json();
    if (data && data.length > 0 && data[0].country) {
      console.log('[FOOD-DELIVERY] Country detected from API:', data[0].country);
      return data[0].country; // Returns ISO country code (e.g., 'IN', 'US', 'GB')
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('[FOOD-DELIVERY] Country detection timed out, using coordinate fallback');
    } else {
      console.error('[FOOD-DELIVERY] Error detecting country:', error);
    }
  }

  // Default fallback based on coordinates
  console.log('[FOOD-DELIVERY] Using coordinate-based country detection');

  // India: roughly 8-35°N, 68-97°E
  if (latitude >= 8 && latitude <= 35 && longitude >= 68 && longitude <= 97) {
    console.log('[FOOD-DELIVERY] Coordinates indicate India');
    return 'IN';
  }
  // USA: roughly 25-50°N, -125 to -65°W
  if (latitude >= 25 && latitude <= 50 && longitude >= -125 && longitude <= -65) {
    console.log('[FOOD-DELIVERY] Coordinates indicate USA');
    return 'US';
  }
  // UK: roughly 50-60°N, -8 to 2°E
  if (latitude >= 50 && latitude <= 60 && longitude >= -8 && longitude <= 2) {
    console.log('[FOOD-DELIVERY] Coordinates indicate UK');
    return 'GB';
  }

  console.log('[FOOD-DELIVERY] Using default country: US');
  return 'US'; // Default fallback
}

