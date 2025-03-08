
import React from 'react';
import { LayoutDashboard, FileText, Users, CheckSquare, Edit, FileSpreadsheet, File } from 'lucide-react';
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
      label: 'Drafts',
      icon: Edit,
      href: '/drafts',
    },
    {
      label: 'Filings',
      icon: File,
      href: '/filings',
    },
    {
      label: 'Client Dashboard',
      icon: FileSpreadsheet,
      href: '/clients',
    },
  ];

  return <Sidebar navItems={navItems} />;
};

export default AdminSidebar;
