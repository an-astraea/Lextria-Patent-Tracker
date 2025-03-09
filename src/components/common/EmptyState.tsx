
import React, { ReactNode } from 'react';
import { FileQuestion } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  message: string;
  icon?: ReactNode;
  action?: ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({ 
  title = 'No data found', 
  message, 
  icon,
  action
}) => {
  return (
    <div className="text-center p-8 border rounded-lg bg-background flex flex-col items-center gap-4">
      <div className="text-muted-foreground">
        {icon || <FileQuestion className="h-16 w-16 mx-auto opacity-20" />}
      </div>
      <div>
        <h3 className="text-lg font-medium">{title}</h3>
        <p className="text-muted-foreground mt-1">{message}</p>
      </div>
      {action && (
        <div className="mt-2">
          {action}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
