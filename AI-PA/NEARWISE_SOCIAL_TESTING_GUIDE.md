# NearWise Social Media Integration - Testing Guide

## 🧪 Complete Testing Checklist

This guide provides step-by-step instructions for testing all social media integration features in the NearWise AI Local Discovery application.

---

## 📋 Pre-Testing Setup

### **1. Start Development Server**

```bash
cd AI-PA
npm run dev
```

**Expected Output**:
```
> ai-pa@0.1.0 dev
> next dev -p 3002

  ▲ Next.js 15.5.6
  - Local:        http://localhost:3002
  - Environments: .env.local

 ✓ Starting...
 ✓ Ready in 2.3s
```

### **2. Verify Environment Variables**

Check that `.env.local` has the following:

```env
# Social Media API Keys (Optional - will use mock data if not set)
FACEBOOK_APP_ID=
FACEBOOK_APP_SECRET=
FACEBOOK_ACCESS_TOKEN=

INSTAGRAM_APP_ID=
INSTAGRAM_APP_SECRET=
INSTAGRAM_ACCESS_TOKEN=

TWITTER_API_KEY=
TWITTER_API_SECRET=
TWITTER_BEARER_TOKEN=

EVENTBRITE_API_KEY=

# Feature Flags
ENABLE_FACEBOOK_INTEGRATION=false
ENABLE_INSTAGRAM_INTEGRATION=false
ENABLE_TWITTER_INTEGRATION=false
USE_MOCK_SOCIAL_DATA=true
```

**Note**: With `USE_MOCK_SOCIAL_DATA=true`, the app will use realistic mock data for testing without requiring API keys.

---

## 🔍 Test Scenarios

### **Test 1: Basic Social Media API Endpoint**

#### **Test 1.1: Fetch All Social Posts**

**Request**:
```
GET http://localhost:3002/api/nearwise/social?latitude=16.92&longitude=82.22&radius=10&platform=all
```

**How to Test**:
1. Open browser
2. Navigate to the URL above
3. Or use curl:
   ```bash
   curl "http://localhost:3002/api/nearwise/social?latitude=16.92&longitude=82.22&radius=10&platform=all"
   ```

**Expected Response**:
```json
{
  "success": true,
  "location": {
    "latitude": 16.92,
    "longitude": 82.22
  },
  "radius": 10,
  "platform": "all",
  "count": 50,
  "posts": [
    {
      "id": "mock-facebook-1731412800000-0",
      "platform": "facebook",
      "businessName": "Starbucks Coffee",
      "content": "New seasonal collection just dropped! 🔥 Come check it out!",
      "media": [
        {
          "type": "image",
          "url": "https://images.unsplash.com/photo-1441986300917-64674bd600d8"
        }
      ],
      "engagement": {
        "likes": 245,
        "comments": 32,
        "shares": 18
      },
      "timestamp": "2025-11-10T14:30:00.000Z",
      "link": "https://facebook.com/post/1731412800000-0",
      "location": {
        "name": "Starbucks Coffee",
        "distance": 3.45
      }
    }
    // ... more posts
  ],
  "usingMockData": true,
  "message": "Using mock data. Enable social media integrations in .env.local for real data."
}
```

**Validation Checklist**:
- ✅ `success: true`
- ✅ `count` is 50 or less
- ✅ `posts` array contains objects with all required fields
- ✅ Posts have mixed platforms (facebook, instagram, twitter)
- ✅ `usingMockData: true` (if using mock data)
- ✅ Posts sorted by timestamp (most recent first)

---

#### **Test 1.2: Platform Filtering - Facebook Only**

**Request**:
```
GET http://localhost:3002/api/nearwise/social?latitude=16.92&longitude=82.22&radius=10&platform=facebook
```

**Expected**:
- ✅ All posts have `"platform": "facebook"`
- ✅ No Instagram or Twitter posts

---

#### **Test 1.3: Platform Filtering - Instagram Only**

