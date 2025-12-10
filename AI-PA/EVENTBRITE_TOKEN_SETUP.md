# 🔑 Eventbrite API Token Setup Guide

## ⚠️ **Current Issue: Invalid API Token**

**Problem**: The Eventbrite API tokens in your `.env.local` file appear to be invalid or incomplete.

**Evidence**:
- `EVENTBRITE_PRIVATE_TOKEN=TOPVXFCAVVQ2AFLYGIRE` (20 characters)
- `EVENTBRITE_API_KEY=AGD2XFL4T5CR5AG3IM` (18 characters)

**Expected**: Valid Eventbrite OAuth tokens are typically **40-60+ characters** long.

**Result**: The API returns authentication errors, causing the system to fall back to mock/sample events.

---

## 🎯 **How to Get a Valid Eventbrite API Token**

### **Step 1: Create an Eventbrite Account**

1. Go to https://www.eventbrite.com
2. Sign up for a free account (or log in if you already have one)
3. Verify your email address

### **Step 2: Access the Eventbrite Platform**

1. Navigate to https://www.eventbrite.com/platform/
2. Click on "API" or "Get Started"
3. You'll be redirected to the Eventbrite Platform page

### **Step 3: Create an App**

1. Go to https://www.eventbrite.com/account-settings/apps
2. Click "Create New App" or "Add App"
3. Fill in the app details:
   - **App Name**: "AI-PA Local Discovery" (or any name you prefer)
   - **Description**: "AI Personal Assistant with local event discovery"
   - **Application URL**: http://localhost:3002 (for development)
   - **OAuth Redirect URI**: http://localhost:3002/auth/callback (optional for now)
4. Click "Create App"

### **Step 4: Get Your Private OAuth Token**

1. After creating the app, you'll see your app details page
2. Look for **"Private Token"** or **"Personal OAuth Token"**
3. Click "Show Token" or "Generate Token"
4. **Copy the entire token** - it should be 40-60+ characters long
5. Example format: `ABCDEFGHIJ1234567890KLMNOPQRSTUVWXYZ1234567890`

### **Step 5: Update Your `.env.local` File**

1. Open `AI-PA/.env.local`
2. Replace the existing token with your new token:
   ```env
   EVENTBRITE_PRIVATE_TOKEN=YOUR_ACTUAL_TOKEN_HERE
   ```
3. Save the file
4. Restart your development server

---

## 🔧 **Alternative: Use OAuth 2.0 Flow (Advanced)**

If you want to use OAuth 2.0 for production:

1. **Get Client ID and Client Secret** from your app settings
2. **Implement OAuth flow**:
   - Redirect users to Eventbrite authorization URL
   - Handle callback with authorization code
   - Exchange code for access token
3. **Use access token** for API requests

**For development/testing**, the Private OAuth Token is sufficient.

---

## 🧪 **Testing Your Token**

### **Method 1: Using cURL**

