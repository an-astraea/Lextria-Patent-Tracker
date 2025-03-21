
import React, { useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import MobileSidebar from './sidebar/MobileSidebar';
import DesktopSidebar from './sidebar/DesktopSidebar';
import { NavItem } from '@/types/NavItem';

interface SidebarProps {
  navItems: NavItem[];
  user?: {
    full_name?: string;
    role?: string;
  };
  onLogout?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ navItems, user, onLogout }) => {
  // Default to expanded sidebar (isCollapsed = false)
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(true); // Default to open on mobile
  const isMobile = useIsMobile();

  const toggleSidebar = () => {
    if (isMobile) {
      setIsMobileOpen(!isMobileOpen);
    } else {
      setIsCollapsed(!isCollapsed);
    }
  };

  const closeMobileSidebar = () => {
    if (isMobile) {
      setIsMobileOpen(false);
    }
  };

  return (
    <div className="h-full flex">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <DesktopSidebar
          isCollapsed={isCollapsed}
          toggleSidebar={toggleSidebar}
          navItems={navItems}
          user={user}
          onLogout={onLogout}
        />
      )}

      {/* Mobile Sidebar */}
      {isMobile && (
        <MobileSidebar
          isOpen={isMobileOpen}
          onClose={closeMobileSidebar}
          navItems={navItems}
          user={user}
          onLogout={onLogout}
        />
      )}
    </div>
  );
};

export default Sidebar;