**Request**:
```
GET http://localhost:3002/api/nearwise/social?latitude=16.92&longitude=82.22&radius=10&platform=instagram
```

**Expected**:
- ✅ All posts have `"platform": "instagram"`
- ✅ No Facebook or Twitter posts

---

#### **Test 1.4: Platform Filtering - Twitter Only**

**Request**:
```
GET http://localhost:3002/api/nearwise/social?latitude=16.92&longitude=82.22&radius=10&platform=twitter
```

**Expected**:
- ✅ All posts have `"platform": "twitter"`
- ✅ No Facebook or Instagram posts

---

#### **Test 1.5: Different Radius**

**Request**:
```
GET http://localhost:3002/api/nearwise/social?latitude=16.92&longitude=82.22&radius=5&platform=all
```

**Expected**:
- ✅ Posts have `location.distance` ≤ 5km
- ✅ Fewer posts than radius=10

---

#### **Test 1.6: Caching Test**

**Steps**:
1. Make first request:
   ```
   GET http://localhost:3002/api/nearwise/social?latitude=16.92&longitude=82.22&radius=10&platform=all
   ```
2. Note the response time (should be ~100-500ms)
3. Immediately make the same request again
4. Note the response time (should be ~10-50ms)

**Expected**:
- ✅ First request: `"fromCache": false`
- ✅ Second request: `"fromCache": true`
- ✅ Second request is significantly faster
- ✅ Both responses are identical

---

#### **Test 1.7: Error Handling - Missing Parameters**

**Request**:
```
GET http://localhost:3002/api/nearwise/social
```

**Expected Response**:
```json
{
  "success": false,
  "error": "latitude and longitude are required"
}
```

**Status Code**: 400 Bad Request

---

### **Test 2: Events API Endpoint**

#### **Test 2.1: Fetch All Events**

**Request**:
```
GET http://localhost:3002/api/nearwise/events?latitude=16.92&longitude=82.22&radius=10
```

**Expected Response**:
```json
{
  "success": true,
  "location": {
    "latitude": 16.92,
    "longitude": 82.22
  },
  "radius": 10,
  "count": 30,
  "events": [
    {
      "id": "event-1731412800000-0",
      "name": "Summer Music Festival",
      "description": "Join us for an amazing summer music festival!",
      "startTime": "2025-11-15T18:00:00.000Z",
      "endTime": "2025-11-15T22:00:00.000Z",
      "location": {
        "name": "City Convention Center",
        "address": "123 Main Street, City",
        "distance": 3.2
      },
      "attendeeCount": 150,
      "coverImage": "https://images.unsplash.com/photo-1500000000000",
      "link": "https://example.com/events/1731412800000-0",
      "category": "Music",
      "isFree": false
    }
    // ... more events
  ],
  "usingMockData": true,
  "message": "Using mock data. Enable Facebook or Eventbrite integration in .env.local for real events."
}
```

**Validation Checklist**:
- ✅ `success: true`
- ✅ `count` is 30 or less
- ✅ `events` array contains objects with all required fields
- ✅ Events sorted by `startTime` (soonest first)
- ✅ All events have future dates

---

#### **Test 2.2: Date Range Filtering**

**Request**:
```
GET http://localhost:3002/api/nearwise/events?latitude=16.92&longitude=82.22&radius=10&startDate=2025-11-15T00:00:00Z&endDate=2025-12-31T23:59:59Z
```

**Expected**:
- ✅ All events have `startTime` between specified dates
- ✅ Events sorted by start time

---

### **Test 3: UI Testing**

#### **Test 3.1: Navigate to NearWise Page**

**Steps**:
1. Open browser
2. Navigate to `http://localhost:3002/ai-local-discovery`
3. Wait for page to load

**Expected**:
- ✅ Page loads without errors
- ✅ Location detection prompt appears (or manual location input)
- ✅ NearWise branding visible
- ✅ Dark mode toggle works

---

