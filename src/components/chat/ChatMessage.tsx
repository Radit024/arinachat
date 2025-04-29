
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
    <div className="mb-4 max-w-4xl mx-auto">
      {/* User message - right aligned with green background */}
      {!isArina && (
        <div className="flex flex-col items-end">
          <div className="flex items-center justify-end mb-1">
            <span className="text-xs text-gray-500 mr-2">{timestamp}</span>
            <span className="text-xs font-medium">You</span>
          </div>
          <div className="flex items-start gap-2">
            <div className="bg-[#0D472C] text-white p-2.5 rounded-lg max-w-[80%]">
              <p className="whitespace-pre-wrap text-sm">{content}</p>
            </div>
            <Avatar className="w-7 h-7 bg-gray-500">
              <span className="text-xs text-white font-semibold">U</span>
            </Avatar>
          </div>
        </div>
      )}
      
      {/* Arina message - left aligned with white background */}
      {isArina && (
        <div className="flex flex-col items-start">
          <div className="flex items-center mb-1">
            <span className="text-xs font-medium">Arina</span>
            <span className="text-xs text-gray-500 ml-2">{timestamp}</span>
          </div>
          <div className="flex items-start gap-2">
            <Avatar className="w-7 h-7 bg-green-200">
              <span className="text-xs text-green-800 font-semibold">A</span>
            </Avatar>
            <div className="bg-white border border-gray-200 p-2.5 rounded-lg shadow-sm max-w-[80%]">
              <p className="whitespace-pre-wrap text-sm text-gray-800">{content}</p>
              
              {/* Message actions */}
              <div className="flex items-center gap-1 pt-1 mt-1.5">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 px-1.5 text-xs text-gray-500 hover:text-gray-700"
                  onClick={handleCopy}
                >
                  {copied ? <Check size={12} className="mr-1 text-green-500" /> : <Copy size={12} className="mr-1" />}
                  {copied ? "Copied" : "Copy"}
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={cn("h-6 px-1.5", liked ? "text-green-500" : "text-gray-500 hover:text-gray-700")}
                  onClick={handleLike}
                >
                  <ThumbsUp size={12} />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={cn("h-6 px-1.5", disliked ? "text-red-500" : "text-gray-500 hover:text-gray-700")}
                  onClick={handleDislike}
                >
                  <ThumbsDown size={12} />
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
