
import React, { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { deleteMemoryData } from '@/services/memoryService';

interface MemorySettingsProps {
  memoryUser: any;
  memoryEnabled: boolean;
  onToggleMemory: (enabled: boolean) => void;
}

const MemorySettings: React.FC<MemorySettingsProps> = ({ 
  memoryUser, 
  memoryEnabled,
  onToggleMemory 
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  
  const handleToggleMemory = async (checked: boolean) => {
    if (!memoryUser) return;
    
    try {
      // Update user preferences in database
      const { error } = await supabase
        .from('memory_users')
        .update({
          preferences: {
            ...memoryUser.preferences,
            memoryEnabled: checked
          }
        })
        .eq('id', memoryUser.id);
      
      if (error) throw error;
      
      onToggleMemory(checked);
      
      toast({
        title: checked ? 'Memory enabled' : 'Memory disabled',
        description: checked 
          ? 'Arina will now remember your conversations and preferences.'
          : 'Arina will not store your conversation history.',
      });
    } catch (error: any) {
      toast({
        title: 'Error updating settings',
        description: error.message,
        variant: 'destructive'
      });
    }
  };
  
  const handleDeleteMemory = async (type: 'conversations' | 'entities' | 'sessions') => {
    if (!memoryUser) return;
    
    setIsDeleting(true);
    
    try {
      const success = await deleteMemoryData(memoryUser.id, type);
      
      if (success) {
        toast({
          title: 'Memory deleted',
          description: `Your ${type} memory has been deleted successfully.`,
        });
      }
    } catch (error) {
      console.error('Error deleting memory:', error);
    } finally {
      setIsDeleting(false);
    }
  };
  
  if (!memoryUser) {
    return (
      <div className="p-4">
        <p>Loading memory settings...</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6 py-2">
      <div className="flex items-center justify-between">
        <div>
          <Label htmlFor="memory-switch" className="font-medium">Memory System</Label>
          <p className="text-sm text-gray-500">Enable Arina to remember past conversations and preferences</p>
        </div>
        <Switch 
          id="memory-switch"
          checked={memoryEnabled}
          onCheckedChange={handleToggleMemory}
        />
      </div>
      
      <div className="border-t pt-4">
        <h3 className="font-medium mb-2">Delete Memory Data</h3>
        <p className="text-sm text-gray-500 mb-4">
          You can delete specific types of memory data below. This action cannot be undone.
        </p>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Conversation Memory</p>
              <p className="text-sm text-gray-500">Past chat interactions and context</p>
            </div>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => handleDeleteMemory('conversations')}
              disabled={isDeleting}
            >
              <Trash2 size={16} className="mr-1" /> Delete
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Entity Memory</p>
              <p className="text-sm text-gray-500">Information about crops, equipment, etc.</p>
            </div>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => handleDeleteMemory('entities')}
              disabled={isDeleting}
            >
              <Trash2 size={16} className="mr-1" /> Delete
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Session Memory</p>
              <p className="text-sm text-gray-500">Temporary session information</p>
            </div>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => handleDeleteMemory('sessions')}
              disabled={isDeleting}
            >
              <Trash2 size={16} className="mr-1" /> Delete
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemorySettings;
