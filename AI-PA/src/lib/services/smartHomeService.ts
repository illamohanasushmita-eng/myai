import { supabase } from '@/lib/supabaseClient';
import { SmartDevice, DeviceLog } from '@/lib/types/database';

// ===== SMART DEVICES =====

export async function getUserSmartDevices(userId: string): Promise<SmartDevice[]> {
  try {
    const { data, error } = await supabase
      .from('smart_devices')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching smart devices:', error);
    throw error;
  }
}

export async function getSmartDevice(deviceId: string): Promise<SmartDevice | null> {
  try {
    const { data, error } = await supabase
      .from('smart_devices')
      .select('*')
      .eq('device_id', deviceId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching smart device:', error);
    throw error;
  }
}

export async function createSmartDevice(
  userId: string,
  deviceData: Omit<SmartDevice, 'device_id' | 'user_id' | 'created_at' | 'updated_at'>
): Promise<SmartDevice> {
  try {
    const { data, error } = await supabase
      .from('smart_devices')
      .insert([{ user_id: userId, ...deviceData }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating smart device:', error);
    throw error;
  }
}

export async function updateSmartDevice(
  deviceId: string,
  updates: Partial<SmartDevice>
): Promise<SmartDevice> {
  try {
    const { data, error } = await supabase
      .from('smart_devices')
      .update(updates)
      .eq('device_id', deviceId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating smart device:', error);
    throw error;
  }
}

export async function deleteSmartDevice(deviceId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('smart_devices')
      .delete()
      .eq('device_id', deviceId);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting smart device:', error);
    throw error;
  }
}

export async function getDevicesByType(userId: string, deviceType: string): Promise<SmartDevice[]> {
  try {
    const { data, error } = await supabase
      .from('smart_devices')
      .select('*')
      .eq('user_id', userId)
      .eq('device_type', deviceType)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching devices by type:', error);
    throw error;
  }
}

// ===== DEVICE LOGS =====

export async function getDeviceLogs(deviceId: string): Promise<DeviceLog[]> {
  try {
    const { data, error } = await supabase
      .from('device_logs')
      .select('*')
      .eq('device_id', deviceId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching device logs:', error);
    throw error;
  }
}

export async function createDeviceLog(
  deviceId: string,
  userId: string,
  logData: Omit<DeviceLog, 'log_id' | 'device_id' | 'user_id' | 'created_at'>
): Promise<DeviceLog> {
  try {
    const { data, error } = await supabase
      .from('device_logs')
      .insert([
        {
          device_id: deviceId,
          user_id: userId,
          ...logData,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating device log:', error);
    throw error;
  }
}

export async function getRecentDeviceLogs(deviceId: string, hours: number = 24): Promise<DeviceLog[]> {
  try {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
    const { data, error } = await supabase
      .from('device_logs')
      .select('*')
      .eq('device_id', deviceId)
      .gte('created_at', since)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching recent device logs:', error);
    throw error;
  }
}

