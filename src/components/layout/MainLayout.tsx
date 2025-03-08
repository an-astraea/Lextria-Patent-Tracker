
import React from 'react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface MainLayoutProps {
  children: React.ReactNode;
  sidebarComponent?: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, sidebarComponent }) => {
  const isMobile = useIsMobile();
  const hasSidebar = !!sidebarComponent;

  return (
    <div className="flex min-h-screen h-screen bg-background overflow-hidden">
      {sidebarComponent}
      
      <main className={cn("flex-1 w-full overflow-auto", {
        "pl-0": !hasSidebar || isMobile
      })}>
        <div className="min-h-full p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
