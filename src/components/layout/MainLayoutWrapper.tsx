
import React from 'react';
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
  console.log('isIndexPage:', isIndexPage);
  console.log('user:', user);

  // Login page doesn't need sidebar
  if (isIndexPage) {
    return <MainLayout>{children}</MainLayout>;
  }

  // Show loading state while checking authentication
  if (isLoading) {
    return <LoadingLayout />;
  }

  // Render layout based on user role
  if (user?.role === 'admin') {
    return (
      <MainLayout 
        sidebarComponent={<AdminSidebar onLogout={handleLogout} />}
      >
        {children}
      </MainLayout>
    );
  } else if (user?.role === 'drafter') {
    return (
      <MainLayout 
        sidebarComponent={<DrafterSidebar user={user} onLogout={handleLogout} />}
      >
        {children}
      </MainLayout>
    );
  } else if (user?.role === 'filer') {
    return (
      <MainLayout 
        sidebarComponent={<FilerSidebar user={user} onLogout={handleLogout} />}
      >
        {children}
      </MainLayout>
    );
  }

  // Fallback - use a default sidebar for any other roles or situations
  return (
    <MainLayout 
      sidebarComponent={
        <DefaultSidebar 
          user={user || { full_name: "Guest", role: "guest" }} 
          onLogout={handleLogout}
        />
      }
    >
      {children}
    </MainLayout>
  );
};

export default MainLayoutWrapper;
