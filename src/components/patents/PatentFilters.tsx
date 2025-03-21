
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import SearchFilters from '@/components/common/SearchFilters';

interface PatentFiltersProps {
  filters: {
    draftingStatus: string | null;
    filingStatus: string | null;
    ferStatus: string | null;
    clientId: string | null;
    patentStatus: string | null;
    dateRange: {
      start: string | null;
      end: string | null;
    };
  };
  setFilters: React.Dispatch<React.SetStateAction<{
    draftingStatus: string | null;
    filingStatus: string | null;
    ferStatus: string | null;
    clientId: string | null;
    patentStatus: string | null;
    dateRange: {
      start: string | null;
      end: string | null;
    };
  }>>;
  searchFields: Array<{ value: string; label: string }>;
  onSearch: (query: string, field?: string) => void;
  getActiveFiltersCount: () => number;
}

const PatentFilters: React.FC<PatentFiltersProps> = ({ 
  filters, 
  setFilters, 
  searchFields, 
  onSearch,
  getActiveFiltersCount
}) => {
  return (
    <>
      <SearchFilters 
        onSearch={onSearch} 
        placeholder="Search patents..."
        searchFields={searchFields}
      />
      
      {getActiveFiltersCount() > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.patentStatus && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Status: {filters.patentStatus.replace('_', ' ')}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setFilters({...filters, patentStatus: null})}
                className="h-4 w-4 p-0 ml-1"
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {filters.draftingStatus && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Drafting: {filters.draftingStatus.replace('_', ' ')}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setFilters({...filters, draftingStatus: null})}
                className="h-4 w-4 p-0 ml-1"
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {filters.filingStatus && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Filing: {filters.filingStatus.replace('_', ' ')}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setFilters({...filters, filingStatus: null})}
                className="h-4 w-4 p-0 ml-1"
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {filters.ferStatus && (
            <Badge variant="secondary" className="flex items-center gap-1">
              FER: {filters.ferStatus}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setFilters({...filters, ferStatus: null})}
                className="h-4 w-4 p-0 ml-1"
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {filters.clientId && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Client: {filters.clientId}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setFilters({...filters, clientId: null})}
                className="h-4 w-4 p-0 ml-1"
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {(filters.dateRange.start || filters.dateRange.end) && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Date: {filters.dateRange.start || 'Any'} to {filters.dateRange.end || 'Any'}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setFilters({...filters, dateRange: {start: null, end: null}})}
                className="h-4 w-4 p-0 ml-1"
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
        </div>
      )}
    </>
  );
};

export default PatentFilters;
