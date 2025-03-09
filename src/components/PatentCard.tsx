import React from 'react';
import { Patent, PatentCardProps } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PatentCardProps {
  patent: Patent;
  key?: string;
  isCompact?: boolean;
  showClientInfo?: boolean;
  showReviewBadge?: boolean;
}

const PatentCard: React.FC<PatentCardProps> = ({ patent, isCompact = false, showClientInfo = false, showReviewBadge = false }) => {
  return (
    <Link to={`/patents/${patent.id}`}>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="flex justify-between items-start">
            <div className="truncate">{patent.patent_title}</div>
            {showReviewBadge && (
              <Badge variant="secondary">Review</Badge>
            )}
          </CardTitle>
          <CardDescription>ID: {patent.tracking_id}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          {showClientInfo && (
            <div className="flex items-center space-x-2">
              <Building className="h-4 w-4 text-gray-500" />
              <span>Client: {patent.client_id}</span>
            </div>
          )}
          <div className="flex items-center space-x-2">
            <FileText className="h-4 w-4 text-gray-500" />
            <span>Applicant: {patent.patent_applicant}</span>
          </div>
          {!isCompact && (
            <>
              <div>
                <span className="font-medium">Filing Date:</span> {patent.date_of_filing}
              </div>
              <div>
                <span className="font-medium">Inventors:</span> {patent.inventors?.map(i => i.inventor_name).join(', ')}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </Link>
  );
};

export default PatentCard;
