
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import MainLayout from './MainLayout';
import AdminSidebar from '../AdminSidebar';
import Sidebar from '../Sidebar';
import { LayoutDashboard, FileText, Edit } from 'lucide-react';

const MainLayoutWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const isIndexPage = location.pathname === '/';

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

  // Don't show sidebar on the index/login page
  if (isIndexPage) {
    return <MainLayout>{children}</MainLayout>;
  }

  if (!user) {
    return <MainLayout>{children}</MainLayout>;
  }

  if (user.role === 'admin') {
    return (
      <MainLayout 
        sidebarComponent={
          <AdminSidebar onLogout={handleLogout} />
        }
      >
        {children}
      </MainLayout>
    );
  } else if (user.role === 'drafter') {
    // Navigation items for drafters
    const drafterNavItems = [
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
        label: 'My Drafts',
        icon: Edit,
        href: '/drafts',
      }
    ];
    
    return (
      <MainLayout 
        sidebarComponent={
          <Sidebar 
            navItems={drafterNavItems} 
            user={user} 
            onLogout={handleLogout}
          />
        }
      >
        {children}
      </MainLayout>
    );
  } else if (user.role === 'filer') {
    // Navigation items for filers
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
        icon: FileText,
        href: '/filings',
      }
    ];
    
    return (
      <MainLayout 
        sidebarComponent={
          <Sidebar 
            navItems={filerNavItems} 
            user={user} 
            onLogout={handleLogout}
          />
        }
      >
        {children}
      </MainLayout>
    );
  }

  // Fallback for unknown roles
  return <MainLayout>{children}</MainLayout>;
};

export default MainLayoutWrapper;
