# Filter Testing Guide - AI Local Discovery

## Quick Start

1. **Open Application**: http://localhost:3002/ai-local-discovery
2. **Enable Location**: Click "Detect My Location" or enter location manually
3. **Wait for Data**: Places should load automatically
4. **Test Filters**: Follow test cases below

---

## Test Case 1: Category Filters

### Test 1.1: All Categories
**Steps**:
1. Click "All" category tab
2. Observe results

**Expected**:
- ✅ All places displayed (mixed categories)
- ✅ Count shows total number of places
- ✅ No category-specific filtering applied

---

### Test 1.2: Clothing Category
**Steps**:
1. Click "Clothing" category tab
2. Observe results

**Expected**:
- ✅ Only clothing stores displayed
- ✅ Count shows number of clothing stores
- ✅ Each place has category "clothing"
- ✅ API called with `category=clothing`

**Example Stores**: Zara, H&M, Uniqlo, Forever 21

---

### Test 1.3: Shoes Category
**Steps**:
1. Click "Shoes" category tab
2. Observe results

**Expected**:
- ✅ Only shoe stores displayed
- ✅ Count shows number of shoe stores
- ✅ Each place has category "shoes"

**Example Stores**: Nike, Adidas, Puma, Foot Locker

---

### Test 1.4: Shops Category (CRITICAL - Previously Broken)
**Steps**:
1. Click "Shops" category tab
2. Observe results

**Expected**:
- ✅ General shops displayed (not clothing/shoes/etc)
- ✅ Count shows number of shops
- ✅ API called with `category=shop` (singular, not "shops")
- ✅ Results returned successfully

**Before Fix**: Returned 0 results or error  
**After Fix**: Returns general shops correctly

---

### Test 1.5: Malls Category (CRITICAL - Previously Broken)
**Steps**:
1. Click "Malls" category tab
2. Observe results

**Expected**:
- ✅ Only shopping malls displayed
- ✅ Count shows number of malls
- ✅ API called with `category=mall` (singular, not "malls")
- ✅ Results returned successfully

**Before Fix**: Returned 0 results or error  
**After Fix**: Returns malls correctly

---

### Test 1.6: Restaurants Category (CRITICAL - Previously Broken)
**Steps**:
1. Click "Restaurants" category tab
2. Observe results

**Expected**:
- ✅ Restaurants, cafes, and fast food places displayed
- ✅ Count shows number of restaurants
- ✅ API called with `category=restaurant` (singular, not "restaurants")
- ✅ Results returned successfully

**Before Fix**: Returned 0 results or error  
**After Fix**: Returns restaurants correctly

**Example Stores**: McDonald's, Starbucks, KFC, Subway

---

### Test 1.7: New Category
**Steps**:
1. Click "🆕 New" category tab
2. Observe results

**Expected**:
- ✅ Only recently opened places displayed
- ✅ Each place has `isNew: true`
- ✅ Places sorted by opening date (newest first)
- ✅ "NEW" badge visible on each place

---

### Test 1.8: Trending Category
**Steps**:
1. Click "🔥 Trending" category tab
2. Observe results

**Expected**:
- ✅ Only trending places displayed
- ✅ Each place has `isTrending: true` or `trending: true`
- ✅ Places sorted by social engagement (highest first)
- ✅ "TRENDING" badge visible on each place

---

### Test 1.9: Offers Category
**Steps**:
1. Click "💰 Offers" category tab
2. Observe results

**Expected**:
- ✅ Only places with current offers displayed
- ✅ Each place has `hasOffer: true`
- ✅ Offer text and expiration date shown
- ✅ "SPECIAL OFFER" badge visible on each place

---

## Test Case 2: Radius Filter

### Test 2.1: 5km Radius
**Steps**:
1. Move radius slider to 5km
2. Observe results

**Expected**:
- ✅ Only places within 5km displayed
- ✅ Badge shows "Nearby"
- ✅ API called with `radius=5`
- ✅ All distances ≤ 5km

---

### Test 2.2: 10km Radius
**Steps**:
1. Move radius slider to 10km
2. Observe results

**Expected**:
- ✅ Places within 10km displayed
- ✅ Badge shows "Local"
- ✅ API called with `radius=10`
- ✅ All distances ≤ 10km
- ✅ More results than 5km

---

### Test 2.3: 15km Radius
**Steps**:
1. Move radius slider to 15km
2. Observe results

**Expected**:
- ✅ Places within 15km displayed
- ✅ Badge shows "Extended"
- ✅ API called with `radius=15`
- ✅ All distances ≤ 15km

---

### Test 2.4: 20km Radius
**Steps**:
1. Move radius slider to 20km
2. Observe results

