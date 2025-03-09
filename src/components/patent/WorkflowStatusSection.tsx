
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Patent } from '@/lib/types';
import { updatePatentStatus } from '@/lib/api';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface WorkflowStatusSectionProps {
  patent: Patent;
  userRole: string;
  refreshPatentData: () => Promise<void>;
}

const WorkflowStatusSection = ({ patent, userRole, refreshPatentData }: WorkflowStatusSectionProps) => {
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  
  const isAdmin = userRole === 'admin';
  
  const handleStatusToggle = async (field: string, value: boolean) => {
    if (!isAdmin) {
      toast.error("Only administrators can change these settings");
      return;
    }
    
    setIsUpdating(field);
    try {
      // Convert boolean to number (1/0) for API compatibility
      const success = await updatePatentStatus(patent.id, field, value ? 1 : 0);
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
  
  const StatusSwitch = ({ 
    field, 
    label, 
    value, 
    disabled = false,
    description
  }: { 
    field: string; 
    label: string; 
    value: boolean; 
    disabled?: boolean;
    description?: string;
  }) => {
    return (
      <div className="flex items-center justify-between py-2 space-x-2">
        <div className="space-y-0.5">
          <Label htmlFor={field}>{label}</Label>
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
        <div className="flex items-center">
          {isUpdating === field ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : null}
          <Switch
            id={field}
            checked={value}
            onCheckedChange={(checked) => handleStatusToggle(field, checked)}
            disabled={disabled || !!isUpdating || !isAdmin}
          />
        </div>
      </div>
    );
  };
  
  // Check if IDF is fully received (sent AND received)
  const isIDFComplete = patent.idf_sent && patent.idf_received;
  
  // For CS Data status logic
  const isPSComplete = patent.ps_completion_status === 1;
  const isCSDataComplete = patent.cs_data && patent.cs_data_received;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Workflow Status</CardTitle>
        <CardDescription>Track patent lifecycle and workflow stages</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <h3 className="text-sm font-medium">Patent Status</h3>
          <StatusSwitch
            field="withdrawn"
            label="Withdrawn"
            value={patent.withdrawn || false}
            description="Mark this patent as withdrawn from further processing"
          />
          <StatusSwitch
            field="completed"
            label="Completed"
            value={patent.completed || false}
            description="Mark this patent as fully completed"
          />
        </div>
        
        <div className="space-y-3">
          <h3 className="text-sm font-medium">Invention Disclosure Form (IDF)</h3>
          <StatusSwitch
            field="idf_sent"
            label="IDF Sent"
            value={patent.idf_sent || false}
            description="IDF has been sent to the inventor/client"
          />
          <StatusSwitch
            field="idf_received"
            label="IDF Received"
            value={patent.idf_received || false}
            description="Completed IDF has been received from inventor/client"
          />
        </div>
        
        <div className="space-y-3">
          <h3 className="text-sm font-medium">Complete Specification Data</h3>
          <StatusSwitch
            field="cs_data"
            label="CS Data Sent"
            value={patent.cs_data || false}
            description="Request for CS data has been sent"
            disabled={!isPSComplete && !isAdmin}
          />
          <StatusSwitch
            field="cs_data_received"
            label="CS Data Received"
            value={patent.cs_data_received || false}
            description="CS data has been received and is ready for processing"
            disabled={!patent.cs_data && !isAdmin}
          />
        </div>
        
        {!isAdmin && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded text-sm">
            <p>Note: Some workflow statuses can only be changed by administrators.</p>
            {!isIDFComplete && (
              <p className="mt-1 font-medium">Tasks will be assigned only after IDF is received.</p>
            )}
            {isPSComplete && !isCSDataComplete && (
              <p className="mt-1 font-medium">CS work will begin after CS data is received.</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WorkflowStatusSection;
