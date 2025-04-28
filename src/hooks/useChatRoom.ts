
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { getChatMessages, sendMessage, ChatMessage } from '@/services/chatService';
import { toast } from '@/components/ui/use-toast';

export const useChatRoom = (selectedFeature: string | null) => {
  const { user } = useAuth();
  const { chatId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [isNewChat, setIsNewChat] = useState(false);
  const [isOffTopic, setIsOffTopic] = useState(false);

  useEffect(() => {
    if (!chatId) {
      setIsNewChat(true);
      setMessages([]);
      return;
    }
    
    setIsNewChat(false);
    
    const fetchMessages = async () => {
      if (chatId) {
        const chatMessages = await getChatMessages(chatId);
        setMessages(chatMessages);
      }
    };
    
    fetchMessages();
  }, [chatId]);

  const handleSendMessage = async (content: string) => {
    if (!user) return;
    
    // Reset off-topic flag
    setIsOffTopic(false);
    
    let currentChatId = chatId;
    
    if (isNewChat) {
      try {
        // Create a new chat
        const newChatTitle = content.substring(0, 30) + (content.length > 30 ? '...' : '');
        const { data: newChat, error } = await supabase
          .from('chats')
          .insert([{ 
            title: newChatTitle,
            user_id: user.id
          }])
          .select();
          
        if (error) throw error;
        currentChatId = newChat[0].id;
        navigate(`/chat/${currentChatId}`);
        setIsNewChat(false);
      } catch (error: any) {
        toast({
          title: 'Error creating chat',
          description: error.message,
          variant: 'destructive'
        });
        return;
      }
    }
    
    // Add user message
    try {
      const newMessage = await sendMessage(currentChatId!, content, 'user');
      setMessages(prev => [...prev, newMessage]);
      
      // Show thinking indicator
      setIsThinking(true);
      
      // Call the AI edge function with the selected feature
      const response = await supabase.functions.invoke('chatWithAI', {
        body: { 
          messages: [...messages, newMessage],
          selectedFeature: selectedFeature 
        }
      });
      
      setIsThinking(false);
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      // Check if the response indicates an off-topic message based on the selected feature
      if (response.data.response.includes("I can only discuss") || 
          response.data.response.includes("I can only assist with") || 
          response.data.response.includes("I can only perform") ||
          response.data.response.includes("I'm specialized in business topics")) {
        setIsOffTopic(true);
      }
      
      // Save AI response to the database
      const aiMessage = await sendMessage(
        currentChatId!, 
        response.data.response, 
        'assistant'
      );
      
      setMessages(prev => [...prev, aiMessage]);
      
    } catch (error: any) {
      setIsThinking(false);
      toast({
        title: 'Error',
        description: error.message || 'Failed to get AI response',
        variant: 'destructive'
      });
    }
  };

  const handleNewChat = () => {
    navigate('/chat');
  };

  return {
    messages,
    isThinking,
    isNewChat,
    isOffTopic,
    handleSendMessage,
    handleNewChat
  };
};
