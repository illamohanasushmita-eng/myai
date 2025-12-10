# 🧪 Food Delivery Integration - Testing Guide

## 🎯 **Quick Test Procedure**

Follow these steps to verify the food delivery integration is working correctly.

---

## 📍 **Test 1: Automatic Restaurant Detection**

### **Steps**:
1. Open http://localhost:3002/ai-local-discovery
2. Click "Detect My Location" and allow location access
3. Select "Restaurants" category from the filter tabs
4. Observe the restaurant cards

### **Expected Results**:
- ✅ Only restaurants, cafes, and food establishments are shown
- ✅ Each restaurant card has a "🚚 Order Delivery:" section
- ✅ Delivery platform buttons are displayed below restaurant details
- ✅ Non-restaurant places (shops, malls) do NOT show delivery buttons

### **Verification**:
- [ ] Restaurants detected correctly
- [ ] Delivery section visible on restaurant cards
- [ ] No delivery buttons on non-restaurant places

---

## 🌍 **Test 2: Country-Based Platform Availability**

### **Test in India** (Expected: Swiggy + Zomato):

**Steps**:
1. Click "Enter Manually" button
2. Enter coordinates:
   - **Mumbai**: Lat: `19.0760`, Lon: `72.8777`
   - **Delhi**: Lat: `28.6139`, Lon: `77.2090`
   - **Bangalore**: Lat: `12.9716`, Lon: `77.5946`
3. Click "Set Location"
4. Select "Restaurants" category
5. Check delivery platform buttons

**Expected Results**:
- ✅ Swiggy button (🍔 Orange)
- ✅ Zomato button (🍕 Red)
- ✅ No Uber Eats, DoorDash, or other platforms

**Verification**:
- [ ] Swiggy button appears
- [ ] Zomato button appears
- [ ] Only India-specific platforms shown

---

### **Test in USA** (Expected: Uber Eats + DoorDash + Grubhub):

**Steps**:
1. Click "Enter Manually" button
2. Enter coordinates:
   - **New York**: Lat: `40.7128`, Lon: `-74.0060`
   - **San Francisco**: Lat: `37.7749`, Lon: `-122.4194`
   - **Chicago**: Lat: `41.8781`, Lon: `-87.6298`
3. Click "Set Location"
4. Select "Restaurants" category
5. Check delivery platform buttons

**Expected Results**:
- ✅ Uber Eats button (🚗 Green)
- ✅ DoorDash button (🚪 Red)
- ✅ Grubhub button (🍽️ Red)
- ✅ Zomato button (🍕 Red) - also available in USA
- ✅ No Swiggy, Deliveroo, or foodpanda

**Verification**:
- [ ] Uber Eats button appears
- [ ] DoorDash button appears
- [ ] Grubhub button appears
- [ ] Only USA-available platforms shown

---

### **Test in UK** (Expected: Uber Eats + Deliveroo + Just Eat):

**Steps**:
1. Click "Enter Manually" button
2. Enter coordinates:
   - **London**: Lat: `51.5074`, Lon: `-0.1278`
   - **Manchester**: Lat: `53.4808`, Lon: `-2.2426`
   - **Edinburgh**: Lat: `55.9533`, Lon: `-3.1883`
3. Click "Set Location"
4. Select "Restaurants" category
5. Check delivery platform buttons

**Expected Results**:
- ✅ Uber Eats button (🚗 Green)
- ✅ Deliveroo button (🦘 Teal)
- ✅ Just Eat button (🍴 Orange)
- ✅ Zomato button (🍕 Red) - also available in UK
- ✅ No Swiggy, DoorDash, or Grubhub

**Verification**:
- [ ] Uber Eats button appears
- [ ] Deliveroo button appears
- [ ] Just Eat button appears
- [ ] Only UK-available platforms shown

---

### **Test in Australia** (Expected: Uber Eats + DoorDash + Deliveroo):

