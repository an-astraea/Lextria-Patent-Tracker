
import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { fetchPatents, deletePatent } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';  // Fixed import
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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { toast } = useToast();  // Using the toast hook properly
  
  useEffect(() => {
    const loadPatents = async () => {
      setLoading(true);
      try {
        const data = await fetchPatents();
        setPatents(data);
        setFilteredPatents(data);
      } catch (error) {
        console.error("Error loading patents:", error);
        toast({
          title: "Error",
          description: "Failed to load patents",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadPatents();
  }, [toast]);
  
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
    setDeleteDialogOpen(true);
  };
  
  const confirmDeletePatent = async () => {
    if (!patentToDelete) return;
    
    try {
      const success = await deletePatent(patentToDelete);
      
      if (success) {
        // Remove the patent from the lists
        const updatedPatents = patents.filter(p => p.id !== patentToDelete);
        setPatents(updatedPatents);
        setFilteredPatents(filteredPatents.filter(p => p.id !== patentToDelete));
        toast({
          title: "Success", 
          description: "Patent deleted successfully"
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to delete patent",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error deleting patent:", error);
      toast({
        title: "Error",
        description: "An error occurred while deleting the patent",
        variant: "destructive"
      });
    } finally {
      setDeleteDialogOpen(false);
      setPatentToDelete(null);
    }
  };
  
  const cancelDeletePatent = () => {
    setDeleteDialogOpen(false);
    setPatentToDelete(null);
  };
  
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
      <PatentListHeader 
        userRole={user?.role}
        onSearch={handleSearch} 
      />
      
      <PatentListTabs
        filteredPatents={filteredPatents}
        getInProgressPatents={getInProgressPatents}
        getCompletedPatents={getCompletedPatents}
        getWithdrawnPatents={getWithdrawnPatents}
        onDeletePatent={handleDeletePatent}
        userRole={user?.role || 'viewer'}
      />
      
      <DeletePatentDialog
        isOpen={deleteDialogOpen}
        onCancel={cancelDeletePatent}
        onConfirm={confirmDeletePatent}
      />
    </div>
  );
};

export default Patents;
