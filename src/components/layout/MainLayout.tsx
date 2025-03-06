
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import * as LucideIcons from 'lucide-react';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  // Get user from localStorage
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  
  // Auto-collapse sidebar on mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  }, [isMobile]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // If no user, redirect to login page
  useEffect(() => {
    if (!user && window.location.pathname !== '/') {
      navigate('/');
    }
  }, [user, navigate]);

  // If no user and not on login page, show nothing while redirecting
  if (!user && window.location.pathname !== '/') {
    return null;
  }

  // If on login page, just render children
  if (window.location.pathname === '/') {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile sidebar overlay backdrop */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30" 
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}
      
      {/* Sidebar */}
      <aside
        className={cn(
          "z-40 fixed md:relative h-full bg-sidebar-background border-r border-sidebar-border transition-all duration-300 ease-in-out",
          sidebarOpen 
            ? "w-64 translate-x-0" 
            : isMobile 
              ? "-translate-x-full w-64" 
              : "w-16 translate-x-0"
        )}
      >
        {/* Sidebar toggle button (visible only on desktop when collapsed) */}
        {!isMobile && !sidebarOpen && (
          <button 
            onClick={toggleSidebar}
            className="absolute right-0 top-16 -mr-3 h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md border border-border z-10"
            aria-label="Expand sidebar"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
        
        {/* Sidebar toggle button (visible when expanded) */}
        {sidebarOpen && !isMobile && (
          <button
            onClick={toggleSidebar}
            className="absolute right-0 top-16 -mr-3 h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md border border-border z-10"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
        
        {/* Logo area */}
        <div className={cn(
          "h-16 flex items-center border-b border-sidebar-border",
          sidebarOpen ? "justify-between px-4" : "justify-center px-2"
        )}>
          {sidebarOpen ? (
            <>
              <div className="flex items-center space-x-2 min-w-0">
                <div className="h-8 w-8 flex-shrink-0 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">P</div>
                <span className="font-semibold text-sidebar-foreground truncate">PatentTrack</span>
              </div>
              
              {/* Close button - only on mobile */}
              {isMobile && (
                <button 
                  onClick={toggleSidebar}
                  className="p-1 rounded-md hover:bg-muted"
                  aria-label="Close sidebar"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </>
          ) : (
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">P</div>
          )}
        </div>
        
        {/* Navigation links */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <SidebarNavItem 
            to="/dashboard" 
            icon="LayoutDashboard" 
            label="Dashboard" 
            expanded={sidebarOpen} 
          />
          <SidebarNavItem 
            to="/patents" 
            icon="FileText" 
            label="Patents" 
            expanded={sidebarOpen} 
          />
          
          {/* Admin only navigation */}
          {user?.role === 'admin' && (
            <>
              <SidebarNavItem 
                to="/employees" 
                icon="Users" 
                label="Employees" 
                expanded={sidebarOpen} 
              />
              <SidebarNavItem 
                to="/approvals" 
                icon="CheckCircle" 
                label="Approvals" 
                expanded={sidebarOpen} 
              />
            </>
          )}
          
          {/* Drafter specific navigation */}
          {user?.role === 'drafter' && (
            <SidebarNavItem 
              to="/drafts" 
              icon="PenTool" 
              label="My Drafts" 
              expanded={sidebarOpen} 
            />
          )}
          
          {/* Filer specific navigation */}
          {user?.role === 'filer' && (
            <SidebarNavItem 
              to="/filings" 
              icon="FilePlus" 
              label="My Filings" 
              expanded={sidebarOpen} 
            />
          )}
        </nav>
        
        {/* User info */}
        {user && (
          <div className={cn(
            "border-t border-sidebar-border p-3",
            sidebarOpen ? "px-4" : "px-2"
          )}>
            <div className={cn(
              "flex items-center",
              sidebarOpen ? "justify-between" : "justify-center"
            )}>
              <div className="flex items-center space-x-2 min-w-0">
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  {user.full_name?.charAt(0) || 'U'}
                </div>
                {sidebarOpen && (
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-sm font-medium truncate">{user.full_name}</span>
                    <span className="text-xs text-muted-foreground capitalize truncate">{user.role}</span>
                  </div>
                )}
              </div>
              
              {sidebarOpen && (
                <button
                  onClick={() => {
                    localStorage.removeItem('user');
                    navigate('/');
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground ml-2 flex-shrink-0"
                >
                  Logout
                </button>
              )}
            </div>
          </div>
        )}
      </aside>
      
      {/* Main content */}
      <main className="flex-1 overflow-y-auto bg-background p-6 w-full">
        {/* Mobile header with menu button */}
        {isMobile && (
          <div className="flex items-center justify-between mb-6">
            <button 
              onClick={toggleSidebar} 
              className="p-2 -ml-2 rounded-md hover:bg-muted"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="font-semibold">PatentTrack</div>
            <div className="w-5" /> {/* Spacer for alignment */}
          </div>
        )}
        
        {/* Page content */}
        <div className="container max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

// Helper component for sidebar navigation
const SidebarNavItem = ({ 
  to, 
  icon, 
  label, 
  expanded 
}: { 
  to: string; 
  icon: string; 
  label: string; 
  expanded: boolean;
}) => {
  const navigate = useNavigate();
  const isActive = window.location.pathname === to;
  
  // Get icon from Lucide icons
  const Icon = (LucideIcons as any)[icon] || LucideIcons.Circle;
  
  return (
    <button
      onClick={() => navigate(to)}
      className={cn(
        "w-full flex items-center space-x-3 px-3 py-2 rounded-md mb-1 transition-colors",
        isActive 
          ? "bg-sidebar-accent text-sidebar-accent-foreground" 
          : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
        !expanded && "justify-center"
      )}
    >
      <Icon className="h-5 w-5 flex-shrink-0" />
      {expanded && <span className="truncate">{label}</span>}
    </button>
  );
};

export default MainLayout;
