
import React from 'react';

interface LoadingStateProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({ 
  size = 'md', 
  text = 'Loading...',
  className = ''
}) => {
  const sizeClass = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  }[size];

  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div className={`animate-spin rounded-full border-b-2 border-primary ${sizeClass}`}></div>
      {text && <p className="text-muted-foreground text-sm">{text}</p>}
    </div>
  );
};

export default LoadingState;
