
import React from 'react';
import { LayoutDashboard, FileText, Users, CheckSquare, FileSpreadsheet, Upload, Database, DollarSign, Calculator } from 'lucide-react';
import Sidebar from './Sidebar';

interface AdminSidebarProps {
  onLogout?: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ onLogout }) => {
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
      label: 'Finance',
      icon: DollarSign,
      href: '/finance',
    },
    {
      label: 'Accounts',
      icon: Calculator,
      href: '/accounts',
    },
    {
      label: 'Client Dashboard',
      icon: FileSpreadsheet,
      href: '/clients',
    },
    {
      label: 'Bulk Upload',
      icon: Upload,
      href: '/bulk-upload',
    },
    {
      label: 'Sheets',
      icon: Database,
      href: '/sheets',
    },
  ];

  // Get user data from localStorage to display in the sidebar
  const userData = localStorage.getItem('user') 
    ? JSON.parse(localStorage.getItem('user')!) 
    : { full_name: 'Admin', role: 'admin' };

  return (
    <Sidebar 
      navItems={navItems} 
      user={userData}
      onLogout={onLogout}
    />
  );
};

export default AdminSidebar;