#### **Test 3.2: Location Detection**

**Steps**:
1. Click "Detect My Location" button
2. Allow location access when prompted

**Expected**:
- ✅ Toast notification: "✅ Location Detected"
- ✅ Location displayed (e.g., "Visakhapatnam, Andhra Pradesh")
- ✅ Nearby places start loading
- ✅ Loading spinner appears

---

#### **Test 3.3: Manual Location Entry**

**Steps**:
1. Enter "New York" in the location input
2. Click "Set Location" button

**Expected**:
- ✅ Toast notification: "✅ Location Set - New York, New York"
- ✅ Location updated
- ✅ Nearby places reload

---

#### **Test 3.4: Social Buzz Section Visibility**

**Steps**:
1. Scroll down to "Social Buzz & Events" section
2. Click "Show" button

**Expected**:
- ✅ Section expands
- ✅ Platform filter buttons visible (All, Facebook, Instagram, Twitter)
- ✅ Sort options visible (Recent, Most Engaged, Nearest)
- ✅ Loading spinner appears
- ✅ Social posts load after ~1-2 seconds

---

#### **Test 3.5: Platform Filtering in UI**

**Steps**:
1. Ensure Social Buzz section is visible
2. Click "📘 Facebook" button
3. Wait for posts to reload
4. Click "📷 Instagram" button
5. Wait for posts to reload
6. Click "𝕏 Twitter" button
7. Wait for posts to reload
8. Click "All" button

**Expected**:
- ✅ Facebook filter: Only Facebook posts (blue badge 📘)
- ✅ Instagram filter: Only Instagram posts (pink badge 📷)
- ✅ Twitter filter: Only Twitter posts (sky blue badge 𝕏)
- ✅ All filter: Mixed posts from all platforms
- ✅ Active button has colored background
- ✅ Toast notification shows when using mock data

---

#### **Test 3.6: Sort Options in UI**

**Steps**:
1. Ensure Social Buzz section is visible with posts
2. Click "Recent" button
3. Observe post order
4. Click "Most Engaged" button
5. Observe post order changes
6. Click "Nearest" button
7. Observe post order changes

**Expected**:
- ✅ Recent: Posts sorted by timestamp (newest first)
- ✅ Most Engaged: Posts sorted by total engagement (likes + comments + shares)
- ✅ Nearest: Posts sorted by distance (closest first)
- ✅ Active button has teal background
- ✅ Post order visibly changes

---

#### **Test 3.7: Social Post Card Display**

**Steps**:
1. Examine a social post card

**Expected Elements**:
- ✅ Platform badge (📘 Facebook, 📷 Instagram, or 𝕏 Twitter)
- ✅ Business name (e.g., "Starbucks Coffee")
- ✅ Location and distance (e.g., "0.5 km")
- ✅ Relative timestamp (e.g., "2h ago")
- ✅ Post content text
- ✅ Media image (if available)
- ✅ Engagement metrics:
  - ❤️ Likes count
  - 💬 Comments count
  - 🔄 Shares count
- ✅ "View Original" button

---

#### **Test 3.8: View Original Post**

**Steps**:
1. Click "View Original" button on any post

**Expected**:
- ✅ New tab opens
- ✅ URL matches the post's platform (facebook.com, instagram.com, or twitter.com)
- ✅ Original tab remains on NearWise page

---

#### **Test 3.9: Events Display**

**Steps**:
1. Scroll to "Upcoming Events" section within Social Buzz

**Expected Elements**:
- ✅ Section header: "🗓️ Upcoming Events"
- ✅ Event cards displayed
- ✅ Each event card shows:
  - Event name
  - Date and time (formatted)
  - Location name and distance
  - Attendee count (if > 0)
  - Cover image (if available)
  - "FREE" badge (if free event)
  - "View Event" button

---

#### **Test 3.10: View Event Details**

**Steps**:
1. Click "View Event" button on any event

