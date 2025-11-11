/**
 * Supabase Integration Examples
 * This file contains example usage of all Supabase services
 */

import {
  // Auth
  signUp,
  signIn,
  changePassword,
  // User
  getUser,
  getUserByEmail,
  updateUser,
  // Tasks
  getUserTasks,
  createTask,
  updateTask,
  deleteTask,
  getTasksByStatus,
  // Notes
  getUserNotes,
  createNote,
  updateNote,
  // Chats
  getUserChats,
  createChat,
  // Health
  getHealthRecordsFromHealthRecordService,
  createHealthRecordFromHealthRecordService,
  getUserSymptomsFromHealthRecordService,
  createSymptomFromHealthRecordService,
  // Moods
  getUserMoods,
  createMood,
  getMoodByDate,
  // Settings
  getUserSettings,
  updateSettings,
  getSettingsUserNotifications,
  getPendingNotifications,
  // General
  getUserDevices,
  createDevice,
  getUserCalendarEvents,
  createCalendarEvent,
} from '@/lib/services';

// ============ AUTHENTICATION EXAMPLES ============

export async function authExamples() {
  // Sign up a new user
  const newUser = await signUp(
    'user@example.com',
    'password123',
    'John Doe',
    '+1234567890'
  );
  console.log('New user created:', newUser);

  // Sign in
  const user = await signIn('user@example.com', 'password123');
  console.log('User signed in:', user);

  // Store user ID for later use
  localStorage.setItem('userId', user.user_id);

  // Change password
  await changePassword(user.user_id, 'password123', 'newPassword456');
}

// ============ USER MANAGEMENT EXAMPLES ============

export async function userExamples(userId: string) {
  // Get user by ID
  const user = await getUser(userId);
  console.log('User:', user);

  // Get user by email
  const userByEmail = await getUserByEmail('user@example.com');
  console.log('User by email:', userByEmail);

  // Update user profile
  const updated = await updateUser(userId, {
    name: 'Jane Doe',
    theme: 'dark',
  });
  console.log('Updated user:', updated);
}

// ============ TASK MANAGEMENT EXAMPLES ============

export async function taskExamples(userId: string) {
  // Get all tasks
  const allTasks = await getUserTasks(userId);
  console.log('All tasks:', allTasks);

  // Create a new task
  const newTask = await createTask(userId, {
    title: 'Complete project proposal',
    description: 'Finish the Q4 project proposal',
    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'work',
    status: 'pending',
    priority: 'high',
    updated_at: new Date().toISOString(),
    ai_generated: false,
  });
  console.log('New task:', newTask);

  // Update task status
  const updated = await updateTask(newTask.task_id, {
    status: 'completed',
  });
  console.log('Updated task:', updated);

  // Get tasks by status
  const pendingTasks = await getTasksByStatus(userId, 'pending');
  console.log('Pending tasks:', pendingTasks);

  // Delete task
  await deleteTask(newTask.task_id);
  console.log('Task deleted');
}

// ============ NOTE MANAGEMENT EXAMPLES ============

export async function noteExamples(userId: string) {
  // Get all notes
  const allNotes = await getUserNotes(userId);
  console.log('All notes:', allNotes);

  // Create a new note
  const newNote = await createNote(userId, {
    title: 'Meeting Notes',
    content: 'Discussed Q4 roadmap and team goals',
    updated_at: new Date().toISOString(),
  });
  console.log('New note:', newNote);

  // Update note
  const updated = await updateNote(newNote.note_id, {
    content: 'Updated meeting notes with action items',
  });
  console.log('Updated note:', updated);
}

// ============ CHAT EXAMPLES ============

