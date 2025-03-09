
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, Loader2, User, Calendar } from 'lucide-react';
import { Patent } from '@/lib/types';
import { updatePatentStatus } from '@/lib/api';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';

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
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Calendar className="h-3 w-3" />
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
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Main Patent Status</h3>
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
      
      {/* New section: Team Members Working on This Patent */}
      <Card className="mt-6">
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4">Team Members Working on This Patent</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {patent.ps_drafter_assgn && (
              <div className="p-3 border rounded-md bg-slate-50">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="font-medium">{patent.ps_drafter_assgn}</div>
                    <div className="text-sm text-gray-500">PS Drafter</div>
                    {patent.ps_drafter_deadline && (
                      <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <Calendar className="h-3 w-3" />
                        <span>Deadline: {format(new Date(patent.ps_drafter_deadline), 'PPP')}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {patent.ps_filer_assgn && (
              <div className="p-3 border rounded-md bg-slate-50">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-green-600" />
                  <div>
                    <div className="font-medium">{patent.ps_filer_assgn}</div>
                    <div className="text-sm text-gray-500">PS Filer</div>
                    {patent.ps_filer_deadline && (
                      <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <Calendar className="h-3 w-3" />
                        <span>Deadline: {format(new Date(patent.ps_filer_deadline), 'PPP')}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {patent.cs_drafter_assgn && (
              <div className="p-3 border rounded-md bg-slate-50">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-purple-600" />
                  <div>
                    <div className="font-medium">{patent.cs_drafter_assgn}</div>
                    <div className="text-sm text-gray-500">CS Drafter</div>
                    {patent.cs_drafter_deadline && (
                      <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <Calendar className="h-3 w-3" />
                        <span>Deadline: {format(new Date(patent.cs_drafter_deadline), 'PPP')}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {patent.cs_filer_assgn && (
              <div className="p-3 border rounded-md bg-slate-50">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-orange-600" />
                  <div>
                    <div className="font-medium">{patent.cs_filer_assgn}</div>
                    <div className="text-sm text-gray-500">CS Filer</div>
                    {patent.cs_filer_deadline && (
                      <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <Calendar className="h-3 w-3" />
                        <span>Deadline: {format(new Date(patent.cs_filer_deadline), 'PPP')}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Show assigned FER team members if FER is enabled */}
            {patent.fer_status === 1 && (
              <>
                {/* Show assigned FER team members from the patent record */}
                {patent.fer_drafter_assgn && (
                  <div className="p-3 border rounded-md bg-slate-50">
                    <div className="flex items-center gap-2">
                      <User className="h-5 w-5 text-indigo-600" />
                      <div>
                        <div className="font-medium">{patent.fer_drafter_assgn}</div>
                        <div className="text-sm text-gray-500">FER Drafter (Main)</div>
                        {patent.fer_drafter_deadline && (
                          <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                            <Calendar className="h-3 w-3" />
                            <span>Deadline: {format(new Date(patent.fer_drafter_deadline), 'PPP')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                
                {patent.fer_filer_assgn && (
                  <div className="p-3 border rounded-md bg-slate-50">
                    <div className="flex items-center gap-2">
                      <User className="h-5 w-5 text-rose-600" />
                      <div>
                        <div className="font-medium">{patent.fer_filer_assgn}</div>
                        <div className="text-sm text-gray-500">FER Filer (Main)</div>
                        {patent.fer_filer_deadline && (
                          <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                            <Calendar className="h-3 w-3" />
                            <span>Deadline: {format(new Date(patent.fer_filer_deadline), 'PPP')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Also show FER entries team members if different from the main FER team */}
                {patent.fer_entries && patent.fer_entries.length > 0 && (
                  <div className="col-span-1 md:col-span-2 mt-2">
                    <h4 className="text-md font-medium mb-3">FER Entry Specific Assignments</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {patent.fer_entries.map((entry) => (
                        <React.Fragment key={entry.id}>
                          {entry.fer_drafter_assgn && entry.fer_drafter_assgn !== patent.fer_drafter_assgn && (
                            <div className="p-3 border rounded-md bg-slate-50">
                              <div className="flex items-center gap-2">
                                <User className="h-5 w-5 text-teal-600" />
                                <div>
                                  <div className="font-medium">{entry.fer_drafter_assgn}</div>
                                  <div className="text-sm text-gray-500">FER #{entry.fer_number} Drafter</div>
                                  {entry.fer_drafter_deadline && (
                                    <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                      <Calendar className="h-3 w-3" />
                                      <span>Deadline: {format(new Date(entry.fer_drafter_deadline), 'PPP')}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {entry.fer_filer_assgn && entry.fer_filer_assgn !== patent.fer_filer_assgn && (
                            <div className="p-3 border rounded-md bg-slate-50">
                              <div className="flex items-center gap-2">
                                <User className="h-5 w-5 text-amber-600" />
                                <div>
                                  <div className="font-medium">{entry.fer_filer_assgn}</div>
                                  <div className="text-sm text-gray-500">FER #{entry.fer_number} Filer</div>
                                  {entry.fer_filer_deadline && (
                                    <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                      <Calendar className="h-3 w-3" />
                                      <span>Deadline: {format(new Date(entry.fer_filer_deadline), 'PPP')}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>
      
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
