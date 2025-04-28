
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export interface UserProfile {
  id: string;
  business_name?: string;
  business_type?: string;
  farm_size?: number;
  location?: string;
  main_crops?: string[];
}

export interface MemoryUser {
  id: string;
  display_name?: string;
  email?: string;
  last_active?: string;
  preferences?: Record<string, any>;
}

export interface Conversation {
  id: string;
  title: string;
  analysis_type?: string;
  summary?: string;
  tags?: string[];
  created_at: string;
}

export interface MemoryMessage {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface Entity {
  id: string;
  entity_type: string;
  entity_name: string;
  attributes: Record<string, any>;
}

export interface SessionData {
  id: string;
  session_key: string;
  session_data: Record<string, any>;
  expires_at: string;
}

interface MemoryContext {
  user?: MemoryUser;
  profile?: UserProfile;
  recentMessages?: MemoryMessage[];
  relevantEntities?: Entity[];
}

// Function to create or get the current memory user from auth user
export const initializeMemoryUser = async (): Promise<MemoryUser | null> => {
  try {
    // Get current authenticated user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    
    // Update last active timestamp
    await supabase.rpc('update_last_active', { user_auth_id: user.id });
    
    // Get or create memory user
    const { data, error } = await supabase
      .from('memory_users')
      .select('*')
      .eq('auth_id', user.id)
      .single();
      
    if (error) {
      console.error('Error fetching memory user:', error);
      return null;
    }
    
    return data as MemoryUser;
  } catch (error: any) {
    console.error('Error initializing memory user:', error.message);
    return null;
  }
};

// Get user profile
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    if (error && error.code !== 'PGRST116') { // Not found error
      throw error;
    }
    
    return data as UserProfile;
  } catch (error: any) {
    console.error('Error fetching user profile:', error.message);
    return null;
  }
};

// Create or update user profile
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
        .update(profileData)
        .eq('user_id', userId)
        .select()
        .single();
        
      if (error) throw error;
      return data as UserProfile;
    } else {
      // Create new profile
      const { data, error } = await supabase
        .from('user_profiles')
        .insert([{ 
          user_id: userId,
          ...profileData
        }])
        .select()
        .single();
        
      if (error) throw error;
      return data as UserProfile;
    }
  } catch (error: any) {
    toast({
      title: 'Error saving profile',
      description: error.message,
      variant: 'destructive'
    });
    return null;
  }
};

// Create a new conversation
export const createConversation = async (
  userId: string,
  title: string,
  analysisType?: string
): Promise<Conversation | null> => {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .insert([{
        user_id: userId,
        title,
        analysis_type: analysisType
      }])
      .select()
      .single();
      
    if (error) throw error;
    return data as Conversation;
  } catch (error: any) {
    toast({
      title: 'Error creating conversation',
      description: error.message,
      variant: 'destructive'
    });
    return null;
  }
};

// Get all conversations for a user
export const getUserConversations = async (userId: string): Promise<Conversation[]> => {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data as Conversation[];
  } catch (error: any) {
    console.error('Error fetching conversations:', error.message);
    return [];
  }
};

// Save a message to memory
export const saveMessage = async (
  conversationId: string,
  content: string,
  role: 'user' | 'assistant'
): Promise<MemoryMessage | null> => {
  try {
    const { data, error } = await supabase
      .from('memory_messages')
      .insert([{
        conversation_id: conversationId,
        content,
        role
      }])
      .select()
      .single();
      
    if (error) throw error;
    
    // Generate and store embedding for the message
    if (data) {
      try {
        await supabase.functions.invoke('generateEmbedding', {
          body: { 
            text: content,
            messageId: data.id
          }
        });
      } catch (embeddingError) {
        console.error('Error generating embedding:', embeddingError);
        // Continue even if embedding fails
      }
    }
    
    return data as MemoryMessage;
  } catch (error: any) {
    console.error('Error saving message:', error.message);
    return null;
  }
};

