
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
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const isMobile = useIsMobile();

  console.log('Sidebar rendering with isMobile:', isMobile);

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
    <>
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
        <>
          <MobileSidebar
            isOpen={isMobileOpen}
            onClose={closeMobileSidebar}
            navItems={navItems}
            user={user}
            onLogout={onLogout}
          />
          
          {/* Mobile Sidebar Trigger Button - Only visible on mobile */}
          <button
            onClick={() => setIsMobileOpen(true)}
            className="fixed z-30 top-4 left-4 p-2 rounded-md bg-white shadow-md"
            aria-label="Open sidebar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        </>
      )}
    </>
  );
};

export default Sidebar;
