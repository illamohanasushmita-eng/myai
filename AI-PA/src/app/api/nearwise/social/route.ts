import { NextRequest, NextResponse } from 'next/server';

// Types
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

interface TrendingPlace {
  placeId: string;
  placeName: string;
  category: string;
  trendScore: number;
  mentions: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  popularTimes: string[];
  recentPosts: SocialPost[];
}

// Cache for social media data (15-minute expiration)
const socialMediaCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds

// Rate limiting tracker
const rateLimitTracker = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds

// Helper: Check rate limit
function checkRateLimit(platform: string, limit: number): boolean {
  const now = Date.now();
  const key = `${platform}-rate-limit`;
  const tracker = rateLimitTracker.get(key);

  if (!tracker || now > tracker.resetTime) {
    // Reset rate limit
    rateLimitTracker.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (tracker.count >= limit) {
    console.warn(`[NEARWISE-SOCIAL] Rate limit exceeded for ${platform}`);
    return false;
  }

  tracker.count++;
  return true;
}

// Helper: Get cached data
function getCachedData(key: string): any | null {
  const cached = socialMediaCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log(`[NEARWISE-SOCIAL] Cache hit for key: ${key}`);
    return cached.data;
  }
  return null;
}

// Helper: Set cached data
function setCachedData(key: string, data: any): void {
  socialMediaCache.set(key, { data, timestamp: Date.now() });
}

// Helper: Detect new opening keywords
function detectNewOpening(content: string): boolean {
  const keywords = [
    'grand opening', 'now open', 'new location', 'opening soon',
    'just opened', 'coming soon', 'newly opened', 'opening day',
    'opening celebration', 'opening week', 'opening event', 'we\'re open',
    'officially open', 'soft opening', 'opening hours'
  ];
  const lowerContent = content.toLowerCase();
  return keywords.some(keyword => lowerContent.includes(keyword));
}

// Helper: Detect promotion keywords
function detectPromotion(content: string): boolean {
  const keywords = [
    'sale', 'discount', 'offer', 'deal', 'promo', 'coupon', '% off',
    'special', 'limited time', 'flash sale', 'clearance', 'save',
    'buy one get one', 'bogo', 'free shipping', 'exclusive',
    'promotion', 'bargain', 'reduced', 'markdown'
  ];
  const lowerContent = content.toLowerCase();
  return keywords.some(keyword => lowerContent.includes(keyword));
}

