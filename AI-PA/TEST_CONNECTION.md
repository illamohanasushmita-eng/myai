# 🧪 Test Supabase Connection

## Quick Connection Test

To verify your Supabase connection is working, follow these steps:

### Step 1: Create a Test User

Open your browser console and run:

```typescript
import { signUp } from '@/lib/services';

const user = await signUp(
  'test@example.com',
  'password123',
  'Test User',
  '1234567890'
);

console.log('User created:', user);
```

### Step 2: Create a Test Task

```typescript
import { createTask } from '@/lib/services';

const task = await createTask(user.user_id, {
  title: 'Test Task',
  description: 'This is a test task',
  due_date: new Date().toISOString(),
  category: 'test',
  status: 'pending',
  priority: 'high',
  ai_generated: false
});

console.log('Task created:', task);
```

### Step 3: Fetch Tasks

```typescript
import { getUserTasks } from '@/lib/services';

const tasks = await getUserTasks(user.user_id);

console.log('Tasks:', tasks);
```

### Step 4: Verify in Supabase

1. Go to Supabase Dashboard
2. Click Table Editor
3. Select `users` table
4. Verify your test user is there
5. Select `tasks` table
6. Verify your test task is there

---

## Testing Each Feature

### Test Reminders
```typescript
import { createReminder, getUserReminders } from '@/lib/services';

const reminder = await createReminder(userId, {
  title: 'Test Reminder',
  description: 'Test reminder description',
  reminder_time: new Date().toISOString(),
  reminder_type: 'notification',
  status: 'active',
  is_recurring: false
});

const reminders = await getUserReminders(userId);
console.log('Reminders:', reminders);
```

### Test Health Records
```typescript
import { createHealthRecord, getUserHealthRecords } from '@/lib/services';

const record = await createHealthRecord(userId, {
  record_date: new Date().toISOString().split('T')[0],
  steps: 8000,
  sleep_hours: 7.5,
  water_intake: 2.5,
  weight: 70,
  blood_pressure: '120/80',
  heart_rate: 72
});

const records = await getUserHealthRecords(userId);
console.log('Health Records:', records);
```

### Test Habits
```typescript
import { createHabit, getUserHabits, logHabitCompletion } from '@/lib/services';

const habit = await createHabit(userId, {
  habit_name: 'Morning Exercise',
  description: 'Exercise for 30 minutes',
  frequency: 'daily',
  category: 'health',
  is_active: true
});

const log = await logHabitCompletion(
  habit.habit_id,
  userId,
  new Date().toISOString().split('T')[0],
  true,
  'Completed 30 min run'
);

const habits = await getUserHabits(userId);
console.log('Habits:', habits);
```

### Test Vehicles
```typescript
import { createVehicle, getUserVehicles } from '@/lib/services';

const vehicle = await createVehicle(userId, {
  make: 'Toyota',
  model: 'Camry',
  year: 2023,
  license_plate: 'ABC123',
  vin: 'VIN123456',
  color: 'Blue',
  is_primary: true
});

const vehicles = await getUserVehicles(userId);
console.log('Vehicles:', vehicles);
```

### Test Smart Devices
```typescript
import { createSmartDevice, getUserSmartDevices } from '@/lib/services';

const device = await createSmartDevice(userId, {
  device_name: 'Living Room Light',
  device_type: 'light',
  location: 'Living Room',
  status: 'on',
  last_action: new Date().toISOString()
});

const devices = await getUserSmartDevices(userId);
console.log('Devices:', devices);
```

### Test Professional Notes
```typescript
import { createProfessionalNote, getUserProfessionalNotes } from '@/lib/services';

const note = await createProfessionalNote(userId, {
  title: 'Meeting Notes',
  content: 'Discussed project timeline',
  category: 'meeting',
  tags: ['important', 'project']
});

const notes = await getUserProfessionalNotes(userId);
console.log('Notes:', notes);
```

---

## Expected Results

✅ All functions should return data without errors
✅ Data should appear in Supabase Table Editor
✅ Timestamps should be automatically set
✅ UUIDs should be generated automatically
✅ User isolation should work (each user sees only their data)

---

## Troubleshooting

### Error: "Relation does not exist"
- Verify all tables were created in Supabase
- Check table names match exactly

### Error: "Permission denied"
- Configure RLS policies in Supabase
- Ensure policies allow INSERT/SELECT/UPDATE/DELETE

### Error: "Connection refused"
- Check `.env.local` has correct Supabase URL and key
- Verify Supabase project is active

### Error: "Type mismatch"
- Verify data types match table schema
- Check `src/lib/types/database.ts` for correct types

---

## Success Indicators

✅ User created successfully
✅ Task created successfully
✅ Data fetched successfully
✅ Data visible in Supabase
✅ No console errors
✅ All CRUD operations work

---

## Next Steps

1. Test all features
2. Verify data in Supabase
3. Check for any errors
4. Configure RLS policies if needed
5. Deploy to production

---

**Status**: Ready to Test
**Application**: Running on http://localhost:3002

