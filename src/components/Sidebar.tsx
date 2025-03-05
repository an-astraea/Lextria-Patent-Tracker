
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Shield, 
  LogOut,
  Menu,
  X,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { User } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

interface SidebarProps {
  user: User | null;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ user, onLogout }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();
  const isMobile = useIsMobile();

  const toggleSidebar = () => {
    if (isMobile) {
      setIsMobileOpen(!isMobileOpen);
    } else {
      setIsCollapsed(!isCollapsed);
    }
  };

  const closeMobileSidebar = () => {
    if (isMobile) {
      setIsMobileOpen(false);
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/patents', label: 'Patents', icon: FileText },
    { path: '/employees', label: 'Employees', icon: Users },
    { path: '/approvals', label: 'Approvals', icon: Shield },
  ];

  return (
    <>
      {/* Mobile Trigger Button (Always Visible) */}
      <div className="fixed top-4 left-4 z-50">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={toggleSidebar}
        >
          <Menu className="h-6 w-6" />
        </Button>
      </div>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "fixed h-full z-40 transition-all duration-300 ease-in-out bg-sidebar border-r border-border shadow-lg",
          isCollapsed ? "w-20" : "w-64",
          isMobile ? "hidden" : "block"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-4 flex items-center justify-between border-b border-border">
            <div className={cn("flex items-center", isCollapsed && "justify-center w-full")}>
              {!isCollapsed && (
                <h2 className="text-xl font-semibold ml-2 tracking-tight">PatentTrack</h2>
              )}
              {isCollapsed && <FileText className="h-6 w-6" />}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className={cn(isMobile && "hidden")}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>

          {/* User Info */}
          {user && (
            <div className={cn(
              "p-4 border-b border-border",
              isCollapsed ? "flex justify-center" : "block"
            )}>
              {!isCollapsed ? (
                <div>
                  <p className="font-medium">{user.full_name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                  {user.full_name.charAt(0)}
                </div>
              )}
            </div>
          )}

          {/* Navigation Links */}
          <nav className="flex-1 px-2 py-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center px-3 py-2.5 rounded-md transition-all",
                  isActive(item.path)
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-secondary text-foreground",
                  isCollapsed ? "justify-center" : ""
                )}
                onClick={closeMobileSidebar}
              >
                <item.icon className={cn("h-5 w-5", isActive(item.path) ? "" : "text-muted-foreground")} />
                {!isCollapsed && <span className="ml-3">{item.label}</span>}
              </Link>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-border">
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start text-muted-foreground hover:text-foreground",
                isCollapsed && "justify-center"
              )}
              onClick={onLogout}
            >
              <LogOut className="h-5 w-5" />
              {!isCollapsed && <span className="ml-2">Logout</span>}
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar (Overlay) */}
      {isMobile && (
        <div
          className={cn(
            "fixed inset-0 bg-black/50 z-30 transition-opacity",
            isMobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
          onClick={closeMobileSidebar}
        />
      )}

      {/* Mobile Sidebar (Content) */}
      <aside
        className={cn(
          "fixed h-full z-40 transition-all duration-300 ease-in-out bg-sidebar border-r border-border shadow-lg w-64",
          isMobileOpen ? "translate-x-0" : "-translate-x-full",
          isMobile ? "block" : "hidden"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Mobile Sidebar Header */}
          <div className="p-4 flex items-center justify-between border-b border-border">
            <h2 className="text-xl font-semibold ml-2">PatentTrack</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* User Info */}
          {user && (
            <div className="p-4 border-b border-border">
              <div>
                <p className="font-medium">{user.full_name}</p>
                <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="flex-1 px-2 py-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center px-3 py-2.5 rounded-md transition-all",
                  isActive(item.path)
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-secondary text-foreground"
                )}
                onClick={closeMobileSidebar}
              >
                <item.icon className={cn("h-5 w-5", isActive(item.path) ? "" : "text-muted-foreground")} />
                <span className="ml-3">{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-border">
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground hover:text-foreground"
              onClick={onLogout}
            >
              <LogOut className="h-5 w-5" />
              <span className="ml-2">Logout</span>
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
