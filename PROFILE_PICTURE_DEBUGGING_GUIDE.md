# Profile Picture Debugging Guide

## 🔍 Comprehensive Debugging Steps

### Step 1: Check Browser Console Logs

Open your browser's Developer Tools (F12) and go to the **Console** tab.

**Expected Log Sequence:**

1. **On Page Load:**

   ```
   [USER-SERVICE] Fetching user with ID: <user-id>
   [USER-SERVICE] User fetched successfully
   [PROFILE-DISPLAY] Rendering profile image
   [PROFILE-DISPLAY] profileImage: <data-or-url>
   [PROFILE-DISPLAY] profile?.avatar_url: <data-or-url>
   [PROFILE-DISPLAY] profile?.name: <name>
   ```

2. **On File Upload:**

   ```
   [PROFILE] File selected: <filename> Size: <size> Type: <type>
   [PROFILE] File read as data URL, length: <length>
   [PROFILE] Data URL preview: data:image/...
   [PROFILE] profileImage state updated
   [PROFILE-DISPLAY] Rendering profile image
   [PROFILE-DISPLAY] Rendering data URL image
   ```

3. **On Save Click:**
   ```
   [PROFILE] Starting save process for user: <user-id>
   [PROFILE] Current profileImage: data:image/...
   [PROFILE] Form data: {name, phone, theme, language}
   [PROFILE] Initial updateData: {...}
   [PROFILE] Profile image is data URL, adding to updateData
   [PROFILE] Updated avatar_url in updateData
   [PROFILE] Final updateData before API call: {...}
   [PROFILE] Calling updateUser with: <user-id>, {...}
   [USER-SERVICE] updateUser called with userId: <user-id>
   [USER-SERVICE] Updates to apply: {...}
   [USER-SERVICE] Update successful, returned data: {...}
   [PROFILE] Update successful, received: {...}
   [PROFILE] Updated avatar_url from server: <data-or-url>
   [PROFILE] Save completed successfully
   ```

### Step 2: Verify Database Update

1. Go to Supabase Dashboard
2. Navigate to **SQL Editor**
3. Run this query:
   ```sql
   SELECT user_id, name, phone, avatar_url, theme, language
   FROM users
   WHERE user_id = '<your-user-id>';
   ```

**Expected Result:**

- `avatar_url` should contain the data URL or image URL
- Other fields should match what you entered

### Step 3: Check Network Requests

1. Open Developer Tools → **Network** tab
2. Filter by "Fetch/XHR"
3. Look for requests to `/api/` or Supabase endpoints
4. Click on the request and check:
   - **Request Payload**: Should include `avatar_url`
   - **Response**: Should return updated user data with `avatar_url`

### Step 4: Verify Image Display Logic

The image display uses this logic:

```
If profileImage starts with 'data:'
  → Show with <img> tag (data URL)
Else if profileImage is not empty and doesn't start with 'data:'
  → Show with Next.js <Image> component (external URL)
Else
  → Show DefaultAvatar with initials
```

**Debug Check:**

- After upload, `profileImage` should start with `data:image/`
- After save, `profileImage` should still contain the data URL
- On page refresh, `profileImage` should be loaded from `profile.avatar_url`

### Step 5: Test Complete Flow

**Test Case 1: Upload and Save**

1. Navigate to `/settings/profile`
2. Click edit button on profile picture
3. Select "Upload from device"
4. Choose an image file
5. **Check Console**: Should see file upload logs
6. **Check UI**: Image preview should appear immediately
7. Click "Save Changes"
8. **Check Console**: Should see save logs
9. **Check Toast**: Should see success message
10. **Check Database**: `avatar_url` should be updated

**Test Case 2: Refresh and Persist**

1. After saving, refresh the page (F5)
2. **Check Console**: Should see profile fetch logs
3. **Check UI**: Profile picture should display from database
4. **Check Console**: Should see `[PROFILE-DISPLAY] Rendering data URL image` or external URL

**Test Case 3: Camera Capture**

1. Click edit button
2. Select "Take a photo"
3. Allow camera access
4. Click "Capture"
5. **Check Console**: Should see file upload logs
6. **Check UI**: Photo preview should appear
7. Click "Save Changes"
8. **Check Console**: Should see save logs

### Step 6: Common Issues and Solutions

**Issue 1: Avatar not saving**

- Check console for `[USER-SERVICE] Error updating user:` logs
- Verify database has `avatar_url` column
- Check Supabase RLS policies allow UPDATE

**Issue 2: Avatar not displaying after save**

- Check if `profileImage` state is being updated after save
- Verify `setProfileImage(updatedProfile.avatar_url || '')` is called
- Check if data URL is too long (browser limit ~2MB)

**Issue 3: Data URL too long**

- Data URLs can be very large (base64 encoded)
- Consider uploading to Supabase Storage instead
- Store public URL in `avatar_url` field

**Issue 4: Image not persisting on refresh**

- Check if `profile.avatar_url` is being fetched correctly
- Verify `setProfileImage(userProfile.avatar_url || '')` is called
- Check database query returns `avatar_url` field

### Step 7: Enable Detailed Logging

All logging is already enabled. Check these console prefixes:

- `[PROFILE]` - Profile page component
- `[PROFILE-DISPLAY]` - Image display logic
- `[USER-SERVICE]` - User service API calls

### Step 8: Database Schema Verification

Run this query to verify the schema:

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;
```

**Expected columns:**

- `user_id` (UUID)
- `email` (TEXT)
- `name` (TEXT)
- `phone` (TEXT)
- `avatar_url` (TEXT) ← This is critical
- `theme` (TEXT)
- `language` (TEXT)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### Step 9: Test with Different Image Sizes

1. Test with small image (< 100KB)
2. Test with medium image (100KB - 1MB)
3. Test with large image (> 1MB)

**Note:** Data URLs have size limits. For large images, consider uploading to Supabase Storage.

### Step 10: Check RLS Policies

Verify Supabase RLS policies allow UPDATE:

```sql
SELECT * FROM pg_policies
WHERE tablename = 'users'
AND cmd = 'UPDATE';
```

Should see a policy like:

```
Users can update their own profile
```

---

## 📋 Debugging Checklist

- [ ] Console logs show file upload
- [ ] Console logs show save process
- [ ] Console logs show database update
- [ ] Database query shows `avatar_url` updated
- [ ] Image displays after save
- [ ] Image persists after refresh
- [ ] No 500 errors in Network tab
- [ ] Toast notification shows success
- [ ] All form fields save correctly

---

## 🚀 Next Steps

If all debugging steps pass:

1. The profile picture functionality is working correctly
2. Data URLs are being saved to database
3. Images are persisting across page refreshes

If issues remain:

1. Check Supabase logs for errors
2. Verify RLS policies
3. Check database constraints
4. Review network requests for errors
