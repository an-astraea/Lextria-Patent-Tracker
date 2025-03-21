
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

  return (
    <div className="flex min-h-screen h-screen bg-background">
      {/* Sidebar - always visible */}
      {hasSidebar && (
        <div className="fixed z-40 h-full">
          {sidebarComponent}
        </div>
      )}
      
      {/* Main content */}
      <main className={cn(
        "flex-1 overflow-hidden transition-all duration-300",
        isMobile ? "ml-0 pt-14" : (hasSidebar ? "ml-64" : "ml-0"),
      )}>
        <ScrollArea className="h-full w-full">
          <div className="p-6">
            {children}
          </div>
        </ScrollArea>
      </main>
    </div>
  );
};

export default MainLayout;
