
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export interface ChatMessage {
  id?: string;
  chat_id: string;
  content: string;
  role: 'user' | 'assistant';
  created_at?: string;
  user_id?: string;
}

export interface Chat {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export const createChat = async (title: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('chats')
      .insert([{ 
        title,
        user_id: user.id
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error: any) {
    toast({
      title: 'Error creating chat',
      description: error.message,
      variant: 'destructive'
    });
    throw error;
  }
};

export const getChats = async () => {
  try {
    const { data, error } = await supabase
      .from('chats')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error: any) {
    toast({
      title: 'Error fetching chats',
      description: error.message,
      variant: 'destructive'
    });
    return [];
  }
};

export const getChatMessages = async (chatId: string) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    // Ensure role is correctly typed as 'user' | 'assistant'
    const typedMessages = data.map(msg => ({
      ...msg,
      role: msg.role as 'user' | 'assistant'
    }));
    return typedMessages as ChatMessage[] || [];
  } catch (error: any) {
    toast({
      title: 'Error fetching messages',
      description: error.message,
      variant: 'destructive'
    });
    return [];
  }
};

export const sendMessage = async (chatId: string, content: string, role: 'user' | 'assistant') => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('messages')
      .insert([{
        chat_id: chatId,
        content,
        role,
        user_id: user.id
      }])
      .select()
      .single();

    if (error) throw error;
    // Ensure role is correctly typed
    return { ...data, role: data.role as 'user' | 'assistant' } as ChatMessage;
  } catch (error: any) {
    toast({
      title: 'Error sending message',
      description: error.message,
      variant: 'destructive'
    });
    throw error;
  }
};

export const deleteChat = async (chatId: string) => {
  try {
    const { error } = await supabase
      .from('chats')
      .delete()
      .eq('id', chatId);

    if (error) throw error;
  } catch (error: any) {
    toast({
      title: 'Error deleting chat',
      description: error.message,
      variant: 'destructive'
    });
    throw error;
  }
};
