'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import BottomNav from '@/components/layout/bottom-nav';
import { VoiceAssistantWrapper } from '@/components/layout/VoiceAssistantWrapper';
import { useToast } from '@/hooks/use-toast';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import DeliveryPlatformButtons from '@/components/DeliveryPlatformButtons';
import MallStoreDirectory from '@/components/MallStoreDirectory';
import StoreOffersModal from '@/components/StoreOffersModal';

// Serialized platform interface (no functions, for JSON serialization)
interface SerializedPlatform {
  id: string;
  name: string;
  logo: string;
  color: string;
}

// Types
interface Location {
  latitude: number;
  longitude: number;
  city: string;
  area: string;
}

interface Place {
  id: string;
  name: string;
  category: string;
  distance: number;
  rating: number;
  address: string;
  openingHours?: string;
  phone?: string;
  isNew?: boolean;
  trending?: boolean;
  website?: string;
  hasOnlineStore?: boolean;
  storeType?: string;
  // New fields for offers and social engagement
  hasOffer?: boolean;
  offerText?: string;
  offerExpiration?: string; // ISO date string
  socialEngagement?: number; // Total engagement from social posts
  createdDate?: string; // OSM creation date (if available)
  isTrending?: boolean; // High recent social engagement
  // Food delivery integration
  isRestaurant?: boolean;
  deliveryPlatforms?: SerializedPlatform[]; // Changed from DeliveryPlatform[] to SerializedPlatform[]
  latitude?: number;
  longitude?: number;
}

interface Notification {
  id: string;
  type: 'new_opening' | 'event' | 'offer';
  title: string;
  message: string;
  enabled: boolean;
}

interface SocialPost {
  id: string;
  platform: 'facebook' | 'instagram' | 'twitter';
  businessName: string;
  content: string;
  media: Array<{ type: 'image' | 'video'; url: string }>;
  engagement: {
    likes: number;
    comments: number;
    shares: number;
  };
  timestamp: string;
  link: string;
  location?: {
    name: string;
    distance: number;
  };
  // New business-focused fields
  isNewOpening?: boolean;
  isPromotion?: boolean;
  rating?: number; // 1-5 star rating
  reviewCount?: number;
  checkInCount?: number;
  offerExpiration?: string; // ISO date string
  reviews?: Array<{
    id: string;
    author: string;
    rating: number;
    text: string;
    timestamp: string;
  }>;
}

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
  };
  attendeeCount: number;
  coverImage?: string;
  link: string;
  category?: string;
  isFree?: boolean;
}

