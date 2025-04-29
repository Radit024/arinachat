import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Plus, Search, Mic } from 'lucide-react';
interface ChatInputProps {
  onSendMessage: (message: string) => void;
}
const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage
}) => {
  const [message, setMessage] = useState('');
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };
  return <div className="border-t border-gray-200 bg-white p-2">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="relative">
          <div className="flex items-center gap-1">
            
            
            <div className="relative flex-1 bg-gray-100 rounded-2xl">
              <Input value={message} onChange={e => setMessage(e.target.value)} placeholder="Ask anything" className="bg-transparent border-none shadow-none py-3 pl-3 pr-20 focus-visible:ring-0 focus-visible:ring-offset-0 text-xs" onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }} />
              
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                
                
                <Button type="submit" size="icon" variant="ghost" disabled={!message.trim()} className="h-5 w-5 rounded-full" aria-label="Send message">
                  <Send size={12} className={message.trim() ? "text-[#36a16e]" : "text-gray-400"} />
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>;
};
export default ChatInput;