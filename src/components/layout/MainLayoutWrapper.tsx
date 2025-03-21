
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import MainLayout from './MainLayout';
import AdminSidebar from '../AdminSidebar';
import Sidebar from '../Sidebar';
import { LayoutDashboard, FileText, Edit, CheckSquare } from 'lucide-react';
import { toast } from 'sonner';

const MainLayoutWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const isIndexPage = location.pathname === '/';

  useEffect(() => {
    console.log('MainLayoutWrapper useEffect');
    try {
      const storedUser = localStorage.getItem('user');
      console.log('Stored user:', storedUser);
      
      // Handle authentication logic
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        
        // Check if the user is trying to access a page they shouldn't have access to
        const currentPath = location.pathname;
        
        // Admin-only pages
        const adminOnlyPages = ['/employees', '/approvals', '/clients', '/bulk-upload'];
        
        // Prevent non-admins from accessing admin-only pages
        if (!parsedUser.role.includes('admin') && adminOnlyPages.some(page => currentPath.startsWith(page))) {
          console.log('Non-admin trying to access admin page:', currentPath);
          toast.error('You do not have permission to access this page');
          
          // Redirect based on role
          if (parsedUser.role === 'drafter') {
            navigate('/drafts');
          } else if (parsedUser.role === 'filer') {
            navigate('/filings');
          } else {
            navigate('/dashboard');
          }
        }
        
        // Drafter-only pages
        else if (parsedUser.role === 'filer' && currentPath.startsWith('/drafts')) {
          console.log('Filer trying to access drafter page:', currentPath);
          toast.error('You do not have permission to access this page');
          navigate('/filings');
        }
        
        // Filer-only pages
        else if (parsedUser.role === 'drafter' && currentPath.startsWith('/filings')) {
          console.log('Drafter trying to access filer page:', currentPath);
          toast.error('You do not have permission to access this page');
          navigate('/drafts');
        }
      } else if (!isIndexPage) {
        navigate('/');
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error getting user from localStorage:', error);
      if (!isIndexPage) {
        navigate('/');
      }
      setIsLoading(false);
    }
  }, [navigate, isIndexPage, location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  // Log current state for debugging
  console.log('isIndexPage:', isIndexPage);
  console.log('user:', user);
  console.log('current path:', location.pathname);

  // Login page doesn't need sidebar
  if (isIndexPage) {
    return <MainLayout>{children}</MainLayout>;
  }

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Handle case where user isn't logged in but we're not on index page
  if (!user && !isIndexPage) {
    navigate('/');
    return null;
  }

  // Add role-specific sidebar content
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
        icon: CheckSquare,
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

  // Fallback - use a default sidebar for any other roles or situations
  // This ensures there is always a sidebar
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
    }
  ];
    
  return (
    <MainLayout 
      sidebarComponent={
        <Sidebar 
          navItems={defaultNavItems} 
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
