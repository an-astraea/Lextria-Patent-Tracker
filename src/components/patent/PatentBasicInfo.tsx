
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Patent } from '@/lib/types';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface PatentBasicInfoProps {
  patent: Patent;
}

const PatentBasicInfo: React.FC<PatentBasicInfoProps> = ({ patent }) => {
  // Format date function
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  // Determine task prerequisites status
  const hasIDFReceived = patent.idf_received === true;
  const hasCSDataReceived = patent.cs_data_received === true && patent.cs_data === true;
  
  // Determine assignment status
  const isPSAssigned = patent.ps_drafter_assgn && !hasIDFReceived;
  const isCSAssigned = patent.cs_drafter_assgn && !hasCSDataReceived;

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
          <div>
            <div className="text-sm font-medium text-gray-500">PS Drafter</div>
            <div className="font-semibold flex items-center gap-1">
              {patent.ps_drafter_assgn || 'N/A'}
              {patent.ps_drafter_assgn && !hasIDFReceived && (
                <div className="flex items-center gap-1 text-amber-500 text-xs">
                  <AlertCircle className="h-3 w-3" /> Waiting for IDF
                </div>
              )}
              {patent.ps_drafter_assgn && hasIDFReceived && (
                <div className="flex items-center gap-1 text-green-500 text-xs">
                  <CheckCircle2 className="h-3 w-3" /> IDF Received
                </div>
              )}
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500">CS Drafter</div>
            <div className="font-semibold flex items-center gap-1">
              {patent.cs_drafter_assgn || 'N/A'}
              {patent.cs_drafter_assgn && !hasCSDataReceived && (
                <div className="flex items-center gap-1 text-amber-500 text-xs">
                  <AlertCircle className="h-3 w-3" /> Waiting for CS Data
                </div>
              )}
              {patent.cs_drafter_assgn && hasCSDataReceived && (
                <div className="flex items-center gap-1 text-green-500 text-xs">
                  <CheckCircle2 className="h-3 w-3" /> CS Data Received
                </div>
              )}
            </div>
          </div>
          
          {/* Status indicators */}
          <div>
            <div className="text-sm font-medium text-gray-500">IDF Status</div>
            <div className="font-semibold">
              {patent.idf_sent ? (
                <span className="text-green-500">Sent</span>
              ) : (
                <span className="text-gray-400">Not Sent</span>
              )}
              {' | '}
              {patent.idf_received ? (
                <span className="text-green-500">Received</span>
              ) : (
                <span className="text-gray-400">Not Received</span>
              )}
            </div>
          </div>
          
          <div>
            <div className="text-sm font-medium text-gray-500">CS Data Status</div>
            <div className="font-semibold">
              {patent.cs_data ? (
                <span className="text-green-500">Sent</span>
              ) : (
                <span className="text-gray-400">Not Sent</span>
              )}
              {' | '}
              {patent.cs_data_received ? (
                <span className="text-green-500">Received</span>
              ) : (
                <span className="text-gray-400">Not Received</span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PatentBasicInfo;
