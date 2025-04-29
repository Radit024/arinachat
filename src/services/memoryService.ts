
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';

// Define interfaces for type safety
export interface UserProfile {
  id: string;
  user_id: string;
  first_name?: string;
  last_name?: string;
  business_name?: string;
  business_type?: string;
  location?: string;
  main_crops?: string[];
  created_at?: string;
}

export interface MemoryUser {
  id: string;
  email: string;
  preferences?: {
    memoryEnabled?: boolean;
  };
}

export interface ChatMessage {
  id?: string;
  content: string;
  role: 'user' | 'assistant';
  created_at?: string;
}

// Function to initialize a memory user with Supabase
export const initializeMemoryUser = async (): Promise<MemoryUser | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Get user preferences if they exist
      const { data: preferences } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      return {
        id: user.id,
        email: user.email || 'default@example.com',
        preferences: preferences || { memoryEnabled: true }
      };
    } else {
      console.log('No user found in session.');
      return null;
    }
  } catch (error) {
    console.error("Error initializing memory user:", error);
    return null;
  }
};

// Update user preferences
export const updateUserPreferences = async (
  userId: string, 
  preferences: { memoryEnabled?: boolean }
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: userId,
        preferences
      });
    
    if (error) {
      console.error("Error updating preferences:", error);
      return false;
    }
    return true;
  } catch (error) {
    console.error("Error updating preferences:", error);
    return false;
  }
};

// Generate a unique ID
export const generateId = (): string => {
  return uuidv4();
};

// Create a new conversation
export const createConversation = async (
  userId: string,
  title: string,
  category?: string
): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .insert([{
        user_id: userId,
        title,
        category
      }])
      .select('id')
      .single();
      
    if (error) {
      console.error("Error creating conversation:", error);
      return null;
    }
    
    return data.id;
  } catch (error) {
    console.error("Error creating conversation:", error);
    return null;
  }
};

// Save a message to the conversation history
export const saveMessage = async (
  conversationId: string,
  content: string,
  role: 'user' | 'assistant'
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('messages')
      .insert([{
        conversation_id: conversationId,
        content,
        role
      }]);
      
    if (error) {
      console.error("Error saving message:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error saving message:", error);
    return false;
  }
};

// Get messages from a conversation
export const getConversationMessages = async (conversationId: string): Promise<ChatMessage[]> => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
      
    if (error) {
      console.error("Error fetching messages:", error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error("Error fetching messages:", error);
    return [];
  }
};

// Retrieve context from memory for a user's query
export const retrieveMemoryContext = async (userId: string, query: string) => {
  try {
    // This is a simplified version - in a real implementation, 
    // this would retrieve relevant context based on embeddings or other memory mechanisms
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
      
    return {
      userMessage: query,
      userProfile
    };
  } catch (error) {
    console.error("Error retrieving memory context:", error);
    return {
      userMessage: query,
      userProfile: null
    };
  }
};
