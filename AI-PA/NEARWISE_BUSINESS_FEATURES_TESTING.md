# NearWise Business Features - Quick Testing Checklist

## 🚀 Quick Start

```bash
cd AI-PA
npm run dev
```

Navigate to: `http://localhost:3002/ai-local-discovery`

---

## ✅ Testing Checklist

### **1. New Opening Detection** 🎉

- [ ] Posts with "grand opening", "now open" keywords show green "🎉 NEW OPENING" badge
- [ ] New opening posts appear at top of feed (when "All Posts" filter active)
- [ ] Click "🎉 New Openings" filter tab
- [ ] Verify only new opening posts are displayed
- [ ] Badge styling is green with white text
- [ ] Badge displays correctly on mobile

**Expected Count:** ~10 new opening posts (20% of 50 total mock posts)

---

### **2. Promotional Offers** 💰

- [ ] Posts with "sale", "discount", "offer" keywords show orange "💰 SPECIAL OFFER" badge
- [ ] Orange expiration banner displays below post content
- [ ] Expiration countdown shows (e.g., "Expires in 5 days")
- [ ] Click "💰 Deals & Offers" filter tab
- [ ] Verify only promotional posts are displayed
- [ ] Promotional posts appear after new openings in feed (when "All Posts" active)
- [ ] Badge styling is orange with white text

**Expected Count:** ~15 promotional posts (30% of 50 total mock posts)

---

### **3. Ratings & Reviews** ⭐

- [ ] Star rating displays correctly (★★★★☆)
- [ ] Numeric rating shows (e.g., "4.5")
- [ ] Review count displays (e.g., "(127)")
- [ ] Click "Show Reviews" button
- [ ] Reviews section expands smoothly
- [ ] Individual reviews show:
  - [ ] Author name
  - [ ] Star rating
  - [ ] Review text
  - [ ] Relative timestamp
- [ ] Click "Hide Reviews" button
- [ ] Reviews section collapses
- [ ] Click "⭐ Top Rated" filter tab
- [ ] Verify only 4.0+ rated businesses are shown
- [ ] Select "⭐ Top Rated" sort option
- [ ] Verify posts are sorted by highest rating first

**Expected Count:** ~40 posts with ratings (80% of Facebook posts)

---

### **4. Check-in Data** 📍

- [ ] Check-in count displays in post header
- [ ] Format: "1,234 check-ins"
- [ ] Icon: 📍 (person_pin_circle)
- [ ] Only shown for Facebook posts
- [ ] Number formatting includes commas for thousands

**Expected Count:** All Facebook posts should have check-in data

---

### **5. Content Type Filters** 🔍

**Test Each Filter:**

- [ ] **All Posts** - Shows all content with smart prioritization
  - [ ] New openings at top
  - [ ] Promotions after new openings
  - [ ] Regular posts last
  
- [ ] **🎉 New Openings** - Only new opening posts
  - [ ] Post count decreases
  - [ ] All posts have green badge
  
- [ ] **💰 Deals & Offers** - Only promotional posts
  - [ ] Post count decreases
  - [ ] All posts have orange badge
  - [ ] All posts have expiration banner
  
- [ ] **⭐ Top Rated** - Only 4.0+ rated businesses
  - [ ] Post count decreases
  - [ ] All posts have rating ≥ 4.0
  - [ ] Star ratings visible

---

### **6. Sort Options** 📊

**Test Each Sort:**

- [ ] **Recent** - Newest posts first
  - [ ] Timestamps decrease from top to bottom
  - [ ] Most recent post at top
  
- [ ] **Most Engaged** - Highest engagement first
  - [ ] Total engagement (likes + comments + shares) decreases
  - [ ] Highest engagement post at top
  
- [ ] **Nearest** - Closest businesses first
  - [ ] Distance increases from top to bottom
  - [ ] Closest business at top
  
- [ ] **⭐ Top Rated** - Highest ratings first
  - [ ] Ratings decrease from top to bottom
  - [ ] 5.0 rated businesses at top

---

### **7. Visual Design** 🎨

