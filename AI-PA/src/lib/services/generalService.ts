import { supabase } from '@/lib/supabaseClient';
import {
  CalendarEvent,
  Vehicle,
  Route,
  MaintenanceLog,
  LearningModule,
  AILog,
  AIRecommendation,
  VoiceCommand,
  Device,
  Email,
  Report,
  Order,
  SupportTicket,
  BusinessProfile,
} from '@/lib/types/database';

// Calendar Events
export async function getUserCalendarEvents(userId: string): Promise<CalendarEvent[]> {
  const { data, error } = await supabase
    .from('calendar_events')
    .select('*')
    .eq('user_id', userId)
    .order('start_time', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function createCalendarEvent(
  userId: string,
  eventData: Omit<CalendarEvent, 'event_id' | 'user_id'>
): Promise<CalendarEvent> {
  const { data, error } = await supabase
    .from('calendar_events')
    .insert([{ user_id: userId, ...eventData }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Vehicles
export async function getUserVehicles(userId: string): Promise<Vehicle[]> {
  const { data, error } = await supabase
    .from('vehicles')
    .select('*')
    .eq('user_id', userId);

  if (error) throw error;
  return data || [];
}

export async function createVehicle(
  userId: string,
  vehicleData: Omit<Vehicle, 'vehicle_id' | 'user_id'>
): Promise<Vehicle> {
  const { data, error } = await supabase
    .from('vehicles')
    .insert([{ user_id: userId, ...vehicleData }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Routes
export async function getUserRoutes(userId: string): Promise<Route[]> {
  const { data, error } = await supabase
    .from('routes')
    .select('*')
    .eq('user_id', userId);

  if (error) throw error;
  return data || [];
}

export async function createRoute(
  userId: string,
  routeData: Omit<Route, 'route_id' | 'user_id'>
): Promise<Route> {
  const { data, error } = await supabase
    .from('routes')
    .insert([{ user_id: userId, ...routeData }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Maintenance Logs
export async function getVehicleMaintenanceLogs(vehicleId: string): Promise<MaintenanceLog[]> {
  const { data, error } = await supabase
    .from('maintenance_logs')
    .select('*')
    .eq('vehicle_id', vehicleId)
    .order('date', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createMaintenanceLog(
  vehicleId: string,
  logData: Omit<MaintenanceLog, 'log_id' | 'vehicle_id'>
): Promise<MaintenanceLog> {
  const { data, error } = await supabase
    .from('maintenance_logs')
    .insert([{ vehicle_id: vehicleId, ...logData }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Learning Modules
export async function getUserLearningModules(userId: string): Promise<LearningModule[]> {
  const { data, error } = await supabase
    .from('learning_modules')
    .select('*')
    .eq('user_id', userId);

  if (error) throw error;
  return data || [];
}

export async function createLearningModule(
  userId: string,
  moduleData: Omit<LearningModule, 'module_id' | 'user_id'>
): Promise<LearningModule> {
  const { data, error } = await supabase
    .from('learning_modules')
    .insert([{ user_id: userId, ...moduleData }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// AI Logs
export async function getUserAILogs(userId: string): Promise<AILog[]> {
  const { data, error } = await supabase
    .from('ai_logs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createAILog(
  userId: string,
  logData: Omit<AILog, 'log_id' | 'user_id'>
): Promise<AILog> {
  const { data, error } = await supabase
    .from('ai_logs')
    .insert([{ user_id: userId, ...logData }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// AI Recommendations
export async function getUserAIRecommendations(userId: string): Promise<AIRecommendation[]> {
  const { data, error } = await supabase
    .from('ai_recommendations')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createAIRecommendation(
  userId: string,
  recommendationData: Omit<AIRecommendation, 'recommendation_id' | 'user_id'>
): Promise<AIRecommendation> {
  const { data, error } = await supabase
    .from('ai_recommendations')
    .insert([{ user_id: userId, ...recommendationData }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Voice Commands
export async function getUserVoiceCommands(userId: string): Promise<VoiceCommand[]> {
  const { data, error } = await supabase
    .from('voice_commands')
    .select('*')
    .eq('user_id', userId)
    .order('timestamp', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createVoiceCommand(
  userId: string,
  commandData: Omit<VoiceCommand, 'command_id' | 'user_id'>
): Promise<VoiceCommand> {
  const { data, error } = await supabase
    .from('voice_commands')
    .insert([{ user_id: userId, ...commandData }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Devices
export async function getUserDevices(userId: string): Promise<Device[]> {
  const { data, error } = await supabase
    .from('devices')
    .select('*')
    .eq('user_id', userId);

  if (error) throw error;
  return data || [];
}

export async function createDevice(
  userId: string,
  deviceData: Omit<Device, 'device_id' | 'user_id'>
): Promise<Device> {
  const { data, error } = await supabase
    .from('devices')
    .insert([{ user_id: userId, ...deviceData }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

