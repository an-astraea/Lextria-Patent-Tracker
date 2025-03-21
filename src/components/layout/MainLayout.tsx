
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Force sidebar to be visible on desktop
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
      {/* Mobile menu toggle button - always visible on mobile when sidebar exists */}
      {hasSidebar && isMobile && (
        <button 
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-50 p-2 bg-primary text-primary-foreground rounded-md shadow-md"
          aria-label="Toggle Menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      )}
      
      {/* Sidebar - always visible on desktop, conditionally visible on mobile */}
      {sidebarComponent && (
        <div className={cn(
          "h-full transition-all duration-300 ease-in-out",
          isMobile ? 
            (isSidebarOpen ? "fixed z-40 left-0" : "fixed z-40 -left-full") : 
            "relative w-auto"
        )}>
          {sidebarComponent}
        </div>
      )}
      
      {/* Main content */}
      <main className={cn(
        "flex-1 overflow-hidden transition-all duration-300",
        isMobile && hasSidebar ? "pt-14" : "" // Add padding top on mobile when sidebar exists
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