**Badges:**
- [ ] Platform badges display correctly (📘 Facebook, 📷 Instagram, 𝕏 Twitter)
- [ ] NEW OPENING badge is green (#22c55e)
- [ ] SPECIAL OFFER badge is orange (#ea580c)
- [ ] Badges wrap properly on mobile

**Star Ratings:**
- [ ] Full stars are yellow (#eab308)
- [ ] Empty stars are gray
- [ ] Half stars display correctly (if applicable)
- [ ] Stars align properly

**Expiration Banner:**
- [ ] Orange background (#fed7aa dark mode: #ea580c/20)
- [ ] Orange border
- [ ] Clock icon displays
- [ ] Text is readable in both light and dark mode

**Reviews Section:**
- [ ] Expandable/collapsible animation smooth
- [ ] Left border (teal) displays correctly
- [ ] Review cards have proper spacing
- [ ] Text is readable

---

### **8. Responsive Design** 📱

**Desktop (1920x1080):**
- [ ] All filters display in single row
- [ ] Post cards have proper width
- [ ] Images display correctly
- [ ] No horizontal scrolling

**Tablet (768x1024):**
- [ ] Filters wrap to multiple rows
- [ ] Post cards stack properly
- [ ] Touch targets are adequate
- [ ] No layout issues

**Mobile (375x667):**
- [ ] All content readable
- [ ] Buttons accessible
- [ ] Badges wrap properly
- [ ] Reviews expand/collapse smoothly
- [ ] No horizontal scrolling

---

### **9. Dark Mode** 🌙

- [ ] Toggle dark mode
- [ ] Badges maintain contrast
- [ ] Star ratings visible
- [ ] Expiration banner readable
- [ ] Reviews section styled correctly
- [ ] Text remains readable
- [ ] Borders visible

---

### **10. Performance** ⚡

- [ ] Initial load < 3 seconds
- [ ] Filter changes instant
- [ ] Sort changes instant
- [ ] Review expansion smooth
- [ ] No lag when scrolling
- [ ] Images load progressively

---

### **11. Error Handling** 🛡️

- [ ] No console errors
- [ ] Missing images handled gracefully
- [ ] Empty states display correctly
- [ ] Loading states show properly

---

### **12. API Integration** 🔌

**With Mock Data:**
- [ ] Toast shows "Using Sample Social Data"
- [ ] All features work with mock data
- [ ] Realistic data displays

**With Real Facebook API:**
- [ ] Real business names display
- [ ] Actual ratings and reviews show
- [ ] Real check-in counts display
- [ ] Keyword detection works on real posts
- [ ] No "Using Sample Data" toast

---

## 🎯 Success Criteria

**All tests should pass with:**
- ✅ No console errors
- ✅ Smooth animations
- ✅ Proper styling in light and dark mode
- ✅ Responsive on all screen sizes
- ✅ All badges display correctly
- ✅ Ratings and reviews work
- ✅ Filters and sorting function properly
- ✅ Expiration countdowns accurate

---

## 📊 Expected Results Summary

**Mock Data Statistics:**
- Total Posts: 50
- New Openings: ~10 (20%)
- Promotions: ~15 (30%)
- Regular Posts: ~25 (50%)
- Posts with Ratings: ~40 (80% of Facebook posts)
- Average Rating: 3.0-5.0
- Reviews per Post: 2-3
- Check-ins per Business: 50-1,000

---

## 🐛 Common Issues & Solutions

**Issue: Badges not showing**
- Solution: Check that mock data includes `isNewOpening` and `isPromotion` flags

**Issue: Reviews not expanding**
- Solution: Check that `expandedReviews` state is working, verify `toggleReviews` function

**Issue: Star ratings not displaying**
- Solution: Check that `renderStars` function is defined, verify rating values are 1-5

**Issue: Filters not working**
- Solution: Check `getSortedSocialPosts` function, verify filter state updates

**Issue: Expiration not showing**
- Solution: Check that promotional posts have `offerExpiration` field

---

## ✅ Final Verification

After completing all tests:

- [ ] All 12 test sections passed
- [ ] No critical bugs found
- [ ] UI looks polished
- [ ] Features work as expected
- [ ] Ready for production

---

**Testing Complete! 🎉**

If all tests pass, the NearWise Business Features are ready for deployment!

