
import React, { useEffect } from 'react';
import MainLayout from './MainLayout';
import AdminSidebar from '../AdminSidebar';
import { useLayoutAuth } from '@/hooks/useLayoutAuth';
import LoadingLayout from './LoadingLayout';
import DrafterSidebar from './sidebars/DrafterSidebar';
import FilerSidebar from './sidebars/FilerSidebar';
import DefaultSidebar from './sidebars/DefaultSidebar';

const MainLayoutWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading, isIndexPage, handleLogout } = useLayoutAuth();

  // Log current state for debugging
  useEffect(() => {
    console.log('MainLayoutWrapper rendering with:', { 
      isIndexPage, 
      isLoading, 
      userRole: user?.role,
      path: window.location.pathname
    });
  }, [isIndexPage, isLoading, user]);

  // Login page doesn't need sidebar
  if (isIndexPage) {
    console.log('Rendering without sidebar (index page)');
    return (
      <div className="min-h-screen w-full">
        <MainLayout>{children}</MainLayout>
      </div>
    );
  }

  // Show loading state while checking authentication
  if (isLoading) {
    console.log('Rendering loading layout');
    return <LoadingLayout />;
  }

  console.log('Selecting sidebar based on role:', user?.role);

  // Render layout based on user role with proper container
  const renderWithSidebar = (sidebarComponent: React.ReactNode) => (
    <div className="min-h-screen w-full flex">
      <MainLayout sidebarComponent={sidebarComponent}>
        {children}
      </MainLayout>
    </div>
  );

  if (user?.role === 'admin') {
    return renderWithSidebar(<AdminSidebar onLogout={handleLogout} />);
  } else if (user?.role === 'drafter') {
    return renderWithSidebar(<DrafterSidebar user={user} onLogout={handleLogout} />);
  } else if (user?.role === 'filer') {
    return renderWithSidebar(<FilerSidebar user={user} onLogout={handleLogout} />);
  }

  // Fallback - use a default sidebar for any other roles or situations
  return renderWithSidebar(
    <DefaultSidebar 
      user={user || { full_name: "Guest", role: "guest" }} 
      onLogout={handleLogout}
    />
  );
};

export default MainLayoutWrapper;
