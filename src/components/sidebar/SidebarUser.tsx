
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
        <User className="h-6 w-6 text-gray-600" />
      </div>
    );
  }

  return (
    <div className="p-4 border-b border-border">
      <div className="flex items-center gap-2">
        <User className="h-6 w-6 text-gray-600" />
        <div>
          <p className="font-medium text-gray-800">{user.full_name}</p>
          <p className="text-xs text-gray-500 capitalize">{user.role}</p>
        </div>
      </div>
    </div>
  );
};

export default SidebarUser;
