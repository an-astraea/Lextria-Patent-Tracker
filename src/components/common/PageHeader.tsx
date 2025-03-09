import React from 'react';
import { PageHeaderProps } from '@/lib/types';
import { Building, FileText } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  description?: string;
  icon?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, description, icon }) => {
  const getIconComponent = (iconName: string | undefined) => {
    switch (iconName) {
      case 'Building':
        return <Building className="mr-2 h-4 w-4" />;
      case 'FileText':
        return <FileText className="mr-2 h-4 w-4" />;
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
