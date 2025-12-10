# NearWise - AI Local Discovery Feature

## 📋 Overview

**NearWise** is an AI-powered local discovery assistant integrated into the AI-PA application. It helps users discover nearby shops, restaurants, malls, and new store openings within a customizable radius, with social media integration for trending places and smart notifications.

---

## ✅ Implementation Status

### **Phase 1: Core Features (COMPLETED)**

#### 1. **Page Structure** ✅
- **Route**: `/ai-local-discovery`
- **File**: `AI-PA/src/app/ai-local-discovery/page.tsx`
- **Features**:
  - Responsive layout with frosted-glass design
  - Dark mode support
  - Header with back navigation
  - Bottom navigation integration
  - Voice assistant integration

#### 2. **Location Detection** ✅
- **Automatic Detection**: Browser Geolocation API
- **Reverse Geocoding**: OpenWeather API
- **Manual Entry**: Geocoding with OpenWeather API
- **Display**: Text-based (City, Area, Coordinates) - NO MAP
- **Error Handling**: Graceful fallbacks for denied permissions

#### 3. **Radius Selection** ✅
- **UI Component**: Interactive slider
- **Options**: 5km, 10km, 15km, 20km
- **Visual Feedback**: Badge indicators (Nearby, Local, Extended, Wide)
- **Real-time Updates**: Instant radius adjustment

#### 4. **Local Discovery** ✅
- **API Integration**: OpenStreetMap Overpass API
- **API Route**: `AI-PA/src/app/api/nearwise/places/route.ts`
- **Categories**:
  - All Places
  - Shops
  - Malls
  - Restaurants
  - New Openings (marked with "NEW" badge)
- **Place Information**:
  - Name, Category, Distance
  - Rating (generated based on available data)
  - Address, Phone, Opening Hours
  - Trending indicators
- **Features**:
  - Category tabs for filtering
  - Search functionality
  - Sort by distance
  - Refresh button
  - Loading states

#### 5. **Social Media Integration** ✅
- **API Route**: `AI-PA/src/app/api/nearwise/social/route.ts`
- **Platforms**: Facebook, Instagram, Twitter (ready for integration)
- **Current Status**: Mock data implementation
- **Features**:
  - Social media posts about places
  - Trending places analysis
  - Sentiment analysis
  - Popular times
- **Note**: Real API integration requires API keys (see Configuration section)

#### 6. **Database Schema** ✅
- **SQL File**: `AI-PA/supabase_nearwise_tables.sql`
- **Tables Created**:
  - `nearwise_saved_locations` - User's favorite places
  - `nearwise_preferences` - User preferences
  - `nearwise_notifications` - Notification subscriptions
  - `nearwise_search_history` - Search analytics
  - `nearwise_place_reviews` - User reviews (future)
- **Features**:
  - Row Level Security (RLS) enabled
  - Indexes for performance
  - Triggers for timestamp updates

#### 7. **API Routes** ✅
- **Places API**: `/api/nearwise/places` (GET)
  - Fetch nearby places from OpenStreetMap
  - Filter by category and radius
  - Calculate distances
  - Generate ratings
- **Social Media API**: `/api/nearwise/social` (GET, POST)
  - Fetch social media posts
  - Analyze trending places
  - Mock data for now
- **Saved Locations API**: `/api/nearwise/saved-locations` (GET, POST, DELETE)
  - Save favorite locations
  - Retrieve saved locations
  - Delete saved locations

---

## 🔧 Configuration

### **Environment Variables**

Add the following to your `.env.local` file:

```env
# OpenWeather API (Already configured)
OPENWEATHER_API_KEY=72f5c4b9ba0b32305cc8d8e3a1ee58c4

# UnwiredLabs LocationAPI (Already configured)
UNWIREDLABS_API_KEY=pk.b87bf899a9aaff01d51622567856370e

# Social Media APIs (Optional - for future integration)
FACEBOOK_ACCESS_TOKEN=your_facebook_token_here
INSTAGRAM_ACCESS_TOKEN=your_instagram_token_here
TWITTER_BEARER_TOKEN=your_twitter_token_here
```

### **Database Setup**

1. Open your Supabase SQL Editor
2. Run the SQL script: `AI-PA/supabase_nearwise_tables.sql`
3. Verify tables are created:
   - `nearwise_saved_locations`
   - `nearwise_preferences`
   - `nearwise_notifications`
   - `nearwise_search_history`
   - `nearwise_place_reviews`

---

## 🚀 Usage

### **Accessing NearWise**

1. Navigate to the dashboard: `http://localhost:3002/dashboard`
2. Click on the "AI Local Discovery" card
3. Allow location access when prompted (or enter manually)
4. Adjust search radius using the slider
5. Browse places by category
6. Use search to find specific places

