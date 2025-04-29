
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';

// Define types
export interface MemoryContext {
  userMessage: string;
  recentMessages: {
    role: string;
    content: string;
  }[];
  relevantEntities: string[];
  userProfile: any;
}

export interface MemoryUser {
  id: string;
  email: string;
  preferences?: {
    memoryEnabled?: boolean;
  };
}

export interface MemoryMessage {
  id: string;
  conversation_id: string;
  content: string;
  role: string;
  created_at: string;
  similarity?: number;
}

export interface Entity {
  id: string;
  entity_name: string;
  entity_type: string;
  attributes: Record<string, any>;
  user_id: string;
  created_at: string;
  updated_at: string;
}

const defaultContext: MemoryContext = {
  userMessage: '',
  recentMessages: [],
  relevantEntities: [],
  userProfile: null,
};

// Function to generate a unique user ID
export const generateUserId = (): string => {
  return uuidv4();
};

// Function to initialize a memory user with Supabase
export const initializeMemoryUser = async (): Promise<MemoryUser | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data } = await supabase
        .from('memory_users')
        .select('*')
        .eq('auth_id', user.id)
        .single();

      return {
        id: user.id,
        email: user.email || 'default@example.com',
        preferences: data?.preferences || { memoryEnabled: true }
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

// Function to save user message and assistant response to chat history
export const saveChatHistory = async (
  chatId: string,
  userId: string,
  message: string,
  response: string
): Promise<void> => {
  try {
    const { error: messageError } = await supabase
      .from('messages')
      .insert([
        { chat_id: chatId, user_id: userId, content: message, role: 'user' },
        { chat_id: chatId, user_id: userId, content: response, role: 'assistant' },
      ]);

    if (messageError) {
      console.error("Error saving messages:", messageError);
    }
  } catch (error) {
    console.error("Error saving chat history:", error);
  }
};

// Function to create a new chat
export const createChat = async (userId: string, title: string): Promise<{ id: string } | null> => {
  try {
    const { data, error } = await supabase
      .from('chats')
      .insert([{ user_id: userId, title: title }])
      .select('id')
      .single();

    if (error) {
      console.error("Error creating chat:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error creating chat:", error);
    return null;
  }
};

// Function to load chat history from Supabase
export const loadChatHistory = async (chatId: string): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error("Error fetching chat history:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error loading chat history:", error);
    return [];
  }
};

// Function to update chat title
export const updateChatTitle = async (chatId: string, title: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('chats')
      .update({ title: title })
      .eq('id', chatId);

    if (error) {
      console.error("Error updating chat title:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error updating chat title:", error);
    return false;
  }
};

// Function to create initial memory context
export const createInitialMemoryContext = (messageText: string): MemoryContext => {
  return {
    userMessage: messageText,
    recentMessages: [],
    relevantEntities: [],
    userProfile: null
  };
};

// Add the missing functions that are referenced in ChatRoom.tsx
export const retrieveMemoryContext = async (userId: string, message: string): Promise<MemoryContext> => {
  try {
    // Get recent messages
    const { data: recentMessagesData } = await supabase
      .from('memory_messages')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    const recentMessages = recentMessagesData?.map(msg => ({
      role: msg.role,
      content: msg.content,
    })) || [];

    // Get user profile
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    return {
      userMessage: message,
      recentMessages,
      relevantEntities: [],
      userProfile: userProfile || null
    };
  } catch (error) {
    console.error("Error retrieving memory context:", error);
    return createInitialMemoryContext(message);
  }
};

export const createConversation = async (
  userId: string,
  title: string,
  selectedFeature?: string
): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .insert([{
        user_id: userId,
        title,
        metadata: { feature: selectedFeature }
      }])
      .select('id')
      .single();

    if (error) {
      console.error("Error creating conversation:", error);
      return null;
    }

    return data?.id || null;
  } catch (error) {
    console.error("Error creating conversation:", error);
    return null;
  }
};

export const saveMessage = async (
  conversationId: string,
  content: string,
  role: 'user' | 'assistant'
): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('memory_messages')
      .insert([{
        conversation_id: conversationId,
        content,
        role
      }])
      .select('id')
      .single();

    if (error) {
      console.error("Error saving memory message:", error);
      return null;
    }

    return data?.id || null;
  } catch (error) {
    console.error("Error saving memory message:", error);
    return null;
  }
};

export const getConversationMessages = async (conversationId: string): Promise<MemoryMessage[]> => {
  try {
    const { data, error } = await supabase
      .from('memory_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error("Error fetching conversation messages:", error);
      return [];
    }

    return data?.map(msg => ({
      ...msg,
      created_at: msg.created_at || new Date().toISOString()
    })) || [];
  } catch (error) {
    console.error("Error getting conversation messages:", error);
    return [];
  }
};

// Adding functions for MemorySettings and ProfileEditor
export const deleteMemoryData = async (userId: string): Promise<boolean> => {
  try {
    // Delete memory messages
    await supabase
      .from('memory_messages')
      .delete()
      .eq('user_id', userId);
    
    // Delete conversations
    await supabase
      .from('conversations')
      .delete()
      .eq('user_id', userId);
      
    return true;
  } catch (error) {
    console.error("Error deleting memory data:", error);
    return false;
  }
};

export interface UserProfile {
  id?: string;
  user_id: string;
  farm_name?: string;
  farm_size?: number;
  farm_location?: string;
  crop_types?: string[];
  created_at?: string;
  updated_at?: string;
}

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    if (error) {
      if (error.code !== 'PGRST116') { // No rows returned is not an error for us
        console.error("Error fetching user profile:", error);
      }
      return null;
    }
    
    return data;
  } catch (error) {
    console.error("Error getting user profile:", error);
    return null;
  }
};

export const saveUserProfile = async (profile: UserProfile): Promise<UserProfile | null> => {
  try {
    // Check if profile exists
    const existing = await getUserProfile(profile.user_id);
    
    let result;
    
    if (existing) {
      // Update existing profile
      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          farm_name: profile.farm_name,
          farm_size: profile.farm_size,
          farm_location: profile.farm_location,
          crop_types: profile.crop_types,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', profile.user_id)
        .select()
        .single();
        
      if (error) {
        console.error("Error updating user profile:", error);
        return null;
      }
      
      result = data;
    } else {
      // Insert new profile
      const { data, error } = await supabase
        .from('user_profiles')
        .insert([{
          ...profile,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();
        
      if (error) {
        console.error("Error creating user profile:", error);
        return null;
      }
      
      result = data;
    }
    
    return result;
  } catch (error) {
    console.error("Error saving user profile:", error);
    return null;
  }
};
