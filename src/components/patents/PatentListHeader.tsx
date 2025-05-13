
import React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';

interface PatentListHeaderProps {
  userRole?: string;
  onSearch: (query: string, field?: string) => void;
}

const PatentListHeader: React.FC<PatentListHeaderProps> = ({ userRole, onSearch }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = React.useState('');
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  const handleSubmitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Patents</h1>
        {userRole === 'admin' && (
          <Button onClick={() => navigate('/patents/add')} className="sm:w-auto">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Patent
          </Button>
        )}
      </div>
      
      <form onSubmit={handleSubmitSearch} className="flex gap-2">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search patents..."
            className="pl-10"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
        <Button type="submit" variant="secondary">
          Search
        </Button>
      </form>
    </div>
  );
};

export default PatentListHeader;
