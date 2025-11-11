import { supabase } from '@/lib/supabaseClient';
import { HealthRecord, Symptom } from '@/lib/types/database';

// Health Records
export async function getUserHealthRecords(userId: string): Promise<HealthRecord[]> {
  try {
    const { data, error } = await supabase
      .from('health_records')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching health records:', error);
    throw error;
  }
}

export async function createHealthRecord(
  userId: string,
  recordData: Omit<HealthRecord, 'record_id' | 'user_id'>
): Promise<HealthRecord> {
  try {
    const { data, error } = await supabase
      .from('health_records')
      .insert([
        {
          user_id: userId,
          ...recordData,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating health record:', error);
    throw error;
  }
}

export async function updateHealthRecord(
  recordId: string,
  updates: Partial<HealthRecord>
): Promise<HealthRecord> {
  try {
    const { data, error } = await supabase
      .from('health_records')
      .update(updates)
      .eq('record_id', recordId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating health record:', error);
    throw error;
  }
}

// Symptoms
export async function getUserSymptoms(userId: string): Promise<Symptom[]> {
  try {
    const { data, error } = await supabase
      .from('symptoms')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching symptoms:', error);
    throw error;
  }
}

export async function createSymptom(
  userId: string,
  symptomData: Omit<Symptom, 'symptom_id' | 'user_id'>
): Promise<Symptom> {
  try {
    const { data, error } = await supabase
      .from('symptoms')
      .insert([
        {
          user_id: userId,
          ...symptomData,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating symptom:', error);
    throw error;
  }
}

export async function deleteSymptom(symptomId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('symptoms')
      .delete()
      .eq('symptom_id', symptomId);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting symptom:', error);
    throw error;
  }
}

