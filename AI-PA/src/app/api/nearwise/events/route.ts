import { NextRequest, NextResponse } from 'next/server';

// Types
interface Event {
  id: string;
  name: string;
  description: string;
  startTime: string;
  endTime: string;
  location: {
    name: string;
    address: string;
    distance: number;
    latitude?: number;
    longitude?: number;
  };
  attendeeCount: number;
  coverImage?: string;
  link: string;
  category?: string;
  ticketUrl?: string;
  isFree?: boolean;
}

// Cache for events data (15-minute expiration)
const eventsCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

// Rate limiting tracker
const rateLimitTracker = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour

// Helper: Check rate limit
function checkRateLimit(platform: string, limit: number): boolean {
  const now = Date.now();
  const key = `${platform}-rate-limit`;
  const tracker = rateLimitTracker.get(key);

  if (!tracker || now > tracker.resetTime) {
    rateLimitTracker.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (tracker.count >= limit) {
    console.warn(`[NEARWISE-EVENTS] Rate limit exceeded for ${platform}`);
    return false;
  }

  tracker.count++;
  return true;
}

// Helper: Get cached data
function getCachedData(key: string): any | null {
  const cached = eventsCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log(`[NEARWISE-EVENTS] Cache hit for key: ${key}`);
    return cached.data;
  }
  return null;
}

// Helper: Set cached data
function setCachedData(key: string, data: any): void {
  eventsCache.set(key, { data, timestamp: Date.now() });
}

// Helper: Calculate distance between two coordinates (Haversine formula)
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

// Mock data generator for events
function generateMockEvents(latitude: number, longitude: number, radius: number, count: number = 15): Event[] {
  const eventNames = [
    'Summer Music Festival',
    'Food & Wine Tasting',
    'Art Exhibition Opening',
    'Tech Startup Meetup',
    'Yoga in the Park',
    'Local Farmers Market',
    'Comedy Night',
    'Book Club Meeting',
    'Photography Workshop',
    'Charity Run 5K',
    'Jazz Concert',
    'Cooking Class',
    'Film Screening',
    'Business Networking Event',
    'Dance Performance',
  ];

  const venues = [
    'City Convention Center',
    'Downtown Plaza',
    'Community Center',
    'Art Gallery',
    'Central Park',
    'Local Theater',
    'Coffee House',
    'Sports Complex',
    'Library Auditorium',
    'Rooftop Lounge',
  ];

  const categories = ['Music', 'Food & Drink', 'Arts', 'Business', 'Sports', 'Community', 'Entertainment'];

  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;

  return Array.from({ length: count }, (_, i) => {
    const startTime = new Date(now + Math.random() * 30 * oneDay); // Events in next 30 days
    const duration = (2 + Math.random() * 4) * 60 * 60 * 1000; // 2-6 hours
    const endTime = new Date(startTime.getTime() + duration);
    const distance = Math.random() * radius;
    const venue = venues[Math.floor(Math.random() * venues.length)];

    return {
      id: `mock-event-${Date.now()}-${i}`,
      name: `[SAMPLE] ${eventNames[i % eventNames.length]}`,
      description: `⚠️ This is a sample event for demonstration purposes. Join us for an amazing ${eventNames[i % eventNames.length].toLowerCase()}! This event promises to be unforgettable with great atmosphere, wonderful people, and memorable experiences. Enable Eventbrite or Facebook integration to see real events.`,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      location: {
        name: venue,
        address: `${Math.floor(Math.random() * 999) + 1} Main Street, City`,
        distance: Math.round(distance * 100) / 100,
        latitude: latitude + (Math.random() - 0.5) * 0.1,
        longitude: longitude + (Math.random() - 0.5) * 0.1,
      },
      attendeeCount: Math.floor(Math.random() * 500) + 50,
      coverImage: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 100000000)}`,
      link: `#`,
      category: categories[Math.floor(Math.random() * categories.length)],
      ticketUrl: undefined, // No ticket URL for mock events
      isFree: Math.random() > 0.6,
    };
  }).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
}

