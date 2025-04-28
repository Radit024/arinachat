
import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import ChatRoom from '@/components/chat/ChatRoom';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);
  const { chatId } = useParams();
  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  
  // Set up real-time subscription for messages
  useEffect(() => {
    if (!chatId) return;
    
    const channel = supabase
      .channel(`messages:${chatId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `chat_id=eq.${chatId}`
      }, (payload) => {
        console.log('New message:', payload.new);
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId]);
  
  return (
    <div className="flex h-screen bg-secondary">
      <Sidebar 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
        selectedFeature={selectedFeature}
        setSelectedFeature={setSelectedFeature}
      />
      
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${
        isSidebarOpen ? 'md:ml-0' : 'md:ml-0 w-full'
      }`}>
        <Header toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
        <main className="flex-1 overflow-hidden bg-white">
          <ChatRoom selectedFeature={selectedFeature} />
        </main>
      </div>
    </div>
  );
};

export default Index;
