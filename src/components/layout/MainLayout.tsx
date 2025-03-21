
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Menu } from 'lucide-react';

interface MainLayoutProps {
  children: React.ReactNode;
  sidebarComponent?: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, sidebarComponent }) => {
  const isMobile = useIsMobile();
  const hasSidebar = !!sidebarComponent;
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);
  
  // Force sidebar to be visible on desktop initially
  useEffect(() => {
    if (!isMobile) {
      setIsSidebarOpen(true);
    }
  }, [isMobile]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex min-h-screen h-screen bg-background">
      {/* Mobile menu toggle button - always visible on mobile */}
      {hasSidebar && isMobile && (
        <button 
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-50 p-2 bg-primary text-primary-foreground rounded-md shadow-md"
          aria-label="Toggle Menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      )}
      
      {/* Sidebar */}
      {sidebarComponent && (
        <aside className={cn(
          "transition-all duration-300 h-full",
          isMobile ? "fixed z-40 left-0" : "relative",
          isSidebarOpen ? "translate-x-0 opacity-100" : isMobile ? "-translate-x-full opacity-0" : "w-0 opacity-0",
          isMobile ? "shadow-xl" : ""
        )}>
          {sidebarComponent}
          
          {/* Sidebar toggle button for desktop */}
          {!isMobile && (
            <button 
              onClick={toggleSidebar}
              className={cn(
                "absolute top-4 -right-4 bg-primary text-primary-foreground rounded-full p-1 shadow-md",
                isSidebarOpen ? "rotate-0" : "rotate-180"
              )}
              aria-label={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
            >
              {isSidebarOpen ? '◀' : '▶'}
            </button>
          )}
        </aside>
      )}
      
      {/* Overlay for mobile sidebar */}
      {isMobile && isSidebarOpen && hasSidebar && (
        <div 
          className="fixed inset-0 bg-black/20 z-30"
          onClick={toggleSidebar}
        />
      )}
      
      {/* Main content */}
      <main className={cn(
        "flex-1 overflow-hidden transition-all duration-300",
        {
          "ml-0": isMobile || !isSidebarOpen,
        }
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
