
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface ChatHeaderProps {
  isNewChat: boolean;
  onNewChat: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ isNewChat, onNewChat }) => {
  return (
    <div className="border-b p-2 flex items-center justify-between">
      <h2 className="font-medium text-lg px-4">
        {isNewChat ? 'New Chat' : 'Chat'}
      </h2>
      <Button 
        variant="ghost" 
        size="sm" 
        className="flex items-center gap-1"
        onClick={onNewChat}
      >
        <Plus size={16} />
        New Chat
      </Button>
    </div>
  );
};

export default ChatHeader;
