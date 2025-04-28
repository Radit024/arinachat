
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export interface ChatMessage {
  id?: string;
  chat_id: string;
  content: string;
  role: 'user' | 'assistant';
  created_at?: string;
}

export interface Chat {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export const createChat = async (title: string) => {
  const user = supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  try {
    const { data, error } = await supabase
      .from('chats')
      .insert([{ title }])
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
    return data || [];
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
    const { data, error } = await supabase
      .from('messages')
      .insert([{
        chat_id: chatId,
        content,
        role
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
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
