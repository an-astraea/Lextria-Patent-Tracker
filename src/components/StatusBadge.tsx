
import React from 'react';
import { cn } from '@/lib/utils';
import { Badge, BadgeProps } from '@/components/ui/badge';
import { CheckCircle, Clock, AlertCircle, XCircle, AlertTriangle } from 'lucide-react';

type Status = 'completed' | 'pending' | 'inProgress' | 'notStarted' | 'withdrawn';

interface StatusBadgeProps {
  status: Status | string;
  label?: string;
  showIcon?: boolean;
  className?: string;
  variant?: BadgeProps['variant'];
  children?: React.ReactNode;
  size?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  showIcon = true,
  className,
  variant: propVariant,
  children,
  size,
}) => {
  let displayLabel = label;
  let icon = CheckCircle;
  let color = 'bg-green-100 text-green-800 border-green-200';
  let defaultLabel = 'Status';
  
  // Set up configuration based on the status
  switch (status) {
    case 'completed':
    case 'Completed':
      defaultLabel = 'Completed';
      icon = CheckCircle;
      color = 'bg-green-100 text-green-800 border-green-200';
      break;
    case 'pending':
    case 'Pending':
      defaultLabel = 'Pending';
      icon = Clock;
      color = 'bg-orange-100 text-orange-800 border-orange-200';
      break;
    case 'inProgress':
    case 'In Progress':
      defaultLabel = 'In Progress';
      icon = AlertCircle;
      color = 'bg-blue-100 text-blue-800 border-blue-200';
      break;
    case 'notStarted':
    case 'Not Started':
      defaultLabel = 'Not Started';
      icon = XCircle;
      color = 'bg-gray-100 text-gray-800 border-gray-200';
      break;
    case 'withdrawn':
    case 'Withdrawn':
      defaultLabel = 'Withdrawn';
      icon = AlertTriangle;
      color = 'bg-red-100 text-red-800 border-red-200';
      break;
    case 'PS Draft':
    case 'PS Filing':
    case 'CS Draft':
    case 'CS Filing':
    case 'FER Draft':
    case 'FER Filing':
      defaultLabel = status;
      icon = AlertCircle;
      color = 'bg-blue-100 text-blue-800 border-blue-200';
      break;
    default:
      // Default fallback for any other string values
      defaultLabel = status;
      break;
  }

  const Icon = icon;
  displayLabel = displayLabel || defaultLabel;

  // Use children content if provided
  const content = children || displayLabel;

  // Default to outline variant if not specified
  const variant = propVariant || (status === 'completed' ? 'outline' : 'outline');

  // Handle size variants
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5' : 'px-3 py-1 text-xs';

  return (
    <Badge
      variant={variant}
      className={cn(
        'rounded-full font-medium flex items-center gap-1',
        sizeClasses,
        color,
        className
      )}
    >
      {showIcon && <Icon className="h-3 w-3 mr-1" />}
      {content}
    </Badge>
  );
};

export default StatusBadge;
