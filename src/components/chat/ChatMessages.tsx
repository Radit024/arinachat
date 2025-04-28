
import React, { useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import ChatMessage from './ChatMessage';
import ThinkingIndicator from './ThinkingIndicator';
import { ChatMessage as ChatMessageType } from '@/services/chatService';

interface ChatMessagesProps {
  messages: ChatMessageType[];
  isThinking: boolean;
  isOffTopic: boolean;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({ messages, isThinking, isOffTopic }) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages]);
  
  return (
    <ScrollArea className="flex-1 px-4 md:px-20 py-4" ref={scrollAreaRef}>
      <div className="max-w-3xl mx-auto">
        {isOffTopic && (
          <Alert className="mb-4 bg-amber-50 border-amber-200">
            <AlertTitle>Topic-specific mode active</AlertTitle>
            <AlertDescription>
              Arina is currently in a specialized mode. Please ask questions relevant to the selected analysis feature.
            </AlertDescription>
          </Alert>
        )}
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
  );
};

export default ChatMessages;
