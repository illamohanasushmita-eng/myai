import { supabase } from "@/lib/supabaseClient";
import { Note } from "@/lib/types/database";

// Get all notes for a user
export async function getUserNotes(userId: string): Promise<Note[]> {
  try {
    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching notes:", error);
    throw error;
  }
}

// Get a single note
export async function getNote(noteId: string): Promise<Note | null> {
  try {
    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .eq("note_id", noteId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching note:", error);
    throw error;
  }
}

// Create a new note
export async function createNote(
  userId: string,
  noteData: Omit<Note, "note_id" | "user_id" | "created_at">,
): Promise<Note> {
  try {
    const { data, error } = await supabase
      .from("notes")
      .insert([
        {
          user_id: userId,
          ...noteData,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating note:", error);
    throw error;
  }
}

// Update a note
export async function updateNote(
  noteId: string,
  updates: Partial<Note>,
): Promise<Note> {
  try {
    const { data, error } = await supabase
      .from("notes")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("note_id", noteId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating note:", error);
    throw error;
  }
}

// Delete a note
export async function deleteNote(noteId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from("notes")
      .delete()
      .eq("note_id", noteId);

    if (error) throw error;
  } catch (error) {
    console.error("Error deleting note:", error);
    throw error;
  }
}

// Get notes by category
export async function getNotesByCategory(
  userId: string,
  category: string,
): Promise<Note[]> {
  try {
    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .eq("user_id", userId)
      .eq("category", category)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching notes by category:", error);
    throw error;
  }
}
