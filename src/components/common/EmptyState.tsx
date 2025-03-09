
import React from 'react';
import { FileText, AlertTriangle, CheckCircle, Info, LucideIcon, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface EmptyStateProps {
  title: string;
  description?: string;
  message?: string; // Alternative to description for some components
  icon?: string;
  buttonText?: string;
  onButtonClick?: () => void | Promise<void>;
}

const EmptyState: React.FC<EmptyStateProps> = ({ 
  title, 
  description, 
  message, 
  icon,
  buttonText,
  onButtonClick
}) => {
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

  // Use message as fallback for description
  const displayDescription = description || message;

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="mb-4">
        {getIcon()}
      </div>
      <h3 className="text-lg font-medium">{title}</h3>
      {displayDescription && <p className="mt-2 text-sm text-muted-foreground">{displayDescription}</p>}
      
      {buttonText && onButtonClick && (
        <Button 
          onClick={onButtonClick} 
          className="mt-4"
          variant="outline"
        >
          {buttonText}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
