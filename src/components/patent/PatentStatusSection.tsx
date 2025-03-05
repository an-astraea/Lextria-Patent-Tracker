
import React from 'react';
import { Patent } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StatusBadge from '@/components/StatusBadge';

interface PatentStatusSectionProps {
  patent: Patent;
}

const PatentStatusSection: React.FC<PatentStatusSectionProps> = ({ patent }) => {
  // Determine overall status
  const determineStatus = (patent: Patent) => {
    if (patent.ps_completion_status === 1 && patent.cs_completion_status === 1) {
      return 'completed';
    } else if ((patent.ps_drafting_status === 1 || patent.cs_drafting_status === 1 || patent.fer_drafter_status === 1) && 
               (patent.ps_filing_status === 0 || patent.cs_filing_status === 0 || patent.fer_filing_status === 0)) {
      return 'inProgress';
    } else if (patent.ps_drafting_status === 0 && patent.cs_drafting_status === 0) {
      return 'notStarted';
    } else {
      return 'pending';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Patent Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Overall Status</h3>
            <StatusBadge status={determineStatus(patent)} />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Provisional Specification</h3>
            <div className="flex flex-wrap gap-2">
              <StatusBadge 
                status={patent.ps_drafting_status === 1 ? 'completed' : 'pending'} 
                label="PS Draft" 
                showIcon={false} 
                className="text-xs" 
              />
              <StatusBadge 
                status={patent.ps_filing_status === 1 ? 'completed' : 'pending'} 
                label="PS Filing" 
                showIcon={false} 
                className="text-xs" 
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Complete Specification</h3>
            <div className="flex flex-wrap gap-2">
              <StatusBadge 
                status={patent.cs_drafting_status === 1 ? 'completed' : 'pending'} 
                label="CS Draft" 
                showIcon={false} 
                className="text-xs" 
              />
              <StatusBadge 
                status={patent.cs_filing_status === 1 ? 'completed' : 'pending'} 
                label="CS Filing" 
                showIcon={false} 
                className="text-xs" 
              />
            </div>
          </div>
          
          {patent.fer_status === 1 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">First Examination Report</h3>
              <div className="flex flex-wrap gap-2">
                <StatusBadge 
                  status={patent.fer_drafter_status === 1 ? 'completed' : 'pending'} 
                  label="FER Draft" 
                  showIcon={false} 
                  className="text-xs" 
                />
                <StatusBadge 
                  status={patent.fer_filing_status === 1 ? 'completed' : 'pending'} 
                  label="FER Filing" 
                  showIcon={false} 
                  className="text-xs" 
                />
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PatentStatusSection;
