
import React from 'react';
import { Building, CheckSquare, FileText, Home, Landmark, LucideIcon, User, Users } from 'lucide-react';

export interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, description, icon }) => {
  const getIcon = (): React.ReactNode => {
    switch (icon) {
      case 'Home':
        return <Home className="h-5 w-5" />;
      case 'FileText':
        return <FileText className="h-5 w-5" />;
      case 'CheckSquare':
        return <CheckSquare className="h-5 w-5" />;
      case 'User':
        return <User className="h-5 w-5" />;
      case 'Users':
        return <Users className="h-5 w-5" />;
      case 'Building':
        return <Building className="h-5 w-5" />;
      case 'Landmark':
        return <Landmark className="h-5 w-5" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
          {icon && <span className="text-muted-foreground">{getIcon()}</span>}
          {title}
        </h2>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
    </div>
  );
};

export default PageHeader;
