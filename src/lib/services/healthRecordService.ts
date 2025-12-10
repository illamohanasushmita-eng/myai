import { supabase } from "@/lib/supabaseClient";
import {
  HealthRecord,
  Symptom,
  Medication,
  Appointment,
} from "@/lib/types/database";

// ===== HEALTH RECORDS =====

export async function getUserHealthRecords(
  userId: string,
): Promise<HealthRecord[]> {
  try {
    const { data, error } = await supabase
      .from("health_records")
      .select("*")
      .eq("user_id", userId)
      .order("record_date", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching health records:", error);
    throw error;
  }
}

export async function createHealthRecord(
  userId: string,
  recordData: Omit<
    HealthRecord,
    "record_id" | "user_id" | "created_at" | "updated_at"
  >,
): Promise<HealthRecord> {
  try {
    const { data, error } = await supabase
      .from("health_records")
      .insert([{ user_id: userId, ...recordData }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating health record:", error);
    throw error;
  }
}

export async function updateHealthRecord(
  recordId: string,
  updates: Partial<HealthRecord>,
): Promise<HealthRecord> {
  try {
    const { data, error } = await supabase
      .from("health_records")
      .update(updates)
      .eq("record_id", recordId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating health record:", error);
    throw error;
  }
}

export async function deleteHealthRecord(recordId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from("health_records")
      .delete()
      .eq("record_id", recordId);

    if (error) throw error;
  } catch (error) {
    console.error("Error deleting health record:", error);
    throw error;
  }
}

// ===== SYMPTOMS =====

export async function getUserSymptoms(userId: string): Promise<Symptom[]> {
  try {
    const { data, error } = await supabase
      .from("symptoms")
      .select("*")
      .eq("user_id", userId)
      .order("logged_date", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching symptoms:", error);
    throw error;
  }
}

export async function createSymptom(
  userId: string,
  symptomData: Omit<
    Symptom,
    "symptom_id" | "user_id" | "created_at" | "updated_at"
  >,
): Promise<Symptom> {
  try {
    const { data, error } = await supabase
      .from("symptoms")
      .insert([{ user_id: userId, ...symptomData }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating symptom:", error);
    throw error;
  }
}

export async function updateSymptom(
  symptomId: string,
  updates: Partial<Symptom>,
): Promise<Symptom> {
  try {
    const { data, error } = await supabase
      .from("symptoms")
      .update(updates)
      .eq("symptom_id", symptomId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating symptom:", error);
    throw error;
  }
}

export async function deleteSymptom(symptomId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from("symptoms")
      .delete()
      .eq("symptom_id", symptomId);

    if (error) throw error;
  } catch (error) {
    console.error("Error deleting symptom:", error);
    throw error;
  }
}

// ===== MEDICATIONS =====

export async function getUserMedications(
  userId: string,
): Promise<Medication[]> {
  try {
    const { data, error } = await supabase
      .from("medications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching medications:", error);
    throw error;
  }
}

export async function getActiveMedications(
  userId: string,
): Promise<Medication[]> {
  try {
    const { data, error } = await supabase
      .from("medications")
      .select("*")
      .eq("user_id", userId)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching active medications:", error);
    throw error;
  }
}

export async function createMedication(
  userId: string,
  medicationData: Omit<
    Medication,
    "medication_id" | "user_id" | "created_at" | "updated_at"
  >,
): Promise<Medication> {
  try {
    const { data, error } = await supabase
      .from("medications")
      .insert([{ user_id: userId, ...medicationData }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating medication:", error);
    throw error;
  }
}

export async function updateMedication(
  medicationId: string,
  updates: Partial<Medication>,
): Promise<Medication> {
  try {
    const { data, error } = await supabase
      .from("medications")
      .update(updates)
      .eq("medication_id", medicationId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating medication:", error);
    throw error;
  }
}

export async function deleteMedication(medicationId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from("medications")
      .delete()
      .eq("medication_id", medicationId);

    if (error) throw error;
  } catch (error) {
    console.error("Error deleting medication:", error);
    throw error;
  }
}

// ===== APPOINTMENTS =====

export async function getUserAppointments(
  userId: string,
): Promise<Appointment[]> {
  try {
    const { data, error } = await supabase
      .from("appointments")
      .select("*")
      .eq("user_id", userId)
      .order("appointment_date", { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching appointments:", error);
    throw error;
  }
}

export async function createAppointment(
  userId: string,
  appointmentData: Omit<
    Appointment,
    "appointment_id" | "user_id" | "created_at" | "updated_at"
  >,
): Promise<Appointment> {
  try {
    const { data, error } = await supabase
      .from("appointments")
      .insert([{ user_id: userId, ...appointmentData }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating appointment:", error);
    throw error;
  }
}

export async function updateAppointment(
  appointmentId: string,
  updates: Partial<Appointment>,
): Promise<Appointment> {
  try {
    const { data, error } = await supabase
      .from("appointments")
      .update(updates)
      .eq("appointment_id", appointmentId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating appointment:", error);
    throw error;
  }
}

export async function deleteAppointment(appointmentId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from("appointments")
      .delete()
      .eq("appointment_id", appointmentId);

    if (error) throw error;
  } catch (error) {
    console.error("Error deleting appointment:", error);
    throw error;
  }
}
