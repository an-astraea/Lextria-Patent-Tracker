
import React from 'react';
import { cn } from '@/lib/utils';
import { Badge, BadgeProps } from '@/components/ui/badge';
import { CheckCircle, Clock, AlertCircle, XCircle, DollarSign, FileBox, FileText } from 'lucide-react';

type Status = 'completed' | 'pending' | 'inProgress' | 'notStarted' | 'withdrawn' | 'sent' | 'received' | 'notSent' | 'partialPayment' | 'fullPayment';

interface StatusBadgeProps {
  status: Status | string;
  label?: string;
  showIcon?: boolean;
  className?: string;
  variant?: BadgeProps['variant'];
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  showIcon = true,
  className,
  variant: propVariant,
}) => {
  let displayLabel = label;
  let icon = CheckCircle;
  let color = 'bg-green-100 text-green-800 border-green-200';
  let defaultLabel = 'Status';
  
  // Set up configuration based on the status
  switch (status) {
    case 'completed':
      defaultLabel = 'Completed';
      icon = CheckCircle;
      color = 'bg-green-100 text-green-800 border-green-200';
      break;
    case 'pending':
      defaultLabel = 'Pending';
      icon = Clock;
      color = 'bg-orange-100 text-orange-800 border-orange-200';
      break;
    case 'inProgress':
      defaultLabel = 'In Progress';
      icon = AlertCircle;
      color = 'bg-blue-100 text-blue-800 border-blue-200';
      break;
    case 'notStarted':
      defaultLabel = 'Not Started';
      icon = XCircle;
      color = 'bg-gray-100 text-gray-800 border-gray-200';
      break;
    case 'withdrawn':
      defaultLabel = 'Withdrawn';
      icon = XCircle;
      color = 'bg-red-100 text-red-800 border-red-200';
      break;
    case 'sent':
      defaultLabel = 'Sent';
      icon = FileText;
      color = 'bg-blue-100 text-blue-800 border-blue-200';
      break;
    case 'received':
      defaultLabel = 'Received';
      icon = CheckCircle;
      color = 'bg-green-100 text-green-800 border-green-200';
      break;
    case 'notSent':
      defaultLabel = 'Not Sent';
      icon = FileBox;
      color = 'bg-gray-100 text-gray-800 border-gray-200';
      break;
    case 'partialPayment':
      defaultLabel = 'Partial Payment';
      icon = DollarSign;
      color = 'bg-amber-100 text-amber-800 border-amber-200';
      break;
    case 'fullPayment':
      defaultLabel = 'Full Payment';
      icon = DollarSign;
      color = 'bg-green-100 text-green-800 border-green-200';
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

  const variant = propVariant || (status === 'completed' ? 'outline' : 'outline');

  return (
    <Badge
      variant={variant}
      className={cn(
        'rounded-full px-3 py-1 text-xs font-medium flex items-center gap-1',
        color,
        className
      )}
    >
      {showIcon && <Icon className="h-3 w-3 mr-1" />}
      {displayLabel}
    </Badge>
  );
};

export default StatusBadge;
