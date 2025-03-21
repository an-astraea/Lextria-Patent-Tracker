
import React from 'react';
import { LayoutDashboard, FileText, Users } from 'lucide-react';
import Sidebar from '../../Sidebar';

interface DefaultSidebarProps {
  user: any;
  onLogout: () => void;
}

const DefaultSidebar: React.FC<DefaultSidebarProps> = ({ user, onLogout }) => {
  const defaultNavItems = [
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
      label: 'Employees',
      icon: Users,
      href: '/employees',
    }
  ];
  
  return (
    <Sidebar 
      navItems={defaultNavItems} 
      user={user} 
      onLogout={onLogout}
    />
  );
};

export default DefaultSidebar;
