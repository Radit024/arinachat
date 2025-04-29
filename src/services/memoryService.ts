
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
  farm_size?: number;
  main_crops?: string[];
  created_at?: string;
  updated_at?: string;
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
      // Get user preferences from memory_users table
      const { data: memoryUser } = await supabase
        .from('memory_users')
        .select('*')
        .eq('auth_id', user.id)
        .maybeSingle();
      
      return {
        id: user.id,
        email: user.email || 'default@example.com',
        preferences: memoryUser?.preferences as { memoryEnabled?: boolean } || { memoryEnabled: true }
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
    // Update the preferences in the memory_users table
    const { error } = await supabase
      .from('memory_users')
      .update({
        preferences
      })
      .eq('auth_id', userId);
    
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
        analysis_type: category
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
      .from('memory_messages')
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
      .from('memory_messages')
      .select('id, content, role, created_at')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
      
    if (error) {
      console.error("Error fetching messages:", error);
      return [];
    }
    
    return data as ChatMessage[] || [];
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

// Function to get user profile
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
      
    if (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
    
    return data as UserProfile;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
};

// Function to save/update user profile
export const saveUserProfile = async (
  userId: string, 
  profileData: Partial<UserProfile>
): Promise<UserProfile | null> => {
  try {
    // Check if profile exists
    const existingProfile = await getUserProfile(userId);
    
    if (existingProfile) {
      // Update existing profile
      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          ...profileData,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select('*')
        .single();
        
      if (error) {
        console.error("Error updating profile:", error);
        return null;
      }
      
      return data as UserProfile;
    } else {
      // Create new profile
      const { data, error } = await supabase
        .from('user_profiles')
        .insert([{
          user_id: userId,
          ...profileData
        }])
        .select('*')
        .single();
        
      if (error) {
        console.error("Error creating profile:", error);
        return null;
      }
      
      return data as UserProfile;
    }
  } catch (error) {
    console.error("Error saving user profile:", error);
    return null;
  }
};

// Function to delete memory data
export const deleteMemoryData = async (
  userId: string, 
  type: 'conversations' | 'entities' | 'sessions'
): Promise<boolean> => {
  try {
    let error;
    
    switch (type) {
      case 'conversations':
        // Get all conversation IDs for the user
        const { data: conversations } = await supabase
          .from('conversations')
          .select('id')
          .eq('user_id', userId);
          
        if (conversations && conversations.length > 0) {
          const conversationIds = conversations.map(conv => conv.id);
          
          // Delete all messages from these conversations
          const { error: messagesError } = await supabase
            .from('memory_messages')
            .delete()
            .in('conversation_id', conversationIds);
            
          if (messagesError) {
            console.error("Error deleting conversation messages:", messagesError);
            return false;
          }
          
          // Delete the conversations
          const { error: convsError } = await supabase
            .from('conversations')
            .delete()
            .eq('user_id', userId);
            
          error = convsError;
        }
        break;
        
      case 'entities':
        // Delete entity memory
        const { error: entitiesError } = await supabase
          .from('entities')
          .delete()
          .eq('user_id', userId);
          
        error = entitiesError;
        break;
        
      case 'sessions':
        // Delete session data
        const { error: sessionsError } = await supabase
          .from('user_session_data')
          .delete()
          .eq('user_id', userId);
          
        error = sessionsError;
        break;
    }
    
    if (error) {
      console.error(`Error deleting ${type}:`, error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error(`Error deleting ${type}:`, error);
    return false;
  }
};
