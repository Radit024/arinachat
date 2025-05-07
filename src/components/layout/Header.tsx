
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  ChevronDown, 
  Share2, 
  Menu, 
  UserCircle2,
  Settings,
  LayoutDashboard,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import ProfileEditor from '@/components/memory/ProfileEditor';
import MemorySettings from '@/components/memory/MemorySettings';

interface HeaderProps {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar, isSidebarOpen }) => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);
  const [isMemoryOpen, setIsMemoryOpen] = React.useState(false);
  
  // Extract first letter of email for avatar fallback
  const getInitials = () => {
    if (!user?.email) return 'U';
    return user.email.charAt(0).toUpperCase();
  };
  
  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };
  
  // Separate handlers for each dialog to prevent state conflicts
  const handleOpenProfileDialog = () => {
    setIsProfileOpen(true);
  };
  
  const handleOpenMemoryDialog = () => {
    setIsMemoryOpen(true);
  };
  
  const handleProfileDialogChange = (open: boolean) => {
    setIsProfileOpen(open);
  };
  
  const handleMemoryDialogChange = (open: boolean) => {
    setIsMemoryOpen(open);
  };
  
  return (
    <header className={cn(
      "flex items-center justify-between p-2 border-b border-border bg-[#E8F5E9]",
      !isSidebarOpen && "pl-3"
    )}>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="h-7 w-7 rounded-md hover:bg-[#d0e9d4]"
          aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          <Menu size={16} />
        </Button>
        <h1 className="text-sm font-medium flex items-center">
          Arina Agro Insights <ChevronDown size={12} className="ml-1" />
        </h1>
      </div>
      
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="flex items-center gap-1 h-6 text-xs">
          <Share2 size={12} /> Share
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 rounded-full p-0">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent align="end" className="w-56">
            {/* Business Profile - Uses separate dialog state */}
            <Dialog open={isProfileOpen} onOpenChange={handleProfileDialogChange}>
              <DialogTrigger asChild>
                <DropdownMenuItem onClick={handleOpenProfileDialog} onSelect={(e) => e.preventDefault()}>
                  <UserCircle2 className="mr-2 h-4 w-4" />
                  <span>Business Profile</span>
                </DropdownMenuItem>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <div className="p-2">
                  <h3 className="text-base font-medium mb-3">Your Business Profile</h3>
                  <ProfileEditor />
                </div>
              </DialogContent>
            </Dialog>
            
            <DropdownMenuItem>
              <LayoutDashboard className="mr-2 h-4 w-4" />
              <span>Account Dashboard</span>
            </DropdownMenuItem>
            
            {/* Memory Settings - Uses separate dialog state */}
            <Dialog open={isMemoryOpen} onOpenChange={handleMemoryDialogChange}>
              <DialogTrigger asChild>
                <DropdownMenuItem onClick={handleOpenMemoryDialog} onSelect={(e) => e.preventDefault()}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Memory Settings</span>
                </DropdownMenuItem>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <div className="p-2">
                  <h3 className="text-base font-medium mb-3">Memory Settings</h3>
                  <MemorySettings 
                    memoryUser={user} 
                    memoryEnabled={true}
                    onToggleMemory={() => {}}
                  />
                </div>
              </DialogContent>
            </Dialog>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
