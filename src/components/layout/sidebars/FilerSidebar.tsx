
import React from 'react';
import { LayoutDashboard, FileText, CheckSquare, UserCheck, Building2 } from 'lucide-react';
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
      label: 'My Filings',
      icon: CheckSquare,
      href: '/filings',
    },
    {
      label: 'Approvals',
      icon: UserCheck,
      href: '/approvals',
    },
    {
      label: 'Client Dashboard',
      icon: Building2,
      href: '/clients',
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
