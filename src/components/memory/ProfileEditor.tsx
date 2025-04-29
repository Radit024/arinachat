
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { Edit2, Save, User } from 'lucide-react';
import { getUserProfile, saveUserProfile, initializeMemoryUser, UserProfile } from '@/services/memoryService';
import { Badge } from '@/components/ui/badge';

interface ProfileEditorProps {
  onProfileUpdate?: (profile: UserProfile) => void;
}

const ProfileEditor: React.FC<ProfileEditorProps> = ({ onProfileUpdate }) => {
  const [memoryUser, setMemoryUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    businessName: '',
    businessType: '',
    farmSize: '',
    location: '',
    crops: ''
  });
  
  useEffect(() => {
    const fetchUserData = async () => {
      const user = await initializeMemoryUser();
      if (user) {
        setMemoryUser(user);
        const userProfile = await getUserProfile(user.id);
        if (userProfile) {
          setProfile(userProfile);
          setFormData({
            businessName: userProfile.business_name || '',
            businessType: userProfile.business_type || '',
            farmSize: userProfile.farm_size ? String(userProfile.farm_size) : '',
            location: userProfile.location || '',
            crops: userProfile.main_crops ? userProfile.main_crops.join(', ') : ''
          });
        }
      }
    };
    
    fetchUserData();
  }, []);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!memoryUser) return;
    
    setIsLoading(true);
    
    try {
      // Parse crops as array and farm size as number
      const cropsArray = formData.crops
        .split(',')
        .map(crop => crop.trim())
        .filter(crop => crop !== '');
      
      const farmSizeNumber = formData.farmSize ? parseFloat(formData.farmSize) : undefined;
      
      const profileData = {
        business_name: formData.businessName,
        business_type: formData.businessType,
        farm_size: farmSizeNumber,
        location: formData.location,
        main_crops: cropsArray
      };
      
      const updatedProfile = await saveUserProfile(memoryUser.id, profileData);
      
      if (updatedProfile) {
        setProfile(updatedProfile);
        
        if (onProfileUpdate) {
          onProfileUpdate(updatedProfile);
        }
        
        toast({
          title: 'Profile updated',
          description: 'Your business profile has been updated successfully.',
        });
        
        setIsDialogOpen(false);
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error: any) {
      toast({
        title: 'Error updating profile',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">
            {profile ? (
              <>
                <Edit2 size={16} className="mr-2" /> Edit Business Profile
              </>
            ) : (
              <>
                <User size={16} className="mr-2" /> Complete Business Profile
              </>
            )}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Your Agricultural Business Profile</DialogTitle>
            <DialogDescription>
              Complete your profile to help Arina provide more personalized assistance.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name</Label>
              <Input
                id="businessName"
                name="businessName"
                value={formData.businessName}
                onChange={handleInputChange}
                placeholder="Your farm or business name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="businessType">Business Type</Label>
              <Input
                id="businessType"
                name="businessType"
                value={formData.businessType}
                onChange={handleInputChange}
                placeholder="e.g., Crop Farming, Dairy, Mixed Agriculture"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="farmSize">Farm Size (acres/hectares)</Label>
              <Input
                id="farmSize"
                name="farmSize"
                type="text"
                value={formData.farmSize}
                onChange={handleInputChange}
                placeholder="Size of your farm"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="Your farm location"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="crops">Main Crops or Products</Label>
              <Textarea
                id="crops"
                name="crops"
                value={formData.crops}
                onChange={handleInputChange}
                placeholder="Enter crops or products (comma separated)"
                rows={3}
              />
              <p className="text-sm text-gray-500">Separate each crop with a comma</p>
            </div>
            
            <div className="pt-4 flex justify-end">
              <Button type="submit" className="flex items-center" disabled={isLoading}>
                <Save size={16} className="mr-2" />
                {isLoading ? 'Saving...' : 'Save Profile'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      
      {profile && (
        <div className="border rounded-lg p-4 my-4 bg-gray-50 dark:bg-gray-900">
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-medium text-lg">{profile.business_name || 'Your Business'}</h3>
            <Button variant="ghost" size="sm" onClick={() => setIsDialogOpen(true)}>
              <Edit2 size={16} />
            </Button>
          </div>
          
          <div className="space-y-2">
            {profile.business_type && (
              <div>
                <span className="text-gray-500 text-sm">Business Type:</span>
                <p>{profile.business_type}</p>
              </div>
            )}
            
            {profile.farm_size && (
              <div>
                <span className="text-gray-500 text-sm">Farm Size:</span>
                <p>{profile.farm_size} acres/hectares</p>
              </div>
            )}
            
            {profile.location && (
              <div>
                <span className="text-gray-500 text-sm">Location:</span>
                <p>{profile.location}</p>
              </div>
            )}
            
            {profile.main_crops && profile.main_crops.length > 0 && (
              <div>
                <span className="text-gray-500 text-sm">Main Crops:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {profile.main_crops.map((crop, index) => (
                    <Badge key={index} variant="outline">
                      {crop}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ProfileEditor;
