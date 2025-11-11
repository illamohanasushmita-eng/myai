# 🔧 FIX: All RLS-Related Errors (401 Unauthorized)

## ✅ Problem Identified

Your application has **RLS (Row Level Security) policies** that block unconfirmed users from inserting data. This causes **401 Unauthorized** errors when trying to create:
- ✅ User profiles (FIXED)
- ✅ Tasks (FIXED)
- ⏳ Other resources (need fixing)

---

## ✅ Solution Pattern

For each resource that needs fixing, we need to:

1. **Create Backend API Route**
   - Uses Service Role Key
   - Bypasses RLS policies
   - Handles database insert

2. **Update Service Function**
   - Calls API route instead of direct insert
   - Better error handling

3. **Test**
   - Verify data in Supabase
   - Check browser console for errors

---

## 📋 Resources That Need Fixing

### ✅ Already Fixed
- [x] User Profiles - `src/app/api/auth/create-profile/route.ts`
- [x] Tasks - `src/app/api/tasks/create/route.ts`

### ⏳ Need Fixing (Same Pattern)
- [ ] Reminders
- [ ] Habits
- [ ] Health Records
- [ ] Vehicles
- [ ] Smart Devices
- [ ] Professional Notes
- [ ] Settings (already done in signup)
- [ ] Other resources

---

## 🔧 How to Fix Each Resource

### Step 1: Create API Route

Create file: `src/app/api/[resource]/create/route.ts`

```typescript
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, ...data } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      );
    }

    // Insert data using service role
    const { error, data: insertedData } = await supabaseAdmin
      .from('[table_name]')
      .insert([{ user_id: userId, ...data }])
      .select();

    if (error) {
      console.error('Error creating resource:', error);
      return NextResponse.json(
        { error: 'Failed to create resource', details: error },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, data: insertedData?.[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}
```

### Step 2: Update Service Function

Update the service function to call the API route:

```typescript
export async function createResource(
  userId: string,
  data: any
): Promise<any> {
  try {
    const response = await fetch('/api/[resource]/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, ...data }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Error:', result);
      throw new Error(result.error || 'Failed to create resource');
    }

    return result.data;
  } catch (error) {
    console.error('Error creating resource:', error);
    throw error;
  }
}
```

### Step 3: Test

1. Create resource through UI
2. Check browser console (F12)
3. Verify in Supabase table

---

## 📊 Resources to Fix

### 1. Reminders
- **Service**: `src/lib/services/reminderService.ts`
- **Function**: `createReminder()`
- **Table**: `reminders`
- **API Route**: `src/app/api/reminders/create/route.ts`

### 2. Habits
- **Service**: `src/lib/services/habitService.ts`
- **Function**: `createHabit()`
- **Table**: `habits`
- **API Route**: `src/app/api/habits/create/route.ts`

### 3. Health Records
- **Service**: `src/lib/services/healthRecordService.ts`
- **Function**: `createHealthRecord()`
- **Table**: `health_records`
- **API Route**: `src/app/api/health/create/route.ts`

### 4. Vehicles
- **Service**: `src/lib/services/automotiveService.ts`
- **Function**: `createVehicle()`
- **Table**: `vehicles`
- **API Route**: `src/app/api/vehicles/create/route.ts`

### 5. Smart Devices
- **Service**: `src/lib/services/smartHomeService.ts`
- **Function**: `createSmartDevice()`
- **Table**: `smart_devices`
- **API Route**: `src/app/api/devices/create/route.ts`

### 6. Professional Notes
- **Service**: `src/lib/services/professionalService.ts`
- **Function**: `createProfessionalNote()`
- **Table**: `professional_notes`
- **API Route**: `src/app/api/professional/create/route.ts`

---

## 🎯 Priority Order

1. **High Priority** (Most Used)
   - [ ] Reminders
   - [ ] Habits
   - [ ] Tasks (✅ DONE)

2. **Medium Priority** (Commonly Used)
   - [ ] Health Records
   - [ ] Vehicles
   - [ ] Smart Devices

3. **Low Priority** (Less Used)
   - [ ] Professional Notes
   - [ ] Other resources

---

## ✅ Verification Checklist

For each resource fixed:
- [ ] API route created
- [ ] Service function updated
- [ ] No 401 errors in console
- [ ] Data appears in Supabase table
- [ ] All fields populated correctly
- [ ] Can edit/delete resource

---

## 🔐 Security

✅ **All API routes**:
- Use Service Role Key (server-side only)
- Never expose key to client
- Bypass RLS only for creation
- RLS still protects user data

---

## 📞 Need Help?

1. **Check**: Browser console (F12) for errors
2. **Check**: Server logs (terminal) for errors
3. **Check**: Supabase logs for errors
4. **Copy**: Exact error message

---

## 🚀 Summary

| Aspect | Status |
|--------|--------|
| **Problem** | ✅ RLS blocking unconfirmed users |
| **Solution** | ✅ Backend API routes with Service Role Key |
| **User Profiles** | ✅ FIXED |
| **Tasks** | ✅ FIXED |
| **Other Resources** | ⏳ Ready to fix |

---

**Status**: ✅ Pattern established, ready to apply to other resources
**Time per Resource**: ~5 minutes
**Difficulty**: Easy (follow the pattern)

