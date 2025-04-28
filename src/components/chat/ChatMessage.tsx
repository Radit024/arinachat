
import React from 'react';
import { Avatar } from '@/components/ui/avatar';
import { Copy, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface ChatMessageProps {
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ sender, content, timestamp }) => {
  const isArina = sender === 'assistant';
  
  return (
    <div className={`mb-6 ${isArina ? '' : 'flex-row-reverse'}`}>
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="flex-shrink-0 mt-1">
          <Avatar className={`w-8 h-8 ${isArina ? 'bg-arina-green' : 'bg-arina-medium'}`}>
            <span className="text-white font-semibold">
              {isArina ? 'A' : 'U'}
            </span>
          </Avatar>
        </div>
        
        {/* Message content */}
        <div className="flex-grow space-y-1">
          <div className="flex items-center">
            <span className="font-medium text-sm">{isArina ? 'Arina' : 'You'}</span>
            <span className="text-xs text-gray-500 ml-2">{timestamp}</span>
          </div>
          
          <div className={`p-4 rounded-lg ${
            isArina ? 'bg-white' : 'bg-arina-light text-primary'
          }`}>
            <p className="whitespace-pre-wrap">{content}</p>
          </div>
          
          {/* Message actions */}
          <div className="flex items-center gap-2 pt-1">
            <Button variant="ghost" size="sm" className="h-8 px-2 text-gray-500 hover:text-gray-700">
              <Copy size={14} className="mr-1" /> Copy
            </Button>
            <Button variant="ghost" size="sm" className="h-8 px-2 text-gray-500 hover:text-gray-700">
              <ThumbsUp size={14} />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 px-2 text-gray-500 hover:text-gray-700">
              <ThumbsDown size={14} />
            </Button>
          </div>
          
          {/* Disclaimer for AI responses */}
          {isArina && (
            <div className="text-xs text-gray-500 italic mt-1">
              Arina can make mistakes. Please double-check responses.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
