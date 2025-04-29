import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, MessageSquare, LogOut } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { analysisFeatures } from '@/data/analysisFeatures';
import { useAuth } from '@/contexts/AuthContext';
import { getChats, Chat } from '@/services/chatService';
import { Link, useNavigate } from 'react-router-dom';
import { format, isToday, isThisWeek, isThisMonth } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  selectedFeature: string | null;
  setSelectedFeature: (feature: string | null) => void;
}

const Sidebar = ({ isOpen, setIsOpen, selectedFeature, setSelectedFeature }: SidebarProps) => {
  const { user, signOut } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchChats = async () => {
      if (!user) return;
      const userChats = await getChats();
      setChats(userChats);
    };
    
    fetchChats();
    
    // Set up a real-time subscription
    const channel = supabase
      .channel('public:chats')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'chats' 
      }, () => {
        fetchChats();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const handleFeatureSelect = (featureId: string) => {
    setSelectedFeature(featureId);
  };
  
  const handleNewChat = () => {
    navigate('/chat');
  };
  
  // Organize chats by time periods
  const todayChats = chats.filter(chat => isToday(new Date(chat.created_at)));
  const last7DaysChats = chats.filter(chat => 
    !isToday(new Date(chat.created_at)) && 
    isThisWeek(new Date(chat.created_at))
  );
  const last30DaysChats = chats.filter(chat => 
    !isToday(new Date(chat.created_at)) && 
    !isThisWeek(new Date(chat.created_at)) && 
    isThisMonth(new Date(chat.created_at))
  );
  
  const renderChatList = (chatList: Chat[], title: string) => {
    if (chatList.length === 0) return null;
    
    return (
      <div className="space-y-1 py-1.5">
        <div className="flex items-center px-3 py-1">
          <MessageSquare size={13} className="mr-2 text-arina-cream/70" />
          <h2 className="text-xs font-medium uppercase text-arina-cream/70">{title}</h2>
        </div>
        {chatList.map((chat) => (
          <Button
            key={chat.id}
            variant="ghost"
            className="w-full justify-start text-left text-arina-cream hover:bg-arina-dark px-3 py-1.5 h-auto"
            asChild
          >
            <Link to={`/chat/${chat.id}`}>
              <div className="truncate">
                <span className="block text-sm">{chat.title}</span>
                <span className="block text-xs text-arina-cream/60">
                  {format(new Date(chat.created_at), 'MMM d, h:mm a')}
                </span>
              </div>
            </Link>
          </Button>
        ))}
      </div>
    );
  };

  // Apply different classes based on sidebar state
  const sidebarClasses = cn(
    "fixed inset-y-0 left-0 z-40 flex flex-col bg-arina-green border-r border-arina-medium transition-all duration-300 ease-in-out",
    isOpen 
      ? "w-64 translate-x-0" 
      : "w-0 -translate-x-full md:translate-x-0 md:w-0",
    "md:relative"
  );

  return (
    <aside className={sidebarClasses}>
      <div className={cn(
        "flex items-center justify-between px-4 py-3",
        !isOpen && "md:hidden"
      )}>
        <span className="text-base font-medium text-arina-cream whitespace-nowrap">Arina</span>
      </div>
      
      <div className={cn("p-3", !isOpen && "md:hidden")}>
        <Button
          className="w-full bg-arina-medium hover:bg-arina-dark text-arina-cream flex items-center justify-center gap-1.5 whitespace-nowrap py-1.5 h-8"
          onClick={handleNewChat}
        >
          <Plus size={15} /> New Chat
        </Button>
      </div>
      
      <ScrollArea className={cn("flex-1 px-2", !isOpen && "md:hidden")}>
        <div className="space-y-1 py-1.5">
          <h2 className="text-xs font-medium uppercase text-arina-cream/70 px-3 py-1">Analysis Features</h2>
          {analysisFeatures.map((feature) => (
            <Button
              key={feature.id}
              variant="ghost"
              className={`w-full justify-start text-left text-arina-cream hover:bg-arina-dark px-3 py-1.5 h-auto text-sm ${
                selectedFeature === feature.id ? 'bg-arina-dark' : ''
              }`}
              onClick={() => handleFeatureSelect(feature.id)}
            >
              {feature.name}
            </Button>
          ))}
        </div>
        
        <Separator className="my-2 bg-arina-medium" />
        
        {/* Chat history organized by time periods */}
        {renderChatList(todayChats, "Today")}
        {renderChatList(last7DaysChats, "Previous 7 days")}
        {renderChatList(last30DaysChats, "Previous 30 days")}
      </ScrollArea>
      
      <div className={cn("border-t border-arina-medium p-3", !isOpen && "md:hidden")}>
        {user && (
          <div className="mb-3 px-2">
            <div className="text-xs text-arina-cream">{user.email}</div>
          </div>
        )}
        <Button
          variant="ghost"
          className="w-full justify-start text-left text-arina-cream hover:bg-arina-dark flex items-center px-3 py-1.5 h-auto"
          onClick={signOut}
        >
          <LogOut size={14} className="mr-2" />
          <span className="text-sm">Sign Out</span>
        </Button>
      </div>
    </aside>
  );
};

export default Sidebar;
