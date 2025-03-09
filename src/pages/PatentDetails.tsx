import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { 
  fetchPatentById, 
  fetchPatentTimeline,
  fetchEmployees,
  completeFERDrafterTask,
  completeFERFilerTask,
  approveFERReview,
  updatePatentForms
} from '@/lib/api';
import { FEREntry, Patent } from '@/lib/types';
import { toast } from 'sonner';

import PatentBasicInfo from '@/components/patent/PatentBasicInfo';
import InventorsInfoCard from '@/components/patent/InventorsInfoCard';
import PatentStatusSection from '@/components/patent/PatentStatusSection';
import FEREntriesSection from '@/components/patent/FEREntriesSection';
import FormRequirementsList from '@/components/patent/FormRequirementsList';
import PatentNotes from '@/components/patent/PatentNotes';
import PatentTimeline from '@/components/patent/PatentTimeline';

const PatentDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [patent, setPatent] = useState<Patent | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [timeline, setTimeline] = useState([]);
  const [userRole, setUserRole] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [employees, setEmployees] = useState<any[]>([]);
  
  // FER status update states
  const [isCompletingDraft, setIsCompletingDraft] = useState(false);
  const [isCompletingFiling, setIsCompletingFiling] = useState(false);
  const [isApprovingDraft, setIsApprovingDraft] = useState(false);
  const [isApprovingFiling, setIsApprovingFiling] = useState(false);

  useEffect(() => {
    // Get user role from localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserRole(user.role || '');
    setUserName(user.full_name || '');

    const fetchPatent = async () => {
      if (id) {
        try {
          const patentData = await fetchPatentById(id);
          if (patentData) {
            setPatent(patentData);
          } else {
            toast.error('Patent not found');
            navigate('/patents');
          }
        } catch (error) {
          console.error('Error fetching patent:', error);
          toast.error('Failed to load patent details');
        } finally {
          setLoading(false);
        }
      }
    };

    const fetchTimelineData = async () => {
      if (id) {
        try {
          const timelineData = await fetchPatentTimeline(id);
          setTimeline(timelineData);
        } catch (error) {
          console.error('Error fetching patent timeline:', error);
          toast.error('Failed to load patent timeline');
        }
      }
    };
    
    const fetchAllEmployees = async () => {
      try {
        const employeesData = await fetchEmployees();
        setEmployees(employeesData || []);
      } catch (error) {
        console.error('Error fetching employees:', error);
      }
    };

    fetchPatent();
    fetchTimelineData();
    fetchAllEmployees();
  }, [id, navigate]);

  const handleFormUpdate = async (formName: string, value: boolean) => {
    if (!patent || !id) return;
    
    setIsSaving(true);
    try {
      // Create an object with just the updated form field
      const formData: Record<string, boolean> = {
        [formName]: value
      };
      
      const success = await updatePatentForms(id, formData);
      if (success) {
        // Update local state to reflect the change
        setPatent(prev => {
          if (!prev) return null;
          return {
            ...prev,
            [formName]: value
          };
        });
        toast.success(`${formName.toUpperCase()} updated successfully`);
      }
    } catch (error) {
      console.error('Error updating form:', error);
      toast.error('Failed to update form');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCompleteFERDraft = async (ferEntry: FEREntry) => {
    if (!ferEntry) return;
    
    setIsCompletingDraft(true);
    try {
      const success = await completeFERDrafterTask(ferEntry, userName);
      if (success) {
        toast.success('FER drafting completed and submitted for review');
        // Update local state
        refreshPatentData();
      }
    } catch (error) {
      console.error('Error completing FER draft:', error);
      toast.error('Failed to complete FER draft');
    } finally {
      setIsCompletingDraft(false);
    }
  };

  const handleCompleteFERFiling = async (ferEntry: FEREntry) => {
    if (!ferEntry) return;
    
    setIsCompletingFiling(true);
    try {
      const success = await completeFERFilerTask(ferEntry, userName);
      if (success) {
        toast.success('FER filing completed and submitted for review');
        // Update local state
        refreshPatentData();
      }
    } catch (error) {
      console.error('Error completing FER filing:', error);
      toast.error('Failed to complete FER filing');
    } finally {
      setIsCompletingFiling(false);
    }
  };

  const handleApproveFERDraft = async (ferEntry: FEREntry) => {
    if (!ferEntry) return;
    
    setIsApprovingDraft(true);
    try {
      const success = await approveFERReview(ferEntry, 'draft');
      if (success) {
        toast.success('FER draft approved');
        // Update local state
        refreshPatentData();
      }
    } catch (error) {
      console.error('Error approving FER draft:', error);
      toast.error('Failed to approve FER draft');
    } finally {
      setIsApprovingDraft(false);
    }
  };

  const handleApproveFERFiling = async (ferEntry: FEREntry) => {
    if (!ferEntry) return;
    
    setIsApprovingFiling(true);
    try {
      const success = await approveFERReview(ferEntry, 'file');
      if (success) {
        toast.success('FER filing approved');
        // Update local state and check if all FERs are now complete
        refreshPatentData();
      }
    } catch (error) {
      console.error('Error approving FER filing:', error);
      toast.error('Failed to approve FER filing');
    } finally {
      setIsApprovingFiling(false);
    }
  };

  const refreshPatentData = async () => {
    if (!id) return;
    
    try {
      const patentData = await fetchPatentById(id);
      if (patentData) {
        setPatent(patentData);
      }
      
      // Also refresh timeline
      const timelineData = await fetchPatentTimeline(id);
      setTimeline(timelineData);
    } catch (error) {
      console.error('Error refreshing patent data:', error);
    }
  };

  const canEditForms = userRole === 'admin' || userRole === 'filer';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="mr-2 h-8 w-8 animate-spin" />
        Loading patent details...
      </div>
    );
  }

  if (!patent) {
    return <div className="text-red-500">Patent not found.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Patent Details</h1>
      </div>

      {/* Basic Information */}
      <PatentBasicInfo patent={patent} />

      {/* Inventors */}
      <InventorsInfoCard inventors={patent.inventors || []} />

      {/* Patent Status */}
      <PatentStatusSection 
        patent={patent} 
        userRole={userRole} 
        refreshPatentData={refreshPatentData}
      />
      
      {/* FER Entries */}
      <FEREntriesSection 
        patent={patent}
        userRole={userRole}
        userName={userName}
        employees={employees}
        refreshPatentData={refreshPatentData}
        onApproveDraft={handleApproveFERDraft}
        onApproveFiling={handleApproveFERFiling}
        onCompleteDraft={handleCompleteFERDraft}
        onCompleteFiling={handleCompleteFERFiling}
      />

      {/* Form Requirements */}
      <FormRequirementsList 
        patent={patent} 
        userRole={userRole} 
        onUpdate={canEditForms ? handleFormUpdate : undefined} 
      />

      {/* Patent Notes */}
      <PatentNotes 
        patentId={id || ''}
        initialNotes={patent.notes || ''}
        userRole={userRole}
        onNotesUpdated={refreshPatentData}
      />

      {/* Timeline */}
      <PatentTimeline timeline={timeline} />
    </div>
  );
};

export default PatentDetails;
