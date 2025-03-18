
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SearchFiltersProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  filters?: {
    name: string;
    options: Array<{ value: string | null; label: string }>;
    onFilter: (value: string | null) => void;
    activeFilter: string | null;
  }[];
}

const SearchFilters: React.FC<SearchFiltersProps> = ({ 
  onSearch, 
  placeholder = "Search...",
  filters = [] 
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = () => {
    onSearch(searchQuery);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <div className="relative flex-grow">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={placeholder}
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch();
            }
          }}
        />
      </div>
      
      <Button variant="secondary" onClick={handleSearch}>
        <Search className="mr-2 h-4 w-4" />
        Search
      </Button>
      
      {filters.map((filter, index) => (
        <DropdownMenu key={index}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="sm:w-auto">
              <Filter className="mr-2 h-4 w-4" />
              {filter.name}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {filter.options.map((option, optIndex) => (
              <DropdownMenuItem 
                key={optIndex} 
                onClick={() => filter.onFilter(option.value)}
                className={filter.activeFilter === option.value ? "bg-accent" : ""}
              >
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ))}
    </div>
  );
};

export default SearchFilters;