**Steps**:
1. Click "Enter Manually" button
2. Enter coordinates:
   - **Sydney**: Lat: `-33.8688`, Lon: `151.2093`
   - **Melbourne**: Lat: `-37.8136`, Lon: `144.9631`
3. Click "Set Location"
4. Select "Restaurants" category
5. Check delivery platform buttons

**Expected Results**:
- ✅ Uber Eats button (🚗 Green)
- ✅ DoorDash button (🚪 Red)
- ✅ Deliveroo button (🦘 Teal)
- ✅ Zomato button (🍕 Red)

**Verification**:
- [ ] Uber Eats button appears
- [ ] DoorDash button appears
- [ ] Deliveroo button appears

---

## 🔗 **Test 3: Deep Link Functionality**

### **Steps**:
1. Find a restaurant card with delivery buttons
2. Click on a delivery platform button (e.g., "Order on Swiggy")
3. Observe the behavior

### **Expected Results**:
- ✅ New browser tab opens
- ✅ Delivery platform website loads
- ✅ Search results show the restaurant or similar restaurants
- ✅ Location is pre-filled with user's coordinates
- ✅ Original AI Local Discovery page remains open

### **Verification**:
- [ ] New tab opens (not replacing current page)
- [ ] Delivery platform loads correctly
- [ ] Restaurant name appears in search
- [ ] Location is accurate

### **URL Format Verification**:

**Swiggy** (India):
```
https://www.swiggy.com/search?lat=19.0760&lng=72.8777&query=Restaurant+Name
```

**Zomato** (Global):
```
https://www.zomato.com/search?q=Restaurant+Name&lat=19.0760&lon=72.8777
```

**Uber Eats** (Global):
```
https://www.ubereats.com/search?q=Restaurant+Name&pl=40.7128%2C-74.0060
```

**DoorDash** (USA):
```
https://www.doordash.com/search/?query=Restaurant+Name&lat=40.7128&lng=-74.0060
```

---

## 🎨 **Test 4: UI/UX Verification**

### **Button Styling**:
- [ ] Buttons have platform-specific colors
- [ ] Buttons have emoji logos
- [ ] Buttons have hover effect (scale animation)
- [ ] Buttons have "open in new" icon
- [ ] Buttons wrap gracefully on small screens

### **Layout**:
- [ ] Delivery section appears after restaurant details
- [ ] Delivery section appears before action buttons (Visit Store, etc.)
- [ ] Section has clear heading: "🚚 Order Delivery:"
- [ ] Helper text appears: "💡 Click to open the restaurant..."

### **Non-Restaurant Places**:
- [ ] Shops show NO delivery buttons
- [ ] Malls show NO delivery buttons
- [ ] Only restaurants show delivery buttons

---

## 🔍 **Test 5: Console Log Verification**

### **Steps**:
1. Open browser console (Press F12)
2. Go to Console tab
3. Detect location or change location
4. Look for log messages

### **Expected Console Logs**:

**Country Detection**:
```
[NEARWISE-PLACES] Detected country: IN
[NEARWISE-PLACES] Available delivery platforms: Swiggy, Zomato
```

**Button Click**:
```
[FOOD-DELIVERY] Opening Swiggy for "Pizza Hut": https://www.swiggy.com/search?lat=19.0760&lng=72.8777&query=Pizza+Hut
```

### **Verification**:
- [ ] Country code is correct (IN, US, GB, etc.)
- [ ] Platform list matches expected platforms
- [ ] URL is correctly formatted
- [ ] No error messages appear

---

## 🧩 **Test 6: Edge Cases**

### **Test: No Restaurants Found**:
1. Set location to remote area (e.g., ocean coordinates)
2. Select "Restaurants" category
3. Verify "No Places Found" message appears

### **Test: Mixed Categories**:
1. Select "All" category
2. Verify restaurants show delivery buttons
3. Verify non-restaurants do NOT show delivery buttons

