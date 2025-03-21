
import React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import SidebarUser from './SidebarUser';
import SidebarNav from './SidebarNav';
import SidebarFooter from './SidebarFooter';
import { NavItem } from '@/types/NavItem';

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  navItems: NavItem[];
  user?: {
    full_name?: string;
    role?: string;
  };
  onLogout?: () => void;
}

const MobileSidebar: React.FC<MobileSidebarProps> = ({
  isOpen,
  onClose,
  navItems,
  user,
  onLogout
}) => {
  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 w-72 h-full flex flex-col transition-transform duration-300 ease-in-out bg-sidebar border-r border-border",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      {/* Mobile Sidebar Header */}
      <div className="p-4 flex items-center justify-between border-b border-border">
        <h2 className="text-xl font-semibold">PatentTrack</h2>
        <button
          className="p-2 rounded-md hover:bg-accent hover:text-accent-foreground"
          onClick={onClose}
          aria-label="Close sidebar"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* User Info */}
      <SidebarUser user={user} />

      {/* Navigation Links */}
      <SidebarNav navItems={navItems} onItemClick={onClose} />

      {/* Footer */}
      <SidebarFooter onLogout={onLogout} />
    </aside>
  );
};

export default MobileSidebar;
