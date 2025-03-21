
import React from 'react';
import { LayoutDashboard, FileText, CheckSquare } from 'lucide-react';
import Sidebar from '../../Sidebar';

interface FilerSidebarProps {
  user: any;
  onLogout: () => void;
}

const FilerSidebar: React.FC<FilerSidebarProps> = ({ user, onLogout }) => {
  const filerNavItems = [
    {
      label: 'Dashboard',
      icon: LayoutDashboard,
      href: '/dashboard',
    },
    {
      label: 'Patents',
      icon: FileText,
      href: '/patents',
    },
    {
      label: 'My Filings',
      icon: CheckSquare,
      href: '/filings',
    }
  ];
  
  return (
    <Sidebar 
      navItems={filerNavItems} 
      user={user} 
      onLogout={onLogout}
    />
  );
};

export default FilerSidebar;
