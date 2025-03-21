
import React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import SidebarUser from './SidebarUser';
import SidebarNav from './SidebarNav';
import SidebarFooter from './SidebarFooter';
import { NavItem } from '@/types/NavItem';

interface DesktopSidebarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
  navItems: NavItem[];
  user?: {
    full_name?: string;
    role?: string;
  };
  onLogout?: () => void;
}

const DesktopSidebar: React.FC<DesktopSidebarProps> = ({
  isCollapsed,
  toggleSidebar,
  navItems,
  user,
  onLogout
}) => {
  return (
    <aside className={cn(
      "h-screen flex flex-col bg-white border-r border-border transition-all duration-300",
      isCollapsed ? "w-20" : "w-64"
    )}>
      {/* Logo and Close Button */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        {!isCollapsed && (
          <h2 className="text-xl font-bold text-black">PatentTrack</h2>
        )}
        <button
          className={cn(
            "p-2 rounded-md hover:bg-gray-100 text-gray-600",
            isCollapsed && "mx-auto"
          )}
          onClick={toggleSidebar}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <X className="h-5 w-5" /> : <X className="h-5 w-5" />}
        </button>
      </div>

      {/* User Info */}
      <SidebarUser user={user} isCollapsed={isCollapsed} />

      {/* Navigation Links */}
      <SidebarNav navItems={navItems} isCollapsed={isCollapsed} />

      {/* Footer */}
      <SidebarFooter onLogout={onLogout} isCollapsed={isCollapsed} />
    </aside>
  );
};

export default DesktopSidebar;
