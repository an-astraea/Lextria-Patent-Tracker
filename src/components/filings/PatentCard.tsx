
import React from 'react';
import { Patent } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ClipboardList, CheckCircle } from 'lucide-react';

interface PatentCardProps {
  patent: Patent;
  user: any;
  onClick?: () => void;
  isComplete?: boolean;
}

const PatentCard: React.FC<PatentCardProps> = ({ patent, user, onClick, isComplete = false }) => {
  return (
    <Card 
      key={patent.id} 
      className={!isComplete ? "cursor-pointer hover:shadow-md transition-shadow" : ""}
      onClick={!isComplete ? onClick : undefined}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{patent.patent_title}</CardTitle>
        <CardDescription>ID: {patent.tracking_id}</CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="text-sm">
          <p>Applicant: {patent.patent_applicant}</p>
          <p>Client: {patent.client_id}</p>
          
          {/* Show which filing stage this patent is in for this filer */}
          {!isComplete && user?.full_name === patent.ps_filer_assgn && patent.ps_filing_status === 0 && (
            <div className="mt-2 bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-medium">
              PS Filing Stage
            </div>
          )}
          {!isComplete && user?.full_name === patent.cs_filer_assgn && patent.cs_filing_status === 0 && (
            <div className="mt-2 bg-green-50 text-green-700 px-2 py-1 rounded text-xs font-medium">
              CS Filing Stage
            </div>
          )}
          {!isComplete && user?.full_name === patent.fer_filer_assgn && patent.fer_filing_status === 0 && (
            <div className="mt-2 bg-yellow-50 text-yellow-700 px-2 py-1 rounded text-xs font-medium">
              FER Filing Stage
            </div>
          )}
          
          {/* Show which filing was completed by this filer */}
          {isComplete && user?.full_name === patent.ps_filer_assgn && patent.ps_filing_status === 1 && (
            <div className="mt-2 bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-medium">
              PS Filing Completed
              {patent.ps_review_file_status === 1 ? " - Approved" : " - Under Review"}
            </div>
          )}
          {isComplete && user?.full_name === patent.cs_filer_assgn && patent.cs_filing_status === 1 && (
            <div className="mt-2 bg-green-50 text-green-700 px-2 py-1 rounded text-xs font-medium">
              CS Filing Completed
              {patent.cs_review_file_status === 1 ? " - Approved" : " - Under Review"}
            </div>
          )}
          {isComplete && user?.full_name === patent.fer_filer_assgn && patent.fer_filing_status === 1 && (
            <div className="mt-2 bg-yellow-50 text-yellow-700 px-2 py-1 rounded text-xs font-medium">
              FER Filing Completed
              {patent.fer_review_file_status === 1 ? " - Approved" : " - Under Review"}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="ghost" size="sm" className="w-full" disabled={isComplete}>
          {isComplete ? (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Completed
            </>
          ) : (
            <>
              <ClipboardList className="w-4 h-4 mr-2" />
              Fill Forms
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PatentCard;
