
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, Share2, Menu } from 'lucide-react';

interface HeaderProps {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
}

const Header = ({ toggleSidebar, isSidebarOpen }: HeaderProps) => {
  return (
    <header className="flex items-center justify-between p-4 border-b border-border bg-secondary">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          <Menu size={20} />
        </Button>
        <h1 className="text-lg font-semibold flex items-center">
          Arina Agro Insights <ChevronDown size={16} className="ml-1" />
        </h1>
      </div>
      <div>
        <Button variant="ghost" size="sm" className="flex items-center gap-1">
          <Share2 size={16} /> Share
        </Button>
      </div>
    </header>
  );
};

export default Header;
