
import React, { useState } from 'react';
import { Avatar } from '@/components/ui/avatar';
import { Copy, ThumbsUp, ThumbsDown, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

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
    <div className="mb-6 max-w-3xl mx-auto">
      {/* User message - right aligned with green background */}
      {!isArina && (
        <div className="flex flex-col items-end">
          <div className="flex items-center justify-end mb-1">
            <span className="text-xs text-gray-500 mr-2">{timestamp}</span>
            <span className="font-medium text-sm">You</span>
          </div>
          <div className="flex items-start gap-2">
            <div className="bg-[#0D472C] text-white p-3 rounded-lg max-w-[80%]">
              <p className="whitespace-pre-wrap">{content}</p>
            </div>
            <Avatar className="w-8 h-8 bg-gray-500 mt-1">
              <span className="text-white font-semibold">U</span>
            </Avatar>
          </div>
        </div>
      )}
      
      {/* Arina message - left aligned with white background */}
      {isArina && (
        <div className="flex flex-col items-start">
          <div className="flex items-center mb-1">
            <span className="font-medium text-sm">Arina</span>
            <span className="text-xs text-gray-500 ml-2">{timestamp}</span>
          </div>
          <div className="flex items-start gap-2">
            <Avatar className="w-8 h-8 bg-green-200 mt-1">
              <span className="text-green-800 font-semibold">A</span>
            </Avatar>
            <div className="bg-white border border-gray-200 p-3 rounded-lg shadow-sm max-w-[80%]">
              <p className="whitespace-pre-wrap text-gray-800">{content}</p>
              
              {/* Message actions */}
              <div className="flex items-center gap-2 pt-1 mt-2">
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
                  className={cn("h-8 px-2", liked ? "text-green-500" : "text-gray-500 hover:text-gray-700")}
                  onClick={handleLike}
                >
                  <ThumbsUp size={14} />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={cn("h-8 px-2", disliked ? "text-red-500" : "text-gray-500 hover:text-gray-700")}
                  onClick={handleDislike}
                >
                  <ThumbsDown size={14} />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
