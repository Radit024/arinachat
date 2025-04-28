
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
    <aside 
      className={`fixed inset-y-0 left-0 z-40 flex flex-col w-72 bg-arina-green border-r border-arina-medium transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } md:relative`}
    >
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-xl font-bold text-arina-cream">Arina</span>
      </div>
      
      <div className="p-4">
        <Button
          className="w-full bg-arina-medium hover:bg-arina-dark text-arina-cream flex items-center justify-center gap-2"
        >
          <Plus size={16} /> New Chat
        </Button>
      </div>
      
      <ScrollArea className="flex-1 px-3">
        <div className="space-y-1 py-2">
          <h2 className="text-xs font-semibold text-arina-cream/70 px-2 py-1">ANALYSIS FEATURES</h2>
          {analysisFeatures.map((feature) => (
            <Button
              key={feature.id}
              variant="ghost"
              className={`w-full justify-start text-left text-arina-cream hover:bg-arina-dark ${
                selectedFeature === feature.id ? 'bg-arina-dark' : ''
              }`}
              onClick={() => setSelectedFeature(feature.id)}
            >
              {feature.name}
            </Button>
          ))}
        </div>
        
        <Separator className="my-2 bg-arina-medium" />
        
        <div className="space-y-1 py-2">
          <div className="flex items-center px-2 py-1">
            <MessageSquare size={14} className="mr-2 text-arina-cream/70" />
            <h2 className="text-xs font-semibold text-arina-cream/70">RECENT CHATS</h2>
          </div>
          {recentChats.map((chat) => (
            <Button
              key={chat.id}
              variant="ghost"
              className="w-full justify-start text-left text-arina-cream hover:bg-arina-dark"
            >
              <div className="truncate">
                <span className="block text-sm">{chat.title}</span>
                <span className="block text-xs text-arina-cream/60">{chat.date}</span>
              </div>
            </Button>
          ))}
        </div>
      </ScrollArea>
      
      <div className="border-t border-arina-medium p-4">
        <Button
          variant="ghost"
          className="w-full justify-start text-left text-arina-cream hover:bg-arina-dark flex items-center"
        >
          <User size={18} className="mr-2" />
          <span>User Profile</span>
        </Button>
      </div>
    </aside>
  );
};

export default Sidebar;
