import { supabase } from '@/lib/supabaseClient';
import { SmartHomeRoutine, RoutineAction, RoutineExecutionLog } from '@/lib/types/database';

// ===== SMART HOME ROUTINES =====

export async function getUserRoutines(userId: string): Promise<SmartHomeRoutine[]> {
  try {
    const { data, error } = await supabase
      .from('smart_home_routines')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching routines - Details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      // Return empty array instead of throwing to prevent page crash
      return [];
    }
    return data || [];
  } catch (error) {
    console.error('Error fetching routines - Exception:', error);
    // Return empty array instead of throwing to prevent page crash
    return [];
  }
}

export async function getRoutine(routineId: string): Promise<SmartHomeRoutine | null> {
  try {
    const { data, error } = await supabase
      .from('smart_home_routines')
      .select('*')
      .eq('routine_id', routineId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching routine:', error);
    throw error;
  }
}

export async function createRoutine(
  userId: string,
  routineData: Omit<SmartHomeRoutine, 'routine_id' | 'user_id' | 'created_at' | 'updated_at'>
): Promise<SmartHomeRoutine> {
  try {
    const { data, error } = await supabase
      .from('smart_home_routines')
      .insert([{ user_id: userId, ...routineData }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating routine:', error);
    throw error;
  }
}

export async function updateRoutine(
  routineId: string,
  updates: Partial<SmartHomeRoutine>
): Promise<SmartHomeRoutine> {
  try {
    const { data, error } = await supabase
      .from('smart_home_routines')
      .update(updates)
      .eq('routine_id', routineId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating routine:', error);
    throw error;
  }
}

export async function deleteRoutine(routineId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('smart_home_routines')
      .delete()
      .eq('routine_id', routineId);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting routine:', error);
    throw error;
  }
}

// ===== ROUTINE ACTIONS =====

export async function getRoutineActions(routineId: string): Promise<RoutineAction[]> {
  try {
    const { data, error } = await supabase
      .from('routine_actions')
      .select('*')
      .eq('routine_id', routineId)
      .order('order_index', { ascending: true });

    if (error) {
      console.error('Error fetching routine actions - Details:', {
        message: error.message,
        code: error.code,
      });
      return [];
    }
    return data || [];
  } catch (error) {
    console.error('Error fetching routine actions - Exception:', error);
    return [];
  }
}

export async function createRoutineAction(
  userId: string,
  actionData: Omit<RoutineAction, 'action_id' | 'user_id' | 'created_at'>
): Promise<RoutineAction> {
  try {
    const { data, error } = await supabase
      .from('routine_actions')
      .insert([{ user_id: userId, ...actionData }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating routine action:', error);
    throw error;
  }
}

export async function deleteRoutineAction(actionId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('routine_actions')
      .delete()
      .eq('action_id', actionId);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting routine action:', error);
    throw error;
  }
}

// ===== ROUTINE EXECUTION LOGS =====

export async function logRoutineExecution(
  userId: string,
  routineId: string,
  status: string = 'success',
  notes?: string
): Promise<RoutineExecutionLog> {
  try {
    const { data, error } = await supabase
      .from('routine_execution_logs')
      .insert([{ user_id: userId, routine_id: routineId, status, notes }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error logging routine execution:', error);
    throw error;
  }
}

export async function getRoutineExecutionLogs(
  routineId: string,
  limit: number = 10
): Promise<RoutineExecutionLog[]> {
  try {
    const { data, error } = await supabase
      .from('routine_execution_logs')
      .select('*')
      .eq('routine_id', routineId)
      .order('executed_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching execution logs:', error);
    throw error;
  }
}

