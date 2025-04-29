
import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import ChatRoom from '@/components/chat/ChatRoom';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import ProfileEditor from '@/components/memory/ProfileEditor';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { UserCircle2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { initializeMemoryUser } from '@/services/memoryService';

const Index = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);
  const [showProfilePrompt, setShowProfilePrompt] = useState(false);
  const { chatId } = useParams();
  const { user } = useAuth();
  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  
  useEffect(() => {
    const checkUserProfile = async () => {
      if (user) {
        const memoryUser = await initializeMemoryUser();
        
        if (memoryUser) {
          // Check if user has completed their profile
          const { data, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', memoryUser.id);
            
          if (!error && (!data || data.length === 0)) {
            setShowProfilePrompt(true);
          }
        }
      }
    };
    
    checkUserProfile();
  }, [user]);
  
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
    <div className="flex h-screen bg-[#F8F8F4]">
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
        <main className="flex-1 overflow-hidden bg-[#F8F8F4]">
          <ChatRoom selectedFeature={selectedFeature} />
        </main>
        
        {/* Profile Prompt Dialog */}
        {showProfilePrompt && (
          <Dialog
            defaultOpen={true}
            onOpenChange={(open) => {
              if (!open) setShowProfilePrompt(false);
            }}
          >
            <DialogContent className="sm:max-w-md">
              <div className="p-4 text-center">
                <UserCircle2 className="w-10 h-10 mx-auto mb-3 text-primary" />
                <h3 className="text-base font-medium mb-2">Complete Your Business Profile</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Help Arina provide more personalized agricultural business advice by completing your profile.
                </p>
                <ProfileEditor onProfileUpdate={() => setShowProfilePrompt(false)} />
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
};

export default Index;
