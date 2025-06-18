
import React from 'react';
import { LayoutDashboard, FileText, Edit, Plus, Building2 } from 'lucide-react';
import Sidebar from '../../Sidebar';

interface DrafterSidebarProps {
  user: any;
  onLogout: () => void;
}

const DrafterSidebar: React.FC<DrafterSidebarProps> = ({ user, onLogout }) => {
  const drafterNavItems = [
    {
      label: 'Dashboard',
      icon: LayoutDashboard,
      href: '/dashboard',
    },
    {
      label: 'Company Dashboard',
      icon: Building2,
      href: '/company-dashboard',
    },
    {
      label: 'Patents',
      icon: FileText,
      href: '/patents',
    },
    {
      label: 'My Drafts',
      icon: Edit,
      href: '/drafts',
    },
    {
      label: 'Add Patent',
      icon: Plus,
      href: '/patents/add',
    }
  ];
  
  return (
    <Sidebar 
      navItems={drafterNavItems} 
      user={user} 
      onLogout={onLogout}
    />
  );
};

export default DrafterSidebar;
