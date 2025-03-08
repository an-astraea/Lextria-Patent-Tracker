
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LogOut,
  Menu,
  X,
  LucideIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface NavItem {
  label: string;
  icon: LucideIcon;
  href: string;
}

interface SidebarProps {
  navItems: NavItem[];
  user?: {
    full_name?: string;
    role?: string;
  };
  onLogout?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ navItems, user, onLogout }) => {
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);
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

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "h-full flex flex-col",
          isCollapsed ? "w-20" : "w-64",
          isMobile && "hidden"
        )}
      >
        {/* Navigation Links */}
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path || item.href}
              to={item.path || item.href}
              className={cn(
                "flex items-center px-3 py-2.5 rounded-md transition-all",
                isActive(item.path || item.href)
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-secondary text-foreground",
                isCollapsed ? "justify-center" : ""
              )}
              onClick={closeMobileSidebar}
            >
              <item.icon className={cn("h-5 w-5", isActive(item.path || item.href) ? "" : "text-muted-foreground")} />
              {!isCollapsed && <span className="ml-3">{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        {onLogout && (
          <div className="p-4 border-t border-border">
            <button
              className={cn(
                "w-full flex items-center px-3 py-2 text-muted-foreground hover:text-foreground",
                isCollapsed && "justify-center"
              )}
              onClick={onLogout}
            >
              <LogOut className="h-5 w-5" />
              {!isCollapsed && <span className="ml-2">Logout</span>}
            </button>
          </div>
        )}
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
            <button
              className="p-2 rounded-md hover:bg-accent hover:text-accent-foreground"
              onClick={toggleSidebar}
            >
              <X className="h-5 w-5" />
            </button>
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
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center px-3 py-2.5 rounded-md transition-all",
                  isActive(item.href)
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-secondary text-foreground"
                )}
                onClick={closeMobileSidebar}
              >
                <item.icon className={cn("h-5 w-5", isActive(item.href) ? "" : "text-muted-foreground")} />
                <span className="ml-3">{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Footer */}
          {onLogout && (
            <div className="p-4 border-t border-border">
              <button
                className="w-full flex items-center px-3 py-2 text-muted-foreground hover:text-foreground"
                onClick={onLogout}
              >
                <LogOut className="h-5 w-5" />
                <span className="ml-2">Logout</span>
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
