
import React from 'react';
import { Patent } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DeadlineDisplay from './DeadlineDisplay';
import { User } from 'lucide-react';

interface AssignmentDetailsProps {
  patent: Patent;
}

const AssignmentDetails: React.FC<AssignmentDetailsProps> = ({ patent }) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Assignment Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="border-b pb-3">
            <h3 className="font-medium mb-2">Provisional Specification</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {patent.ps_drafter_assgn && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Drafter: {patent.ps_drafter_assgn}</span>
                </div>
              )}
              {patent.ps_drafter_deadline && (
                <DeadlineDisplay 
                  date={patent.ps_drafter_deadline} 
                  label="Draft Due" 
                />
              )}
              
              {patent.ps_filer_assgn && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Filer: {patent.ps_filer_assgn}</span>
                </div>
              )}
              {patent.ps_filer_deadline && (
                <DeadlineDisplay 
                  date={patent.ps_filer_deadline} 
                  label="Filing Due" 
                />
              )}
            </div>
          </div>
          
          <div className="border-b pb-3">
            <h3 className="font-medium mb-2">Complete Specification</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {patent.cs_drafter_assgn && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Drafter: {patent.cs_drafter_assgn}</span>
                </div>
              )}
              {patent.cs_drafter_deadline && (
                <DeadlineDisplay 
                  date={patent.cs_drafter_deadline} 
                  label="Draft Due" 
                />
              )}
              
              {patent.cs_filer_assgn && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Filer: {patent.cs_filer_assgn}</span>
                </div>
              )}
              {patent.cs_filer_deadline && (
                <DeadlineDisplay 
                  date={patent.cs_filer_deadline} 
                  label="Filing Due" 
                />
              )}
            </div>
          </div>
          
          {patent.fer_status === 1 && (
            <div>
              <h3 className="font-medium mb-2">First Examination Report (FER)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {patent.fer_drafter_assgn && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Drafter: {patent.fer_drafter_assgn}</span>
                  </div>
                )}
                {patent.fer_drafter_deadline && (
                  <DeadlineDisplay 
                    date={patent.fer_drafter_deadline} 
                    label="Draft Due" 
                  />
                )}
                
                {patent.fer_filer_assgn && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Filer: {patent.fer_filer_assgn}</span>
                  </div>
                )}
                {patent.fer_filer_deadline && (
                  <DeadlineDisplay 
                    date={patent.fer_filer_deadline} 
                    label="Filing Due" 
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AssignmentDetails;
