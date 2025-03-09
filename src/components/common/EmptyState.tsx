
import React from 'react';
import { FileText, AlertTriangle, CheckCircle, Info, LucideIcon, Search } from 'lucide-react';

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ title, description, icon }) => {
  const getIcon = (): React.ReactNode => {
    switch (icon) {
      case 'FileText':
        return <FileText className="h-12 w-12 text-muted-foreground opacity-50" />;
      case 'AlertTriangle':
        return <AlertTriangle className="h-12 w-12 text-muted-foreground opacity-50" />;
      case 'CheckCircle':
        return <CheckCircle className="h-12 w-12 text-muted-foreground opacity-50" />;
      case 'Info':
        return <Info className="h-12 w-12 text-muted-foreground opacity-50" />;
      case 'Search':
        return <Search className="h-12 w-12 text-muted-foreground opacity-50" />;
      default:
        return <FileText className="h-12 w-12 text-muted-foreground opacity-50" />;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="mb-4">
        {getIcon()}
      </div>
      <h3 className="text-lg font-medium">{title}</h3>
      {description && <p className="mt-2 text-sm text-muted-foreground">{description}</p>}
    </div>
  );
};

export default EmptyState;
