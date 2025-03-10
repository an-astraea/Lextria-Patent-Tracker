
import { useState, useEffect } from 'react';
import { 
  fetchPatentById, 
  fetchEmployees, 
  completeDrafterTask, 
  completeFilerTask, 
  updatePatentForms, 
  approveFERDraft, 
  approveFERFiling 
} from '@/lib/api';
import { Patent, FEREntry } from '@/lib/types';
import { toast } from 'sonner';

export function usePatentDetails(id: string | undefined) {
  const [user, setUser] = useState<any>(null);
  const [patent, setPatent] = useState<Patent | null>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formValues, setFormValues] = useState<Record<string, boolean>>({});
  const [timelineMilestones, setTimelineMilestones] = useState<any[]>([]);
  
  // Get user from localStorage
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error getting user from localStorage:', error);
    }
  }, []);
  
  const fetchPatentData = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const patentData = await fetchPatentById(id);
      setPatent(patentData);
      
      if (patentData) {
        const initialFormValues: Record<string, boolean> = {};
        Object.entries(patentData).forEach(([key, value]) => {
          if (key.startsWith('form_')) {
            initialFormValues[key] = !!value;
          }
        });
        setFormValues(initialFormValues);
      }
    } catch (error) {
      console.error('Error fetching patent data:', error);
      toast.error('Failed to load patent details');
    } finally {
      setLoading(false);
    }
  };

  const loadEmployees = async () => {
    try {
      const employeesData = await fetchEmployees();
      setEmployees(employeesData);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  useEffect(() => {
    fetchPatentData();
    loadEmployees();
  }, [id]);

  const handleFormUpdate = (formName: string, value: boolean) => {
    setFormValues(prev => ({
      ...prev,
      [formName]: value
    }));
  };

  const saveFormValues = async () => {
    if (!patent?.id) return;
    
    try {
      await updatePatentForms(patent.id, formValues);
      toast.success('Form requirements updated successfully');
      await fetchPatentData();
    } catch (error) {
      console.error('Error updating form requirements:', error);
      toast.error('Failed to update form requirements');
    }
  };

  const completeDrafting = async () => {
    if (!patent || !user) return false;
    
    try {
      const success = await completeDrafterTask(patent, user.full_name);
      if (success) {
        toast.success('Drafting marked as completed and submitted for review');
        await fetchPatentData();
        return true;
      } else {
        toast.error('Failed to complete drafting task');
      }
    } catch (error) {
      console.error('Error completing drafting task:', error);
      toast.error('An error occurred while completing the drafting task');
    }
    return false;
  };

  const completeFiling = async () => {
    if (!patent || !user) return false;
    
    try {
      const success = await completeFilerTask(patent, user.full_name, formValues);
      if (success) {
        toast.success('Filing marked as completed and submitted for review');
        await fetchPatentData();
        return true;
      } else {
        toast.error('Failed to complete filing task');
      }
    } catch (error) {
      console.error('Error completing filing task:', error);
      toast.error('An error occurred while completing the filing task');
    }
    return false;
  };

  const completeFERDraft = async (fer: FEREntry) => {
    if (!patent || !user) return false;

    try {
      const success = await completeDrafterTask(patent, user.full_name, fer.id);
      if (success) {
        toast.success('FER Draft marked as completed and submitted for review');
        await fetchPatentData();
        return true;
      } else {
        toast.error('Failed to complete FER draft task');
      }
    } catch (error) {
      console.error('Error completing FER draft task:', error);
      toast.error('An error occurred while completing the FER draft task');
    }
    return false;
  };

  const completeFERFiling = async (fer: FEREntry) => {
    if (!patent || !user) return false;

    try {
      const success = await completeFilerTask(patent, user.full_name, formValues, fer.id);
      if (success) {
        toast.success('FER Filing marked as completed and submitted for review');
        await fetchPatentData();
        return true;
      } else {
        toast.error('Failed to complete FER filing task');
      }
    } catch (error) {
      console.error('Error completing FER filing task:', error);
      toast.error('An error occurred while completing the FER filing task');
    }
    return false;
  };

  const approveFERDraftSubmission = async (fer: FEREntry) => {
    if (!patent || !user || user.role !== 'admin') return false;

    try {
      const success = await approveFERDraft(fer.id);
      if (success) {
        toast.success('FER Draft approved successfully');
        await fetchPatentData();
        return true;
      } else {
        toast.error('Failed to approve FER draft');
      }
    } catch (error) {
      console.error('Error approving FER draft:', error);
      toast.error('An error occurred while approving the FER draft');
    }
    return false;
  };

  const approveFERFilingSubmission = async (fer: FEREntry) => {
    if (!patent || !user || user.role !== 'admin') return false;

    try {
      const success = await approveFERFiling(fer.id);
      if (success) {
        toast.success('FER Filing approved successfully');
        await fetchPatentData();
        return true;
      } else {
        toast.error('Failed to approve FER filing');
      }
    } catch (error) {
      console.error('Error approving FER filing:', error);
      toast.error('An error occurred while approving the FER filing');
    }
    return false;
  };

  const isAssignedDrafter = () => {
    if (!patent || !user) return false;
    
    return (
      user.role === 'drafter' && (
        (patent.ps_drafter_assgn === user.full_name && patent.ps_drafting_status === 0 && patent.idf_received === true) ||
        (patent.cs_drafter_assgn === user.full_name && patent.cs_drafting_status === 0 && patent.cs_data === true && patent.cs_data_received === true) ||
        (patent.fer_drafter_assgn === user.full_name && patent.fer_drafter_status === 0)
      )
    );
  };

  const isAssignedFiler = () => {
    if (!patent || !user) return false;
    
    return (
      user.role === 'filer' && (
        (patent.ps_filer_assgn === user.full_name && patent.ps_filing_status === 0 && patent.ps_drafting_status === 1 && patent.idf_received === true) ||
        (patent.cs_filer_assgn === user.full_name && patent.cs_filing_status === 0 && patent.cs_drafting_status === 1 && patent.cs_data_received === true) ||
        (patent.fer_filer_assgn === user.full_name && patent.fer_filing_status === 0 && patent.fer_drafter_status === 1)
      )
    );
  };

  const getDrafterCompletionField = () => {
    if (!patent || !user) return null;
    
    if (patent.ps_drafter_assgn === user.full_name && patent.ps_drafting_status === 0 && patent.idf_received === true) {
      return 'PS Drafting';
    } else if (patent.cs_drafter_assgn === user.full_name && patent.cs_drafting_status === 0 && patent.cs_data === true && patent.cs_data_received === true) {
      return 'CS Drafting';
    } else if (patent.fer_drafter_assgn === user.full_name && patent.fer_drafter_status === 0) {
      return 'FER Drafting';
    }
    
    return null;
  };

  const getFilerCompletionField = () => {
    if (!patent || !user) return null;
    
    if (patent.ps_filer_assgn === user.full_name && patent.ps_filing_status === 0 && patent.ps_drafting_status === 1 && patent.idf_received === true) {
      return 'PS Filing';
    } else if (patent.cs_filer_assgn === user.full_name && patent.cs_filing_status === 0 && patent.cs_drafting_status === 1 && patent.cs_data_received === true) {
      return 'CS Filing';
    } else if (patent.fer_filer_assgn === user.full_name && patent.fer_filing_status === 0 && patent.fer_drafter_status === 1) {
      return 'FER Filing';
    }
    
    return null;
  };

  return {
    user,
    patent,
    employees,
    loading,
    formValues,
    timelineMilestones,
    setTimelineMilestones,
    fetchPatentData,
    handleFormUpdate,
    saveFormValues,
    completeDrafting,
    completeFiling,
    completeFERDraft,
    completeFERFiling,
    approveFERDraftSubmission,
    approveFERFilingSubmission,
    isAssignedDrafter,
    isAssignedFiler,
    getDrafterCompletionField,
    getFilerCompletionField
  };
}
