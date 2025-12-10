# 🧪 AI Local Discovery - Location Filtering Testing Guide

## 🎯 **Quick Test Procedure**

Follow these steps to verify that all displayed information is accurately filtered based on your actual current location.

---

## 📍 **Test 1: Location Detection**

### **Steps**:
1. Open http://localhost:3002/ai-local-discovery
2. Click the **"Detect My Location"** button
3. When prompted, click **"Allow"** to grant location access

### **Expected Results**:
- ✅ Toast notification: "📍 Location Detected - [Your City], [Your State]"
- ✅ Location card shows:
  - Your city name
  - Your state/area
  - Coordinates: "Lat: XX.XXXX, Lon: YY.YYYY"
- ✅ Loading spinner appears while fetching data
- ✅ Results populate automatically

### **Verification**:
- [ ] Coordinates match your actual location (verify with Google Maps)
- [ ] City/area name is correct
- [ ] No error messages appear

---

## 🏪 **Test 2: Nearby Places Filtering**

### **Steps**:
1. After location is detected, scroll to "Nearby Places" section
2. Check the displayed places
3. Note the distance shown for each place (e.g., "0.5 km", "2.3 km")
4. Change the radius slider from 10km to 5km
5. Observe which places disappear

### **Expected Results**:
- ✅ All places show distance from your location
- ✅ All distances are ≤ current radius setting
- ✅ Places are sorted by distance (closest first)
- ✅ When radius decreases, farther places disappear
- ✅ When radius increases, more places appear

### **Verification**:
- [ ] No places with distance > radius are shown
- [ ] Distance calculations appear accurate
- [ ] Places are actually near your location (verify with Google Maps)
- [ ] Changing radius updates results immediately

### **Test Different Categories**:
- [ ] Click "Shops" - shows only shops within radius
- [ ] Click "Malls" - shows only malls within radius
- [ ] Click "Restaurants" - shows only restaurants within radius
- [ ] Click "All" - shows all categories within radius

---

## 🎉 **Test 3: Events Filtering**

### **Steps**:
1. Enable "Social Buzz & Events" toggle
2. Scroll to "Upcoming Events" section
3. Check event locations and distances
4. Change radius slider
5. Verify events update

### **Expected Results**:
- ✅ Events show venue location and distance
- ✅ All events are within the selected radius
- ✅ Events are sorted by start time (soonest first)
- ✅ Changing radius updates event list

### **Verification**:
- [ ] Event venues are in your area
- [ ] Distances are accurate
- [ ] No events from other cities appear
- [ ] Clicking "View Event" opens correct Eventbrite page

### **Check Console Logs**:
Open browser console (F12) and look for:
```
[NEARWISE-EVENTS] Fetching Eventbrite events for location: XX.XXXX, YY.YYYY, radius: 10km
[NEARWISE-EVENTS] Eventbrite returned X events
```

---

## 🏷️ **Test 4: Brand Finder Filtering**

### **Steps**:
1. Scroll to "AI Brand Finder Assistant" section
2. Enter a brand name (e.g., "Starbucks", "Nike", "McDonald's")
3. Click "Find Stores"
4. Check the results

### **Expected Results**:
- ✅ Shows offline stores within your radius
- ✅ Each store shows distance from your location
- ✅ Stores are sorted by distance
- ✅ Online shopping links are provided

### **Verification**:
- [ ] Stores are actually near your location
- [ ] Distances are accurate
- [ ] No stores from other cities appear
- [ ] Changing radius updates store list

### **Check Console Logs**:
```
[BRAND-FINDER] Searching for brand: "Starbucks" near (XX.XXXX, YY.YYYY) within 10000m (10km)
[BRAND-FINDER] Overpass API search completed: X stores found
```

---

## 📱 **Test 5: Social Buzz Filtering**

### **Steps**:
1. Enable "Social Buzz & Events" toggle
2. Scroll to "Social Buzz" section
3. Check the posts and their locations
4. Verify businesses mentioned are local

### **Expected Results**:
- ✅ Posts are from businesses in your area
- ✅ Business names are recognizable local establishments
- ✅ Post locations match your area

### **Verification**:
- [ ] No posts from distant cities
- [ ] Business names are local
- [ ] Post content is relevant to your area

---

## 🌍 **Test 6: Manual Location Entry**

### **Steps**:
1. Click "Enter Manually" button
2. Enter coordinates for a different city:
   - **New York**: Lat: 40.7128, Lon: -74.0060
   - **San Francisco**: Lat: 37.7749, Lon: -122.4194
   - **London**: Lat: 51.5074, Lon: -0.1278
3. Click "Set Location"
4. Observe all results update

### **Expected Results**:
- ✅ Location card updates to show new city
- ✅ All places update to show locations in the new city
- ✅ All events update to show events in the new city
- ✅ Brand finder results update to new city
- ✅ Social posts update to new city

