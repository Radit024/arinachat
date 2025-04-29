
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
      "flex items-center justify-between p-3 border-b border-border bg-arina-light",
      !isSidebarOpen && "pl-4"
    )}>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="h-8 w-8 rounded-md hover:bg-secondary"
          aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          <Menu size={18} />
        </Button>
        <h1 className="text-base font-medium flex items-center">
          Arina Agro Insights <ChevronDown size={14} className="ml-1" />
        </h1>
      </div>
      <div>
        <Button variant="outline" size="sm" className="flex items-center gap-1 h-8">
          <Share2 size={14} /> Share
        </Button>
      </div>
    </header>
  );
};

export default Header;
