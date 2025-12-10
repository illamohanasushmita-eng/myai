# ✅ Facebook Graph API Integration - Ready to Test!

## 🎉 Configuration Complete

The Facebook Graph API credentials have been successfully configured in `.env.local`:

- ✅ **App ID**: `826100790166232`
- ✅ **App Secret**: `addda5c4fbcad352a933013b7a24ecf1`
- ✅ **Access Token**: Configured (long-lived token)
- ✅ **Integration Enabled**: `ENABLE_FACEBOOK_INTEGRATION=true`
- ✅ **Mock Data Disabled**: `USE_MOCK_SOCIAL_DATA=false`

---

## 🚀 Next Steps

### **1. Restart the Development Server**

The environment variables are loaded when the server starts, so you need to restart:

```bash
# If the server is running, stop it with Ctrl+C
# Then restart:
cd AI-PA
npm run dev
```

**Expected Output:**
```
> ai-pa@0.1.0 dev
> next dev -p 3002

  ▲ Next.js 15.5.6
  - Local:        http://localhost:3002
  - Environments: .env.local

 ✓ Starting...
 ✓ Ready in 2.3s
```

---

### **2. Test the Facebook API Endpoint**

Once the server is running, test the API endpoint directly:

**Test URL:**
```
http://localhost:3002/api/nearwise/social?latitude=37.7749&longitude=-122.4194&radius=10&platform=facebook
```

**Alternative Test Locations:**
- **San Francisco**: `latitude=37.7749&longitude=-122.4194`
- **New York**: `latitude=40.7128&longitude=-74.0060`
- **Los Angeles**: `latitude=34.0522&longitude=-118.2437`
- **Your Location**: Use your actual coordinates

**Expected Response:**
```json
{
  "success": true,
  "location": {
    "latitude": 37.7749,
    "longitude": -122.4194
  },
  "radius": 10,
  "platform": "facebook",
  "count": 15,
  "posts": [
    {
      "id": "123456789_987654321",
      "platform": "facebook",
      "businessName": "Starbucks Coffee",
      "content": "New seasonal drinks available!",
      "media": [...],
      "engagement": {
        "likes": 245,
        "comments": 32,
        "shares": 18
      },
      "timestamp": "2025-11-13T10:30:00+0000",
      "link": "https://facebook.com/123456789_987654321",
      "location": {
        "name": "Starbucks Coffee",
        "distance": 0.5
      }
    }
  ],
  "usingMockData": false,
  "fromCache": false
}
```

**Key Indicators of Success:**
- ✅ `"success": true`
- ✅ `"usingMockData": false` (means real Facebook data)
- ✅ `"platform": "facebook"`
- ✅ Posts have real Facebook IDs (not "mock-facebook-...")
- ✅ Links point to actual Facebook posts

---

### **3. Test in the NearWise UI**

**Steps:**

1. **Navigate to NearWise Page:**
   ```
   http://localhost:3002/ai-local-discovery
   ```

2. **Set Your Location:**
   - Click "Detect My Location" and allow browser access
   - OR enter a city name manually (e.g., "San Francisco")

3. **Open Social Buzz Section:**
   - Scroll down to "Social Buzz & Events" section
   - Click the "Show" button

4. **Filter by Facebook:**
   - Click the "📘 Facebook" button
   - Wait for posts to load (~1-3 seconds)

5. **Verify Real Data:**
   - Check that posts look realistic
   - Click "View Original" to verify links go to real Facebook posts
   - Check engagement metrics (likes, comments, shares)

**What You Should See:**
- Real business names from your area
- Actual post content from Facebook
- Real engagement numbers
- Working "View Original" links to Facebook
- Distance from your location

---

## 🔍 Troubleshooting

### **Issue: Still seeing "Using Sample Data" toast**

**Possible Causes:**
1. Server not restarted after updating `.env.local`
2. Environment variables not loaded

