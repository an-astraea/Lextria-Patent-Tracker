
import React from 'react';
import { Menu, X } from 'lucide-react';
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
      "h-screen flex flex-col bg-sidebar border-r border-border transition-all duration-300",
      isCollapsed ? "w-20" : "w-64"
    )}>
      {/* Logo */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        {!isCollapsed && (
          <h2 className="text-xl font-semibold">PatentTrack</h2>
        )}
        <button
          className={cn(
            "p-2 rounded-md hover:bg-accent hover:text-accent-foreground",
            isCollapsed && "mx-auto"
          )}
          onClick={toggleSidebar}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
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