### **Features Available**

#### **Location Management**
- Auto-detect location using GPS
- Manual location entry
- Refresh location anytime

#### **Place Discovery**
- View nearby shops, malls, restaurants
- Filter by category (All, Shops, Malls, Restaurants, New)
- Search places by name
- See distance, rating, and details
- View opening hours and contact info

#### **Place Actions**
- Get directions (button ready for integration)
- Save to favorites (button ready for integration)

---

## 📊 API Reference

### **1. Places API**

**Endpoint**: `GET /api/nearwise/places`

**Parameters**:
- `latitude` (required): User's latitude
- `longitude` (required): User's longitude
- `radius` (optional): Search radius in km (default: 10)
- `category` (optional): Filter by category (all, shop, mall, restaurant, new)

**Response**:
```json
{
  "success": true,
  "location": { "latitude": 12.9716, "longitude": 77.5946 },
  "radius": 10,
  "category": "all",
  "count": 25,
  "places": [
    {
      "id": "osm-node-123456",
      "name": "Example Shop",
      "category": "shop",
      "distance": 1.5,
      "rating": 4.2,
      "address": "123 Main St",
      "latitude": 12.9720,
      "longitude": 77.5950,
      "openingHours": "Mo-Su 09:00-21:00",
      "phone": "+91 1234567890",
      "isNew": false,
      "trending": true
    }
  ]
}
```

### **2. Social Media API**

**Endpoint**: `GET /api/nearwise/social`

**Parameters**:
- `placeId` (optional): Specific place ID
- `placeName` (optional): Place name
- `type` (optional): 'posts' or 'trending'

**Response**:
```json
{
  "success": true,
  "type": "posts",
  "placeName": "Example Restaurant",
  "count": 10,
  "posts": [
    {
      "id": "post-123",
      "platform": "instagram",
      "author": "John Doe",
      "content": "Amazing food at Example Restaurant!",
      "likes": 150,
      "comments": 25,
      "shares": 10,
      "timestamp": "2025-11-12T10:30:00Z"
    }
  ],
  "usingMockData": true
}
```

### **3. Saved Locations API**

**Endpoint**: `GET /api/nearwise/saved-locations`

**Parameters**:
- `userId` (required): User's ID

**Response**:
```json
{
  "success": true,
  "count": 5,
  "locations": [
    {
      "location_id": "uuid",
      "user_id": "uuid",
      "place_id": "osm-node-123",
      "place_name": "Favorite Shop",
      "place_category": "shop",
      "latitude": 12.9716,
      "longitude": 77.5946,
      "saved_at": "2025-11-12T10:00:00Z"
    }
  ]
}
```

---

## 🔮 Future Enhancements

### **Phase 2: Advanced Features (PENDING)**

1. **Real Social Media Integration**
   - Connect Facebook Graph API
   - Connect Instagram Graph API
   - Connect Twitter API v2
   - Real-time trending analysis

2. **Smart Notifications**
   - Push notifications for new openings
   - Event alerts
   - Promotional offers
   - Proximity-based triggers

3. **Enhanced Place Details**
   - Photo galleries
   - User reviews and ratings
   - Popular times graph
   - Price range indicators

4. **Navigation Integration**
   - Google Maps integration
   - Apple Maps integration
   - In-app directions

5. **Personalization**
   - AI-powered recommendations
   - Learning user preferences
   - Personalized discovery feed

---

## 🐛 Known Issues

1. **Social Media Data**: Currently using mock data. Real integration requires API keys.
2. **Overpass API Rate Limits**: OpenStreetMap Overpass API has rate limits. Consider caching results.
3. **Place Ratings**: Ratings are generated based on available metadata. Real ratings require additional data sources.

---

## 📝 Notes

- The feature is fully functional with OpenStreetMap data
- Social media integration is ready but requires API keys
- Database tables need to be created in Supabase
- All UI components follow the existing design system
- Dark mode is fully supported
- Mobile responsive design implemented

---

## 🤝 Contributing

To add new features or improvements:

1. Update the relevant API route in `AI-PA/src/app/api/nearwise/`
2. Modify the page component in `AI-PA/src/app/ai-local-discovery/page.tsx`
3. Update database schema if needed in `AI-PA/supabase_nearwise_tables.sql`
4. Test thoroughly with different locations and radii
5. Update this documentation

---

## 📞 Support

For issues or questions:
- Check the console logs for detailed error messages
- Verify API keys are correctly configured
- Ensure database tables are created
- Check browser console for client-side errors

---

**Last Updated**: November 12, 2025
**Version**: 1.0.0
**Status**: Production Ready (Core Features)