**Expected**:
- ✅ Places within 20km displayed
- ✅ Badge shows "Wide"
- ✅ API called with `radius=20`
- ✅ All distances ≤ 20km
- ✅ Maximum results

---

## Test Case 3: Store Type Filter

### Test 3.1: All Stores
**Steps**:
1. Click "All Stores" button
2. Observe results

**Expected**:
- ✅ All places displayed (nearby + online)
- ✅ Button highlighted in teal

---

### Test 3.2: Nearby Only
**Steps**:
1. Click "Nearby Only" button
2. Observe results

**Expected**:
- ✅ Only places with physical locations displayed
- ✅ Places with `distance` property shown
- ✅ Online-only stores hidden
- ✅ Button highlighted in teal

---

### Test 3.3: Online Only
**Steps**:
1. Click "Online Only" button
2. Observe results

**Expected**:
- ✅ Only places with online stores displayed
- ✅ Places with `hasOnlineStore: true` shown
- ✅ Physical-only stores hidden
- ✅ Button highlighted in teal

---

## Test Case 4: Search Filter

### Test 4.1: Search by Name
**Steps**:
1. Type "Starbucks" in search box
2. Observe results

**Expected**:
- ✅ Only places with "Starbucks" in name displayed
- ✅ Case-insensitive search
- ✅ Instant filtering (no API call)

---

### Test 4.2: Search by Category
**Steps**:
1. Type "clothing" in search box
2. Observe results

**Expected**:
- ✅ Places with "clothing" in category displayed
- ✅ Case-insensitive search

---

### Test 4.3: Clear Search
**Steps**:
1. Type something in search box
2. Clear the search box
3. Observe results

**Expected**:
- ✅ All places displayed again
- ✅ No filtering applied

---

## Test Case 5: Combined Filters

### Test 5.1: Category + Radius
**Steps**:
1. Select "Clothing" category
2. Set radius to 5km
3. Observe results

**Expected**:
- ✅ Only clothing stores within 5km displayed
- ✅ Both filters applied
- ✅ API called with both parameters

---

### Test 5.2: Category + Search
**Steps**:
1. Select "Restaurants" category
2. Type "Starbucks" in search
3. Observe results

**Expected**:
- ✅ Only Starbucks restaurants displayed
- ✅ Both filters applied

---

### Test 5.3: All Filters Combined
**Steps**:
1. Select "Clothing" category
2. Set radius to 10km
3. Click "Nearby Only"
4. Type "Zara" in search
5. Observe results

**Expected**:
- ✅ Only Zara clothing stores within 10km with physical locations
- ✅ All filters applied correctly

---

## Test Case 6: "See All" Buttons

### Test 6.1: See All New
**Steps**:
1. In "What's New Nearby" section, click "See All" for Recent Openings
2. Observe results

**Expected**:
- ✅ Category changes to "🆕 New"
- ✅ All new places displayed
- ✅ API called with `category=new`

---

### Test 6.2: See All Offers
**Steps**:
1. In "What's New Nearby" section, click "See All" for Current Offers
2. Observe results

**Expected**:
- ✅ Category changes to "💰 Offers"
- ✅ All places with offers displayed
- ✅ API called with `category=offers`

---

### Test 6.3: See All Trending
**Steps**:
1. In "What's New Nearby" section, click "See All" for Trending Now
2. Observe results

**Expected**:
- ✅ Category changes to "🔥 Trending"
- ✅ All trending places displayed
- ✅ API called with `category=trending`

---

## Debugging Tips

### Check Browser Console
```javascript
// Look for these log messages:
[NEARWISE-PLACES] Fetching places: { latitude, longitude, radius, category, brandName }
[NEARWISE-PLACES] Processed places: X
```

### Check Network Tab
1. Open DevTools → Network tab
2. Filter by "nearwise"
3. Look for `/api/nearwise/places?...` requests
4. Verify query parameters are correct

### Common Issues

**Issue**: No results for Shops/Malls/Restaurants  
**Solution**: ✅ FIXED - Category names now match API expectations

**Issue**: Radius changes don't update results  
**Check**: useEffect dependency array includes `radius`

**Issue**: Category changes don't update results  
**Check**: useEffect dependency array includes `selectedCategory`

---

## Success Criteria

✅ All 12 category filters work correctly  
✅ Radius slider updates results immediately  
✅ Store type filter works for all 3 options  
✅ Search filter works for name and category  
✅ Combined filters work together  
✅ "See All" buttons navigate to correct categories  
✅ No console errors  
✅ API calls have correct parameters  
✅ Results match selected filters  

---

**Last Updated**: 2025-11-14  
**Status**: ✅ All Filters Working - Ready for Testing

