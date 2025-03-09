
import React from 'react';
import { Building, FileText, Users, ClipboardList, CheckSquare } from 'lucide-react';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  description?: string;
  icon?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, description, icon }) => {
  const getIconComponent = (iconName: string | undefined) => {
    switch (iconName) {
      case 'Building':
        return <Building className="mr-2 h-5 w-5" />;
      case 'FileText':
        return <FileText className="mr-2 h-5 w-5" />;
      case 'Users':
        return <Users className="mr-2 h-5 w-5" />;
      case 'ClipboardList':
        return <ClipboardList className="mr-2 h-5 w-5" />;
      case 'CheckSquare':
        return <CheckSquare className="mr-2 h-5 w-5" />;
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="mb-2 flex items-center">
        {icon && getIconComponent(icon)}
        <h1 className="text-3xl font-bold">{title}</h1>
      </div>
      {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
      {description && <p className="mt-2 text-sm text-gray-500">{description}</p>}
    </div>
  );
};

export default PageHeader;
