// ============================================================================
// USER & AUTHENTICATION TYPES
// ============================================================================

export interface User {
  user_id: string;
  email: string;
  password_hash: string;
  name?: string;
  phone?: string;
  avatar_url?: string;
  theme: string;
  language: string;
  created_at: string;
  updated_at: string;
  last_login?: string;
}

export interface Settings {
  setting_id: string;
  user_id: string;
  notifications_enabled: boolean;
  email_notifications: boolean;
  push_notifications: boolean;
  voice_input_enabled: boolean;
  data_sharing: boolean;
  theme: string;
  language: string;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// TASK & REMINDER TYPES
// ============================================================================

export interface Task {
  task_id: string;
  user_id: string;
  title: string;
  description?: string;
  due_date?: string;
  category?: string;
  status: string;
  priority: string;
  ai_generated: boolean;
  created_at: string;
  updated_at: string;
}

export interface Reminder {
  reminder_id: string;
  user_id: string;
  title: string;
  description?: string;
  reminder_time: string;
  reminder_type?: string;
  status: string;
  is_recurring: boolean;
  recurrence_pattern?: string;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// HEALTH & WELLNESS TYPES
// ============================================================================

export interface HealthRecord {
  record_id: string;
  user_id: string;
  record_date: string;
  water_intake?: number;
  steps?: number;
  sleep_hours?: number;
  sleep_quality?: string;
  weight?: number;
  blood_pressure?: string;
  heart_rate?: number;
  blood_sugar?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Symptom {
  symptom_id: string;
  user_id: string;
  symptom_name: string;
  severity?: string;
  description?: string;
  logged_date: string;
  duration_hours?: number;
  notes?: string;
  created_at: string;
}

export interface Medication {
  medication_id: string;
  user_id: string;
  medication_name: string;
  dosage?: string;
  frequency?: string;
  time_of_day?: string;
  start_date?: string;
  end_date?: string;
  reason?: string;
  side_effects?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  appointment_id: string;
  user_id: string;
  title: string;
  doctor_name?: string;
  clinic_name?: string;
  appointment_date: string;
  duration_minutes?: number;
  location?: string;
  notes?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// PERSONAL GROWTH TYPES
// ============================================================================

export interface GrowthGoal {
  goal_id: string;
  user_id: string;
  title: string;
  description?: string;
  category?: string;
  target_date?: string;
  progress_percentage: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Habit {
  habit_id: string;
  user_id: string;
  habit_name: string;
  description?: string;
  frequency?: string;
  category?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface HabitLog {
  log_id: string;
  habit_id: string;
  user_id: string;
  log_date: string;
  completed: boolean;
  notes?: string;
  created_at: string;
}

export interface LearningModule {
  module_id: string;
  user_id: string;
  title: string;
  description?: string;
  category?: string;
  progress_percentage: number;
  status: string;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// AUTOMOTIVE TYPES
// ============================================================================

export interface Vehicle {
  vehicle_id: string;
  user_id: string;
  make: string;
  model: string;
  year?: number;
  license_plate?: string;
  vin?: string;
  mileage?: number;
  fuel_type?: string;
  color?: string;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export interface MaintenanceLog {
  maintenance_id: string;
  vehicle_id: string;
  user_id: string;
  maintenance_date: string;
  service_type: string;
  description?: string;
  cost?: number;
  mileage?: number;
  notes?: string;
  created_at: string;
}

export interface Route {
  route_id: string;
  user_id: string;
  start_location: string;
  end_location: string;
  distance_km?: number;
  estimated_time_minutes?: number;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// SMART HOME TYPES
// ============================================================================

export interface SmartDevice {
  device_id: string;
  user_id: string;
  device_name: string;
  device_type: string;
  location?: string;
  is_active: boolean;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface DeviceLog {
  log_id: string;
  device_id: string;
  user_id: string;
  action: string;
  status?: string;
  timestamp: string;
}

export interface SmartHomeRoutine {
  routine_id: string;
  user_id: string;
  routine_name: string;
  description?: string;
  icon: string;
  color: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RoutineAction {
  action_id: string;
  routine_id: string;
  device_id: string;
  user_id: string;
  action_type: string;
  action_value?: string;
  order_index: number;
  created_at: string;
}

export interface RoutineExecutionLog {
  log_id: string;
  routine_id: string;
  user_id: string;
  executed_at: string;
  status: string;
  notes?: string;
}

// ============================================================================
// PROFESSIONAL & NOTES TYPES
// ============================================================================

export interface ProfessionalNote {
  note_id: string;
  user_id: string;
  title: string;
  content?: string;
  category?: string;
  tags?: string;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// NOTIFICATIONS & AI TYPES
// ============================================================================

export interface Notification {
  notification_id: string;
  user_id: string;
  title: string;
  message?: string;
  notification_type?: string;
  scheduled_time?: string;
  status: string;
  is_read: boolean;
  created_at: string;
}

export interface AILog {
  log_id: string;
  user_id: string;
  query: string;
  response?: string;
  intent?: string;
  success: boolean;
  created_at: string;
}

export interface Insight {
  insight_id: string;
  user_id: string;
  insight_type: string;
  title: string;
  description?: string;
  data?: Record<string, any>;
  created_at: string;
}

// Additional type exports for services
export interface Chat {
  chat_id: string;
  user_id: string;
  title: string;
  messages?: string;
  created_at: string;
  updated_at: string;
}

export interface CalendarEvent {
  event_id: string;
  user_id: string;
  title: string;
  description?: string;
  start_date: string;
  end_date?: string;
  location?: string;
  created_at: string;
  updated_at: string;
}

export interface AIRecommendation {
  recommendation_id: string;
  user_id: string;
  title: string;
  description?: string;
  category?: string;
  created_at: string;
}

export interface VoiceCommand {
  command_id: string;
  user_id: string;
  command_text: string;
  intent?: string;
  response?: string;
  created_at: string;
}

export interface Device {
  device_id: string;
  user_id: string;
  device_name: string;
  device_type: string;
  created_at: string;
  updated_at: string;
}

export interface Email {
  email_id: string;
  user_id: string;
  recipient: string;
  subject: string;
  body?: string;
  sent_at: string;
}

export interface Report {
  report_id: string;
  user_id: string;
  title: string;
  content?: string;
  created_at: string;
}

export interface Order {
  order_id: string;
  user_id: string;
  order_number: string;
  total_amount?: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface SupportTicket {
  ticket_id: string;
  user_id: string;
  subject: string;
  description?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface BusinessProfile {
  profile_id: string;
  user_id: string;
  business_name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Mood {
  mood_id: string;
  user_id: string;
  mood_level: number;
  notes?: string;
  created_at: string;
}

export interface Note {
  note_id: string;
  user_id: string;
  title: string;
  content?: string;
  created_at: string;
  updated_at: string;
}
