
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Patent } from '@/lib/types';

interface PatentBasicInfoProps {
  patent: Patent;
}

const PatentBasicInfo: React.FC<PatentBasicInfoProps> = ({ patent }) => {
  // Format date function
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Patent Information</CardTitle>
        <CardDescription>Details about the patent application</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm font-medium text-gray-500">Tracking ID</div>
            <div className="font-semibold">{patent.tracking_id || 'N/A'}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500">Patent Applicant</div>
            <div className="font-semibold">{patent.patent_applicant || 'N/A'}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500">Client ID</div>
            <div className="font-semibold">{patent.client_id || 'N/A'}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500">Application No</div>
            <div className="font-semibold">{patent.application_no || 'N/A'}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500">Date of Filing</div>
            <div className="font-semibold">{formatDate(patent.date_of_filing)}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500">Patent Title</div>
            <div className="font-semibold">{patent.patent_title || 'N/A'}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500">Applicant Address</div>
            <div className="font-semibold">{patent.applicant_addr || 'N/A'}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500">Inventor Phone No</div>
            <div className="font-semibold">{patent.inventor_ph_no || 'N/A'}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500">Inventor Email</div>
            <div className="font-semibold">{patent.inventor_email || 'N/A'}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PatentBasicInfo;
