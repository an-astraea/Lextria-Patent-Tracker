
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { patents } from '@/lib/data';
import { Patent, User } from '@/lib/types';
import PatentCard from '@/components/PatentCard';
import Sidebar from '@/components/Sidebar';
import { toast } from 'sonner';

const Patents = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [filteredPatents, setFilteredPatents] = useState<Patent[]>(patents);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/');
      return;
    }

    setUser(JSON.parse(storedUser));
  }, [navigate]);

  useEffect(() => {
    let result = [...patents];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        patent =>
          patent.tracking_id.toLowerCase().includes(query) ||
          patent.patent_title.toLowerCase().includes(query) ||
          patent.patent_applicant.toLowerCase().includes(query) ||
          patent.client_id.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      switch (statusFilter) {
        case 'complete':
          result = result.filter(patent => patent.ps_completion_status === 1 && patent.cs_completion_status === 1);
          break;
        case 'in-progress':
          result = result.filter(patent => 
            (patent.ps_drafting_status === 1 || patent.ps_filing_status === 1 || 
             patent.cs_drafting_status === 1 || patent.cs_filing_status === 1 ||
             patent.fer_drafter_status === 1 || patent.fer_filing_status === 1) &&
            !(patent.ps_completion_status === 1 && patent.cs_completion_status === 1)
          );
          break;
        case 'pending-review':
          result = result.filter(patent => 
            (patent.ps_drafting_status === 1 && patent.ps_review_draft_status === 0) || 
            (patent.ps_filing_status === 1 && patent.ps_review_file_status === 0) ||
            (patent.cs_drafting_status === 1 && patent.cs_review_draft_status === 0) ||
            (patent.cs_filing_status === 1 && patent.cs_review_file_status === 0) ||
            (patent.fer_drafter_status === 1 && patent.fer_review_draft_status === 0) ||
            (patent.fer_filing_status === 1 && patent.fer_review_file_status === 0)
          );
          break;
      }
    }

    setFilteredPatents(result);
  }, [searchQuery, statusFilter]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleDeletePatent = (id: string) => {
    // In a real app, this would call an API to delete the patent
    const updatedPatents = filteredPatents.filter(patent => patent.id !== id);
    setFilteredPatents(updatedPatents);
    toast.success('Patent deleted successfully');
  };

  return (
    <div className="flex min-h-screen bg-background">
      {user && <Sidebar user={user} onLogout={handleLogout} />}
      
      <div className="flex-1 p-6 md:p-8 md:ml-64 transition-all duration-300 ease-in-out">
        <div className="max-w-[1200px] mx-auto">
          <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Patents</h1>
              <p className="text-muted-foreground mt-1">
                Manage and track all your patent applications
              </p>
            </div>
            <Button onClick={() => navigate('/patents/add')}>
              <Plus className="mr-2 h-4 w-4" /> Add New Patent
            </Button>
          </header>

          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search patents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Patents</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="pending-review">Pending Review</SelectItem>
                <SelectItem value="complete">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filteredPatents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPatents.map((patent) => (
                <PatentCard
                  key={patent.id}
                  patent={patent}
                  onDelete={handleDeletePatent}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="bg-muted/30 rounded-full p-3 mb-4">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-medium mb-1">No patents found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || statusFilter !== 'all'
                  ? "Try adjusting your search or filter criteria"
                  : "Get started by adding your first patent"}
              </p>
              <Button onClick={() => navigate('/patents/add')}>
                <Plus className="mr-2 h-4 w-4" /> Add New Patent
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Patents;
