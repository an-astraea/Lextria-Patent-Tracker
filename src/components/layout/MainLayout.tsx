
import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface MainLayoutProps {
  children: React.ReactNode;
  sidebarComponent?: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, sidebarComponent }) => {
  const isMobile = useIsMobile();

  return (
    <div className="flex min-h-screen bg-background">
      {sidebarComponent}
      
      <main className="flex-1 w-full">
        <div className="min-h-screen p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