// Get messages for a conversation
export const getConversationMessages = async (conversationId: string): Promise<MemoryMessage[]> => {
  try {
    const { data, error } = await supabase
      .from('memory_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
      
    if (error) throw error;
    return data as MemoryMessage[];
  } catch (error: any) {
    console.error('Error fetching conversation messages:', error.message);
    return [];
  }
};

// Store an entity
export const saveEntity = async (
  userId: string,
  entityType: string,
  entityName: string,
  attributes: Record<string, any> = {}
): Promise<Entity | null> => {
  try {
    // Check if entity exists
    const { data: existingEntities, error: fetchError } = await supabase
      .from('entities')
      .select('*')
      .eq('user_id', userId)
      .eq('entity_type', entityType)
      .eq('entity_name', entityName);
      
    if (fetchError) throw fetchError;
    
    if (existingEntities && existingEntities.length > 0) {
      // Update existing entity
      const updatedAttributes = {
        ...existingEntities[0].attributes,
        ...attributes
      };
      
      const { data, error } = await supabase
        .from('entities')
        .update({ attributes: updatedAttributes })
        .eq('id', existingEntities[0].id)
        .select()
        .single();
        
      if (error) throw error;
      return data as Entity;
    } else {
      // Create new entity
      const { data, error } = await supabase
        .from('entities')
        .insert([{
          user_id: userId,
          entity_type: entityType,
          entity_name: entityName,
          attributes
        }])
        .select()
        .single();
        
      if (error) throw error;
      return data as Entity;
    }
  } catch (error: any) {
    console.error('Error saving entity:', error.message);
    return null;
  }
};

// Get entities by type for a user
export const getUserEntities = async (
  userId: string,
  entityType?: string
): Promise<Entity[]> => {
  try {
    let query = supabase
      .from('entities')
      .select('*')
      .eq('user_id', userId);
      
    if (entityType) {
      query = query.eq('entity_type', entityType);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data as Entity[];
  } catch (error: any) {
    console.error('Error fetching entities:', error.message);
    return [];
  }
};

// Save session data
export const saveSessionData = async (
  userId: string,
  sessionKey: string,
  sessionData: Record<string, any>,
  expiresInMinutes: number = 60
): Promise<SessionData | null> => {
  try {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + expiresInMinutes);
    
    // Check if session exists
    const { data: existingSession, error: fetchError } = await supabase
      .from('user_session_data')
      .select('*')
      .eq('user_id', userId)
      .eq('session_key', sessionKey)
      .single();
      
    if (fetchError && fetchError.code !== 'PGRST116') { // Not found error
      throw fetchError;
    }
    
    if (existingSession) {
      // Update existing session
      const { data, error } = await supabase
        .from('user_session_data')
        .update({
          session_data: sessionData,
          expires_at: expiresAt.toISOString()
        })
        .eq('id', existingSession.id)
        .select()
        .single();
        
      if (error) throw error;
      return data as SessionData;
    } else {
      // Create new session
      const { data, error } = await supabase
        .from('user_session_data')
        .insert([{
          user_id: userId,
          session_key: sessionKey,
          session_data: sessionData,
          expires_at: expiresAt.toISOString()
        }])
        .select()
        .single();
        
      if (error) throw error;
      return data as SessionData;
    }
  } catch (error: any) {
    console.error('Error saving session data:', error.message);
    return null;
  }
};

// Get session data
export const getSessionData = async (
  userId: string,
  sessionKey: string
): Promise<SessionData | null> => {
  try {
    const { data, error } = await supabase
      .from('user_session_data')
      .select('*')
      .eq('user_id', userId)
      .eq('session_key', sessionKey)
      .gt('expires_at', new Date().toISOString())
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') {
        // Not found or expired
        return null;
      }
      throw error;
    }
    
    return data as SessionData;
  } catch (error: any) {
    console.error('Error fetching session data:', error.message);
    return null;
  }
};

// Function to retrieve memory context for the current user and query
export const retrieveMemoryContext = async (
  userId: string,
  query?: string
): Promise<MemoryContext> => {
  // Get user info
  const user = await initializeMemoryUser();
  if (!user) return {};
  
  // Get user profile
  const profile = await getUserProfile(userId);
  
  // Initialize memory context with basic data
  const context: MemoryContext = {
    user,
    profile
  };
  
  // If query is provided, try to find relevant messages and entities
  if (query && query.trim() !== '') {
    try {
      // Get embedding for the query
      const embeddingResponse = await supabase.functions.invoke('generateEmbedding', {
        body: { text: query }
      });
      
      if (embeddingResponse.data && embeddingResponse.data.embedding) {
        // Use the embedding to find similar messages
        const { data: similarMessages, error: searchError } = await supabase.rpc(
          'match_memory_messages',
          {
            query_embedding: embeddingResponse.data.embedding,
            similarity_threshold: 0.7,
            match_count: 5,
            user_id: userId
          }
        );
        
        if (!searchError && similarMessages && similarMessages.length > 0) {
          context.recentMessages = similarMessages;
        }
        
        // For demonstration - get some relevant entities
        // In a real implementation, this could be more sophisticated
        const { data: entities, error: entitiesError } = await supabase
          .from('entities')
          .select('*')
          .eq('user_id', userId)
          .limit(3);
          
        if (!entitiesError && entities && entities.length > 0) {
          context.relevantEntities = entities;
        }
      }
    } catch (error) {
      console.error('Error fetching memory context:', error);
      // Continue with what we have even if search fails
    }
  }
  
  return context;
};

// Clean up expired session data
export const cleanupExpiredSessions = async (): Promise<void> => {
  try {
    const { error } = await supabase
      .from('user_session_data')
      .delete()
      .lt('expires_at', new Date().toISOString());
      
    if (error) throw error;
  } catch (error: any) {
    console.error('Error cleaning up expired sessions:', error.message);
  }
};

// Delete memory data by type
export const deleteMemoryData = async (
  userId: string, 
  type: 'conversations' | 'entities' | 'sessions',
  itemId?: string
): Promise<boolean> => {
  try {
    let error;
    
    if (type === 'conversations') {
      if (itemId) {
        ({ error } = await supabase
          .from('conversations')
          .delete()
          .eq('id', itemId)
          .eq('user_id', userId));
      } else {
        ({ error } = await supabase
          .from('conversations')
          .delete()
          .eq('user_id', userId));
      }
    } else if (type === 'entities') {
      if (itemId) {
        ({ error } = await supabase
          .from('entities')
          .delete()
          .eq('id', itemId)
          .eq('user_id', userId));
      } else {
        ({ error } = await supabase
          .from('entities')
          .delete()
          .eq('user_id', userId));
      }
    } else if (type === 'sessions') {
      if (itemId) {
        ({ error } = await supabase
          .from('user_session_data')
          .delete()
          .eq('id', itemId)
          .eq('user_id', userId));
      } else {
        ({ error } = await supabase
          .from('user_session_data')
          .delete()
          .eq('user_id', userId));
      }
    }
    
    if (error) throw error;
    return true;
  } catch (error: any) {
    console.error(`Error deleting ${type}:`, error.message);
    toast({
      title: `Error deleting ${type}`,
      description: error.message,
      variant: 'destructive'
    });
    return false;
  }
};