// Facebook Events API Integration
async function fetchFacebookEvents(latitude: number, longitude: number, radius: number, startDate?: string, endDate?: string): Promise<Event[]> {
  const accessToken = process.env.FACEBOOK_ACCESS_TOKEN;
  
  if (!accessToken || process.env.ENABLE_FACEBOOK_INTEGRATION !== 'true') {
    console.log('[NEARWISE-EVENTS] Facebook integration disabled or no access token');
    return [];
  }

  if (!checkRateLimit('facebook-events', 200)) {
    throw new Error('Facebook Events API rate limit exceeded');
  }

  try {
    // Step 1: Search for nearby places
    const placesUrl = `https://graph.facebook.com/v18.0/search?type=place&center=${latitude},${longitude}&distance=${radius * 1000}&fields=id,name,location&access_token=${accessToken}`;
    
    const placesResponse = await fetch(placesUrl);
    if (!placesResponse.ok) {
      throw new Error(`Facebook API error: ${placesResponse.status}`);
    }
    
    const placesData = await placesResponse.json();
    const places = placesData.data || [];

    // Step 2: Fetch events from each place
    const events: Event[] = [];
    
    for (const place of places.slice(0, 20)) { // Limit to 20 places
      try {
        let eventsUrl = `https://graph.facebook.com/v18.0/${place.id}/events?fields=id,name,description,start_time,end_time,place,attending_count,cover,ticket_uri,is_online&access_token=${accessToken}`;
        
        // Add date filters if provided
        if (startDate) {
          eventsUrl += `&since=${new Date(startDate).getTime() / 1000}`;
        }
        if (endDate) {
          eventsUrl += `&until=${new Date(endDate).getTime() / 1000}`;
        }
        
        const eventsResponse = await fetch(eventsUrl);
        if (!eventsResponse.ok) continue;
        
        const eventsData = await eventsResponse.json();
        const placeEvents = eventsData.data || [];

        for (const event of placeEvents) {
          const eventLat = event.place?.location?.latitude || place.location?.latitude || latitude;
          const eventLon = event.place?.location?.longitude || place.location?.longitude || longitude;
          const distance = calculateDistance(latitude, longitude, eventLat, eventLon);

          if (distance <= radius) {
            events.push({
              id: event.id,
              name: event.name,
              description: event.description || '',
              startTime: event.start_time,
              endTime: event.end_time || event.start_time,
              location: {
                name: event.place?.name || place.name,
                address: event.place?.location?.street || place.location?.street || 'Address not available',
                distance: Math.round(distance * 100) / 100,
                latitude: eventLat,
                longitude: eventLon,
              },
              attendeeCount: event.attending_count || 0,
              coverImage: event.cover?.source,
              link: `https://facebook.com/events/${event.id}`,
              ticketUrl: event.ticket_uri,
              isFree: !event.ticket_uri,
            });
          }
        }
      } catch (error) {
        console.error(`[NEARWISE-EVENTS] Error fetching events for place ${place.id}:`, error);
      }
    }

    return events;
  } catch (error) {
    console.error('[NEARWISE-EVENTS] Facebook Events API error:', error);
    throw error;
  }
}

