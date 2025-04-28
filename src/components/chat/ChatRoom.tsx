
import React, { useState, useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import ThinkingIndicator from './ThinkingIndicator';
import { useAuth } from '@/contexts/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { getChatMessages, sendMessage, ChatMessage as ChatMessageType } from '@/services/chatService';
import { Button } from '@/components/ui/button';
import { Plus, Settings } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { 
  initializeMemoryUser, 
  retrieveMemoryContext, 
  createConversation, 
  saveMessage,
  getConversationMessages
} from '@/services/memoryService';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import MemorySettings from '../memory/MemorySettings';

interface ChatRoomProps {
  selectedFeature: string | null;
}

const ChatRoom: React.FC<ChatRoomProps> = ({ selectedFeature }) => {
  const { user } = useAuth();
  const { chatId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [isNewChat, setIsNewChat] = useState(false);
  const [memoryUser, setMemoryUser] = useState<any>(null);
  const [memoryEnabled, setMemoryEnabled] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const initMemory = async () => {
      const memUser = await initializeMemoryUser();
      setMemoryUser(memUser);
      
      // Check user preferences for memory settings
      if (memUser?.preferences?.memoryEnabled !== undefined) {
        setMemoryEnabled(memUser.preferences.memoryEnabled);
      }
    };
    
    if (user) {
      initMemory();
    }
  }, [user]);
  
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
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages]);
  
  const handleSendMessage = async (content: string) => {
    if (!user) return;
    
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
        
        // Create conversation in memory system if memory is enabled
        if (memoryEnabled && memoryUser) {
          await createConversation(
            memoryUser.id,
            newChatTitle,
            selectedFeature || undefined
          );
        }
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
      
      // Save message to memory if enabled
      if (memoryEnabled && memoryUser && !isNewChat) {
        await saveMessage(currentChatId!, content, 'user');
      }
      
      // Show thinking indicator
      setIsThinking(true);
      
      // Retrieve memory context if enabled
      let memoryContext = {};
      if (memoryEnabled && memoryUser) {
        memoryContext = await retrieveMemoryContext(memoryUser.id, content);
      }
      
      // Call the AI edge function with the selected feature and memory context
      const response = await supabase.functions.invoke('chatWithAI', {
        body: { 
          messages: [...messages, newMessage],
          selectedFeature: selectedFeature,
          memoryContext: memoryEnabled ? memoryContext : null
        }
      });
      
      setIsThinking(false);
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      // Save AI response to the database
      const aiMessage = await sendMessage(
        currentChatId!, 
        response.data.response, 
        'assistant'
      );
      
      setMessages(prev => [...prev, aiMessage]);
      
      // Save AI response to memory if enabled
      if (memoryEnabled && memoryUser && !isNewChat) {
        await saveMessage(currentChatId!, response.data.response, 'assistant');
      }
      
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
  
  const handleToggleMemory = (enabled: boolean) => {
    setMemoryEnabled(enabled);
  };
  
  return (
    <div className="flex flex-col h-full bg-[#F8F8F4]">
      {messages.length === 0 && isNewChat ? (
        // Welcome screen when no messages exist
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <h1 className="text-3xl font-semibold mb-8 text-center">
            How can Arina help you today?
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl w-full">
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-start text-left"
              onClick={() => handleSendMessage("Analyze crop yield factors")}
            >
              <span className="font-medium mb-2">Analyze crop yield factors</span>
              <span className="text-sm text-gray-500">Get insights on what affects your crop yield</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-start text-left"
              onClick={() => handleSendMessage("Create a business forecast")}
            >
              <span className="font-medium mb-2">Create a business forecast</span>
              <span className="text-sm text-gray-500">Project your agricultural business growth</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-start text-left"
              onClick={() => handleSendMessage("Calculate ROI for new equipment")}
            >
              <span className="font-medium mb-2">Calculate ROI for new equipment</span>
              <span className="text-sm text-gray-500">Understand the return on your investments</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-start text-left"
              onClick={() => handleSendMessage("Compare crop performance")}
            >
              <span className="font-medium mb-2">Compare crop performance</span>
              <span className="text-sm text-gray-500">See which crops perform best in your conditions</span>
            </Button>
          </div>
        </div>
      ) : (
        // Chat messages when conversation has started
        <>
          <div className="border-b p-2 flex items-center justify-between">
            <h2 className="font-medium text-lg px-4">
              {isNewChat ? 'New Chat' : 'Chat'}
            </h2>
            <div className="flex items-center gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="flex items-center gap-1"
                  >
                    <Settings size={16} />
                    <span className="hidden md:inline">Memory Settings</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Memory Settings</DialogTitle>
                    <DialogDescription>
                      Control how Arina remembers your conversations and information.
                    </DialogDescription>
                  </DialogHeader>
                  <MemorySettings 
                    memoryUser={memoryUser}
                    memoryEnabled={memoryEnabled}
                    onToggleMemory={handleToggleMemory}
                  />
                </DialogContent>
              </Dialog>
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex items-center gap-1"
                onClick={handleNewChat}
              >
                <Plus size={16} />
                New Chat
              </Button>
            </div>
          </div>
          <ScrollArea className="flex-1 px-4 py-6" ref={scrollAreaRef}>
            <div>
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  sender={message.role}
                  content={message.content}
                  timestamp={new Date(message.created_at!).toLocaleTimeString()}
                />
              ))}
              {isThinking && <ThinkingIndicator />}
            </div>
          </ScrollArea>
        </>
      )}
      <ChatInput onSendMessage={handleSendMessage} />
    </div>
  );
};

export default ChatRoom;