```bash
curl -X GET \
  "https://www.eventbriteapi.com/v3/users/me/" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response**:
```json
{
  "id": "123456789",
  "name": "Your Name",
  "email": "your@email.com"
}
```

**Error Response** (invalid token):
```json
{
  "error": "INVALID_AUTH",
  "error_description": "The OAuth token you provided was invalid."
}
```

### **Method 2: Using the Test Script**

1. Update `AI-PA/test-eventbrite-api.js` with your token
2. Run: `node AI-PA/test-eventbrite-api.js`
3. Check the output for status 200 and events found

### **Method 3: Check Browser Console**

1. Open http://localhost:3002/ai-local-discovery
2. Open browser console (F12)
3. Look for `[NEARWISE-EVENTS]` logs
4. Check for:
   - "Eventbrite token appears invalid" → Token is too short
   - "Eventbrite API error: 401" → Token is invalid/expired
   - "Eventbrite returned X events" → Token is working!

---

## 📊 **Token Validation Checklist**

Before using your token, verify:

- [ ] Token is **40+ characters** long
- [ ] Token contains **alphanumeric characters** (A-Z, 0-9)
- [ ] Token was copied **completely** (no truncation)
- [ ] Token is from a **valid Eventbrite app**
- [ ] App has **appropriate permissions** (read events)
- [ ] Token is **not expired** (check app settings)

---

## 🚨 **Common Issues**

### **Issue 1: Token Too Short**

**Symptom**: Console shows "Eventbrite token appears invalid (too short)"

**Solution**: 
- The token in `.env.local` is incomplete
- Go back to Eventbrite app settings and copy the full token
- Make sure you copy the entire string

### **Issue 2: 401 Unauthorized**

**Symptom**: API returns status 401

**Solutions**:
- Token is invalid or expired
- Generate a new token from your app settings
- Make sure you're using the Private OAuth Token, not the Client Secret

### **Issue 3: 403 Forbidden**

**Symptom**: API returns status 403

**Solutions**:
- Your app doesn't have permission to access events
- Check app permissions in Eventbrite settings
- Make sure your Eventbrite account is verified

### **Issue 4: No Events Found**

**Symptom**: API returns 200 but 0 events

**Solutions**:
- There may genuinely be no events in that location
- Try a major city (New York, London, San Francisco)
- Increase the search radius (try 20km or 50km)
- Check if events exist on Eventbrite.com for that location

---

## 🌐 **Recommended Test Locations**

Use these locations to test if your token is working (they usually have many events):

| City | Latitude | Longitude | Expected Events |
|------|----------|-----------|-----------------|
| New York, NY | 40.7128 | -74.0060 | 50+ |
| San Francisco, CA | 37.7749 | -122.4194 | 30+ |
| London, UK | 51.5074 | -0.1278 | 40+ |
| Los Angeles, CA | 34.0522 | -118.2437 | 40+ |
| Chicago, IL | 41.8781 | -87.6298 | 30+ |

---

## 📝 **Example: Valid `.env.local` Configuration**

```env
# Eventbrite API (REPLACE WITH YOUR ACTUAL TOKENS)
EVENTBRITE_PRIVATE_TOKEN=ABCDEFGHIJ1234567890KLMNOPQRSTUVWXYZ1234567890ABCDEF
EVENTBRITE_CLIENT_SECRET=ABCDEFGHIJ1234567890KLMNOPQRSTUVWXYZ1234567890
EVENTBRITE_API_KEY=ABCDEFGHIJ1234567890KLMNOPQRSTUVWXYZ1234567890

# Feature Flags
ENABLE_EVENTBRITE_INTEGRATION=true
```

**Note**: The tokens above are examples. Your actual tokens will be different.

---

## 🎉 **After Getting a Valid Token**

1. ✅ Update `.env.local` with your new token
2. ✅ Restart the development server
3. ✅ Open http://localhost:3002/ai-local-discovery
4. ✅ Enable location or enter coordinates
5. ✅ Check browser console for `[NEARWISE-EVENTS]` logs
6. ✅ Verify events are fetched: "Eventbrite returned X events"
7. ✅ Check that events do NOT have `[SAMPLE]` prefix
8. ✅ Click "View Event" to open actual Eventbrite pages

---

## 🔗 **Useful Links**

- **Eventbrite Platform**: https://www.eventbrite.com/platform/
- **API Documentation**: https://www.eventbrite.com/platform/api
- **App Management**: https://www.eventbrite.com/account-settings/apps
- **API Reference**: https://www.eventbrite.com/platform/api#/reference
- **Authentication Guide**: https://www.eventbrite.com/platform/api#/introduction/authentication

---

## 💡 **Next Steps**

1. **Get a valid Eventbrite API token** following the steps above
2. **Update your `.env.local`** file with the new token
3. **Restart your server**: Kill the current process and run `npm run dev`
4. **Test the integration** by opening the AI Local Discovery page
5. **Verify real events** are displayed instead of sample events

---

**Status**: ⚠️ **ACTION REQUIRED - OBTAIN VALID EVENTBRITE API TOKEN**

Once you have a valid token, real events from Eventbrite will be displayed in your application! 🚀

