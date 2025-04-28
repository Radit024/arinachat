
import React from 'react';
import ChatInput from './ChatInput';
import WelcomeScreen from './WelcomeScreen';
import ChatHeader from './ChatHeader';
import ChatMessages from './ChatMessages';
import { useChatRoom } from '@/hooks/useChatRoom';

interface ChatRoomProps {
  selectedFeature: string | null;
}

const ChatRoom: React.FC<ChatRoomProps> = ({ selectedFeature }) => {
  const {
    messages,
    isThinking,
    isNewChat,
    isOffTopic,
    handleSendMessage,
    handleNewChat
  } = useChatRoom(selectedFeature);
  
  return (
    <div className="flex flex-col h-full bg-white">
      {messages.length === 0 && isNewChat ? (
        // Welcome screen when no messages exist
        <WelcomeScreen onExampleClick={handleSendMessage} />
      ) : (
        // Chat messages when conversation has started
        <>
          <ChatHeader isNewChat={isNewChat} onNewChat={handleNewChat} />
          <ChatMessages 
            messages={messages} 
            isThinking={isThinking} 
            isOffTopic={isOffTopic} 
          />
        </>
      )}
      <ChatInput onSendMessage={handleSendMessage} />
    </div>
  );
};

export default ChatRoom;
