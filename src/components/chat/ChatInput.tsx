
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Paperclip, FileText } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage }) => {
  const [message, setMessage] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };
  
  return (
    <div className="border-t border-border bg-secondary p-4">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <div className="relative">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Reply to Arina..."
            className="min-h-[80px] resize-none pr-12 bg-white"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <Button 
            type="submit"
            size="sm"
            className="absolute bottom-2 right-2"
            disabled={!message.trim()}
          >
            <Send size={18} />
          </Button>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Button type="button" variant="ghost" size="sm">
              <Paperclip size={16} className="mr-1" /> Attach
            </Button>
            <Button type="button" variant="ghost" size="sm">
              <FileText size={16} className="mr-1" /> Format
            </Button>
          </div>
          <div className="text-xs text-gray-500">
            Use Shift+Enter for new line
          </div>
        </div>
      </form>
    </div>
  );
};

export default ChatInput;
