
import React from 'react';

export interface LoadingStateProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  message?: string; // Added for backward compatibility
  className?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({ 
  size = 'md', 
  text,
  message = 'Loading...', // Added for backward compatibility
  className = ''
}) => {
  const sizeClass = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  }[size];
  
  // Use text or message (for backward compatibility)
  const displayText = text || message;

  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div className={`animate-spin rounded-full border-b-2 border-primary ${sizeClass}`}></div>
      {displayText && <p className="text-muted-foreground text-sm">{displayText}</p>}
    </div>
  );
};

export default LoadingState;
