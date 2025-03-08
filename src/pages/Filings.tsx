
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { completeFilerTask } from '@/lib/api';
import { Patent } from '@/lib/types';
import { toast } from 'sonner';
import PageHeader from '@/components/common/PageHeader';
import LoadingState from '@/components/common/LoadingState';
import PatentList from '@/components/filings/PatentList';
import PatentDetails from '@/components/filings/PatentDetails';
import { useFilerAssignments } from '@/hooks/useFilerAssignments';

const Filings = () => {
  const [activePatent, setActivePatent] = useState<Patent | null>(null);
  const [formValues, setFormValues] = useState<{[key: string]: boolean}>({});
  const [otherForms, setOtherForms] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  
  // Get user from localStorage
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  
  // Use the custom hook for data fetching
  const { pending, completed, loading, lastUpdated, refreshData } = useFilerAssignments(user?.full_name);
  
  // Redirect if not filer
  useEffect(() => {
    if (user?.role !== 'filer' && user?.role !== 'admin') {
      toast.error('Access denied. Filer privileges required.');
      navigate('/dashboard');
    }
  }, [user, navigate]);
  
  const handleOpenPatent = (patent: Patent) => {
    setActivePatent(patent);
    
    // Reset form values
    const formState: {[key: string]: boolean} = {};
    
    // Pre-populate all common form values from the patent
    if (patent.form_01) formState.form_01 = true;
    if (patent.form_03) formState.form_03 = true;
    if (patent.form_05) formState.form_05 = true;
    if (patent.form_26) formState.form_26 = true;
    if (patent.form_28) formState.form_28 = true;
    
    // Determine which stage-specific forms to pre-populate
    if (user?.full_name === patent.ps_filer_assgn && patent.ps_filing_status === 0) {
      // PS filing stage - add PS specific forms
      if (patent.form_02_ps) formState.form_02_ps = true;
      if (patent.form_04) formState.form_04 = true;
    } else if (user?.full_name === patent.cs_filer_assgn && patent.cs_filing_status === 0) {
      // CS filing stage - add CS specific forms
      if (patent.form_02_cs) formState.form_02_cs = true;
      if (patent.form_18) formState.form_18 = true;
      if (patent.form_18a) formState.form_18a = true;
    } else if (user?.full_name === patent.fer_filer_assgn && patent.fer_filing_status === 0) {
      // FER filing stage - add FER specific forms
      if (patent.form_13) formState.form_13 = true;
    }
    
    setFormValues(formState);
    setOtherForms(patent.other_forms || '');
  };
  
  const handleClosePatent = () => {
    setActivePatent(null);
    setFormValues({});
    setOtherForms('');
  };
  
  const handleFormChange = (formId: string, checked: boolean) => {
    setFormValues(prev => ({
      ...prev,
      [formId]: checked
    }));
  };
  
  const handleSubmit = async () => {
    if (!activePatent || !user) return;
    
    try {
      setSubmitting(true);
      
      // Build form data
      const formData = {
        ...formValues,
        other_forms: otherForms || null
      };
      
      const success = await completeFilerTask(activePatent, user.full_name, formData);
      
      if (success) {
        toast.success('Filing completed and submitted for review');
        
        // Update cache by fetching fresh data
        await refreshData(false);
        
        handleClosePatent();
      } else {
        toast.error('Failed to complete filing');
      }
    } catch (error) {
      console.error('Error completing filing:', error);
      toast.error('An error occurred while submitting the forms');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-6">
      <PageHeader
        title="Patent Filings"
        subtitle="Manage and complete your assigned patent filing tasks"
      />
      
      {loading ? (
        <LoadingState text="Loading patent filing assignments..." />
      ) : activePatent ? (
        <PatentDetails 
          patent={activePatent}
          user={user}
          formValues={formValues}
          otherForms={otherForms}
          onFormChange={handleFormChange}
          onOtherFormsChange={setOtherForms}
          onClose={handleClosePatent}
          onSubmit={handleSubmit}
          submitting={submitting}
        />
      ) : (
        <PatentList
          pending={pending}
          completed={completed}
          user={user}
          lastUpdated={lastUpdated}
          onRefresh={() => refreshData(true)}
          onPatentSelect={handleOpenPatent}
        />
      )}
    </div>
  );
};

export default Filings;
