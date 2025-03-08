
import React, { useState } from 'react';
import { Sidebar } from '../ui/sidebar';
import { X, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface MainLayoutProps {
  children: React.ReactNode;
  sidebarComponent?: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, sidebarComponent }) => {
  const [collapsed, setCollapsed] = useState(false);
  const isMobile = useIsMobile();

  return (
    <div className="flex min-h-screen bg-background">
      <div
        className={cn(
          "fixed inset-y-0 z-10 border-r bg-background transition-all duration-300",
          collapsed ? "w-16" : "w-60",
          isMobile && "transform",
          isMobile && (collapsed ? "-translate-x-full" : "translate-x-0")
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex justify-between items-center px-4 h-16 border-b">
            <img
              src="/logo.png"
              alt="Logo"
              className={cn("h-8", collapsed && "mx-auto")}
            />
            <button
              onClick={() => setCollapsed(!collapsed)}
              className={cn(
                "p-2 rounded-md hover:bg-accent hover:text-accent-foreground",
                collapsed && "hidden"
              )}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 overflow-auto">
            {sidebarComponent || (
              <nav className="flex flex-col gap-2 p-3">
                {/* Default navigation would go here */}
              </nav>
            )}
          </div>
        </div>
      </div>

      <main
        className={cn(
          "flex-1 transition-all duration-300",
          collapsed ? "ml-16" : "ml-60",
          isMobile && "ml-0"
        )}
      >
        <header className="flex items-center h-16 px-4 border-b gap-4">
          {(isMobile || collapsed) && (
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-2 rounded-md hover:bg-accent hover:text-accent-foreground"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}
        </header>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
};

export default MainLayout;
