
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, Loader2, User } from 'lucide-react';
import { Patent } from '@/lib/types';
import { updatePatentStatus } from '@/lib/api';
import { toast } from 'sonner';

interface PatentStatusSectionProps {
  patent: Patent;
  userRole: string;
  refreshPatentData: () => Promise<void>;
}

const PatentStatusSection = ({ patent, userRole, refreshPatentData }: PatentStatusSectionProps) => {
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  
  const isAdmin = userRole === 'admin';
  
  const handleStatusUpdate = async (statusField: string, newValue: number) => {
    if (!isAdmin) return;
    
    setIsUpdating(statusField);
    try {
      const result = await updatePatentStatus(patent.id, statusField, newValue);
      if (result.success) {
        toast.success(`Status updated successfully`);
        refreshPatentData();
      } else {
        toast.error('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    } finally {
      setIsUpdating(null);
    }
  };
  
  const StatusBadge = ({ 
    label, 
    status, 
    statusField,
    assignee = null,
    deadline = null
  }: { 
    label: string; 
    status: number; 
    statusField: string;
    assignee?: string | null;
    deadline?: string | null;
  }) => {
    return (
      <div className="flex flex-col gap-2 p-3 border rounded-md">
        <div className="text-sm font-medium">{label}</div>
        <div className="flex gap-2 items-center">
          <Badge variant={status === 1 ? "success" : "secondary"}>
            {status === 1 ? "Completed" : "Pending"}
          </Badge>
          
          {isAdmin && status !== 1 && (
            <Button 
              variant="outline" 
              size="sm"
              className="h-6 px-2 py-0"
              onClick={() => handleStatusUpdate(statusField, 1)}
              disabled={!!isUpdating}
            >
              {isUpdating === statusField ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Check className="h-3 w-3" />
              )}
            </Button>
          )}
          
          {isAdmin && status === 1 && (
            <Button 
              variant="outline" 
              size="sm"
              className="h-6 px-2 py-0"
              onClick={() => handleStatusUpdate(statusField, 0)}
              disabled={!!isUpdating}
            >
              <span className="text-xs">Reset</span>
            </Button>
          )}
        </div>
        
        {assignee && (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <User className="h-3 w-3" />
            <span>Assigned to: {assignee}</span>
          </div>
        )}
        
        {deadline && (
          <div className="text-xs text-gray-500">
            <span>Deadline: {new Date(deadline).toLocaleDateString()}</span>
          </div>
        )}
      </div>
    );
  };
  
  // Dynamically check if any FER entries exist and at least one is incomplete
  const anyFERPending = patent.fer_entries && patent.fer_entries.some(
    entry => entry.fer_drafter_status === 0 || entry.fer_filing_status === 0
  );

  // If FER is enabled but no entries exist, the status should reflect pending
  const ferPendingStatus = (patent.fer_status === 1 && (!patent.fer_entries || patent.fer_entries.length === 0)) ||
                           anyFERPending;
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatusBadge 
          label="PS Drafting Status" 
          status={patent.ps_drafting_status} 
          statusField="ps_drafting_status"
          assignee={patent.ps_drafter_assgn}
          deadline={patent.ps_drafter_deadline}
        />
        <StatusBadge 
          label="PS Filing Status" 
          status={patent.ps_filing_status} 
          statusField="ps_filing_status"
          assignee={patent.ps_filer_assgn}
          deadline={patent.ps_filer_deadline}
        />
        <StatusBadge 
          label="PS Completion Status" 
          status={patent.ps_completion_status} 
          statusField="ps_completion_status"
        />
        <StatusBadge 
          label="CS Drafting Status" 
          status={patent.cs_drafting_status} 
          statusField="cs_drafting_status"
          assignee={patent.cs_drafter_assgn}
          deadline={patent.cs_drafter_deadline}
        />
        <StatusBadge 
          label="CS Filing Status" 
          status={patent.cs_filing_status} 
          statusField="cs_filing_status"
          assignee={patent.cs_filer_assgn}
          deadline={patent.cs_filer_deadline}
        />
        <StatusBadge 
          label="CS Completion Status" 
          status={patent.cs_completion_status} 
          statusField="cs_completion_status"
        />
        <StatusBadge 
          label="FER Status" 
          status={patent.fer_status} 
          statusField="fer_status"
        />
        
        {patent.fer_status === 1 && (
          <StatusBadge 
            label="FER Overall Completion" 
            status={ferPendingStatus ? 0 : 1} 
            statusField="fer_completion_status"
          />
        )}
      </div>
      
      {isAdmin && (
        <div className="p-4 bg-gray-50 rounded-md mt-4">
          <p className="text-sm text-gray-600">
            <strong>Admin Note:</strong> You can manually update any status by clicking the buttons next to each status.
            This allows you to override the workflow when necessary, such as when a patent starts from CS drafting instead of PS.
            If a new FER entry is created, the patent status will be updated automatically.
          </p>
        </div>
      )}
    </div>
  );
};

export default PatentStatusSection;
