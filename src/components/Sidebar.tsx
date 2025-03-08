
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LogOut,
  Menu,
  X,
  User,
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
      {/* Mobile Header Menu Button */}
      <div className={cn(
        "fixed top-0 left-4 z-50 h-16 flex items-center",
        !isMobile && "hidden"
      )}>
        <button
          className="p-2 rounded-md hover:bg-accent hover:text-accent-foreground"
          onClick={toggleSidebar}
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "h-full flex flex-col bg-sidebar border-r border-border",
          isCollapsed ? "w-20" : "w-64",
          isMobile && "hidden"
        )}
      >
        {/* Logo */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          {!isCollapsed && (
            <h2 className="text-xl font-semibold">PatentTrack</h2>
          )}
          <button
            className={cn(
              "p-2 rounded-md hover:bg-accent hover:text-accent-foreground",
              isCollapsed && "mx-auto"
            )}
            onClick={toggleSidebar}
          >
            {isCollapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
          </button>
        </div>

        {/* User Info */}
        {user && !isCollapsed && (
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <User className="h-6 w-6 text-muted-foreground" />
              <div>
                <p className="font-medium">{user.full_name}</p>
                <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
              </div>
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
                  : "hover:bg-secondary text-foreground",
                isCollapsed ? "justify-center" : ""
              )}
              onClick={closeMobileSidebar}
            >
              <item.icon className={cn("h-5 w-5", isActive(item.href) ? "" : "text-muted-foreground")} />
              {!isCollapsed && <span className="ml-3">{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        {onLogout && (
          <div className="p-4 border-t border-border">
            <button
              className={cn(
                "w-full flex items-center px-3 py-2.5 text-muted-foreground hover:text-foreground rounded-md hover:bg-secondary",
                isCollapsed && "justify-center"
              )}
              onClick={onLogout}
            >
              <LogOut className="h-5 w-5" />
              {!isCollapsed && <span className="ml-3">Logout</span>}
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
          "fixed inset-y-0 left-0 z-40 w-72 transition-transform duration-300 ease-in-out bg-sidebar border-r border-border",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Mobile Sidebar Header */}
          <div className="p-4 flex items-center justify-between border-b border-border">
            <h2 className="text-xl font-semibold">PatentTrack</h2>
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
              <div className="flex items-center gap-2">
                <User className="h-6 w-6 text-muted-foreground" />
                <div>
                  <p className="font-medium">{user.full_name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                </div>
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
                className="w-full flex items-center px-3 py-2.5 text-muted-foreground hover:text-foreground rounded-md hover:bg-secondary"
                onClick={onLogout}
              >
                <LogOut className="h-5 w-5" />
                <span className="ml-3">Logout</span>
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
