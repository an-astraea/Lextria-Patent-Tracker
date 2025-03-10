
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, AlertCircle } from 'lucide-react';
import { Patent } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { format, isAfter, parseISO } from 'date-fns';

interface PendingFilingsListProps {
  patents: Patent[];
  username: string;
  onPatentClick: (patent: Patent) => void;
}

const PendingFilingsList: React.FC<PendingFilingsListProps> = ({
  patents,
  username,
  onPatentClick,
}) => {
  const navigate = useNavigate();

  const isDeadlinePassed = (deadline: string | undefined | null) => {
    if (!deadline) return false;
    return isAfter(new Date(), parseISO(deadline));
  };

  return (
    <div className="grid gap-6">
      {patents.map(patent => {
        let filingType = '';
        let deadline = '';
        
        if (patent.ps_filer_assgn === username && patent.ps_filing_status === 0) {
          filingType = 'PS';
          deadline = patent.ps_filer_deadline;
        } else if (patent.cs_filer_assgn === username && patent.cs_filing_status === 0) {
          filingType = 'CS';
          deadline = patent.cs_filer_deadline;
        } else if (patent.fer_filer_assgn === username && patent.fer_filing_status === 0) {
          filingType = 'FER';
          deadline = patent.fer_filer_deadline;
        }
        
        const isLate = isDeadlinePassed(deadline);
        
        return (
          <Card key={patent.id} className={isLate ? "border-red-500" : ""}>
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  {patent.patent_title}
                  {isLate && (
                    <Badge variant="destructive" className="ml-2">
                      <AlertCircle className="h-3 w-3 mr-1" /> Overdue
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Tracking ID: {patent.tracking_id} | Client: {patent.patent_applicant}
                </CardDescription>
              </div>
              <Badge>{filingType} Filing</Badge>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-sm font-medium text-gray-500">Deadline</div>
                  <div className="font-semibold">
                    {deadline ? format(new Date(deadline), 'PPP') : 'Not set'}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Application No</div>
                  <div className="font-semibold">{patent.application_no || 'N/A'}</div>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => navigate(`/patents/${patent.id}`)}>
                  View Details
                </Button>
                <Button onClick={() => onPatentClick(patent)}>
                  Complete Filing
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default PendingFilingsList;
