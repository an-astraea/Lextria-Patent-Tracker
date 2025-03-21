
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
  console.log('MobileSidebar rendering with isOpen:', isOpen);
  
  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 h-full flex flex-col transition-transform duration-300 ease-in-out bg-white border-r border-border shadow-lg",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      {/* Mobile Sidebar Header */}
      <div className="p-4 flex items-center justify-between border-b border-border">
        <h2 className="text-xl font-bold text-black">PatentTrack</h2>
        <button
          className="p-2 rounded-md hover:bg-gray-100 text-gray-600"
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
