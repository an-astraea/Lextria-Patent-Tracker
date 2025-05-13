
import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { fetchPatents, deletePatent } from '@/lib/api';
import { toast } from 'sonner';
import { Patent } from '@/lib/types';
import { useAuth } from '@/hooks/useAuth';
import PatentListHeader from '@/components/patents/PatentListHeader';
import PatentListTabs from '@/components/patents/PatentListTabs';
import DeletePatentDialog from '@/components/patents/DeletePatentDialog';

const Patents = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [patents, setPatents] = useState<Patent[]>([]);
  const [filteredPatents, setFilteredPatents] = useState<Patent[]>([]);
  const [loading, setLoading] = useState(true);
  const [patentToDelete, setPatentToDelete] = useState<string | null>(null);
  
  useEffect(() => {
    const loadPatents = async () => {
      setLoading(true);
      try {
        const data = await fetchPatents();
        setPatents(data);
        setFilteredPatents(data);
      } catch (error) {
        console.error("Error loading patents:", error);
        toast.error("Failed to load patents");
      } finally {
        setLoading(false);
      }
    };
    
    loadPatents();
  }, []);
  
  const handleSearch = (query: string, field?: string) => {
    if (!query.trim()) {
      setFilteredPatents(patents);
      return;
    }
    
    const lowercaseQuery = query.toLowerCase();
    let filtered: Patent[];
    
    if (field && field !== 'all') {
      filtered = patents.filter(patent => {
        const fieldValue = patent[field as keyof Patent];
        return typeof fieldValue === 'string' && fieldValue.toLowerCase().includes(lowercaseQuery);
      });
    } else {
      filtered = patents.filter(patent => 
        patent.tracking_id.toLowerCase().includes(lowercaseQuery) ||
        patent.patent_title.toLowerCase().includes(lowercaseQuery) ||
        patent.patent_applicant.toLowerCase().includes(lowercaseQuery) ||
        patent.client_id.toLowerCase().includes(lowercaseQuery)
      );
    }
    
    setFilteredPatents(filtered);
  };
  
  const handleDeletePatent = (id: string) => {
    setPatentToDelete(id);
  };
  
  const confirmDeletePatent = async () => {
    if (!patentToDelete) return;
    
    try {
      const result = await deletePatent(patentToDelete);
      
      if (result.success) {
        // Remove the patent from the lists
        const updatedPatents = patents.filter(p => p.id !== patentToDelete);
        setPatents(updatedPatents);
        setFilteredPatents(filterPatents(updatedPatents));
        toast.success("Patent deleted successfully");
      } else {
        toast.error(`Failed to delete patent: ${result.message}`);
      }
    } catch (error) {
      console.error("Error deleting patent:", error);
      toast.error("An error occurred while deleting the patent");
    } finally {
      setPatentToDelete(null);
    }
  };
  
  const cancelDeletePatent = () => {
    setPatentToDelete(null);
  };
  
  const filterPatents = (patentsList: Patent[]) => {
    return patentsList;
  };
  
  const getFilteredPatents = () => filteredPatents;
  
  const getInProgressPatents = () => {
    return filteredPatents.filter(patent => 
      !patent.withdrawn && 
      (!patent.ps_completion_status || !patent.cs_completion_status || !patent.fer_completion_status)
    );
  };
  
  const getCompletedPatents = () => {
    return filteredPatents.filter(patent => 
      !patent.withdrawn && 
      patent.ps_completion_status && 
      patent.cs_completion_status && 
      (patent.fer_status === 0 || patent.fer_completion_status)
    );
  };
  
  const getWithdrawnPatents = () => {
    return filteredPatents.filter(patent => patent.withdrawn);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Patents</h1>
        <Link to="/patents/add">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Patent
          </Button>
        </Link>
      </div>
      
      <PatentListHeader onSearch={handleSearch} />
      
      <PatentListTabs
        filteredPatents={filteredPatents}
        getInProgressPatents={getInProgressPatents}
        getCompletedPatents={getCompletedPatents}
        getWithdrawnPatents={getWithdrawnPatents}
        onDeletePatent={handleDeletePatent}
        userRole={user?.role || 'viewer'}
        loading={loading}
      />
      
      <DeletePatentDialog
        open={!!patentToDelete}
        onCancel={cancelDeletePatent}
        onConfirm={confirmDeletePatent}
      />
    </div>
  );
};

export default Patents;
