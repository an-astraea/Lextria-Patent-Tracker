
import React from 'react';
import { LayoutDashboard, FileText, Users, CheckSquare, FileSpreadsheet } from 'lucide-react';
import Sidebar from './Sidebar';

const AdminSidebar: React.FC = () => {
  const navItems = [
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
    },
    {
      label: 'Approvals',
      icon: CheckSquare,
      href: '/approvals',
    },
    {
      label: 'Client Dashboard',
      icon: FileSpreadsheet,
      href: '/clients',
    },
  ];

  return (
    <Sidebar 
      navItems={navItems} 
      user={{
        full_name: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!).full_name : 'Admin',
        role: 'admin'
      }}
    />
  );
};

export default AdminSidebar;