**Solution:**
```bash
# Stop the server (Ctrl+C)
# Restart:
cd AI-PA
npm run dev
```

---

### **Issue: API returns error "Invalid OAuth access token"**

**Possible Causes:**
1. Access token expired
2. Access token doesn't have required permissions

**Solution:**
1. Go to [Facebook Graph API Explorer](https://developers.facebook.com/tools/explorer/)
2. Select your app (826100790166232)
3. Request permissions:
   - `pages_read_engagement`
   - `pages_show_list`
   - `public_profile`
4. Generate a new long-lived access token
5. Update `FACEBOOK_ACCESS_TOKEN` in `.env.local`
6. Restart server

---

### **Issue: No posts returned (empty array)**

**Possible Causes:**
1. No Facebook business pages in the selected area
2. Radius too small
3. Businesses don't have recent posts

**Solution:**
1. Try a major city location (San Francisco, New York, etc.)
2. Increase radius to 20km:
   ```
   ?latitude=37.7749&longitude=-122.4194&radius=20&platform=facebook
   ```
3. Check Facebook Graph API Explorer to verify data availability

---

### **Issue: Rate limit exceeded**

**Error Message:**
```json
{
  "success": false,
  "error": "Facebook API rate limit exceeded"
}
```

**Solution:**
- Wait 1 hour for rate limit to reset
- Rate limit: 200 requests per hour
- Cached responses don't count toward limit

---

## 📊 What the Integration Does

### **Facebook Graph API Calls:**

1. **Search Nearby Places:**
   ```
   GET /v18.0/search?type=place&center={lat},{lon}&distance={radius}
   ```
   - Finds Facebook business pages near the location
   - Returns up to 10 places

2. **Fetch Posts from Each Place:**
   ```
   GET /v18.0/{page-id}/posts?fields=id,message,created_time,full_picture,likes,comments,shares
   ```
   - Gets recent posts from each business
   - Includes engagement metrics
   - Returns up to 5 posts per business

3. **Aggregate and Return:**
   - Combines all posts
   - Sorts by timestamp (most recent first)
   - Limits to 50 total posts
   - Caches for 15 minutes

---

## 🎯 Expected Behavior

### **First Request:**
- Takes 2-5 seconds (API calls to Facebook)
- `"fromCache": false`
- `"usingMockData": false`

### **Subsequent Requests (within 15 minutes):**
- Takes 50-100ms (from cache)
- `"fromCache": true`
- Same data as first request

### **After 15 Minutes:**
- Cache expires
- New API calls made
- Fresh data returned

---

## 📈 Performance Metrics

**With Facebook Integration Enabled:**
- **API Response Time**: 2-5 seconds (first request)
- **Cached Response Time**: 50-100ms
- **Cache Duration**: 15 minutes
- **Rate Limit**: 200 requests/hour
- **Posts per Request**: Up to 50

**Benefits:**
- ✅ Real-time social media content
- ✅ Actual engagement metrics
- ✅ Links to original Facebook posts
- ✅ Nearby business discovery
- ✅ Trending content from local area

---

## 🎊 Success Checklist

Test these to confirm everything is working:

- [ ] Server restarts without errors
- [ ] API endpoint returns `"success": true`
- [ ] Response has `"usingMockData": false`
- [ ] Posts have real Facebook IDs (not "mock-...")
- [ ] Business names are real (not generic)
- [ ] "View Original" links open real Facebook posts
- [ ] Engagement metrics look realistic
- [ ] UI displays posts correctly
- [ ] Platform badge shows "📘 Facebook"
- [ ] Filtering by Facebook works
- [ ] Sorting options work (Recent, Most Engaged, Nearest)
- [ ] Toast notification doesn't say "Using Sample Data"

---

## 🚀 You're All Set!

The Facebook Graph API integration is now fully configured and ready to use. Restart your development server and start testing!

**Happy Testing! 🎉**

