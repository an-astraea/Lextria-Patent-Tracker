
import React from 'react';
import { User } from 'lucide-react';

interface SidebarUserProps {
  user?: {
    full_name?: string;
    role?: string;
  };
  isCollapsed?: boolean;
}

const SidebarUser: React.FC<SidebarUserProps> = ({ user, isCollapsed }) => {
  if (!user) return null;

  if (isCollapsed) {
    return (
      <div className="p-4 border-b border-border flex justify-center">
        <User className="h-6 w-6 text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-4 border-b border-border">
      <div className="flex items-center gap-2">
        <User className="h-6 w-6 text-muted-foreground" />
        <div>
          <p className="font-medium">{user.full_name}</p>
          <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
        </div>
      </div>
    </div>
  );
};

export default SidebarUser;