// Mock data generator for social media posts
function generateMockSocialPosts(latitude: number, longitude: number, radius: number, count: number = 20): SocialPost[] {
  const platforms: Array<'facebook' | 'instagram' | 'twitter'> = ['facebook', 'instagram', 'twitter'];
  const businesses = [
    'Starbucks Coffee', 'Nike Store', 'Zara Fashion', 'McDonald\'s', 'Subway',
    'H&M', 'Foot Locker', 'Sunglass Hut', 'Macy\'s', 'Lululemon',
    'Pizza Hut', 'KFC', 'Burger King', 'Domino\'s Pizza', 'Taco Bell'
  ];

  const newOpeningContents = [
    'Grand opening celebration this Saturday! Free samples for everyone! 🎊',
    'We\'re now open! Come visit our new location! 🎉',
    'Just opened our doors! Special opening week discounts! 🆕',
    'New location now open! Join us for our grand opening event! 🎈',
    'Opening soon! Get ready for something amazing! Coming this weekend! 🔜',
  ];

  const promotionContents = [
    'Flash sale alert! Up to 50% off selected items! Limited time only! 🏷️',
    'Special offer this weekend only! Don\'t miss out! 🎉',
    'Customer appreciation day! Special discounts for everyone! 💝',
    'Buy one get one free! This week only! 🎁',
    'Exclusive deal: 30% off everything! Use code SAVE30! 💰',
    'Weekend sale! Save big on your favorites! 🛍️',
    'Limited time offer: Free shipping on all orders! 📦',
  ];

  const regularContents = [
    'New seasonal collection just dropped! 🔥 Come check it out!',
    'We\'re hiring! Join our amazing team! 💼',
    'Thank you for 10K followers! Celebrating with a giveaway! 🎁',
    'Fresh arrivals in store now! Limited stock available! ⭐',
    'Happy hour starts at 5 PM! See you there! 🍹',
    'New menu items available now! Come taste the difference! 🍔',
    'Check out our latest collection! 👗',
    'Join us for a special event this Friday! 🎪',
  ];

  const imageUrls = [
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8',
    'https://images.unsplash.com/photo-1472851294608-062f824d29cc',
    'https://images.unsplash.com/photo-1445205170230-053b83016050',
    'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a',
    'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445',
  ];

  const reviewAuthors = ['John D.', 'Sarah M.', 'Mike R.', 'Emily K.', 'David L.', 'Jessica P.', 'Tom W.', 'Lisa H.'];
  const reviewTexts = [
    'Amazing service and great quality! Highly recommend!',
    'Love this place! Always a great experience.',
    'Best in town! Will definitely come back.',
    'Excellent products and friendly staff.',
    'Great atmosphere and wonderful selection.',
    'Outstanding! Exceeded my expectations.',
    'Fantastic experience from start to finish!',
    'Top-notch quality and service!',
  ];

  return Array.from({ length: count }, (_, i) => {
    const business = businesses[Math.floor(Math.random() * businesses.length)];
    const platform = platforms[Math.floor(Math.random() * platforms.length)];
    const hasMedia = Math.random() > 0.3; // 70% chance of having media
    const distance = Math.random() * radius;

    // Determine post type (20% new opening, 30% promotion, 50% regular)
    const rand = Math.random();
    const isNewOpening = rand < 0.2;
    const isPromotion = !isNewOpening && rand < 0.5;

    let content: string;
    if (isNewOpening) {
      content = newOpeningContents[Math.floor(Math.random() * newOpeningContents.length)];
    } else if (isPromotion) {
      content = promotionContents[Math.floor(Math.random() * promotionContents.length)];
    } else {
      content = regularContents[Math.floor(Math.random() * regularContents.length)];
    }

    // Generate rating and reviews (80% chance for Facebook posts)
    const hasRating = platform === 'facebook' && Math.random() > 0.2;
    const rating = hasRating ? Math.round((Math.random() * 2 + 3) * 10) / 10 : undefined; // 3.0-5.0
    const reviewCount = hasRating ? Math.floor(Math.random() * 500) + 10 : undefined;
    const checkInCount = platform === 'facebook' ? Math.floor(Math.random() * 1000) + 50 : undefined;

    // Generate sample reviews (2-3 reviews)
    const reviews = hasRating ? Array.from({ length: Math.floor(Math.random() * 2) + 2 }, (_, ri) => ({
      id: `review-${i}-${ri}`,
      author: reviewAuthors[Math.floor(Math.random() * reviewAuthors.length)],
      rating: Math.floor(Math.random() * 2) + 4, // 4-5 stars
      text: reviewTexts[Math.floor(Math.random() * reviewTexts.length)],
      timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    })) : undefined;

    // Generate offer expiration (for promotions, 3-14 days from now)
    const offerExpiration = isPromotion
      ? new Date(Date.now() + (Math.random() * 11 + 3) * 24 * 60 * 60 * 1000).toISOString()
      : undefined;

    return {
      id: `mock-${platform}-${Date.now()}-${i}`,
      platform,
      businessName: business,
      content,
      media: hasMedia ? [{
        type: Math.random() > 0.7 ? 'video' : 'image',
        url: imageUrls[Math.floor(Math.random() * imageUrls.length)]
      }] : [],
      engagement: {
        likes: Math.floor(Math.random() * 1000) + 50,
        comments: Math.floor(Math.random() * 200) + 10,
        shares: Math.floor(Math.random() * 100) + 5,
      },
      timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      link: `https://${platform}.com/post/${Date.now()}-${i}`,
      location: {
        name: business,
        distance: Math.round(distance * 100) / 100,
      },
      isNewOpening,
      isPromotion,
      rating,
      reviewCount,
      checkInCount,
      offerExpiration,
      reviews,
    };
  }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

// Facebook Graph API Integration
async function fetchFacebookPosts(latitude: number, longitude: number, radius: number): Promise<SocialPost[]> {
  const accessToken = process.env.FACEBOOK_ACCESS_TOKEN;

  if (!accessToken || process.env.ENABLE_FACEBOOK_INTEGRATION !== 'true') {
    console.log('[NEARWISE-SOCIAL] Facebook integration disabled or no access token');
    return [];
  }

  if (!checkRateLimit('facebook', parseInt(process.env.FACEBOOK_RATE_LIMIT || '200'))) {
    throw new Error('Facebook API rate limit exceeded');
  }

  try {
    // Step 1: Search for nearby places
    const placesUrl = `https://graph.facebook.com/v18.0/search?type=place&center=${latitude},${longitude}&distance=${radius * 1000}&fields=id,name,location,category,overall_star_rating,rating_count,checkins&access_token=${accessToken}`;

    const placesResponse = await fetch(placesUrl);
    if (!placesResponse.ok) {
      throw new Error(`Facebook API error: ${placesResponse.status}`);
    }

    const placesData = await placesResponse.json();
    const places = placesData.data || [];

    console.log(`[NEARWISE-SOCIAL] Found ${places.length} Facebook places`);

    // Step 2: Fetch posts, ratings, and reviews from each place
    const posts: SocialPost[] = [];

    for (const place of places.slice(0, 10)) { // Limit to 10 places to avoid rate limits
      try {
        // Fetch posts with extended fields
        const postsUrl = `https://graph.facebook.com/v18.0/${place.id}/posts?fields=id,message,created_time,full_picture,likes.summary(true),comments.summary(true),shares&limit=5&access_token=${accessToken}`;

        const postsResponse = await fetch(postsUrl);
        if (!postsResponse.ok) continue;

        const postsData = await postsResponse.json();
        const placePosts = postsData.data || [];

        // Fetch ratings/reviews for this place (if available)
        let placeReviews: any[] = [];
        try {
          const ratingsUrl = `https://graph.facebook.com/v18.0/${place.id}/ratings?fields=reviewer{name},rating,review_text,created_time&limit=5&access_token=${accessToken}`;
          const ratingsResponse = await fetch(ratingsUrl);
          if (ratingsResponse.ok) {
            const ratingsData = await ratingsResponse.json();
            placeReviews = ratingsData.data || [];
          }
        } catch (reviewError) {
          // Reviews might not be available for all pages
          console.log(`[NEARWISE-SOCIAL] No reviews available for ${place.name}`);
        }

        // Extract place-level data
        const placeRating = place.overall_star_rating || undefined;
        const placeReviewCount = place.rating_count || undefined;
        const placeCheckIns = place.checkins || undefined;

        // Process each post
        for (const post of placePosts) {
          const content = post.message || '';

          // Detect new openings and promotions
          const isNewOpening = detectNewOpening(content);
          const isPromotion = detectPromotion(content);

          // Extract offer expiration from content (simple heuristic)
          let offerExpiration: string | undefined;
          if (isPromotion) {
            // Look for date patterns or set default expiration (7 days from post)
            const postDate = new Date(post.created_time);
            offerExpiration = new Date(postDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
          }

          // Format reviews
          const reviews = placeReviews.slice(0, 3).map((review: any) => ({
            id: review.id || `review-${Math.random()}`,
            author: review.reviewer?.name || 'Anonymous',
            rating: review.rating || 5,
            text: review.review_text || '',
            timestamp: review.created_time || new Date().toISOString(),
          }));

          posts.push({
            id: post.id,
            platform: 'facebook',
            businessName: place.name,
            content,
            media: post.full_picture ? [{ type: 'image', url: post.full_picture }] : [],
            engagement: {
              likes: post.likes?.summary?.total_count || 0,
              comments: post.comments?.summary?.total_count || 0,
              shares: post.shares?.count || 0,
            },
            timestamp: post.created_time,
            link: `https://facebook.com/${post.id}`,
            location: {
              name: place.name,
              distance: 0, // Calculate actual distance if needed
            },
            isNewOpening,
            isPromotion,
            rating: placeRating,
            reviewCount: placeReviewCount,
            checkInCount: placeCheckIns,
            offerExpiration,
            reviews: reviews.length > 0 ? reviews : undefined,
          });
        }
      } catch (error) {
        console.error(`[NEARWISE-SOCIAL] Error fetching posts for place ${place.id}:`, error);
      }
    }

    console.log(`[NEARWISE-SOCIAL] Fetched ${posts.length} Facebook posts (${posts.filter(p => p.isNewOpening).length} new openings, ${posts.filter(p => p.isPromotion).length} promotions)`);

    return posts;
  } catch (error) {
    console.error('[NEARWISE-SOCIAL] Facebook API error:', error);
    throw error;
  }
}

// Instagram Basic Display API Integration
async function fetchInstagramPosts(latitude: number, longitude: number, radius: number): Promise<SocialPost[]> {
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;

  if (!accessToken || process.env.ENABLE_INSTAGRAM_INTEGRATION !== 'true') {
    console.log('[NEARWISE-SOCIAL] Instagram integration disabled or no access token');
    return [];
  }

  if (!checkRateLimit('instagram', parseInt(process.env.INSTAGRAM_RATE_LIMIT || '200'))) {
    throw new Error('Instagram API rate limit exceeded');
  }

  try {
    // Note: Instagram Basic Display API doesn't support location-based search
    // This would require Instagram Graph API with business accounts
    // For now, we'll fetch user's media and filter by location tags

    const mediaUrl = `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count&access_token=${accessToken}`;

    const response = await fetch(mediaUrl);
    if (!response.ok) {
      throw new Error(`Instagram API error: ${response.status}`);
    }

    const data = await response.json();
    const media = data.data || [];

    const posts: SocialPost[] = media.slice(0, 20).map((item: any) => ({
      id: item.id,
      platform: 'instagram',
      businessName: 'Instagram User', // Would need Graph API for business names
      content: item.caption || '',
      media: [{
        type: item.media_type === 'VIDEO' ? 'video' : 'image',
        url: item.media_type === 'VIDEO' ? item.thumbnail_url : item.media_url,
      }],
      engagement: {
        likes: item.like_count || 0,
        comments: item.comments_count || 0,
        shares: 0, // Instagram doesn't provide share count
      },
      timestamp: item.timestamp,
      link: item.permalink,
      location: {
        name: 'Location', // Would need location data from Graph API
        distance: 0,
      },
    }));

    return posts;
  } catch (error) {
    console.error('[NEARWISE-SOCIAL] Instagram API error:', error);
    throw error;
  }
}

// Twitter/X API v2 Integration
async function fetchTwitterPosts(latitude: number, longitude: number, radius: number): Promise<SocialPost[]> {
  const bearerToken = process.env.TWITTER_BEARER_TOKEN;

  if (!bearerToken || process.env.ENABLE_TWITTER_INTEGRATION !== 'true') {
    console.log('[NEARWISE-SOCIAL] Twitter integration disabled or no bearer token');
    return [];
  }

  if (!checkRateLimit('twitter', parseInt(process.env.TWITTER_RATE_LIMIT || '450'))) {
    throw new Error('Twitter API rate limit exceeded');
  }

  try {
    // Search for tweets with location filter
    // Note: Twitter API v2 requires elevated access for geo search
    const query = `geocode:${latitude},${longitude},${radius}km`;
    const url = `https://api.twitter.com/2/tweets/search/recent?query=${encodeURIComponent(query)}&max_results=50&tweet.fields=created_at,public_metrics,entities&expansions=author_id,attachments.media_keys&media.fields=url,preview_image_url&user.fields=name,username`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${bearerToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Twitter API error: ${response.status}`);
    }

    const data = await response.json();
    const tweets = data.data || [];
    const users = data.includes?.users || [];
    const media = data.includes?.media || [];

    const posts: SocialPost[] = tweets.map((tweet: any) => {
      const author = users.find((u: any) => u.id === tweet.author_id);
      const tweetMedia = tweet.attachments?.media_keys?.map((key: string) =>
        media.find((m: any) => m.media_key === key)
      ).filter(Boolean) || [];

      return {
        id: tweet.id,
        platform: 'twitter',
        businessName: author?.name || 'Twitter User',
        content: tweet.text,
        media: tweetMedia.map((m: any) => ({
          type: m.type === 'video' ? 'video' : 'image',
          url: m.type === 'video' ? m.preview_image_url : m.url,
        })),
        engagement: {
          likes: tweet.public_metrics?.like_count || 0,
          comments: tweet.public_metrics?.reply_count || 0,
          shares: tweet.public_metrics?.retweet_count || 0,
        },
        timestamp: tweet.created_at,
        link: `https://twitter.com/${author?.username}/status/${tweet.id}`,
        location: {
          name: 'Location',
          distance: 0,
        },
      };
    });

    return posts;
  } catch (error) {
    console.error('[NEARWISE-SOCIAL] Twitter API error:', error);
    throw error;
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('[NEARWISE-SOCIAL] Starting social media data fetch...');

    const { searchParams } = new URL(request.url);
    const latitude = parseFloat(searchParams.get('latitude') || '0');
    const longitude = parseFloat(searchParams.get('longitude') || '0');
    const radius = parseFloat(searchParams.get('radius') || '10');
    const platform = searchParams.get('platform') || 'all'; // 'all', 'facebook', 'instagram', 'twitter'

    // Validate parameters
    if (!latitude || !longitude) {
      return NextResponse.json({
        success: false,
        error: 'latitude and longitude are required',
      }, { status: 400 });
    }

    // Check cache
    const cacheKey = `social-${latitude.toFixed(4)}-${longitude.toFixed(4)}-${radius}-${platform}`;
    const cachedData = getCachedData(cacheKey);

    if (cachedData) {
      return NextResponse.json({
        ...cachedData,
        fromCache: true,
      });
    }

    // Check if any API integration is enabled
    const useMockData = process.env.USE_MOCK_SOCIAL_DATA === 'true' ||
                       (process.env.ENABLE_FACEBOOK_INTEGRATION !== 'true' &&
                        process.env.ENABLE_INSTAGRAM_INTEGRATION !== 'true' &&
                        process.env.ENABLE_TWITTER_INTEGRATION !== 'true');

    let allPosts: SocialPost[] = [];
    let errors: string[] = [];

    if (useMockData) {
      console.log('[NEARWISE-SOCIAL] Using mock data');
      allPosts = generateMockSocialPosts(latitude, longitude, radius, 50);
    } else {
      // Fetch from enabled platforms
      const fetchPromises: Promise<SocialPost[]>[] = [];

      if (platform === 'all' || platform === 'facebook') {
        if (process.env.ENABLE_FACEBOOK_INTEGRATION === 'true') {
          fetchPromises.push(
            fetchFacebookPosts(latitude, longitude, radius).catch(err => {
              errors.push(`Facebook: ${err.message}`);
              return [];
            })
          );
        }
      }

      if (platform === 'all' || platform === 'instagram') {
        if (process.env.ENABLE_INSTAGRAM_INTEGRATION === 'true') {
          fetchPromises.push(
            fetchInstagramPosts(latitude, longitude, radius).catch(err => {
              errors.push(`Instagram: ${err.message}`);
              return [];
            })
          );
        }
      }

      if (platform === 'all' || platform === 'twitter') {
        if (process.env.ENABLE_TWITTER_INTEGRATION === 'true') {
          fetchPromises.push(
            fetchTwitterPosts(latitude, longitude, radius).catch(err => {
              errors.push(`Twitter: ${err.message}`);
              return [];
            })
          );
        }
      }

      // Wait for all fetches to complete
      const results = await Promise.all(fetchPromises);
      allPosts = results.flat();

      // If all APIs failed, fall back to mock data
      if (allPosts.length === 0 && errors.length > 0) {
        console.warn('[NEARWISE-SOCIAL] All APIs failed, using mock data');
        allPosts = generateMockSocialPosts(latitude, longitude, radius, 50);
      }
    }

    // Filter by platform if specified
    if (platform !== 'all') {
      allPosts = allPosts.filter(post => post.platform === platform);
    }

    // Sort by timestamp (most recent first)
    allPosts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Limit to 50 posts
    allPosts = allPosts.slice(0, 50);

    const response = {
      success: true,
      location: { latitude, longitude },
      radius,
      platform,
      count: allPosts.length,
      posts: allPosts,
      usingMockData: useMockData,
      errors: errors.length > 0 ? errors : undefined,
      message: useMockData
        ? 'Using mock data. Enable social media integrations in .env.local for real data.'
        : errors.length > 0
        ? 'Some social media APIs failed. Showing available data.'
        : undefined,
    };

    // Cache the response
    setCachedData(cacheKey, response);

    return NextResponse.json(response);

  } catch (error) {
    console.error('[NEARWISE-SOCIAL] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch social media data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * NearWise Social Media API Route
 *
 * Aggregates social media content from Facebook, Instagram, and Twitter
 * based on user's location and selected radius.
 *
 * Features:
 * - Facebook Graph API integration for business posts and reviews
 * - Instagram Basic Display API for visual content
 * - Twitter/X API v2 for real-time updates and trending topics
 * - 15-minute caching to reduce API calls
 * - Rate limiting per platform
 * - Graceful fallback to mock data
 *
 * Query Parameters:
 * - latitude (required): User's latitude
 * - longitude (required): User's longitude
 * - radius (optional): Search radius in kilometers (default: 10)
 * - platform (optional): Filter by platform - 'all', 'facebook', 'instagram', 'twitter' (default: 'all')
 *
 * Example:
 * GET /api/nearwise/social?latitude=16.92&longitude=82.22&radius=10&platform=all
 *
 * Response:
 * {
 *   "success": true,
 *   "location": { "latitude": 16.92, "longitude": 82.22 },
 *   "radius": 10,
 *   "platform": "all",
 *   "count": 50,
 *   "posts": [...],
 *   "usingMockData": false,
 *   "fromCache": false
 * }
 */

