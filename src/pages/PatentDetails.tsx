
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { usePatentDetails } from '@/hooks/usePatentDetails';
import PatentDetailsHeader from '@/components/patent/PatentDetailsHeader';
import PatentDetailsTabs from '@/components/patent/PatentDetailsTabs';
import PatentNotFound from '@/components/patent/PatentNotFound';
import CompleteDraftingDialog from '@/components/patent/CompleteDraftingDialog';
import CompleteFilingDialog from '@/components/patent/CompleteFilingDialog';
import TimelineDialog from '@/components/TimelineDialog';

const PatentDetails = () => {
  const { id } = useParams<{ id: string }>();
  
  const [activeTab, setActiveTab] = useState('details');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showFilingDialog, setShowFilingDialog] = useState(false);
  const [isCompletingDraft, setIsCompletingDraft] = useState(false);
  const [isCompletingFiling, setIsCompletingFiling] = useState(false);
  const [showTimelineDialog, setShowTimelineDialog] = useState(false);
  
  const {
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
  } = usePatentDetails(id);

  const handleCompleteDrafting = () => {
    setIsDialogOpen(true);
  };

  const handleCompleteFiling = () => {
    setShowFilingDialog(true);
  };

  const confirmCompleteDrafting = async () => {
    setIsCompletingDraft(true);
    const success = await completeDrafting();
    setIsCompletingDraft(false);
    if (success) {
      setIsDialogOpen(false);
    }
  };

  const confirmCompleteFiling = async () => {
    setIsCompletingFiling(true);
    const success = await completeFiling();
    setIsCompletingFiling(false);
    if (success) {
      setShowFilingDialog(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading patent details...</p>
        </div>
      </div>
    );
  }

  if (!patent) {
    return <PatentNotFound />;
  }

  return (
    <div className="space-y-8 pb-10">
      <PatentDetailsHeader 
        patent={patent}
        userRole={user?.role || 'viewer'}
        isAssignedDrafter={isAssignedDrafter()}
        isAssignedFiler={isAssignedFiler()}
        onCompleteDrafting={handleCompleteDrafting}
        onCompleteFiling={handleCompleteFiling}
      />
      
      <PatentDetailsTabs
        patent={patent}
        userRole={user?.role || 'viewer'}
        userName={user?.full_name || ''}
        employees={employees}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        formValues={formValues}
        handleFormUpdate={handleFormUpdate}
        saveFormValues={saveFormValues}
        refreshPatentData={fetchPatentData}
        setTimelineMilestones={setTimelineMilestones}
        setShowTimelineDialog={setShowTimelineDialog}
        onApproveFERDraft={approveFERDraftSubmission}
        onApproveFERFiling={approveFERFilingSubmission}
        onCompleteFERDraft={completeFERDraft}
        onCompleteFERFiling={completeFERFiling}
      />

      <CompleteDraftingDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        completionField={getDrafterCompletionField()}
        isCompleting={isCompletingDraft}
        onConfirm={confirmCompleteDrafting}
      />

      <CompleteFilingDialog
        isOpen={showFilingDialog}
        onOpenChange={setShowFilingDialog}
        patent={patent}
        userRole={user?.role || 'viewer'}
        formValues={formValues}
        onUpdateForm={handleFormUpdate}
        completionField={getFilerCompletionField()}
        isCompleting={isCompletingFiling}
        onConfirm={confirmCompleteFiling}
      />

      <TimelineDialog 
        open={showTimelineDialog} 
        onOpenChange={setShowTimelineDialog}
        milestones={timelineMilestones}
        patent={patent}
      />
    </div>
  );
};

export default PatentDetails;