// Eventbrite API Integration
async function fetchEventbriteEvents(latitude: number, longitude: number, radius: number, startDate?: string, endDate?: string): Promise<Event[]> {
  // Use EVENTBRITE_PRIVATE_TOKEN for authentication (preferred) or fall back to EVENTBRITE_API_KEY
  const privateToken = process.env.EVENTBRITE_PRIVATE_TOKEN;
  const apiKey = process.env.EVENTBRITE_API_KEY;
  const token = privateToken || apiKey;

  if (!token || process.env.ENABLE_EVENTBRITE_INTEGRATION !== 'true') {
    console.log('[NEARWISE-EVENTS] Eventbrite integration disabled or no API token');
    return [];
  }

  // Validate token format (Eventbrite OAuth tokens are typically 40+ characters)
  if (token.length < 30) {
    console.error('[NEARWISE-EVENTS] Eventbrite token appears invalid (too short). Expected 40+ characters, got:', token.length);
    console.error('[NEARWISE-EVENTS] Please obtain a valid OAuth token from https://www.eventbrite.com/platform/api#/introduction/authentication');
    throw new Error('Invalid Eventbrite API token format');
  }

  if (!checkRateLimit('eventbrite', 1000)) {
    throw new Error('Eventbrite API rate limit exceeded');
  }

  try {
    console.log(`[NEARWISE-EVENTS] Fetching Eventbrite events for location: ${latitude}, ${longitude}, radius: ${radius}km`);
    console.log(`[NEARWISE-EVENTS] Using token: ${token ? token.substring(0, 10) + '...' : 'NONE'}`);

    let url = `https://www.eventbriteapi.com/v3/events/search/?location.latitude=${latitude}&location.longitude=${longitude}&location.within=${radius}km&expand=venue,category`;

    if (startDate) {
      url += `&start_date.range_start=${new Date(startDate).toISOString()}`;
    }
    if (endDate) {
      url += `&start_date.range_end=${new Date(endDate).toISOString()}`;
    }

    console.log(`[NEARWISE-EVENTS] Eventbrite API URL: ${url}`);

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    console.log(`[NEARWISE-EVENTS] Eventbrite API response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[NEARWISE-EVENTS] Eventbrite API error: ${response.status} - ${errorText}`);
      throw new Error(`Eventbrite API error: ${response.status} - ${errorText.substring(0, 200)}`);
    }

    const data = await response.json();
    const eventbriteEvents = data.events || [];

    console.log(`[NEARWISE-EVENTS] Eventbrite returned ${eventbriteEvents.length} events`);

    if (eventbriteEvents.length > 0) {
      console.log(`[NEARWISE-EVENTS] Sample event URL: ${eventbriteEvents[0]?.url || 'N/A'}`);
    }

    const events: Event[] = eventbriteEvents.map((event: any) => {
      const venue = event.venue || {};
      const venueLat = parseFloat(venue.latitude) || latitude;
      const venueLon = parseFloat(venue.longitude) || longitude;
      const distance = calculateDistance(latitude, longitude, venueLat, venueLon);

      return {
        id: event.id,
        name: event.name?.text || 'Unnamed Event',
        description: event.description?.text || '',
        startTime: event.start?.utc || new Date().toISOString(),
        endTime: event.end?.utc || event.start?.utc || new Date().toISOString(),
        location: {
          name: venue.name || 'Venue',
          address: venue.address?.localized_address_display || 'Address not available',
          distance: Math.round(distance * 100) / 100,
          latitude: venueLat,
          longitude: venueLon,
        },
        attendeeCount: 0, // Eventbrite doesn't provide this in search results
        coverImage: event.logo?.url,
        link: event.url,
        category: event.category?.name,
        ticketUrl: event.url,
        isFree: event.is_free,
      };
    });

    return events;
  } catch (error) {
    console.error('[NEARWISE-EVENTS] Eventbrite API error:', error);
    throw error;
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('[NEARWISE-EVENTS] Starting events fetch...');
    
    const { searchParams } = new URL(request.url);
    const latitude = parseFloat(searchParams.get('latitude') || '0');
    const longitude = parseFloat(searchParams.get('longitude') || '0');
    const radius = parseFloat(searchParams.get('radius') || '10');
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;

    // Validate parameters
    if (!latitude || !longitude) {
      return NextResponse.json({
        success: false,
        error: 'latitude and longitude are required',
      }, { status: 400 });
    }

    // Check cache
    const cacheKey = `events-${latitude.toFixed(4)}-${longitude.toFixed(4)}-${radius}-${startDate || 'none'}-${endDate || 'none'}`;
    const cachedData = getCachedData(cacheKey);
    
    if (cachedData) {
      return NextResponse.json({
        ...cachedData,
        fromCache: true,
      });
    }

    // Check if any API integration is enabled
    const shouldUseMockData = process.env.USE_MOCK_SOCIAL_DATA === 'true' ||
                              (process.env.ENABLE_FACEBOOK_INTEGRATION !== 'true' &&
                               process.env.ENABLE_EVENTBRITE_INTEGRATION !== 'true');

    let allEvents: Event[] = [];
    let errors: string[] = [];
    let usedMockDataFallback = false;

    if (shouldUseMockData) {
      console.log('[NEARWISE-EVENTS] Using mock data (no integrations enabled)');
      allEvents = generateMockEvents(latitude, longitude, radius, 30);
    } else {
      // Fetch from enabled platforms
      const fetchPromises: Promise<Event[]>[] = [];

      if (process.env.ENABLE_FACEBOOK_INTEGRATION === 'true') {
        console.log('[NEARWISE-EVENTS] Fetching from Facebook Events API...');
        fetchPromises.push(
          fetchFacebookEvents(latitude, longitude, radius, startDate, endDate).catch(err => {
            console.error('[NEARWISE-EVENTS] Facebook API failed:', err.message);
            errors.push(`Facebook: ${err.message}`);
            return [];
          })
        );
      }

      if (process.env.ENABLE_EVENTBRITE_INTEGRATION === 'true') {
        console.log('[NEARWISE-EVENTS] Fetching from Eventbrite API...');
        fetchPromises.push(
          fetchEventbriteEvents(latitude, longitude, radius, startDate, endDate).catch(err => {
            console.error('[NEARWISE-EVENTS] Eventbrite API failed:', err.message);
            errors.push(`Eventbrite: ${err.message}`);
            return [];
          })
        );
      }

      // Wait for all fetches to complete
      const results = await Promise.all(fetchPromises);
      allEvents = results.flat();

      console.log(`[NEARWISE-EVENTS] Total events fetched from APIs: ${allEvents.length}`);

      // If all APIs failed or returned no events, fall back to mock data
      if (allEvents.length === 0) {
        if (errors.length > 0) {
          console.warn('[NEARWISE-EVENTS] All APIs failed, using mock data as fallback');
        } else {
          console.warn('[NEARWISE-EVENTS] No events found from APIs, using mock data as fallback');
        }
        allEvents = generateMockEvents(latitude, longitude, radius, 30);
        usedMockDataFallback = true;
      }
    }

    // Sort by start time (soonest first)
    allEvents.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

    // Limit to 30 events
    allEvents = allEvents.slice(0, 30);

    const usingMockData = shouldUseMockData || usedMockDataFallback;

    const response = {
      success: true,
      location: { latitude, longitude },
      radius,
      count: allEvents.length,
      events: allEvents,
      usingMockData,
      errors: errors.length > 0 ? errors : undefined,
      message: shouldUseMockData
        ? 'Using mock data. Enable Facebook or Eventbrite integration in .env.local for real events.'
        : usedMockDataFallback
        ? `Using mock data as fallback. ${errors.length > 0 ? 'API errors: ' + errors.join(', ') : 'No events found from enabled APIs.'}`
        : errors.length > 0
        ? 'Some event APIs failed. Showing available events from successful APIs.'
        : `Successfully fetched ${allEvents.length} real events.`,
    };

    console.log(`[NEARWISE-EVENTS] Response: ${allEvents.length} events, usingMockData: ${usingMockData}, errors: ${errors.length}`);

    // Cache the response
    setCachedData(cacheKey, response);

    return NextResponse.json(response);

  } catch (error) {
    console.error('[NEARWISE-EVENTS] Error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch events', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

/**
 * NearWise Events API Route
 * 
 * Fetches upcoming events from Facebook Events API and Eventbrite API
 * based on user's location and selected radius.
 * 
 * Features:
 * - Facebook Events API integration
 * - Eventbrite API integration
 * - 15-minute caching to reduce API calls
 * - Rate limiting per platform
 * - Date range filtering
 * - Graceful fallback to mock data
 * 
 * Query Parameters:
 * - latitude (required): User's latitude
 * - longitude (required): User's longitude
 * - radius (optional): Search radius in kilometers (default: 10)
 * - startDate (optional): Filter events starting from this date (ISO 8601 format)
 * - endDate (optional): Filter events ending before this date (ISO 8601 format)
 * 
 * Example:
 * GET /api/nearwise/events?latitude=16.92&longitude=82.22&radius=10&startDate=2025-11-15T00:00:00Z
 * 
 * Response:
 * {
 *   "success": true,
 *   "location": { "latitude": 16.92, "longitude": 82.22 },
 *   "radius": 10,
 *   "count": 15,
 *   "events": [...],
 *   "usingMockData": false,
 *   "fromCache": false
 * }
 */

