# Supabase Quick Reference Card

## 🔧 Setup

```typescript
// Import services
import { 
  getUserTasks, 
  createTask, 
  updateTask,
  deleteTask 
} from '@/lib/services';

// Get user ID
const userId = localStorage.getItem('userId');
```

## 📋 Tasks

```typescript
// Get all tasks
const tasks = await getUserTasks(userId);

// Create task
const task = await createTask(userId, {
  title: 'My Task',
  description: 'Details',
  due_date: new Date().toISOString(),
  category: 'work',
  status: 'pending',
  ai_generated: false
});

// Update task
await updateTask(taskId, { status: 'completed' });

// Delete task
await deleteTask(taskId);

// Get by status
const pending = await getTasksByStatus(userId, 'pending');

// Get by category
const work = await getTasksByCategory(userId, 'work');
```

## 📝 Notes

```typescript
// Get all notes
const notes = await getUserNotes(userId);

// Create note
const note = await createNote(userId, {
  title: 'Note Title',
  content: 'Note content',
  category: 'personal'
});

// Update note
await updateNote(noteId, { content: 'Updated' });

// Delete note
await deleteNote(noteId);
```

## 💬 Chats

```typescript
// Get all chats
const chats = await getUserChats(userId);

// Create message
const msg = await createChat(userId, {
  message: 'Hello',
  sender: 'user',
  intent: 'greeting'
});

// Get by sender
const aiMsgs = await getChatsBySender(userId, 'ai');
```

## 😊 Moods

```typescript
// Get all moods
const moods = await getUserMoods(userId);

// Create mood
const mood = await createMood(userId, {
  mood: 'happy',
  date: '2024-01-15',
  note: 'Great day!'
});

// Get mood by date
const today = await getMoodByDate(userId, '2024-01-15');

// Get range
const week = await getMoodsInRange(userId, start, end);
```

## 🏥 Health

```typescript
// Health records
const records = await getUserHealthRecords(userId);

const record = await createHealthRecord(userId, {
  date: '2024-01-15',
  bp: '120/80',
  sugar: 100,
  heart_rate: 72,
  weight: 70
});

// Symptoms
const symptoms = await getUserSymptoms(userId);

const symptom = await createSymptom(userId, {
  symptom_name: 'Headache',
  severity: 'mild',
  date: '2024-01-15'
});
```

## 👤 Users

```typescript
// Get user
const user = await getUser(userId);

// Get by email
const user = await getUserByEmail('email@example.com');

// Update user
await updateUser(userId, {
  name: 'New Name',
  theme: 'dark',
  location: 'NYC'
});
```

## 🔐 Auth

```typescript
// Sign up
const user = await signUp(
  'email@example.com',
  'password',
  'Name',
  '+1234567890'
);

// Sign in
const user = await signIn('email@example.com', 'password');

// Store user ID
localStorage.setItem('userId', user.user_id);

// Change password
await changePassword(userId, oldPwd, newPwd);
```

## ⚙️ Settings

```typescript
// Get settings
const settings = await getUserSettings(userId);

// Update settings
await updateSettings(userId, {
  notifications: true,
  voice_input: false,
  data_sharing: false
});

// Create notification
const notif = await createNotification(userId, {
  type: 'reminder',
  message: 'Your message',
  scheduled_time: new Date().toISOString(),
  status: 'pending'
});

// Get pending
const pending = await getPendingNotifications(userId);
```

## 🚗 Vehicles

```typescript
// Get vehicles
const vehicles = await getUserVehicles(userId);

// Create vehicle
const vehicle = await createVehicle(userId, {
  make: 'Toyota',
  model: 'Camry',
  year: 2023,
  mileage: 5000
});

// Get routes
const routes = await getUserRoutes(userId);

// Create route
const route = await createRoute(userId, {
  start_location: 'Home',
  end_location: 'Work',
  distance: 10,
  duration: 30,
  recommended: true
});

// Maintenance logs
const logs = await getVehicleMaintenanceLogs(vehicleId);

const log = await createMaintenanceLog(vehicleId, {
  date: new Date().toISOString(),
  issue: 'Oil change',
  cost: 50
});
```

## 📅 Calendar

```typescript
// Get events
const events = await getUserCalendarEvents(userId);

// Create event
const event = await createCalendarEvent(userId, {
  title: 'Meeting',
  description: 'Team meeting',
  start_time: new Date().toISOString(),
  end_time: new Date(Date.now() + 3600000).toISOString(),
  location: 'Room A'
});
```

## 🎓 Learning

```typescript
// Get modules
const modules = await getUserLearningModules(userId);

// Create module
const module = await createLearningModule(userId, {
  title: 'React Basics',
  description: 'Learn React',
  category: 'programming',
  progress: 0
});
```

## 🤖 AI

```typescript
// Get AI logs
const logs = await getUserAILogs(userId);

// Create AI log
const log = await createAILog(userId, {
  query: 'What is React?',
  response: 'React is...',
  intent: 'learning',
  success: true
});

// Get recommendations
const recs = await getUserAIRecommendations(userId);

// Create recommendation
const rec = await createAIRecommendation(userId, {
  category: 'health',
  message: 'Drink more water'
});
```

## 🎤 Voice

```typescript
// Get commands
const commands = await getUserVoiceCommands(userId);

// Create command
const cmd = await createVoiceCommand(userId, {
  text: 'Create a task',
  action: 'create_task',
  source: 'mobile'
});
```

## 📱 Devices

```typescript
// Get devices
const devices = await getUserDevices(userId);

// Create device
const device = await createDevice(userId, {
  name: 'iPhone',
  type: 'mobile',
  status: 'active'
});
```

## 🔄 Common Patterns

### Fetch and Display
```typescript
const [data, setData] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetch = async () => {
    try {
      const result = await getFunction(userId);
      setData(result);
    } finally {
      setLoading(false);
    }
  };
  fetch();
}, []);

if (loading) return <div>Loading...</div>;
return <div>{data.map(item => ...)}</div>;
```

### Create with Form
```typescript
const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    await createFunction(userId, formData);
    // Refresh or redirect
  } catch (error) {
    console.error(error);
  }
};
```

### Update Item
```typescript
const handleUpdate = async (id, updates) => {
  try {
    await updateFunction(id, updates);
    // Refresh data
  } catch (error) {
    console.error(error);
  }
};
```

### Delete Item
```typescript
const handleDelete = async (id) => {
  try {
    await deleteFunction(id);
    // Remove from state
  } catch (error) {
    console.error(error);
  }
};
```

## 📂 File Locations

- **Client**: `src/lib/supabaseClient.ts`
- **Types**: `src/lib/types/database.ts`
- **Services**: `src/lib/services/*.ts`
- **Examples**: `src/lib/examples/supabaseExamples.ts`
- **Env**: `.env.local`

## 🚀 Tips

1. Always get userId from localStorage
2. Use try-catch for error handling
3. Show loading states
4. Validate form inputs
5. Use TypeScript types for safety
6. Check Supabase dashboard for data
7. Use browser DevTools to debug
8. Test with real data

## 📖 Learn More

- Full Guide: `SUPABASE_INTEGRATION_GUIDE.md`
- Examples: `src/lib/examples/supabaseExamples.ts`
- Setup: `SUPABASE_SETUP_SUMMARY.md`
- Docs: https://supabase.com/docs

