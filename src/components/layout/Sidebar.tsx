
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Menu, MessageSquare, User } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { analysisFeatures } from '@/data/analysisFeatures';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar = ({ isOpen, setIsOpen }: SidebarProps) => {
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);
  
  const recentChats = [
    { id: 1, title: "Rice Cultivation Analysis", date: "2 days ago" },
    { id: 2, title: "Corn Market Forecast", date: "1 week ago" },
    { id: 3, title: "Coffee Bean SWOT Analysis", date: "2 weeks ago" }
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 z-40 flex flex-col w-72 bg-sidebar border-r border-sidebar-border transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } md:relative`}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-sidebar-border">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold text-sidebar-foreground">Arina</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-sidebar-foreground"
            onClick={() => setIsOpen(false)}
          >
            <Menu size={20} />
          </Button>
        </div>
        
        {/* New chat button */}
        <div className="p-4">
          <Button
            className="w-full bg-arina-medium hover:bg-arina-dark text-sidebar-foreground flex items-center justify-center gap-2"
            onClick={() => {
              // Handle new chat
            }}
          >
            <Plus size={16} /> New Chat
          </Button>
        </div>
        
        {/* Analysis features */}
        <ScrollArea className="flex-1 px-3">
          <div className="space-y-1 py-2">
            <h2 className="text-xs font-semibold text-sidebar-foreground/70 px-2 py-1">ANALYSIS FEATURES</h2>
            {analysisFeatures.map((feature) => (
              <Button
                key={feature.id}
                variant="ghost"
                className={`w-full justify-start text-left text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${
                  selectedFeature === feature.id ? 'bg-sidebar-accent' : ''
                }`}
                onClick={() => setSelectedFeature(feature.id)}
              >
                {feature.name}
              </Button>
            ))}
          </div>
          
          <Separator className="my-2 bg-sidebar-border" />
          
          {/* Chats section */}
          <div className="space-y-1 py-2">
            <div className="flex items-center px-2 py-1">
              <MessageSquare size={14} className="mr-2 text-sidebar-foreground/70" />
              <h2 className="text-xs font-semibold text-sidebar-foreground/70">RECENT CHATS</h2>
            </div>
            {recentChats.map((chat) => (
              <Button
                key={chat.id}
                variant="ghost"
                className="w-full justify-start text-left text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                <div className="truncate">
                  <span className="block text-sm">{chat.title}</span>
                  <span className="block text-xs text-sidebar-foreground/60">{chat.date}</span>
                </div>
              </Button>
            ))}
          </div>
        </ScrollArea>
        
        {/* User profile */}
        <div className="border-t border-sidebar-border p-4">
          <Button
            variant="ghost"
            className="w-full justify-start text-left text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex items-center"
          >
            <User size={18} className="mr-2" />
            <span>User Profile</span>
          </Button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
