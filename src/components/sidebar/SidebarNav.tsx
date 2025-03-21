
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { NavItem } from '@/types/NavItem';

interface SidebarNavProps {
  navItems: NavItem[];
  isCollapsed?: boolean;
  onItemClick?: () => void;
}

const SidebarNav: React.FC<SidebarNavProps> = ({ 
  navItems, 
  isCollapsed = false,
  onItemClick
}) => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
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
          onClick={onItemClick}
        >
          <item.icon className={cn(
            "h-5 w-5", 
            isActive(item.href) ? "" : "text-muted-foreground"
          )} />
          {!isCollapsed && <span className="ml-3">{item.label}</span>}
        </Link>
      ))}
    </nav>
  );
};

export default SidebarNav;
