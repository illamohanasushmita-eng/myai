# Supabase Integration Guide

This guide explains how to use the Supabase integration in your Next.js + TypeScript project.

## Project Structure

```
src/
├── lib/
│   ├── supabaseClient.ts          # Supabase client initialization
│   ├── types/
│   │   └── database.ts            # TypeScript interfaces for all tables
│   └── services/
│       ├── authService.ts         # Authentication functions
│       ├── userService.ts         # User management
│       ├── taskService.ts         # Task operations
│       ├── noteService.ts         # Note operations
│       ├── chatService.ts         # Chat operations
│       ├── healthService.ts       # Health records & symptoms
│       ├── moodService.ts         # Mood tracking
│       ├── settingsService.ts     # Settings & notifications
│       ├── generalService.ts      # Other services
│       └── index.ts               # Export all services
```

## Available Services

### 1. Authentication Service (`authService.ts`)
```typescript
import { signUp, signIn, changePassword } from '@/lib/services';

// Sign up
const user = await signUp(email, password, name, phone);

// Sign in
const user = await signIn(email, password);

// Change password
await changePassword(userId, oldPassword, newPassword);
```

### 2. User Service (`userService.ts`)
```typescript
import { getUser, getUserByEmail, updateUser } from '@/lib/services';

// Get user by ID
const user = await getUser(userId);

// Get user by email
const user = await getUserByEmail(email);

// Update user
const updated = await updateUser(userId, { name: 'New Name' });
```

### 3. Task Service (`taskService.ts`)
```typescript
import { 
  getUserTasks, 
  createTask, 
  updateTask, 
  deleteTask,
  getTasksByStatus,
  getTasksByCategory 
} from '@/lib/services';

// Get all tasks
const tasks = await getUserTasks(userId);

// Create task
const task = await createTask(userId, {
  title: 'My Task',
  description: 'Task details',
  due_date: new Date().toISOString(),
  category: 'work',
  status: 'pending',
  ai_generated: false
});

// Update task
const updated = await updateTask(taskId, { status: 'completed' });

// Delete task
await deleteTask(taskId);

// Get tasks by status
const pending = await getTasksByStatus(userId, 'pending');

// Get tasks by category
const workTasks = await getTasksByCategory(userId, 'work');
```

### 4. Note Service (`noteService.ts`)
```typescript
import { 
  getUserNotes, 
  createNote, 
  updateNote, 
  deleteNote,
  getNotesByCategory 
} from '@/lib/services';

// Get all notes
const notes = await getUserNotes(userId);

// Create note
const note = await createNote(userId, {
  title: 'My Note',
  content: 'Note content',
  category: 'personal'
});

// Update note
const updated = await updateNote(noteId, { content: 'Updated content' });

// Delete note
await deleteNote(noteId);
```

### 5. Chat Service (`chatService.ts`)
```typescript
import { 
  getUserChats, 
  createChat, 
  getChatsBySender 
} from '@/lib/services';

// Get all chats
const chats = await getUserChats(userId);

// Create chat message
const chat = await createChat(userId, {
  message: 'Hello AI',
  sender: 'user',
  intent: 'greeting'
});

// Get chats by sender
const aiMessages = await getChatsBySender(userId, 'ai');
```

### 6. Health Service (`healthService.ts`)
```typescript
import { 
  getUserHealthRecords, 
  createHealthRecord,
  getUserSymptoms,
  createSymptom 
} from '@/lib/services';

// Health Records
const records = await getUserHealthRecords(userId);
const record = await createHealthRecord(userId, {
  date: new Date().toISOString().split('T')[0],
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
  date: new Date().toISOString().split('T')[0]
});
```

### 7. Mood Service (`moodService.ts`)
```typescript
import { 
  getUserMoods, 
  createMood, 
  getMoodByDate,
  getMoodsInRange 
} from '@/lib/services';

// Get all moods
const moods = await getUserMoods(userId);

// Create mood entry
const mood = await createMood(userId, {
  mood: 'happy',
  date: new Date().toISOString().split('T')[0],
  note: 'Great day!'
});

// Get mood for specific date
const todayMood = await getMoodByDate(userId, new Date().toISOString().split('T')[0]);

// Get moods in date range
const weekMoods = await getMoodsInRange(userId, startDate, endDate);
```

### 8. Settings Service (`settingsService.ts`)
```typescript
import { 
  getUserSettings, 
  updateSettings,
  createNotification,
  getPendingNotifications 
} from '@/lib/services';

// Get settings
const settings = await getUserSettings(userId);

// Update settings
const updated = await updateSettings(userId, { 
  notifications: true,
  voice_input: false 
});

// Create notification
const notification = await createNotification(userId, {
  type: 'reminder',
  message: 'Time for your task',
  scheduled_time: new Date().toISOString(),
  status: 'pending'
});

// Get pending notifications
const pending = await getPendingNotifications(userId);
```

### 9. General Service (`generalService.ts`)
Includes functions for:
- Calendar Events
- Vehicles & Routes
- Maintenance Logs
- Learning Modules
- AI Logs & Recommendations
- Voice Commands
- Devices
- And more...

## Usage Example

Here's a complete example of how to use the services in a component:

```typescript
'use client';

import { useEffect, useState } from 'react';
import { getUserTasks, createTask } from '@/lib/services';
import { Task } from '@/lib/types/database';

export default function TasksComponent() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const userId = localStorage.getItem('userId');
        if (!userId) return;
        
        const userTasks = await getUserTasks(userId);
        setTasks(userTasks);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const handleAddTask = async (title: string) => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) return;

      const newTask = await createTask(userId, {
        title,
        status: 'pending',
        ai_generated: false
      });

      setTasks([...tasks, newTask]);
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {tasks.map(task => (
        <div key={task.task_id}>{task.title}</div>
      ))}
    </div>
  );
}
```

## Authentication Flow

1. **Sign Up**: Create a new user account
   ```typescript
   const user = await signUp(email, password, name);
   localStorage.setItem('userId', user.user_id);
   ```

2. **Sign In**: Authenticate existing user
   ```typescript
   const user = await signIn(email, password);
   localStorage.setItem('userId', user.user_id);
   ```

3. **Store User ID**: Save user ID in localStorage for later use
   ```typescript
   const userId = localStorage.getItem('userId');
   ```

## Important Notes

⚠️ **Security Considerations**:
- The current password hashing is basic. Use `bcryptjs` for production
- Store sensitive data (API keys) in environment variables
- Use proper authentication context instead of localStorage
- Implement proper session management

## Environment Variables

Your `.env.local` file should contain:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## Next Steps

1. Implement proper authentication context
2. Add error handling and validation
3. Implement real-time subscriptions using Supabase
4. Add proper session management
5. Implement proper password hashing with bcryptjs
6. Add more complex queries and filters
7. Implement caching strategies

## Troubleshooting

**Issue**: "User not authenticated"
- Solution: Make sure user ID is stored in localStorage after sign in

**Issue**: "Failed to fetch data"
- Solution: Check Supabase credentials in `.env.local`
- Verify table names and column names match your database

**Issue**: Type errors
- Solution: Make sure types in `database.ts` match your Supabase schema

## Support

For more information, visit:
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JS Client](https://supabase.com/docs/reference/javascript/introduction)

