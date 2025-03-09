import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { 
  fetchPatentById, 
  fetchPatentTimeline,
  fetchEmployees,
  updateFEREntry,
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
  const [timeline, setTimeline] = useState([]);
  const [userRole, setUserRole] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [employeesList, setEmployeesList] = useState<any[]>([]); 
  
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
        setEmployeesList(employeesData || []); 
      } catch (error) {
        console.error('Error fetching employees:', error);
      }
    };

    fetchPatent();
    fetchTimelineData();
    fetchAllEmployees();
  }, [id, navigate]);

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

  // Add the missing handlers for FER actions
  const handleApproveDraft = async (fer: FEREntry) => {
    try {
      await updateFEREntry(fer.id, {
        fer_review_draft_status: 0
      });
      toast.success("Draft approved successfully");
      await refreshPatentData();
    } catch (error) {
      console.error('Error approving draft:', error);
      toast.error("Failed to approve draft");
    }
  };

  const handleApproveFiling = async (fer: FEREntry) => {
    try {
      await updateFEREntry(fer.id, {
        fer_review_file_status: 0
      });
      toast.success("Filing approved successfully");
      await refreshPatentData();
    } catch (error) {
      console.error('Error approving filing:', error);
      toast.error("Failed to approve filing");
    }
  };

  const handleCompleteDraft = async (fer: FEREntry) => {
    try {
      await updateFEREntry(fer.id, {
        fer_drafter_status: 1,
        fer_review_draft_status: 1
      });
      toast.success("Draft marked as completed");
      await refreshPatentData();
    } catch (error) {
      console.error('Error completing draft:', error);
      toast.error("Failed to complete draft");
    }
  };

  const handleCompleteFiling = async (fer: FEREntry) => {
    try {
      await updateFEREntry(fer.id, {
        fer_filing_status: 1,
        fer_review_file_status: 1
      });
      toast.success("Filing marked as completed");
      await refreshPatentData();
    } catch (error) {
      console.error('Error completing filing:', error);
      toast.error("Failed to complete filing");
    }
  };

  // Add the handleUpdateForms function to update patent forms
  const handleUpdateForms = async (formName: string, value: boolean) => {
    if (!id) return;
    
    try {
      const formData = {
        [formName]: value
      };
      await updatePatentForms(id, formData);
      toast.success("Form status updated");
      await refreshPatentData();
    } catch (error) {
      console.error('Error updating form status:', error);
      toast.error("Failed to update form status");
    }
  };

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

  const canEditForms = userRole === 'admin' || userRole === 'filer';

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
        employees={employeesList}
        refreshPatentData={refreshPatentData}
        onApproveDraft={handleApproveDraft}
        onApproveFiling={handleApproveFiling}
        onCompleteDraft={handleCompleteDraft}
        onCompleteFiling={handleCompleteFiling}
      />

      {/* Form Requirements */}
      <FormRequirementsList 
        patent={patent} 
        userRole={userRole} 
        onUpdate={canEditForms ? handleUpdateForms : undefined} 
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
