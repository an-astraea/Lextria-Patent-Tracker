
import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, AlertCircle, XCircle } from 'lucide-react';

type Status = 'completed' | 'pending' | 'inProgress' | 'notStarted';

interface StatusBadgeProps {
  status: Status;
  label?: string;
  showIcon?: boolean;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  showIcon = true,
  className,
}) => {
  const statusConfig = {
    completed: {
      color: 'bg-green-100 text-green-800 border-green-200',
      icon: CheckCircle,
      defaultLabel: 'Completed',
    },
    pending: {
      color: 'bg-orange-100 text-orange-800 border-orange-200',
      icon: Clock,
      defaultLabel: 'Pending',
    },
    inProgress: {
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: AlertCircle,
      defaultLabel: 'In Progress',
    },
    notStarted: {
      color: 'bg-gray-100 text-gray-800 border-gray-200',
      icon: XCircle,
      defaultLabel: 'Not Started',
    },
  };

  const { color, icon: Icon, defaultLabel } = statusConfig[status];
  const displayLabel = label || defaultLabel;

  return (
    <Badge
      variant="outline"
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
