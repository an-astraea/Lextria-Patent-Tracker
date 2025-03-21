
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
          "w-full flex items-center px-4 py-2.5 text-gray-700 hover:text-gray-900 rounded-md hover:bg-gray-100",
          isCollapsed && "justify-center"
        )}
        onClick={onLogout}
      >
        <LogOut className="h-5 w-5 text-gray-600" />
        {!isCollapsed && <span className="ml-3">Logout</span>}
      </button>
    </div>
  );
};

export default SidebarFooter;
