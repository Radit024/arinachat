
import React, { useState, useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import ChatMessage, { ChatMessageProps } from './ChatMessage';
import ChatInput from './ChatInput';
import ThinkingIndicator from './ThinkingIndicator';
import { analysisFeatures } from '@/data/analysisFeatures';

interface ChatRoomProps {
  selectedFeature: string | null;
}

const ChatRoom: React.FC<ChatRoomProps> = ({ selectedFeature }) => {
  const [messages, setMessages] = useState<ChatMessageProps[]>([
    {
      sender: 'assistant',
      content: "Hello! I'm Arina, your agricultural business analytics assistant. How can I help you today?",
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [isThinking, setIsThinking] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  // Simulate response when selecting a feature
  useEffect(() => {
    if (selectedFeature) {
      const feature = analysisFeatures.find(f => f.id === selectedFeature);
      if (feature) {
        setMessages(prev => [
          ...prev,
          {
            sender: 'assistant',
            content: feature.prompt,
            timestamp: new Date().toLocaleTimeString()
          }
        ]);
      }
    }
  }, [selectedFeature]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages]);
  
  const handleSendMessage = (content: string) => {
    // Add user message
    const newMessage: ChatMessageProps = {
      sender: 'user',
      content,
      timestamp: new Date().toLocaleTimeString()
    };
    setMessages(prev => [...prev, newMessage]);
    
    // Show thinking indicator
    setIsThinking(true);
    
    // Simulate AI response after delay
    setTimeout(() => {
      setIsThinking(false);
      const aiResponse: ChatMessageProps = {
        sender: 'assistant',
        content: getAIResponse(content),
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 2000);
  };
  
  // Basic response generator (placeholder)
  const getAIResponse = (message: string): string => {
    if (message.toLowerCase().includes('hello') || message.toLowerCase().includes('hi')) {
      return "Hello! How can I help you with your agricultural business analysis today?";
    } else if (message.toLowerCase().includes('help')) {
      return "I can help you with various agricultural business analytics. You can select one of the analysis features from the sidebar, or ask me specific questions about your agricultural business.";
    } else if (message.toLowerCase().includes('thank')) {
      return "You're welcome! Is there anything else you'd like to know about agricultural business analytics?";
    } else {
      return "Thank you for your input. I'll need more information to provide a comprehensive analysis. Could you please provide more details about your agricultural business, such as the type of crops, location, scale of operation, and your specific goals?";
    }
  };
  
  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="max-w-3xl mx-auto">
          {messages.map((message, index) => (
            <ChatMessage
              key={index}
              sender={message.sender}
              content={message.content}
              timestamp={message.timestamp}
            />
          ))}
          {isThinking && <ThinkingIndicator />}
        </div>
      </ScrollArea>
      <ChatInput onSendMessage={handleSendMessage} />
    </div>
  );
};

export default ChatRoom;
