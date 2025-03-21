
import React from 'react';
import { LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarFooterProps {
  onLogout?: () => void;
  isCollapsed?: boolean;
}

const SidebarFooter: React.FC<SidebarFooterProps> = ({ 
  onLogout, 
  isCollapsed = false 
}) => {
  if (!onLogout) return null;
  
  return (
    <div className="p-4 mt-auto border-t border-border">
      <button
        className={cn(
          "w-full flex items-center px-3 py-2.5 text-muted-foreground hover:text-foreground rounded-md hover:bg-secondary",
          isCollapsed && "justify-center"
        )}
        onClick={onLogout}
      >
        <LogOut className="h-5 w-5" />
        {!isCollapsed && <span className="ml-3">Logout</span>}
      </button>
    </div>
  );
};

export default SidebarFooter;
