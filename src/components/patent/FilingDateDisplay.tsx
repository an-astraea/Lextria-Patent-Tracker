
import React from 'react';
import { formatDate } from '@/lib/utils';

interface FilingDateDisplayProps {
  date: string | null | undefined;
  className?: string;
}

const FilingDateDisplay: React.FC<FilingDateDisplayProps> = ({ date, className = '' }) => {
  return (
    <span className={className}>
      {formatDate(date)}
    </span>
  );
};

export default FilingDateDisplay;
