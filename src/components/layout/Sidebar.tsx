
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, MessageSquare, LogOut } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { analysisFeatures } from '@/data/analysisFeatures';
import { useAuth } from '@/contexts/AuthContext';
import { getChats, Chat, deleteChat } from '@/services/chatService';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { format, isToday, isThisWeek, isThisMonth } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { 
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Share, Pencil, Archive, Trash2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

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
  const { chatId } = useParams();
  const [renamingChatId, setRenamingChatId] = useState<string | null>(null);
  const [newChatTitle, setNewChatTitle] = useState('');
  
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

  const handleDeleteChat = async (chatId: string) => {
    try {
      await deleteChat(chatId);
      toast({
        title: "Chat deleted",
        description: "Chat has been successfully deleted",
      });
      // If the deleted chat is the current one, navigate to chat home
      if (window.location.pathname.includes(chatId)) {
        navigate('/chat');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete chat",
        variant: "destructive",
      });
    }
  };

  const handleRenameChat = async (chatId: string) => {
    setRenamingChatId(chatId);
    const chat = chats.find(c => c.id === chatId);
    if (chat) {
      setNewChatTitle(chat.title);
    }
  };
  
  const handleSaveRename = async (chatId: string) => {
    if (!newChatTitle.trim()) {
      toast({
        title: "Error",
        description: "Chat title cannot be empty",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await supabase
        .from('chats')
        .update({ title: newChatTitle })
        .eq('id', chatId);
        
      setRenamingChatId(null);
      setNewChatTitle('');
      
      toast({
        title: "Chat renamed",
        description: "Chat has been successfully renamed",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to rename chat",
        variant: "destructive",
      });
    }
  };
  
  const handleShareChat = (chatId: string) => {
    // Create a shareable URL for the chat
    const shareUrl = `${window.location.origin}/chat/${chatId}`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        toast({
          title: "Link copied",
          description: "Chat link has been copied to clipboard",
        });
      })
      .catch(() => {
        toast({
          title: "Error",
          description: "Failed to copy chat link",
          variant: "destructive",
        });
      });
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
          <ContextMenu key={chat.id}>
            <ContextMenuTrigger>
              <Button
                variant="ghost"
                className={`w-full justify-start text-left text-arina-cream hover:bg-arina-dark px-3 py-1.5 h-auto ${
                  chatId === chat.id ? 'bg-arina-dark' : ''
                }`}
                asChild
              >
                <Link to={`/chat/${chat.id}`}>
                  <div className="truncate">
                    {renamingChatId === chat.id ? (
                      <div className="flex items-center w-full" onClick={(e) => e.preventDefault()}>
                        <input
                          type="text"
                          value={newChatTitle}
                          onChange={(e) => setNewChatTitle(e.target.value)}
                          className="flex-1 text-sm bg-arina-dark text-arina-cream border border-arina-medium rounded px-2 py-1"
                          autoFocus
                        />
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="ml-1 text-xs" 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleSaveRename(chat.id);
                          }}
                        >
                          Save
                        </Button>
                      </div>
                    ) : (
                      <span className="block text-sm">{chat.title}</span>
                    )}
                    <span className="block text-xs text-arina-cream/60">
                      {format(new Date(chat.created_at), 'MMM d, h:mm a')}
                    </span>
                  </div>
                </Link>
              </Button>
            </ContextMenuTrigger>
            <ContextMenuContent className="w-48">
              <ContextMenuItem 
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => handleShareChat(chat.id)}
              >
                <Share className="h-4 w-4" />
                <span>Share</span>
              </ContextMenuItem>
              <ContextMenuItem 
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => handleRenameChat(chat.id)}
              >
                <Pencil className="h-4 w-4" />
                <span>Rename</span>
              </ContextMenuItem>
              <ContextMenuItem className="flex items-center gap-2 cursor-pointer text-muted-foreground">
                <Archive className="h-4 w-4" />
                <span>Archive</span>
              </ContextMenuItem>
              <ContextMenuItem 
                className="flex items-center gap-2 cursor-pointer text-red-500 focus:text-red-500 focus:bg-red-50"
                onClick={() => handleDeleteChat(chat.id)}
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete</span>
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
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
