
import React, { useState } from 'react';
import { Avatar } from '@/components/ui/avatar';
import { Copy, ThumbsUp, ThumbsDown, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

export interface ChatMessageProps {
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ sender, content, timestamp }) => {
  const isArina = sender === 'assistant';
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    toast({ title: "Copied to clipboard!" });
    
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };
  
  const handleLike = () => {
    setLiked(!liked);
    setDisliked(false);
  };
  
  const handleDislike = () => {
    setDisliked(!disliked);
    setLiked(false);
  };
  
  return (
    <div className="mb-6">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="flex-shrink-0 mt-1">
          <Avatar className={`w-8 h-8 ${isArina ? 'bg-arina-green' : 'bg-gray-500'}`}>
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
          
          <div className="text-gray-800">
            <p className="whitespace-pre-wrap">{content}</p>
          </div>
          
          {/* Message actions - only show for AI responses */}
          {isArina && (
            <div className="flex items-center gap-2 pt-1">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 px-2 text-gray-500 hover:text-gray-700"
                onClick={handleCopy}
              >
                {copied ? <Check size={14} className="mr-1 text-green-500" /> : <Copy size={14} className="mr-1" />}
                {copied ? "Copied" : "Copy"}
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className={`h-8 px-2 ${liked ? 'text-green-500' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={handleLike}
              >
                <ThumbsUp size={14} />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className={`h-8 px-2 ${disliked ? 'text-red-500' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={handleDislike}
              >
                <ThumbsDown size={14} />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