**Expected**:
- ✅ New tab opens
- ✅ Event page loads (Facebook Events or Eventbrite)
- ✅ Original tab remains on NearWise page

---

#### **Test 3.11: Empty State - No Posts**

**Steps**:
1. Filter by a platform with no posts (if possible)
2. Or wait for API to return empty results

**Expected**:
- ✅ Empty state icon displayed (social_distance)
- ✅ Message: "No social media content available"
- ✅ No error messages

---

#### **Test 3.12: Empty State - No Events**

**Steps**:
1. Wait for events API to return empty results (if possible)

**Expected**:
- ✅ Empty state icon displayed (event_busy)
- ✅ Message: "No upcoming events found"
- ✅ No error messages

---

#### **Test 3.13: Loading States**

**Steps**:
1. Refresh page
2. Observe loading spinners

**Expected**:
- ✅ Social posts: Spinning loader while fetching
- ✅ Events: Spinning loader while fetching
- ✅ Loaders disappear when data loads
- ✅ No layout shift

---

#### **Test 3.14: Scrolling Behavior**

**Steps**:
1. Ensure Social Buzz section has many posts
2. Scroll within the posts container
3. Scroll within the events container

**Expected**:
- ✅ Posts container scrollable (max-height: 600px)
- ✅ Events container scrollable (max-height: 400px)
- ✅ Smooth scrolling
- ✅ Scrollbar visible when needed

---

#### **Test 3.15: Responsive Design - Mobile**

**Steps**:
1. Open browser DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Select "iPhone 12 Pro" or similar
4. Navigate to Social Buzz section

**Expected**:
- ✅ Platform filter buttons wrap to multiple lines
- ✅ Sort buttons wrap to multiple lines
- ✅ Post cards full width
- ✅ Images scale properly
- ✅ Text readable
- ✅ Buttons accessible
- ✅ No horizontal scrolling

---

#### **Test 3.16: Dark Mode**

**Steps**:
1. Toggle dark mode using the theme switcher
2. Observe Social Buzz section

**Expected**:
- ✅ Background colors change appropriately
- ✅ Text colors remain readable
- ✅ Borders visible
- ✅ Badges maintain contrast
- ✅ Images display correctly
- ✅ Buttons styled correctly

---

#### **Test 3.17: Toast Notifications**

**Steps**:
1. Perform various actions (location detection, filtering, etc.)
2. Observe toast notifications

**Expected Toast Messages**:
- ✅ "✅ Location Detected" - when location detected
- ✅ "⚠️ Using Sample Social Data" - when using mock data
- ✅ "⚠️ Using Sample Events" - when using mock events
- ✅ "❌ Error" - when API fails (if testing with real APIs)

---

### **Test 4: Performance Testing**

#### **Test 4.1: Initial Load Time**

**Steps**:
1. Open browser DevTools (F12)
2. Go to Network tab
3. Navigate to `/ai-local-discovery`
4. Measure time to interactive

**Expected**:
- ✅ Page loads in < 3 seconds
- ✅ Social posts load in < 2 seconds (with mock data)
- ✅ Events load in < 2 seconds (with mock data)

---

#### **Test 4.2: Cache Performance**

**Steps**:
1. Load Social Buzz section (first time)
2. Note load time
3. Change platform filter
4. Change back to original filter
5. Note load time

**Expected**:
- ✅ First load: ~1-2 seconds
- ✅ Cached load: < 100ms
- ✅ Toast shows "Using Sample Data" only once

---

#### **Test 4.3: Memory Usage**

**Steps**:
1. Open browser DevTools (F12)
2. Go to Performance tab
3. Record performance
4. Interact with Social Buzz section
5. Stop recording

**Expected**:
- ✅ No memory leaks
- ✅ Smooth 60fps scrolling
- ✅ No layout thrashing

---

### **Test 5: Error Handling**

#### **Test 5.1: Network Error Simulation**

**Steps**:
1. Open browser DevTools (F12)
2. Go to Network tab
3. Set throttling to "Offline"
4. Try to load Social Buzz section

