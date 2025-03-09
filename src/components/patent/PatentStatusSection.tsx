
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, Loader2 } from 'lucide-react';
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
      const success = await updatePatentStatus(patent.id, statusField, newValue);
      if (success) {
        toast.success(`Status updated successfully`);
        refreshPatentData();
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
    statusField 
  }: { 
    label: string; 
    status: number; 
    statusField: string;
  }) => {
    return (
      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        <div className="text-sm font-medium text-gray-500">{label}</div>
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
      </div>
    );
  };
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatusBadge 
          label="PS Drafting Status" 
          status={patent.ps_drafting_status} 
          statusField="ps_drafting_status"
        />
        <StatusBadge 
          label="PS Filing Status" 
          status={patent.ps_filing_status} 
          statusField="ps_filing_status"
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
        />
        <StatusBadge 
          label="CS Filing Status" 
          status={patent.cs_filing_status} 
          statusField="cs_filing_status"
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
      </div>
      
      {isAdmin && (
        <div className="p-4 bg-gray-50 rounded-md mt-4">
          <p className="text-sm text-gray-600">
            <strong>Admin Note:</strong> You can manually update any status by clicking the buttons next to each status.
            This allows you to override the workflow when necessary, such as when a patent starts from CS drafting instead of PS.
          </p>
        </div>
      )}
    </div>
  );
};

export default PatentStatusSection;
