import { supabase } from "@/lib/supabaseClient";
import { Chat } from "@/lib/types/database";

// Get all chats for a user
export async function getUserChats(userId: string): Promise<Chat[]> {
  try {
    const { data, error } = await supabase
      .from("chats")
      .select("*")
      .eq("user_id", userId)
      .order("timestamp", { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching chats:", error);
    throw error;
  }
}

// Get recent chats
export async function getRecentChats(
  userId: string,
  limit: number = 50,
): Promise<Chat[]> {
  try {
    const { data, error } = await supabase
      .from("chats")
      .select("*")
      .eq("user_id", userId)
      .order("timestamp", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching recent chats:", error);
    throw error;
  }
}

// Create a new chat message
export async function createChat(
  userId: string,
  chatData: Omit<Chat, "chat_id" | "user_id" | "timestamp">,
): Promise<Chat> {
  try {
    const { data, error } = await supabase
      .from("chats")
      .insert([
        {
          user_id: userId,
          ...chatData,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating chat:", error);
    throw error;
  }
}

// Update a chat message
export async function updateChat(
  chatId: string,
  updates: Partial<Chat>,
): Promise<Chat> {
  try {
    const { data, error } = await supabase
      .from("chats")
      .update(updates)
      .eq("chat_id", chatId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating chat:", error);
    throw error;
  }
}

// Delete a chat message
export async function deleteChat(chatId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from("chats")
      .delete()
      .eq("chat_id", chatId);

    if (error) throw error;
  } catch (error) {
    console.error("Error deleting chat:", error);
    throw error;
  }
}

// Get chats by sender
export async function getChatsBySender(
  userId: string,
  sender: "user" | "ai",
): Promise<Chat[]> {
  try {
    const { data, error } = await supabase
      .from("chats")
      .select("*")
      .eq("user_id", userId)
      .eq("sender", sender)
      .order("timestamp", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching chats by sender:", error);
    throw error;
  }
}