**Expected**:
- ✅ Error toast notification
- ✅ Graceful fallback to cached data (if available)
- ✅ Empty state displayed (if no cache)
- ✅ No app crash

---

#### **Test 5.2: Invalid Location**

**Steps**:
1. Enter invalid location (e.g., "asdfghjkl")
2. Click "Set Location"

**Expected**:
- ✅ Toast notification: "❌ Location Not Found"
- ✅ Location not changed
- ✅ No app crash

---

## ✅ Test Results Template

Use this template to record your test results:

```
# NearWise Social Media Integration - Test Results

**Date**: [Date]
**Tester**: [Your Name]
**Environment**: Development / Staging / Production
**Browser**: Chrome / Firefox / Safari / Edge
**Device**: Desktop / Mobile

## API Tests
- [ ] Test 1.1: Fetch All Social Posts
- [ ] Test 1.2: Platform Filtering - Facebook
- [ ] Test 1.3: Platform Filtering - Instagram
- [ ] Test 1.4: Platform Filtering - Twitter
- [ ] Test 1.5: Different Radius
- [ ] Test 1.6: Caching Test
- [ ] Test 1.7: Error Handling
- [ ] Test 2.1: Fetch All Events
- [ ] Test 2.2: Date Range Filtering

## UI Tests
- [ ] Test 3.1: Navigate to NearWise Page
- [ ] Test 3.2: Location Detection
- [ ] Test 3.3: Manual Location Entry
- [ ] Test 3.4: Social Buzz Section Visibility
- [ ] Test 3.5: Platform Filtering in UI
- [ ] Test 3.6: Sort Options in UI
- [ ] Test 3.7: Social Post Card Display
- [ ] Test 3.8: View Original Post
- [ ] Test 3.9: Events Display
- [ ] Test 3.10: View Event Details
- [ ] Test 3.11: Empty State - No Posts
- [ ] Test 3.12: Empty State - No Events
- [ ] Test 3.13: Loading States
- [ ] Test 3.14: Scrolling Behavior
- [ ] Test 3.15: Responsive Design - Mobile
- [ ] Test 3.16: Dark Mode
- [ ] Test 3.17: Toast Notifications

## Performance Tests
- [ ] Test 4.1: Initial Load Time
- [ ] Test 4.2: Cache Performance
- [ ] Test 4.3: Memory Usage

## Error Handling Tests
- [ ] Test 5.1: Network Error Simulation
- [ ] Test 5.2: Invalid Location

## Issues Found
[List any issues or bugs discovered during testing]

## Notes
[Any additional observations or comments]
```

---

## 🎯 Success Criteria

All tests should pass with the following criteria:

✅ **Functionality**: All features work as expected  
✅ **Performance**: Fast load times and smooth interactions  
✅ **UI/UX**: Clean, intuitive, and responsive design  
✅ **Error Handling**: Graceful degradation and helpful error messages  
✅ **Accessibility**: Keyboard navigation and screen reader support  
✅ **Cross-browser**: Works on Chrome, Firefox, Safari, Edge  
✅ **Mobile**: Fully responsive on mobile devices  
✅ **Dark Mode**: Proper styling in both light and dark modes  

---

## 🚀 Next Steps After Testing

1. **Document Issues**: Record any bugs or issues found
2. **Fix Critical Bugs**: Address any blocking issues
3. **Optimize Performance**: Improve any slow areas
4. **Add Real API Keys**: Configure production API credentials
5. **Deploy to Staging**: Test with real APIs in staging environment
6. **User Acceptance Testing**: Get feedback from real users
7. **Deploy to Production**: Launch the feature!

---

## 📞 Support

If you encounter any issues during testing:

1. Check browser console for errors
2. Check network tab for failed requests
3. Verify environment variables are set correctly
4. Review the implementation documentation
5. Check the API response format

**Happy Testing! 🎉**

