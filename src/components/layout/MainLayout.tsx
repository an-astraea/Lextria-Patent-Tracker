
import React from 'react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { ScrollArea } from '@/components/ui/scroll-area';

interface MainLayoutProps {
  children: React.ReactNode;
  sidebarComponent?: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, sidebarComponent }) => {
  const isMobile = useIsMobile();
  const hasSidebar = !!sidebarComponent;

  console.log('MainLayout rendering with:', { hasSidebar, isMobile });

  return (
    <div className="flex min-h-screen h-screen w-full bg-background">
      {/* Sidebar - always visible when available */}
      {hasSidebar && (
        <div className="h-full z-30 flex-shrink-0 w-auto">
          {sidebarComponent}
        </div>
      )}
      
      {/* Main content */}
      <main className="flex-1 w-full min-w-0 overflow-hidden">
        <ScrollArea className="h-full w-full">
          <div className="w-full h-full min-h-screen p-0 m-0">
            {children}
          </div>
        </ScrollArea>
      </main>
    </div>
  );
};

export default MainLayout;
