
import React, { useState } from 'react';
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex min-h-screen h-screen bg-background">
      {sidebarComponent && (
        <div className={cn(
          "transition-all duration-300",
          isMobile ? "absolute z-50 h-full" : "relative",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          {sidebarComponent}
          
          {/* Sidebar toggle button for mobile */}
          {isMobile && (
            <button 
              onClick={toggleSidebar}
              className="absolute top-4 right-0 translate-x-full bg-primary text-primary-foreground rounded-r-md p-2"
            >
              {isSidebarOpen ? '◀' : '▶'}
            </button>
          )}
        </div>
      )}
      
      <main className={cn("flex-1 w-full", {
        "pl-0": !hasSidebar || isMobile || !isSidebarOpen
      })}>
        <div className="h-full overflow-auto">
          <div className="min-h-full p-6">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
