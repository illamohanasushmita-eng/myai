# Profile Picture Testing & Troubleshooting Guide

## ✅ Build Status

✅ **Build Successful** - No compilation errors
✅ **No TypeScript Errors** - All types correct
✅ **Ready for Testing**

---

## 🧪 Complete Testing Procedure

### Test 1: Initial Page Load

**Steps:**

1. Start dev server: `npm run dev`
2. Navigate to `http://localhost:3002/settings/profile`
3. Open browser DevTools (F12) → Console tab

**Expected Console Output:**

```
[USER-SERVICE] Fetching user with ID: <user-id>
[USER-SERVICE] User fetched successfully
[PROFILE] avatar_url from database: <url-or-empty>
[PROFILE] Set profileImage and originalProfileImage to: <url-or-empty>
[PROFILE-DISPLAY] Rendering profile image
[PROFILE-DISPLAY] profileImage: <url-or-empty>
[PROFILE-DISPLAY] profile?.avatar_url: <url-or-empty>
[PROFILE-DISPLAY] profile?.name: <name>
```

**Expected UI:**

- Profile picture displays (either avatar with initials or uploaded image)
- Form fields populated with user data
- "Save Changes" button visible

---

### Test 2: Upload Profile Picture from Device

**Steps:**

1. Click edit button on profile picture
2. Select "Upload from device"
3. Choose an image file (JPG, PNG, etc.)
4. **Don't click Save yet** - just observe

**Expected Console Output:**

```
[PROFILE] File selected: <filename> Size: <size> Type: <type>
[PROFILE] File read as data URL, length: <length>
[PROFILE] Data URL preview: data:image/...
[PROFILE] profileImage state updated
[PROFILE-DISPLAY] Rendering profile image
[PROFILE-DISPLAY] Rendering data URL image
```

**Expected UI:**

- Image preview appears immediately in the profile picture area
- Image is displayed with rounded corners
- No errors in console

---

### Test 3: Save Profile Picture

**Steps:**

1. After uploading image (from Test 2)
2. Click "Save Changes" button
3. Wait for success toast

**Expected Console Output:**

```
[PROFILE] Starting save process for user: <user-id>
[PROFILE] Current profileImage: data:image/...
[PROFILE] Original profileImage: <empty-or-previous>
[PROFILE] Image changed: true
[PROFILE] Form data: {name, phone, theme, language}
[PROFILE] Initial updateData: {...}
[PROFILE] Profile image is data URL, adding to updateData
[PROFILE] Updated avatar_url in updateData with data URL
[PROFILE] Final updateData before API call: {...}
[PROFILE] Calling updateUser with: <user-id>, {...}
[USER-SERVICE] updateUser called with userId: <user-id>
[USER-SERVICE] Updates to apply: {...}
[USER-SERVICE] Update successful, returned data: {...}
[PROFILE] Update successful, received: {...}
[PROFILE] Updated avatar_url from server: data:image/...
[PROFILE] Save completed successfully
```

**Expected UI:**

- "Saving..." text appears on button during save
- Success toast appears: "Profile updated successfully"
- Image still displays after save
- No errors in console

---

### Test 4: Verify Database Update

**Steps:**

1. Open Supabase Dashboard
2. Go to SQL Editor
3. Run query:
   ```sql
   SELECT user_id, name, avatar_url
   FROM users
   WHERE user_id = '<your-user-id>'
   LIMIT 1;
   ```

**Expected Result:**

- `avatar_url` column contains the data URL (starts with `data:image/`)
- Data URL is very long (base64 encoded image)
- Other fields match what you entered

---

### Test 5: Refresh Page and Verify Persistence

**Steps:**

1. After saving (from Test 3)
2. Refresh the page (F5)
3. Wait for page to load
4. Check console and UI

**Expected Console Output:**

```
[USER-SERVICE] Fetching user with ID: <user-id>
[USER-SERVICE] User fetched successfully
[PROFILE] avatar_url from database: data:image/...
[PROFILE] Set profileImage and originalProfileImage to: data:image/...
[PROFILE-DISPLAY] Rendering profile image
[PROFILE-DISPLAY] Rendering data URL image
```

**Expected UI:**

- Profile picture displays the same image you uploaded
- No default avatar shown
- Image persists across page refresh

---

### Test 6: Update Other Form Fields

**Steps:**

1. Change name field to a different name
2. Change phone field to a phone number
3. Change theme or language
4. Click "Save Changes"

**Expected Console Output:**

