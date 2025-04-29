
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, Share2, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
}

const Header = ({ toggleSidebar, isSidebarOpen }: HeaderProps) => {
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
      <div>
        <Button variant="outline" size="sm" className="flex items-center gap-1 h-6 text-xs">
          <Share2 size={12} /> Share
        </Button>
      </div>
    </header>
  );
};

export default Header;