### **Verification**:
- [ ] No results from your original location remain
- [ ] All results are from the new city
- [ ] Distances are calculated from new coordinates
- [ ] City name updates correctly

---

## 🔄 **Test 7: Radius Changes**

### **Steps**:
1. Set radius to 1 km
2. Note the number of results
3. Increase radius to 5 km
4. Note the increase in results
5. Increase radius to 20 km
6. Note further increase

### **Expected Results**:
- ✅ Smaller radius = fewer results
- ✅ Larger radius = more results
- ✅ All results respect the radius limit
- ✅ Results update immediately when radius changes

### **Verification**:
- [ ] 1 km shows only very close places
- [ ] 5 km shows moderate number of places
- [ ] 20 km shows many places
- [ ] No place exceeds the radius limit

---

## 🔍 **Test 8: Category Filtering**

### **Steps**:
1. Select "All" category
2. Note all types of places shown
3. Select "Shops" category
4. Verify only shops are shown
5. Select "Restaurants" category
6. Verify only restaurants are shown

### **Expected Results**:
- ✅ Category filter works correctly
- ✅ All filtered results are still within radius
- ✅ Distance calculations remain accurate

### **Verification**:
- [ ] Category filter doesn't affect radius filtering
- [ ] Both filters work together correctly
- [ ] Results are accurate for both category AND location

---

## 📊 **Test 9: Console Log Verification**

### **Steps**:
1. Open browser console (Press F12)
2. Go to Console tab
3. Detect location or change radius
4. Look for log messages

### **Expected Console Logs**:

**Places API**:
```
[NEARWISE-PLACES] Fetching places: { latitude: XX.XXXX, longitude: YY.YYYY, radius: 10, category: 'all' }
[NEARWISE-PLACES] Processed places: 25
[NEARWISE-PLACES] Average distance: 3.45 km
```

**Events API**:
```
[NEARWISE-EVENTS] Fetching Eventbrite events for location: XX.XXXX, YY.YYYY, radius: 10km
[NEARWISE-EVENTS] Eventbrite API response status: 200
[NEARWISE-EVENTS] Eventbrite returned 15 events
```

**Brand Finder**:
```
[BRAND-FINDER] Searching for brand: "Nike" near (XX.XXXX, YY.YYYY) within 10000m (10km)
[BRAND-FINDER] Overpass API search completed: 5 stores found
```

### **Verification**:
- [ ] Coordinates in logs match your location
- [ ] Radius in logs matches slider setting
- [ ] No error messages appear
- [ ] API calls complete successfully

---

## ✅ **Success Criteria**

### **All Tests Pass If**:

1. ✅ Location detection captures accurate GPS/WiFi coordinates
2. ✅ All places are within the specified radius
3. ✅ All events are within the specified radius
4. ✅ All brand stores are within the specified radius
5. ✅ All social posts are from local businesses
6. ✅ Distance calculations are accurate (verify with Google Maps)
7. ✅ Changing radius updates all results immediately
8. ✅ Changing location updates all results to new area
9. ✅ No results from distant cities appear
10. ✅ Console logs show correct coordinates and radius

---

## 🚨 **Common Issues & Solutions**

### **Issue 1: Location Not Detected**
**Solution**: 
- Check browser location permissions
- Try manual location entry
- Verify internet connection

### **Issue 2: No Results Shown**
**Solution**:
- Increase radius (try 20km)
- Check console for API errors
- Verify location coordinates are correct

### **Issue 3: Results from Wrong City**
**Solution**:
- Verify detected coordinates are correct
- Try manual location entry
- Clear browser cache and reload

### **Issue 4: Sample Events Shown**
**Solution**:
- Check Eventbrite API token (see `EVENTBRITE_TOKEN_SETUP.md`)
- Verify `ENABLE_EVENTBRITE_INTEGRATION=true` in `.env.local`
- Check console for API errors

---

## 📝 **Test Report Template**

```
Date: ___________
Tester: ___________

Location Detection: [ ] Pass [ ] Fail
Nearby Places Filtering: [ ] Pass [ ] Fail
Events Filtering: [ ] Pass [ ] Fail
Brand Finder Filtering: [ ] Pass [ ] Fail
Social Buzz Filtering: [ ] Pass [ ] Fail
Manual Location Entry: [ ] Pass [ ] Fail
Radius Changes: [ ] Pass [ ] Fail
Category Filtering: [ ] Pass [ ] Fail
Console Logs: [ ] Pass [ ] Fail

Overall Result: [ ] All Tests Passed [ ] Some Tests Failed

Notes:
_______________________________________
_______________________________________
_______________________________________
```

---

**Ready to Test?** Open http://localhost:3002/ai-local-discovery and follow the steps above! 🚀

