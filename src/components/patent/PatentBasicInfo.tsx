
import React from 'react';
import { Patent } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building, CalendarClock, FileText, User } from 'lucide-react';

interface PatentBasicInfoProps {
  patent: Patent;
}

const PatentBasicInfo: React.FC<PatentBasicInfoProps> = ({ patent }) => {
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Basic Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Tracking ID</p>
              <p className="text-sm text-muted-foreground">{patent.tracking_id}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Building className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Applicant</p>
              <p className="text-sm text-muted-foreground">{patent.patent_applicant}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Client ID</p>
              <p className="text-sm text-muted-foreground">{patent.client_id}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Filing Date</p>
              <p className="text-sm text-muted-foreground">{formatDate(patent.date_of_filing)}</p>
            </div>
          </div>

          {patent.application_no && (
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Application No.</p>
                <p className="text-sm text-muted-foreground">{patent.application_no}</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PatentBasicInfo;