export async function chatExamples(userId: string) {
  // Get all chats
  const allChats = await getUserChats(userId);
  console.log('All chats:', allChats);

  // Create a user message
  const userMessage = await createChat(userId, {
    title: 'Task Query',
    messages: 'What are my tasks for today?',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
  console.log('User message:', userMessage);

  // Create an AI response
  const aiResponse = await createChat(userId, {
    title: 'Task Summary',
    messages: 'You have 3 tasks for today',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
  console.log('AI response:', aiResponse);
}

// ============ HEALTH TRACKING EXAMPLES ============

export async function healthExamples(userId: string) {
  // Get health records
  const records = await getHealthRecordsFromHealthRecordService(userId);
  console.log('Health records:', records);

  // Create health record
  const newRecord = await createHealthRecordFromHealthRecordService(userId, {
    record_date: new Date().toISOString().split('T')[0],
    blood_pressure: '120/80',
    blood_sugar: 95,
    heart_rate: 72,
    weight: 70,
  });
  console.log('New health record:', newRecord);

  // Get symptoms
  const symptoms = await getUserSymptomsFromHealthRecordService(userId);
  console.log('Symptoms:', symptoms);

  // Create symptom entry
  const newSymptom = await createSymptomFromHealthRecordService(userId, {
    symptom_name: 'Headache',
    severity: 'mild',
    logged_date: new Date().toISOString().split('T')[0],
  });
  console.log('New symptom:', newSymptom);
}

// ============ MOOD TRACKING EXAMPLES ============

export async function moodExamples(userId: string) {
  // Get all moods
  const allMoods = await getUserMoods(userId);
  console.log('All moods:', allMoods);

  // Create mood entry
  const newMood = await createMood(userId, {
    mood_level: 8,
    notes: 'Great day at work!',
    created_at: new Date().toISOString(),
  });
  console.log('New mood:', newMood);

  // Get mood for specific date
  const todayMood = await getMoodByDate(
    userId,
    new Date().toISOString().split('T')[0]
  );
  console.log('Today mood:', todayMood);
}

// ============ SETTINGS & NOTIFICATIONS EXAMPLES ============

export async function settingsExamples(userId: string) {
  // Get user settings
  const settings = await getUserSettings(userId);
  console.log('Settings:', settings);

  // Update settings
  const updated = await updateSettings(userId, {
    data_sharing: false,
  });
  console.log('Updated settings:', updated);

  // Get pending notifications
  const notification = await getPendingNotifications(userId);
  console.log('Pending notifications:', notification);

  // Get pending notifications
  const pending = await getPendingNotifications(userId);
  console.log('Pending notifications:', pending);
}

// ============ VEHICLE & AUTOMOTIVE EXAMPLES ============

export async function vehicleExamples(userId: string) {
  // Get devices (vehicles)
  const vehicles = await getUserDevices(userId);
  console.log('Devices:', vehicles);

  // Create device (vehicle)
  const newVehicle = await createDevice(userId, {
    device_name: 'Toyota Camry',
    device_type: 'vehicle',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
  console.log('New vehicle:', newVehicle);
}

// ============ CALENDAR EXAMPLES ============

export async function calendarExamples(userId: string) {
  // Get calendar events
  const events = await getUserCalendarEvents(userId);
  console.log('Calendar events:', events);

  // Create calendar event
  const newEvent = await createCalendarEvent(userId, {
    title: 'Team Meeting',
    description: 'Quarterly planning meeting',
    start_date: new Date().toISOString(),
    end_date: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    location: 'Conference Room A',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
  console.log('New event:', newEvent);
}

// ============ COMPLETE WORKFLOW EXAMPLE ============

export async function completeWorkflow() {
  try {
    // 1. Sign up
    const user = await signUp(
      'newuser@example.com',
      'password123',
      'New User'
    );
    const userId = user.user_id;

    // 2. Create some tasks
    await createTask(userId, {
      title: 'Task 1',
      status: 'pending',
      priority: 'medium',
      updated_at: new Date().toISOString(),
      ai_generated: false,
    });

    // 3. Create a note
    await createNote(userId, {
      title: 'My Notes',
      content: 'Important information',
      updated_at: new Date().toISOString(),
    });

    // 4. Log mood
    await createMood(userId, {
      mood_level: 9,
      notes: 'Productive day',
      created_at: new Date().toISOString(),
    });

    // 5. Get all data
    const tasks = await getUserTasks(userId);
    const notes = await getUserNotes(userId);
    const moods = await getUserMoods(userId);

    console.log('Complete workflow executed successfully');
    console.log('Tasks:', tasks);
    console.log('Notes:', notes);
    console.log('Moods:', moods);
  } catch (error) {
    console.error('Error in workflow:', error);
  }
}

