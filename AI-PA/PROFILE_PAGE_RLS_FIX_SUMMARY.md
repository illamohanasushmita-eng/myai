# Profile Page RLS Fix - Complete Solution

## Issues Fixed

### 1. **Missing `password_hash` Field During Signup**

**Error**: 406 (Not Acceptable) - User profile not found after signup
**Root Cause**: The `users` table requires `password_hash` field, but signup was not providing it
**Fix**: Added `password_hash: 'managed_by_supabase_auth'` to signup insert

### 2. **Profile Page Fallback Creation Failing**

**Error**: 403 (Forbidden) - RLS policy violation when creating default profile
**Root Cause**: Profile page was trying to create user without `user_id` and `password_hash`
**Fix**: Updated profile page to pass `user_id` and `password_hash` when creating fallback profile

### 3. **createUser Function Type Signature**

**Error**: Type mismatch when passing `user_id` to createUser
**Root Cause**: Function only accepted `Omit<User, 'user_id' | 'created_at'>`
**Fix**: Updated to accept both with and without `user_id`: `Omit<User, 'created_at'> | Omit<User, 'user_id' | 'created_at'>`

## Files Modified

### 1. `src/lib/services/authService.ts` (Line 74)

```typescript
// Added password_hash field
const { error: insertError } = await supabase.from("users").insert({
  user_id: data.user.id,
  email,
  name,
  phone: phone || null,
  password_hash: "managed_by_supabase_auth", // ← ADDED
  theme: "light",
  language: "en",
});
```

### 2. `src/app/settings/profile/page.tsx` (Line 112)

```typescript
// Added user_id when creating fallback profile
const newProfile = await createUser({
  user_id: user.id, // ← ADDED
  email: user.email || "",
  name: user.user_metadata?.name || "User",
  phone: "",
  avatar_url: "",
  theme: "light",
  language: "en",
  password_hash: "managed_by_supabase_auth",
});
```

### 3. `src/lib/services/userService.ts` (Line 61)

```typescript
// Updated type signature to accept user_id
export async function createUser(
  userData: Omit<User, "created_at"> | Omit<User, "user_id" | "created_at">,
): Promise<User>;
```

## How It Works Now

1. **Signup Flow**:
   - User signs up → Auth user created → User record inserted with `password_hash`
   - RLS policy allows insert because `auth.uid() = user_id`

2. **Profile Page Access**:
   - User visits profile page → Fetch user record
   - If not found → Create fallback profile with `user_id` and `password_hash`
   - RLS policy allows insert because `auth.uid() = user_id`

## RLS Policies (Already Correct)

The RLS policies in `supabase_rls_policies.sql` are already correct:

```sql
CREATE POLICY "Users can insert their own profile"
ON users FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

This allows authenticated users to insert records where `user_id` matches their auth ID.

## Testing

To verify the fix works:

1. Sign up with a new email
2. Verify user record is created in `users` table
3. Navigate to profile page
4. Verify profile loads without errors
5. Check that `password_hash` is set to 'managed_by_supabase_auth'

## Notes

- `password_hash` is set to 'managed_by_supabase_auth' because passwords are managed by Supabase Auth, not stored in the custom `users` table
- The RLS policies ensure users can only access their own data
- Service role can bypass RLS for backend operations (API routes)
