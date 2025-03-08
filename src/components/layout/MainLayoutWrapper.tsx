
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from './MainLayout';
import AdminSidebar from '../AdminSidebar';
import Sidebar from '../Sidebar';
import { Edit, FileText, User } from 'lucide-react';

const MainLayoutWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Get user from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      // If no user in localStorage, redirect to login
      navigate('/');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  if (!user) {
    return <MainLayout>{children}</MainLayout>;
  }

  if (user.role === 'admin') {
    return <MainLayout sidebarComponent={<AdminSidebar />}>{children}</MainLayout>;
  }

  // Default sidebar for drafter/filer roles
  const navItems = user.role === 'drafter' 
    ? [
        {
          label: 'Drafts',
          icon: Edit,
          href: '/drafts',
        },
        {
          label: 'Profile',
          icon: User,
          href: '/profile',
        },
      ]
    : [
        {
          label: 'Filings',
          icon: FileText,
          href: '/filings',
        },
        {
          label: 'Profile',
          icon: User,
          href: '/profile',
        },
      ];

  return (
    <MainLayout 
      sidebarComponent={
        <Sidebar 
          navItems={navItems} 
          user={user} 
          onLogout={handleLogout}
        />
      }
    >
      {children}
    </MainLayout>
  );
};

export default MainLayoutWrapper;
