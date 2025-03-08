
import React, { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  description?: string; // Added for backward compatibility
  backButton?: boolean;
  action?: ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ 
  title, 
  subtitle,
  description, // Added for backward compatibility
  backButton = false,
  action
}) => {
  const navigate = useNavigate();
  
  // Use subtitle or description (for backward compatibility)
  const displaySubtitle = subtitle || description;
  
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-2">
        {backButton && (
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {displaySubtitle && <p className="text-muted-foreground">{displaySubtitle}</p>}
        </div>
      </div>
      
      {action && (
        <div>
          {action}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
