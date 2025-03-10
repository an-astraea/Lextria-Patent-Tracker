
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  fetchFilerAssignments, 
  fetchFilerCompletedAssignments, 
  fetchFilerFERAssignments, 
  completeFilerTask 
} from '@/lib/api';
import { FEREntry, Patent } from '@/lib/types';
import { toast } from 'sonner';

interface User {
  full_name: string;
  [key: string]: any;
}

export const useFilingsData = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [patents, setPatents] = useState<Patent[]>([]);
  const [completedPatents, setCompletedPatents] = useState<Patent[]>([]);
  const [ferEntries, setFEREntries] = useState<FEREntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatent, setSelectedPatent] = useState<Patent | null>(null);
  const [selectedFER, setSelectedFER] = useState<FEREntry | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isFERDialogOpen, setIsFERDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      
      const fetchData = async () => {
        try {
          const [patentsData, completedData, ferData] = await Promise.all([
            fetchFilerAssignments(parsedUser.full_name),
            fetchFilerCompletedAssignments(parsedUser.full_name),
            fetchFilerFERAssignments(parsedUser.full_name)
          ]);
          
          setPatents(patentsData);
          setCompletedPatents(completedData);
          setFEREntries(ferData);
        } catch (error) {
          console.error('Error fetching data:', error);
          toast.error('Failed to load assignments');
        } finally {
          setLoading(false);
        }
      };
      
      fetchData();
    } else {
      navigate('/');
    }
  }, [navigate]);

  const handlePatentClick = (patent: Patent) => {
    setSelectedPatent(patent);
    setIsDialogOpen(true);
    
    const initialFormData: Record<string, boolean> = {};
    for (let i = 1; i <= 31; i++) {
      const formKey = i < 10 ? `form_0${i}` : `form_${i}`;
      if (formKey in patent) {
        initialFormData[formKey] = !!patent[formKey as keyof Patent];
      }
    }
    
    if ('form_02_ps' in patent) {
      initialFormData['form_02_ps'] = !!patent.form_02_ps;
    }
    if ('form_02_cs' in patent) {
      initialFormData['form_02_cs'] = !!patent.form_02_cs;
    }
    
    ['form_07a', 'form_08a', 'form_09a', 'form_18a'].forEach(formKey => {
      if (formKey in patent) {
        initialFormData[formKey] = !!patent[formKey as keyof Patent];
      }
    });
    
    setFormData(initialFormData);
  };

  const handleFERClick = (fer: FEREntry) => {
    setSelectedFER(fer);
    setIsFERDialogOpen(true);
  };

  const handleFormChange = (formName: string, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      [formName]: value
    }));
  };

  const handleSubmit = async () => {
    if (!selectedPatent || !user) return;
    
    setIsSubmitting(true);
    
    try {
      let filingType = '';
      
      if (selectedPatent.ps_filer_assgn === user.full_name && selectedPatent.ps_filing_status === 0) {
        filingType = 'PS';
      } else if (selectedPatent.cs_filer_assgn === user.full_name && selectedPatent.cs_filing_status === 0) {
        filingType = 'CS';
      } else if (selectedPatent.fer_filer_assgn === user.full_name && selectedPatent.fer_filing_status === 0) {
        filingType = 'FER';
      }
      
      const success = await completeFilerTask(
        selectedPatent, 
        user.full_name,
        filingType === 'CS' ? formData : undefined
      );
      
      if (success) {
        toast.success(`${filingType} filing completed successfully`);
        
        setPatents(prev => prev.filter(p => p.id !== selectedPatent.id));
        setCompletedPatents(prev => [selectedPatent, ...prev]);
        
        setIsDialogOpen(false);
      }
    } catch (error) {
      console.error('Error completing filing:', error);
      toast.error('Failed to complete filing');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFERSubmit = async () => {
    if (!selectedFER || !user) return;
    
    setIsSubmitting(true);
    
    try {
      console.log('Completing FER filing task for FER ID:', selectedFER.id);
      
      if (!selectedFER.patent || !selectedFER.patent.id) {
        const patentId = selectedFER.patent_id;
        if (!patentId) {
          throw new Error('Missing patent ID for FER entry');
        }
        
        const patent = patents.find(p => p.id === patentId);
        if (!patent) {
          throw new Error('Cannot find patent for FER entry');
        }
        
        const success = await completeFilerTask(
          patent,
          user.full_name,
          undefined,
          selectedFER.id
        );
        
        if (success) {
          toast.success('FER filing completed successfully');
          setFEREntries(prev => prev.filter(fer => fer.id !== selectedFER.id));
          setIsFERDialogOpen(false);
        }
      } else {
        const success = await completeFilerTask(
          selectedFER.patent,
          user.full_name,
          undefined,
          selectedFER.id
        );
        
        if (success) {
          toast.success('FER filing completed successfully');
          setFEREntries(prev => prev.filter(fer => fer.id !== selectedFER.id));
          setIsFERDialogOpen(false);
        }
      }
    } catch (error) {
      console.error('Error completing FER filing:', error);
      toast.error('Failed to complete FER filing');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    loading,
    user,
    patents,
    completedPatents,
    ferEntries,
    selectedPatent,
    selectedFER,
    isDialogOpen,
    isFERDialogOpen,
    isSubmitting,
    formData,
    handlePatentClick,
    handleFERClick,
    handleFormChange,
    handleSubmit,
    handleFERSubmit,
    setIsDialogOpen,
    setIsFERDialogOpen
  };
};
