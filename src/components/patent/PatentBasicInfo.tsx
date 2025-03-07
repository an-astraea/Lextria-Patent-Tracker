
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Patent } from '@/lib/types';
import FilingDateDisplay from './FilingDateDisplay';

interface PatentBasicInfoProps {
  patent: Patent;
}

const PatentBasicInfo: React.FC<PatentBasicInfoProps> = ({ patent }) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2">
            <div>
              <h2 className="text-xl font-semibold">{patent.patent_title}</h2>
              <p className="text-sm text-muted-foreground">Tracking ID: {patent.tracking_id}</p>
            </div>
            {patent.application_no && (
              <Badge variant="outline" className="md:self-start">
                Application: {patent.application_no}
              </Badge>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium">Applicant</p>
              <p>{patent.patent_applicant}</p>
            </div>
            <div>
              <p className="font-medium">Client ID</p>
              <p>{patent.client_id}</p>
            </div>
            <div>
              <p className="font-medium">Filing Date</p>
              <FilingDateDisplay date={patent.date_of_filing} />
            </div>
            <div>
              <p className="font-medium">Applicant Address</p>
              <p className="break-words">{patent.applicant_addr}</p>
            </div>
            <div>
              <p className="font-medium">Inventor Phone</p>
              <p>{patent.inventor_ph_no}</p>
            </div>
            <div>
              <p className="font-medium">Inventor Email</p>
              <p className="break-words">{patent.inventor_email}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PatentBasicInfo;
