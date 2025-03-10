
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Patent, FEREntry } from '@/lib/types';
import PatentBasicInfo from '@/components/patent/PatentBasicInfo';
import InventorsList from '@/components/patent/InventorsList';
import PatentStatusSection from '@/components/patent/PatentStatusSection';
import PatentTimeline from '@/components/patent/PatentTimeline';
import PatentNotes from '@/components/patent/PatentNotes';
import AssignmentDetails from '@/components/patent/AssignmentDetails';
import FormRequirementsList from '@/components/FormRequirementsList';
import FEREntriesSection from '@/components/patent/FEREntriesSection';

interface PatentDetailsTabsProps {
  patent: Patent;
  userRole: string;
  userName: string;
  employees: any[];
  activeTab: string;
  setActiveTab: (value: string) => void;
  formValues: Record<string, boolean>;
  handleFormUpdate: (formName: string, value: boolean) => void;
  saveFormValues: () => Promise<void>;
  refreshPatentData: () => Promise<void>;
  setTimelineMilestones: (milestones: any[]) => void;
  setShowTimelineDialog: (show: boolean) => void;
  onApproveFERDraft: (fer: FEREntry) => Promise<boolean>;
  onApproveFERFiling: (fer: FEREntry) => Promise<boolean>;
  onCompleteFERDraft: (fer: FEREntry) => Promise<boolean>;
  onCompleteFERFiling: (fer: FEREntry) => Promise<boolean>;
}

const PatentDetailsTabs: React.FC<PatentDetailsTabsProps> = ({
  patent,
  userRole,
  userName,
  employees,
  activeTab,
  setActiveTab,
  formValues,
  handleFormUpdate,
  saveFormValues,
  refreshPatentData,
  setTimelineMilestones,
  setShowTimelineDialog,
  onApproveFERDraft,
  onApproveFERFiling,
  onCompleteFERDraft,
  onCompleteFERFiling
}) => {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="w-full border-b rounded-none justify-start">
        <TabsTrigger value="details">Details</TabsTrigger>
        <TabsTrigger value="timeline">Timeline</TabsTrigger>
        <TabsTrigger value="status">Status</TabsTrigger>
        <TabsTrigger value="notes">Notes</TabsTrigger>
        <TabsTrigger value="forms">Forms</TabsTrigger>
        <TabsTrigger value="fer">FER</TabsTrigger>
      </TabsList>
      
      <TabsContent value="details" className="space-y-6 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <PatentBasicInfo patent={patent} />
            <InventorsList patent={patent} />
          </div>
          <div>
            <AssignmentDetails patent={patent} />
          </div>
        </div>
      </TabsContent>
      
      <TabsContent value="timeline" className="space-y-6 mt-6">
        <PatentTimeline 
          patentId={patent.id} 
          setTimelineMilestones={setTimelineMilestones}
          setShowTimelineDialog={setShowTimelineDialog}
        />
      </TabsContent>
      
      <TabsContent value="status" className="space-y-6 mt-6">
        <PatentStatusSection 
          patent={patent} 
          userRole={userRole} 
          refreshPatentData={refreshPatentData}
        />
      </TabsContent>
      
      <TabsContent value="notes" className="space-y-6 mt-6">
        <PatentNotes 
          patent={patent}
          userRole={userRole}
          refreshPatentData={refreshPatentData}
        />
      </TabsContent>

      <TabsContent value="forms" className="space-y-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Required Forms</CardTitle>
          </CardHeader>
          <CardContent>
            <FormRequirementsList 
              patent={patent} 
              userRole={userRole} 
              onUpdate={handleFormUpdate}
              formValues={formValues}
            />
            
            {(userRole === 'admin' || userRole === 'filer') && (
              <div className="mt-4 flex justify-end">
                <Button onClick={saveFormValues}>
                  Save Form Requirements
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="fer" className="space-y-6 mt-6">
        {patent.fer_status ? (
          <FEREntriesSection 
            patent={patent}
            userRole={userRole}
            userName={userName}
            employees={employees}
            refreshPatentData={refreshPatentData}
            onApproveDraft={onApproveFERDraft}
            onApproveFiling={onApproveFERFiling}
            onCompleteDraft={onCompleteFERDraft}
            onCompleteFiling={onCompleteFERFiling}
          />
        ) : (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>FER Not Activated</AlertTitle>
            <AlertDescription>
              FER functionality is not currently activated for this patent. Contact an admin to activate it.
            </AlertDescription>
          </Alert>
        )}
      </TabsContent>
    </Tabs>
  );
};

export default PatentDetailsTabs;
