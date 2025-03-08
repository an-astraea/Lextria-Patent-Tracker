
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
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      navigate('/');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  if (isIndexPage) {
    return <MainLayout>{children}</MainLayout>;
  }

  if (!user) {
    return <MainLayout>{children}</MainLayout>;
  }

  if (user?.role === 'admin') {
    return (
      <MainLayout 
        sidebarComponent={
          <AdminSidebar onLogout={handleLogout} />
        }
      >
        {children}
      </MainLayout>
    );
  } else if (user?.role === 'drafter') {
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
  } else if (user?.role === 'filer') {
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

  return <MainLayout>{children}</MainLayout>;
};

export default MainLayoutWrapper;
