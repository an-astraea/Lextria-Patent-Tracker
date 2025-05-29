
import React from 'react';

interface PatentResultsCountProps {
  filteredCount: number;
  totalCount: number;
  searchQuery?: string;
  hasActiveFilters: boolean;
}

const PatentResultsCount: React.FC<PatentResultsCountProps> = ({
  filteredCount,
  totalCount,
  searchQuery,
  hasActiveFilters
}) => {
  const getResultsText = () => {
    if (searchQuery || hasActiveFilters) {
      return `About ${filteredCount.toLocaleString()} results found${totalCount !== filteredCount ? ` out of ${totalCount.toLocaleString()} total patents` : ''}`;
    }
    return `Showing ${totalCount.toLocaleString()} patents`;
  };

  return (
    <div className="text-sm text-muted-foreground py-2 border-b">
      {getResultsText()}
      {searchQuery && (
        <span className="ml-2">
          for "<span className="font-medium">{searchQuery}</span>"
        </span>
      )}
    </div>
  );
};

export default PatentResultsCount;