### **Test: Restaurant Without Delivery**:
- If a restaurant has no available platforms (unlikely), verify:
  - [ ] "🏪 Dine-in only • No delivery available" message appears

---

## 📊 **Test 7: Performance**

### **Metrics to Check**:
- [ ] Page loads within 3 seconds
- [ ] Delivery buttons render immediately with restaurant cards
- [ ] No lag when clicking delivery buttons
- [ ] Country detection doesn't slow down API response

### **Network Tab Verification**:
1. Open DevTools → Network tab
2. Refresh page and detect location
3. Check API response for `/api/nearwise/places`
4. Verify response includes `deliveryPlatforms` array for restaurants

**Expected Response Structure**:
```json
{
  "id": "osm-node-123456",
  "name": "Pizza Hut",
  "category": "restaurant",
  "isRestaurant": true,
  "deliveryPlatforms": [
    {
      "id": "swiggy",
      "name": "Swiggy",
      "logo": "🍔",
      "color": "#FC8019",
      "countries": ["IN"],
      "generateUrl": "[Function]",
      "isAvailable": "[Function]"
    },
    {
      "id": "zomato",
      "name": "Zomato",
      "logo": "🍕",
      "color": "#E23744",
      ...
    }
  ]
}
```

---

## ✅ **Success Criteria**

### **All Tests Pass If**:

1. ✅ Restaurants automatically detected from OSM data
2. ✅ Country detected correctly from GPS coordinates
3. ✅ Delivery platforms filtered by country availability
4. ✅ Correct platforms shown for each country:
   - India: Swiggy, Zomato
   - USA: Uber Eats, DoorDash, Grubhub, Zomato
   - UK: Uber Eats, Deliveroo, Just Eat, Zomato
   - Australia: Uber Eats, DoorDash, Deliveroo, Zomato
5. ✅ Deep links open in new tab with correct URL format
6. ✅ Restaurant name and coordinates passed to delivery platforms
7. ✅ Non-restaurant places do NOT show delivery buttons
8. ✅ UI is responsive and buttons have hover effects
9. ✅ Console logs show correct country and platform detection
10. ✅ No TypeScript or runtime errors

---

## 🚨 **Common Issues & Solutions**

### **Issue 1: No Delivery Buttons Appear**
**Solution**: 
- Check if place is actually a restaurant (amenity=restaurant/cafe/fast_food)
- Verify country detection is working (check console logs)
- Ensure deliveryPlatforms array is not empty in API response

### **Issue 2: Wrong Platforms Shown**
**Solution**:
- Verify country code is correct (check console logs)
- Check platform availability in `food-delivery-platforms.ts`
- Ensure coordinates are accurate

### **Issue 3: Deep Links Don't Work**
**Solution**:
- Check URL format in browser address bar
- Verify restaurant name is URL-encoded correctly
- Test URL manually in browser

### **Issue 4: "Dine-in only" for All Restaurants**
**Solution**:
- Check if `availableDeliveryPlatforms` is empty
- Verify country detection returned valid country code
- Check if country is supported by any platform

---

## 📝 **Test Report Template**

```
Date: ___________
Tester: ___________

Restaurant Detection: [ ] Pass [ ] Fail
Country Detection (India): [ ] Pass [ ] Fail
Country Detection (USA): [ ] Pass [ ] Fail
Country Detection (UK): [ ] Pass [ ] Fail
Platform Filtering: [ ] Pass [ ] Fail
Deep Link Functionality: [ ] Pass [ ] Fail
UI/UX Verification: [ ] Pass [ ] Fail
Console Logs: [ ] Pass [ ] Fail
Edge Cases: [ ] Pass [ ] Fail
Performance: [ ] Pass [ ] Fail

Overall Result: [ ] All Tests Passed [ ] Some Tests Failed

Notes:
_______________________________________
_______________________________________
_______________________________________
```

---

**Ready to Test?** Open http://localhost:3002/ai-local-discovery and follow the steps above! 🚀