```
[PROFILE] Starting save process for user: <user-id>
[PROFILE] Image changed: false
[PROFILE] Form data: {name: <new-name>, phone: <new-phone>, ...}
[PROFILE] Initial updateData: {...}
[PROFILE] Image not changed, not updating avatar_url
[PROFILE] Final updateData before API call: {...}
[PROFILE] Calling updateUser with: <user-id>, {...}
[USER-SERVICE] updateUser called with userId: <user-id>
[USER-SERVICE] Updates to apply: {...}
[USER-SERVICE] Update successful, returned data: {...}
[PROFILE] Update successful, received: {...}
[PROFILE] Save completed successfully
```

**Expected UI:**

- Success toast appears
- Form fields updated
- Profile picture unchanged

---

### Test 7: Camera Capture

**Steps:**

1. Click edit button on profile picture
2. Select "Take a photo"
3. Allow camera access when prompted
4. Click "Capture" button
5. Click "Save Changes"

**Expected Console Output:**

```
[PROFILE] File selected: <filename> Size: <size> Type: <type>
[PROFILE] File read as data URL, length: <length>
[PROFILE] Data URL preview: data:image/...
[PROFILE] profileImage state updated
[PROFILE-DISPLAY] Rendering data URL image
[PROFILE] Starting save process for user: <user-id>
[PROFILE] Image changed: true
[PROFILE] Profile image is data URL, adding to updateData
[PROFILE] Updated avatar_url in updateData with data URL
[PROFILE] Update successful, received: {...}
[PROFILE] Save completed successfully
```

**Expected UI:**

- Camera preview appears
- Photo captured and displayed
- Success toast after save

---

### Test 8: Error Handling

**Steps:**

1. Simulate network error (DevTools → Network → Offline)
2. Try to save changes
3. Check console and UI

**Expected Console Output:**

```
[PROFILE] Error saving profile: <error-message>
[PROFILE] Full error: {...}
```

**Expected UI:**

- Error toast appears: "Error: <error-message>"
- Error message displayed in red
- Button returns to normal state

---

## 🔍 Debugging Checklist

### Console Logs

- [ ] File upload logs appear
- [ ] Save process logs appear
- [ ] Database update logs appear
- [ ] No error logs in console

### UI Behavior

- [ ] Image preview appears immediately after upload
- [ ] Success toast appears after save
- [ ] Image persists after page refresh
- [ ] Form fields save correctly

### Database

- [ ] `avatar_url` field updated in database
- [ ] Data URL stored correctly
- [ ] Other fields updated correctly

### Network

- [ ] No 500 errors in Network tab
- [ ] Supabase requests successful (200 status)
- [ ] Response includes updated user data

---

## 🐛 Common Issues & Solutions

### Issue 1: Image not saving

**Symptoms:** Console shows save logs but database not updated
**Solution:**

1. Check Supabase RLS policies
2. Verify user has UPDATE permission
3. Check database connection

### Issue 2: Image not displaying after save

**Symptoms:** Save successful but image shows default avatar
**Solution:**

1. Check if `profileImage` state updated after save
2. Verify `setProfileImage(updatedProfile.avatar_url)` called
3. Check if data URL is valid

### Issue 3: Data URL too long

**Symptoms:** Save fails with "payload too large" error
**Solution:**

1. Use smaller image files
2. Consider uploading to Supabase Storage instead
3. Store public URL in `avatar_url` field

### Issue 4: Image not persisting on refresh

**Symptoms:** Image displays after save but disappears on refresh
**Solution:**

1. Check if `avatar_url` fetched from database
2. Verify `setProfileImage(userProfile.avatar_url)` called
3. Check database query returns `avatar_url` field

---

## 📊 Expected Data Flow

```
1. Page Load
   ├─ Fetch user from database
   ├─ Set profileImage from avatar_url
   └─ Display image or default avatar

2. File Upload
   ├─ Read file as data URL
   ├─ Update profileImage state
   └─ Display preview immediately

3. Save Changes
   ├─ Prepare updateData with avatar_url
   ├─ Call updateUser API
   ├─ Receive updated profile
   ├─ Update profileImage state
   └─ Show success toast

4. Page Refresh
   ├─ Fetch user from database
   ├─ Set profileImage from avatar_url
   └─ Display saved image
```

---

## ✅ Success Criteria

All tests pass when:

- ✅ Image uploads and displays immediately
- ✅ Image saves to database
- ✅ Image persists after page refresh
- ✅ Other form fields save correctly
- ✅ No console errors
- ✅ Success toast appears
- ✅ Database shows updated avatar_url

---

## 🚀 Next Steps

1. Run all tests in order
2. Check console logs for each test
3. Verify database updates
4. If all tests pass, feature is working correctly
5. If tests fail, check debugging guide for solutions