export default function AILocalDiscoveryPage() {
  const { toast } = useToast();
  
  // State
  const [location, setLocation] = useState<Location | null>(null);
  const [manualLocation, setManualLocation] = useState('');
  const [radius, setRadius] = useState<number>(10);
  const [loading, setLoading] = useState(false);
  const [places, setPlaces] = useState<Place[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [brandSearch, setBrandSearch] = useState('');
  const [storeFilter, setStoreFilter] = useState<'all' | 'nearby' | 'online'>('all');
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: '1', type: 'new_opening', title: 'New Store Openings', message: 'Get notified about new stores in your area', enabled: true },
    { id: '2', type: 'event', title: 'Local Events', message: 'Alerts for events at nearby locations', enabled: true },
    { id: '3', type: 'offer', title: 'Promotional Offers', message: 'Special deals from local businesses', enabled: false },
  ]);

  // Social Media State
  const [socialPosts, setSocialPosts] = useState<SocialPost[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [socialLoading, setSocialLoading] = useState(false);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [socialPlatformFilter, setSocialPlatformFilter] = useState<'all' | 'facebook' | 'instagram' | 'twitter'>('all');
  const [socialContentFilter, setSocialContentFilter] = useState<'all' | 'new_openings' | 'deals' | 'top_rated'>('all');
  const [socialSortBy, setSocialSortBy] = useState<'recent' | 'engagement' | 'nearest' | 'rating'>('recent');
  const [showSocialBuzz, setShowSocialBuzz] = useState(false);
  const [expandedReviews, setExpandedReviews] = useState<Set<string>>(new Set());

  // Brand Finder State
  const [brandFinderQuery, setBrandFinderQuery] = useState('');
  const [brandFinderLoading, setBrandFinderLoading] = useState(false);
  const [brandFinderResult, setBrandFinderResult] = useState<any>(null);
  const [showBrandFinder, setShowBrandFinder] = useState(false);

  // Mall Directory State
  const [selectedMall, setSelectedMall] = useState<Place | null>(null);
  const [showMallDirectory, setShowMallDirectory] = useState(false);

  // Store Offers Modal State
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [selectedStoreName, setSelectedStoreName] = useState<string>('');
  const [showOffersModal, setShowOffersModal] = useState(false);

  // Detect user location
  useEffect(() => {
    detectLocation();
  }, []);

  // Fetch places when location or radius changes
  useEffect(() => {
    if (location) {
      fetchNearbyPlaces();
    }
  }, [location, radius, selectedCategory]);

  // Fetch social media data when location changes
  useEffect(() => {
    if (location && showSocialBuzz) {
      fetchSocialMedia();
      fetchEvents();
    }
  }, [location, radius, showSocialBuzz]);

  const detectLocation = () => {
    setLoading(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          // Reverse geocode to get city name (using OpenWeather API)
          try {
            const response = await fetch(
              https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY || '72f5c4b9ba0b32305cc8d8e3a1ee58c4'}
            );
            const data = await response.json();
            
            if (data && data.length > 0) {
              setLocation({
                latitude,
                longitude,
                city: data[0].name || 'Unknown',
                area: data[0].state || 'Unknown',
              });
              
              toast({
                title: '📍 Location Detected',
                description: ${data[0].name}, ${data[0].state},
              });
            }
          } catch (error) {
            console.error('Error reverse geocoding:', error);
            setLocation({
              latitude,
              longitude,
              city: 'Unknown',
              area: 'Unknown',
            });
          }
          
          setLoading(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          toast({
                title: '❌ Location Access Denied',
            description: 'Please enable location access or enter manually',
            variant: 'destructive',
          });
          setLoading(false);
        }
      );
    } else {
      toast({
        title: '❌ Geolocation Not Supported',
        description: 'Your browser does not support geolocation',
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  const handleManualLocation = async () => {
    if (!manualLocation.trim()) {
      toast({
        title: '⚠ Invalid Location',
        description: 'Please enter a valid city or area name',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      // Geocode the manual location
      const response = await fetch(
        https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(manualLocation)}&limit=1&appid=${process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY || '72f5c4b9ba0b32305cc8d8e3a1ee58c4'}
      );
      const data = await response.json();

      if (data && data.length > 0) {
        setLocation({
          latitude: data[0].lat,
          longitude: data[0].lon,
          city: data[0].name,
          area: data[0].state || data[0].country,
        });

        toast({
          title: '✅ Location Set',
          description: ${data[0].name}, ${data[0].state || data[0].country},
        });
      } else {
        toast({
          title: '❌ Location Not Found',
          description: 'Could not find the specified location',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error geocoding:', error);
      toast({
        title: '❌ Error',
        description: 'Failed to set location',
        variant: 'destructive',
      });
    }
    setLoading(false);
  };

  const toggleNotification = (id: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, enabled: !notif.enabled } : notif
      )
    );
  };

  const fetchNearbyPlaces = async () => {
    if (!location) return;

    setLoading(true);
    try {
      // Build query URL with brand filter if specified
      let queryUrl = /api/nearwise/places?latitude=${location.latitude}&longitude=${location.longitude}&radius=${radius}&category=${selectedCategory};

      if (brandSearch.trim()) {
        queryUrl += &brand=${encodeURIComponent(brandSearch.trim())};
      }

      const response = await fetch(queryUrl);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || Server error: ${response.status});
      }

      const data = await response.json();

      if (data.success) {
        setPlaces(data.places || []);

        // Show different message if using mock data
        if (data.usingMockData) {
          toast({
            title: '⚠ Using Sample Data',
            description: data.message || 'Showing sample places. Real data temporarily unavailable.',
          });
        } else if (data.fromCache) {
          toast({
            title: '✅ Places Loaded (Cached)',
            description: `Found ${data.count} places within ${radius}km${brandSearch ? ` matching "${brandSearch}"` : ''}`,
          });
        } else {
          toast({
            title: '✅ Places Loaded',
            description: `Found ${data.count} places within ${radius}km${brandSearch ? ` matching "${brandSearch}"` : ''}`,
          });
        }

        // Show "no results" message if brand search returned nothing
        if (brandSearch.trim() && data.count === 0) {
          toast({
            title: '🔍 No Results',
            description: No places found matching "${brandSearch}" within ${radius}km,
          });
        }
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Error fetching places:', error);
      toast({
        title: '❌ Error',
        description: error instanceof Error ? error.message : 'Failed to fetch nearby places. Please try again.',
        variant: 'destructive',
      });
      setPlaces([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSocialMedia = async () => {
    if (!location) return;

    setSocialLoading(true);
    try {
      const response = await fetch(
        /api/nearwise/social?latitude=${location.latitude}&longitude=${location.longitude}&radius=${radius}&platform=${socialPlatformFilter}
      );

      if (!response.ok) {
        throw new Error(Server error: ${response.status});
      }

      const data = await response.json();

      if (data.success) {
        setSocialPosts(data.posts || []);

        if (data.usingMockData) {
          toast({
            title: '⚠ Using Sample Social Data',
            description: data.message || 'Showing sample social media posts.',
          });
        }
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Error fetching social media:', error);
      toast({
        title: '❌ Error',
        description: 'Failed to fetch social media content',
        variant: 'destructive',
      });
      setSocialPosts([]);
    } finally {
      setSocialLoading(false);
    }
  };

  const fetchEvents = async () => {
    if (!location) return;

    setEventsLoading(true);
    try {
      const response = await fetch(
        /api/nearwise/events?latitude=${location.latitude}&longitude=${location.longitude}&radius=${radius}
      );

      if (!response.ok) {
        throw new Error(Server error: ${response.status});
      }

      const data = await response.json();

      if (data.success) {
        setEvents(data.events || []);

        if (data.usingMockData) {
          toast({
            title: '⚠ Using Sample Events',
            description: data.message || 'Showing sample events.',
          });
        }
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        title: '❌ Error',
        description: 'Failed to fetch events',
        variant: 'destructive',
      });
      setEvents([]);
    } finally {
      setEventsLoading(false);
    }
  };

  // Brand Finder API call
  const searchBrand = async () => {
    if (!location) {
      toast({
        title: '📍 Location Required',
        description: 'Please enable location access to search for brands',
        variant: 'destructive',
      });
      return;
    }

    if (!brandFinderQuery.trim()) {
      toast({
        title: '🔍 Brand Name Required',
        description: 'Please enter a brand name to search',
        variant: 'destructive',
      });
      return;
    }

    setBrandFinderLoading(true);
    console.log('[BRAND-FINDER-UI] Starting search for:', brandFinderQuery);
    console.log('[BRAND-FINDER-UI] Location:', location);
    console.log('[BRAND-FINDER-UI] Radius:', radius, 'km');

    try {
      const radiusInMeters = radius * 1000; // Convert km to meters
      const apiUrl = /api/nearwise/brand-finder?message=${encodeURIComponent(brandFinderQuery)}&latitude=${location.latitude}&longitude=${location.longitude}&radius=${radiusInMeters};

      console.log('[BRAND-FINDER-UI] API URL:', apiUrl);

      const response = await fetch(apiUrl);

      console.log('[BRAND-FINDER-UI] Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('[BRAND-FINDER-UI] Server error:', errorData);
        throw new Error(errorData.error || Server error: ${response.status});
      }

      const data = await response.json();
      console.log('[BRAND-FINDER-UI] Response data:', data);

      if (data.success) {
        setBrandFinderResult(data.data);

        const storeCount = data.data.offline_stores?.length || 0;
        const debugInfo = data.debug ? ` (${data.debug.duration_ms}ms)` : '';

        toast({
          title: storeCount > 0 ? '✅ Stores Found!' : '📍 No Nearby Stores',
          description: data.message + debugInfo,
        });

        console.log('[BRAND-FINDER-UI] ✓ Search completed successfully');
        console.log('[BRAND-FINDER-UI] Stores found:', storeCount);
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (error) {
      console.error('[BRAND-FINDER-UI] ❌ Error searching brand:', error);
      toast({
        title: '❌ Search Failed',
        description: error instanceof Error ? error.message : 'Failed to search for brand. Please try again.',
        variant: 'destructive',
      });
      setBrandFinderResult(null);
    } finally {
      setBrandFinderLoading(false);
    }
  };

  // Filter and sort social posts based on selected criteria
  const getSortedSocialPosts = () => {
    let filtered = [...socialPosts];

    // Apply content filter
    switch (socialContentFilter) {
      case 'new_openings':
        filtered = filtered.filter(post => post.isNewOpening);
        break;
      case 'deals':
        filtered = filtered.filter(post => post.isPromotion);
        break;
      case 'top_rated':
        filtered = filtered.filter(post => post.rating && post.rating >= 4.0);
        break;
      // 'all' - no filtering
    }

    // Apply sorting
    switch (socialSortBy) {
      case 'recent':
        filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        break;
      case 'engagement':
        filtered.sort((a, b) => {
          const engagementA = a.engagement.likes + a.engagement.comments + a.engagement.shares;
          const engagementB = b.engagement.likes + b.engagement.comments + b.engagement.shares;
          return engagementB - engagementA;
        });
        break;
      case 'nearest':
        filtered.sort((a, b) => (a.location?.distance || 999) - (b.location?.distance || 999));
        break;
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
    }

    // Prioritize new openings and promotions at the top (unless already filtered)
    if (socialContentFilter === 'all') {
      const newOpenings = filtered.filter(p => p.isNewOpening);
      const promotions = filtered.filter(p => p.isPromotion && !p.isNewOpening);
      const regular = filtered.filter(p => !p.isNewOpening && !p.isPromotion);
      filtered = [...newOpenings, ...promotions, ...regular];
    }

    return filtered;
  };

  // Format timestamp to relative time
  const formatRelativeTime = (timestamp: string) => {
    const now = new Date().getTime();
    const time = new Date(timestamp).getTime();
    const diff = now - time;

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return ${minutes}m ago;
    if (hours < 24) return ${hours}h ago;
    return ${days}d ago;
  };

  // Format event date
  const formatEventDate = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);

    const dateStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const startTimeStr = start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    const endTimeStr = end.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

    return ${dateStr} • ${startTimeStr} - ${endTimeStr};
  };

  // Format offer expiration
  const formatOfferExpiration = (expiration: string) => {
    const now = new Date().getTime();
    const expiryTime = new Date(expiration).getTime();
    const diff = expiryTime - now;

    const days = Math.floor(diff / 86400000);
    const hours = Math.floor(diff / 3600000);

    if (days > 1) return Expires in ${days} days;
    if (hours > 1) return Expires in ${hours} hours;
    return 'Expires soon!';
  };

  // Toggle review expansion
  const toggleReviews = (postId: string) => {
    setExpandedReviews(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  // Render star rating
  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const stars = [];

    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={full-${i}} className="text-yellow-500">★</span>);
    }
    if (hasHalfStar) {
      stars.push(<span key="half" className="text-yellow-500">⯨</span>);
    }
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<span key={empty-${i}} className="text-gray-300 dark:text-gray-600">★</span>);
    }

    return <div className="flex items-center gap-0.5">{stars}</div>;
  };

  // Handler for mall selection
  const handleMallClick = (mall: Place) => {
    setSelectedMall(mall);
    setShowMallDirectory(true);
  };

  // Handler for viewing store offers
  const handleViewStoreOffers = (storeId: string, storeName: string) => {
    console.log('[AI Local Discovery] handleViewStoreOffers called:', { storeId, storeName });
    setSelectedStoreId(storeId);
    setSelectedStoreName(storeName);
    setShowOffersModal(true);
    console.log('[AI Local Discovery] Modal state updated:', { selectedStoreId: storeId, showOffersModal: true });
  };

  // Handler for closing mall directory
  const handleCloseMallDirectory = () => {
    setShowMallDirectory(false);
    setSelectedMall(null);
  };

  // Handler for closing offers modal
  const handleCloseOffersModal = () => {
    setShowOffersModal(false);
    setSelectedStoreId(null);
    setSelectedStoreName('');
  };

  const categories = [
    { id: 'all', name: 'All', icon: 'grid_view' },
    { id: 'clothing', name: 'Clothing', icon: 'checkroom' },
    { id: 'shoes', name: 'Shoes', icon: 'footprint' },
    { id: 'accessories', name: 'Accessories', icon: 'watch' },
    { id: 'sportswear', name: 'Sportswear', icon: 'sports' },
    { id: 'department', name: 'Department', icon: 'storefront' },
    { id: 'shop', name: 'Shops', icon: 'store' },
    { id: 'mall', name: 'Malls', icon: 'shopping_bag' },
    { id: 'restaurant', name: 'Restaurants', icon: 'restaurant' },
    { id: 'new', name: '🆕 New', icon: 'new_releases' },
    { id: 'trending', name: '🔥 Trending', icon: 'trending_up' },
    { id: 'offers', name: '💰 Offers', icon: 'local_offer' },
  ];

  return (
    <>
      <div className="flex flex-col min-h-screen">
        <header className="sticky top-0 z-10 bg-card-light/70 dark:bg-card-dark/70 backdrop-blur-sm">
          <div className="flex items-center justify-between p-4 border-b border-border-light/50 dark:border-border-dark/50">
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-primary/10"
            >
              <Link href="/dashboard">
                <span className="material-symbols-outlined text-subtle-light dark:text-subtle-dark">
                  arrow_back_ios_new
                </span>
              </Link>
            </Button>
            <div className="flex flex-col items-center">
              <h1 className="text-lg font-bold">NearWise</h1>
              <p className="text-sm text-subtle-light dark:text-subtle-dark">
                AI Local Discovery
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-primary/10"
            >
              <span className="material-symbols-outlined text-subtle-light dark:text-subtle-dark">
                tune
              </span>
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto pb-28">
          {/* Location Section */}
          <div className="p-6">
            <div className="bg-card-light dark:bg-card-dark rounded-xl p-6 shadow-md frosted-glass border border-white/30 dark:border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-teal-500">location_on</span>
                  Your Location
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={detectLocation}
                  disabled={loading}
                  className="text-primary"
                >
                  <span className="material-symbols-outlined text-lg">refresh</span>
                </Button>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : location ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-teal-500">place</span>
                    <p className="text-lg font-semibold">{location.city}</p>
                  </div>
                  <p className="text-sm text-subtle-light dark:text-subtle-dark ml-8">
                    {location.area}
                  </p>
                  <p className="text-xs text-subtle-light dark:text-subtle-dark ml-8">
                    Lat: {location.latitude.toFixed(4)}, Lon: {location.longitude.toFixed(4)}
                  </p>
                </div>
              ) : (
                <p className="text-subtle-light dark:text-subtle-dark">
                  Location not detected
                </p>
              )}

              <div className="mt-4 pt-4 border-t border-border-light/50 dark:border-border-dark/50">
                <p className="text-sm font-semibold mb-2">Or enter manually:</p>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter city or area name"
                    value={manualLocation}
                    onChange={(e) => setManualLocation(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={handleManualLocation} disabled={loading}>
                    Set
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Radius Selection */}
          <div className="px-6 pb-6">
            <div className="bg-card-light dark:bg-card-dark rounded-xl p-6 shadow-md frosted-glass border border-white/30 dark:border-white/10">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-teal-500">radar</span>
                Search Radius
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-teal-500">{radius} km</span>
                  <Badge variant="outline">{radius <= 5 ? 'Nearby' : radius <= 10 ? 'Local' : radius <= 15 ? 'Extended' : 'Wide'}</Badge>
                </div>
                <Slider
                  value={[radius]}
                  onValueChange={(value) => setRadius(value[0])}
                  min={5}
                  max={20}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-subtle-light dark:text-subtle-dark">
                  <span>5 km</span>
                  <span>10 km</span>
                  <span>15 km</span>
                  <span>20 km</span>
                </div>
              </div>
            </div>
          </div>

          {/* What's New Nearby Section */}
          {places.length > 0 && (
            <div className="px-6 pb-6">
              <div className="bg-card-light dark:bg-card-dark rounded-xl p-6 shadow-md frosted-glass border border-white/30 dark:border-white/10">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-teal-500">auto_awesome</span>
                  What's New Nearby
                </h2>

                <div className="space-y-6">
                  {/* Recent Openings */}
                  {places.filter(p => p.isNew).length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold flex items-center gap-2">
                          <span className="text-green-600 dark:text-green-400">🆕</span>
                          Recent Openings
                        </h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-teal-500 text-xs"
                          onClick={() => setSelectedCategory('new')}
                        >
                          See All
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 gap-3">
                        {places
                          .filter(p => p.isNew)
                          .sort((a, b) => {
                            // Sort by creation date if available
                            if (a.createdDate && b.createdDate) {
                              return new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime();
                            }
                            return a.distance - b.distance;
                          })
                          .slice(0, 3)
                          .map(place => (
                            <div
                              key={place.id}
                              className="bg-background-light/50 dark:bg-background-dark/50 rounded-lg p-3 border border-green-200 dark:border-green-800"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-sm mb-1">{place.name}</h4>
                                  <div className="flex items-center gap-2 text-xs text-subtle-light dark:text-subtle-dark">
                                    <span className="flex items-center gap-1">
                                      <span className="material-symbols-outlined text-xs">location_on</span>
                                      {place.distance} km
                                    </span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1">
                                      <span className="material-symbols-outlined text-xs">star</span>
                                      {place.rating}
                                    </span>
                                  </div>
                                </div>
                                <Badge className="bg-green-600 text-white text-xs border-0">NEW</Badge>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Current Offers */}
                  {places.filter(p => p.hasOffer).length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold flex items-center gap-2">
                          <span className="text-amber-600 dark:text-amber-400">💰</span>
                          Current Offers
                        </h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-teal-500 text-xs"
                          onClick={() => setSelectedCategory('offers')}
                        >
                          See All
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 gap-3">
                        {places
                          .filter(p => p.hasOffer)
                          .sort((a, b) => {
                            // Sort by expiration date (soonest first)
                            if (a.offerExpiration && b.offerExpiration) {
                              return new Date(a.offerExpiration).getTime() - new Date(b.offerExpiration).getTime();
                            }
                            return a.distance - b.distance;
                          })
                          .slice(0, 3)
                          .map(place => (
                            <div
                              key={place.id}
                              className="bg-background-light/50 dark:bg-background-dark/50 rounded-lg p-3 border border-amber-200 dark:border-amber-800"
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-sm mb-1">{place.name}</h4>
                                  <div className="flex items-center gap-2 text-xs text-subtle-light dark:text-subtle-dark">
                                    <span className="flex items-center gap-1">
                                      <span className="material-symbols-outlined text-xs">location_on</span>
                                      {place.distance} km
                                    </span>
                                  </div>
                                </div>
                                <Badge className="bg-amber-600 text-white text-xs border-0">OFFER</Badge>
                              </div>
                              {place.offerText && (
                                <p className="text-xs text-subtle-light dark:text-subtle-dark mb-1 line-clamp-2">
                                  {place.offerText}
                                </p>
                              )}
                              {place.offerExpiration && (
                                <div className="flex items-center gap-1 text-xs text-amber-700 dark:text-amber-400">
                                  <span className="material-symbols-outlined text-xs">schedule</span>
                                  <span>{formatOfferExpiration(place.offerExpiration)}</span>
                                </div>
                              )}
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Trending Now */}
                  {places.filter(p => p.isTrending || p.trending).length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold flex items-center gap-2">
                          <span className="text-orange-600 dark:text-orange-400">🔥</span>
                          Trending Now
                        </h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-teal-500 text-xs"
                          onClick={() => setSelectedCategory('trending')}
                        >
                          See All
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 gap-3">
                        {places
                          .filter(p => p.isTrending || p.trending)
                          .sort((a, b) => (b.socialEngagement || 0) - (a.socialEngagement || 0))
                          .slice(0, 3)
                          .map(place => (
                            <div
                              key={place.id}
                              className="bg-background-light/50 dark:bg-background-dark/50 rounded-lg p-3 border border-orange-200 dark:border-orange-800"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-sm mb-1">{place.name}</h4>
                                  <div className="flex items-center gap-2 text-xs text-subtle-light dark:text-subtle-dark">
                                    <span className="flex items-center gap-1">
                                      <span className="material-symbols-outlined text-xs">location_on</span>
                                      {place.distance} km
                                    </span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1">
                                      <span className="material-symbols-outlined text-xs">star</span>
                                      {place.rating}
                                    </span>
                                    {place.socialEngagement && place.socialEngagement > 0 && (
                                      <>
                                        <span>•</span>
                                        <span className="flex items-center gap-1">
                                          <span className="material-symbols-outlined text-xs">favorite</span>
                                          {place.socialEngagement}
                                        </span>
                                      </>
                                    )}
                                  </div>
                                </div>
                                <Badge className="bg-orange-600 text-white text-xs border-0">TRENDING</Badge>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* AI Brand Finder Section */}
          {location && (
            <div className="px-6 pb-6">
              <div className="bg-card-light dark:bg-card-dark rounded-xl p-6 shadow-md frosted-glass border border-white/30 dark:border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-teal-500">search</span>
                    AI Brand Finder
                  </h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowBrandFinder(!showBrandFinder)}
                  >
                    {showBrandFinder ? 'Hide' : 'Show'}
                  </Button>
                </div>

                {showBrandFinder && (
                  <div className="space-y-4">
                    <p className="text-sm text-subtle-light dark:text-subtle-dark">
                      Search for any brand and get both offline store locations and online shopping links!
                    </p>

                    {/* Search Input */}
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        placeholder="Enter brand name (e.g., Puma, Zudio, H&M, Nykaa, Adidas, Boat, Apple)"
                        value={brandFinderQuery}
                        onChange={(e) => setBrandFinderQuery(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            searchBrand();
                          }
                        }}
                        className="flex-1"
                      />
                      <Button
                        onClick={searchBrand}
                        disabled={brandFinderLoading}
                        className="bg-teal-500 hover:bg-teal-600 text-white"
                      >
                        {brandFinderLoading ? (
                          <>
                            <span className="material-symbols-outlined animate-spin text-base mr-2">progress_activity</span>
                            Searching...
                          </>
                        ) : (
                          <>
                            <span className="material-symbols-outlined text-base mr-2">search</span>
                            Search
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Brand Finder Results */}
                    {brandFinderResult && (
                      <div className="space-y-4 mt-6">
                        {/* Brand Header */}
                        <div className="flex items-center gap-2 pb-3 border-b border-border-light dark:border-border-dark">
                          <span className="material-symbols-outlined text-teal-500">store</span>
                          <h3 className="text-lg font-bold">{brandFinderResult.brand}</h3>
                        </div>

                        {/* Offline Stores */}
                        <div>
                          <h4 className="font-semibold mb-3 flex items-center gap-2">
                            <span className="material-symbols-outlined text-base">location_on</span>
                            Offline Stores ({brandFinderResult.offline_stores.length})
                          </h4>
                          {brandFinderResult.offline_stores.length > 0 ? (
                            <div className="grid grid-cols-1 gap-3">
                              {brandFinderResult.offline_stores.map((store: any, index: number) => (
                                <div
                                  key={index}
                                  className="bg-background-light/50 dark:bg-background-dark/50 rounded-lg p-3 border border-border-light dark:border-border-dark"
                                >
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                      <h5 className="font-semibold text-sm">{store.name}</h5>
                                      <p className="text-xs text-subtle-light dark:text-subtle-dark mt-1">
                                        {store.address}
                                      </p>
                                    </div>
                                    <Badge variant="outline" className="text-xs">
                                      {store.distance_km} km
                                    </Badge>
                                  </div>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full text-teal-500 border-teal-500 hover:bg-teal-500/10 mt-2"
                                    onClick={() => {
                                      window.open(https://www.google.com/maps/dir/?api=1&destination=${store.lat},${store.lon}, '_blank');
                                    }}
                                  >
                                    <span className="material-symbols-outlined text-base mr-1">directions</span>
                                    Get Directions
                                  </Button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-6 text-subtle-light dark:text-subtle-dark">
                              <span className="material-symbols-outlined text-4xl mb-2">store_off</span>
                              <p className="text-sm">No offline stores found within {radius}km radius.</p>
                              <p className="text-xs mt-1">Try increasing the search radius or check online links below!</p>
                            </div>
                          )}
                        </div>

                        {/* Online Shopping Links */}
                        <div>
                          <h4 className="font-semibold mb-3 flex items-center gap-2">
                            <span className="material-symbols-outlined text-base">shopping_cart</span>
                            Shop Online
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {Object.entries(brandFinderResult.online_links).map(([platform, url]: [string, any]) => (
                              <Button
                                key={platform}
                                variant="outline"
                                size="sm"
                                className="text-blue-500 border-blue-500 hover:bg-blue-500/10"
                                onClick={() => window.open(url, '_blank')}
                              >
                                <span className="material-symbols-outlined text-base mr-1">open_in_new</span>
                                {platform.charAt(0).toUpperCase() + platform.slice(1)}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Category Tabs */}
          <div className="px-6 pb-4">
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
              <div className="overflow-x-auto">
                <TabsList className="inline-flex w-auto min-w-full bg-card-light dark:bg-card-dark">
                  {categories.map((cat) => (
                    <TabsTrigger
                      key={cat.id}
                      value={cat.id}
                      className="flex flex-col items-center gap-1 px-4 py-2 data-[state=active]:bg-teal-500/20 whitespace-nowrap"
                    >
                      <span className="material-symbols-outlined text-lg">{cat.icon}</span>
                      <span className="text-xs">{cat.name}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
            </Tabs>
          </div>

          {/* Search Bar */}
          <div className="px-6 pb-4">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-subtle-light dark:text-subtle-dark">
                search
              </span>
              <Input
                placeholder="Search places..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Brand Search */}
          <div className="px-6 pb-4">
            <div className="bg-card-light dark:bg-card-dark rounded-xl p-4 shadow-md frosted-glass border border-white/30 dark:border-white/10">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-teal-500">storefront</span>
                <h3 className="text-sm font-semibold">Search by Brand</h3>
              </div>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-subtle-light dark:text-subtle-dark text-sm">
                    local_offer
                  </span>
                  <Input
                    placeholder="e.g., Starbucks, McDonald's, Walmart..."
                    value={brandSearch}
                    onChange={(e) => setBrandSearch(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        fetchNearbyPlaces();
                      }
                    }}
                    className="pl-10 text-sm"
                  />
                </div>
                <Button
                  onClick={fetchNearbyPlaces}
                  disabled={loading || !location}
                  size="sm"
                  className="bg-teal-500 hover:bg-teal-600"
                >
                  {loading ? (
                    <span className="material-symbols-outlined animate-spin">refresh</span>
                  ) : (
                    <span className="material-symbols-outlined">search</span>
                  )}
                </Button>
                {brandSearch && (
                  <Button
                    onClick={() => {
                      setBrandSearch('');
                      fetchNearbyPlaces();
                    }}
                    disabled={loading}
                    size="sm"
                    variant="ghost"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </Button>
                )}
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {['Zara', 'Nike', 'H&M', 'Adidas', 'Starbucks', 'McDonald\'s', 'Walmart', 'Target'].map((brand) => (
                  <Badge
                    key={brand}
                    variant="outline"
                    className="cursor-pointer hover:bg-teal-500/20 transition-colors"
                    onClick={() => {
                      setBrandSearch(brand);
                      setTimeout(() => fetchNearbyPlaces(), 100);
                    }}
                  >
                    {brand}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Store Filter */}
          <div className="px-6 pb-4">
            <div className="bg-card-light dark:bg-card-dark rounded-xl p-4 shadow-md frosted-glass border border-white/30 dark:border-white/10">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-teal-500">filter_list</span>
                <h3 className="text-sm font-semibold">Store Type Filter</h3>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={storeFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStoreFilter('all')}
                  className={storeFilter === 'all' ? 'bg-teal-500 hover:bg-teal-600' : ''}
                >
                  <span className="material-symbols-outlined text-sm mr-1">grid_view</span>
                  All Stores
                </Button>
                <Button
                  variant={storeFilter === 'nearby' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStoreFilter('nearby')}
                  className={storeFilter === 'nearby' ? 'bg-teal-500 hover:bg-teal-600' : ''}
                >
                  <span className="material-symbols-outlined text-sm mr-1">location_on</span>
                  Nearby Only
                </Button>
                <Button
                  variant={storeFilter === 'online' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStoreFilter('online')}
                  className={storeFilter === 'online' ? 'bg-teal-500 hover:bg-teal-600' : ''}
                >
                  <span className="material-symbols-outlined text-sm mr-1">shopping_cart</span>
                  Online Only
                </Button>
              </div>
            </div>
          </div>

          {/* Places List or Mall Directory */}
          <div className="px-6 pb-6">
            {showMallDirectory && selectedMall ? (
              <MallStoreDirectory
                mallId={selectedMall.id}
                mallName={selectedMall.name}
                onBack={handleCloseMallDirectory}
                onViewOffers={handleViewStoreOffers}
              />
            ) : loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mb-4"></div>
                <p className="text-subtle-light dark:text-subtle-dark">Discovering nearby places...</p>
              </div>
            ) : places.length === 0 ? (
              <div className="bg-card-light dark:bg-card-dark rounded-xl p-8 text-center frosted-glass border border-white/30 dark:border-white/10">
                <span className="material-symbols-outlined text-6xl text-subtle-light dark:text-subtle-dark mb-4">
                  location_searching
                </span>
                <h3 className="text-lg font-bold mb-2">No Places Found</h3>
                <p className="text-sm text-subtle-light dark:text-subtle-dark">
                  {location
                    ? 'Try adjusting your search radius or category'
                    : 'Please enable location access to discover nearby places'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">
                    {places.length} {selectedCategory === 'all' ? 'Places' : categories.find(c => c.id === selectedCategory)?.name} Found
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={fetchNearbyPlaces}
                    className="text-teal-500"
                  >
                    <span className="material-symbols-outlined text-lg">refresh</span>
                  </Button>
                </div>

                {places
                  .filter(place => {
                    // Apply search filter
                    const matchesSearch = searchQuery === '' ||
                      place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      place.category.toLowerCase().includes(searchQuery.toLowerCase());

                    // Apply store type filter
                    if (storeFilter === 'nearby') {
                      return matchesSearch && place.distance !== undefined;
                    } else if (storeFilter === 'online') {
                      return matchesSearch && place.hasOnlineStore;
                    }
                    return matchesSearch;
                  })
                  .map((place) => (
                    <div
                      key={place.id}
                      className="bg-card-light dark:bg-card-dark rounded-xl p-4 shadow-md frosted-glass border border-white/30 dark:border-white/10 hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => {
                        // If it's a mall, show the mall directory
                        if (place.category === 'mall') {
                          handleMallClick(place);
                        }
                      }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="font-bold text-lg">{place.name}</h3>
                            {place.isNew && (
                              <Badge className="bg-green-600 hover:bg-green-700 text-white text-xs border-0">
                                🆕 NEW
                              </Badge>
                            )}
                            {(place.isTrending || place.trending) && (
                              <Badge className="bg-orange-600 hover:bg-orange-700 text-white text-xs border-0">
                                🔥 TRENDING
                              </Badge>
                            )}
                            {place.hasOffer && (
                              <Badge className="bg-amber-600 hover:bg-amber-700 text-white text-xs border-0">
                                💰 SPECIAL OFFER
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            {place.storeType && (
                              <Badge variant="outline" className="text-xs border-teal-500 text-teal-500">
                                {place.storeType}
                              </Badge>
                            )}
                            {place.hasOnlineStore && (
                              <Badge variant="outline" className="text-xs border-blue-500 text-blue-500">
                                <span className="material-symbols-outlined text-xs mr-1">shopping_cart</span>
                                Online Store
                              </Badge>
                            )}
                            <Badge variant="outline" className="text-xs">
                              <span className="material-symbols-outlined text-xs mr-1">location_on</span>
                              Nearby Store
                            </Badge>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <div className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-yellow-500 text-base">star</span>
                            <span className="font-semibold">{place.rating}</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-subtle-light dark:text-subtle-dark">
                            <span className="material-symbols-outlined text-base">distance</span>
                            <span>{place.distance} km</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-start gap-2 text-subtle-light dark:text-subtle-dark">
                          <span className="material-symbols-outlined text-base">location_on</span>
                          <span className="flex-1">{place.address}</span>
                        </div>

                        {place.phone && (
                          <div className="flex items-center gap-2 text-subtle-light dark:text-subtle-dark">
                            <span className="material-symbols-outlined text-base">phone</span>
                            <span>{place.phone}</span>
                          </div>
                        )}

                        {place.openingHours && (
                          <div className="flex items-center gap-2 text-subtle-light dark:text-subtle-dark">
                            <span className="material-symbols-outlined text-base">schedule</span>
                            <span>{place.openingHours}</span>
                          </div>
                        )}
                      </div>

                      {/* Promotional Offer Display */}
                      {place.hasOffer && place.offerText && (
                        <div className="mt-3 p-3 bg-amber-100 dark:bg-amber-900/20 rounded-lg border border-amber-300 dark:border-amber-700">
                          <div className="flex items-start gap-2">
                            <span className="material-symbols-outlined text-amber-700 dark:text-amber-400 text-base mt-0.5">
                              local_offer
                            </span>
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-amber-900 dark:text-amber-200 mb-1">
                                {place.offerText}
                              </p>
                              {place.offerExpiration && (
                                <div className="flex items-center gap-1 text-xs text-amber-700 dark:text-amber-400">
                                  <span className="material-symbols-outlined text-xs">schedule</span>
                                  <span>{formatOfferExpiration(place.offerExpiration)}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Food Delivery Integration */}
                      {place.isRestaurant && place.deliveryPlatforms && place.deliveryPlatforms.length > 0 && (
                        <DeliveryPlatformButtons
                          platforms={place.deliveryPlatforms}
                          restaurantName={place.name}
                          address={place.address}
                          latitude={place.latitude || location?.latitude || 0}
                          longitude={place.longitude || location?.longitude || 0}
                          city={location?.city || 'Unknown'}
                          compact={false}
                        />
                      )}

                      <div className="flex gap-2 mt-3 flex-wrap">
                        {place.hasOffer && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 min-w-[120px] text-amber-600 border-amber-600 hover:bg-amber-600/10 font-semibold"
                            onClick={() => {
                              // Scroll to Social Buzz section
                              const socialSection = document.getElementById('social-buzz-section');
                              if (socialSection) {
                                socialSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                // Open Social Buzz if not already open
                                if (!showSocialBuzz) {
                                  setShowSocialBuzz(true);
                                }
                              }
                            }}
                          >
                            <span className="material-symbols-outlined text-base mr-1">local_offer</span>
                            View Offers
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 min-w-[120px] text-teal-500 border-teal-500 hover:bg-teal-500/10"
                          onClick={() => {
                            window.open(https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name + ' ' + place.address)}, '_blank');
                          }}
                        >
                          <span className="material-symbols-outlined text-base mr-1">directions</span>
                          Visit Store
                        </Button>
                        {place.hasOnlineStore && place.website && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 min-w-[120px] text-blue-500 border-blue-500 hover:bg-blue-500/10"
                            onClick={() => {
                              window.open(place.website, '_blank');
                            }}