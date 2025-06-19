
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchPatents } from '@/lib/api/patent-api';
import PageHeader from '@/components/common/PageHeader';
import LoadingState from '@/components/common/LoadingState';
import PatentSearchSelect from '@/components/accounts/PatentSearchSelect';
import FinancialEntryForm from '@/components/accounts/FinancialEntryForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Accounts: React.FC = () => {
  const [selectedPatentId, setSelectedPatentId] = useState<string>('');

  const {
    data: patents = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['patents'],
    queryFn: fetchPatents,
  });

  const selectedPatent = patents.find(p => p.id === selectedPatentId);

  if (isLoading) return <LoadingState />;

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-600">
          Error loading patents data. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <PageHeader title="Accounts Management" />
      
      <Card>
        <CardHeader>
          <CardTitle>Select Patent for Financial Entry</CardTitle>
        </CardHeader>
        <CardContent>
          <PatentSearchSelect 
            patents={patents}
            selectedPatentId={selectedPatentId}
            onSelectPatent={setSelectedPatentId}
          />
        </CardContent>
      </Card>

      {selectedPatent && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Patent Details */}
          <Card>
            <CardHeader>
              <CardTitle>Patent Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Tracking ID</label>
                <p className="text-sm">{selectedPatent.tracking_id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Patent Title</label>
                <p className="text-sm">{selectedPatent.patent_title}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Client ID</label>
                <p className="text-sm">{selectedPatent.client_id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Patent Applicant</label>
                <p className="text-sm">{selectedPatent.patent_applicant}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Application Number</label>
                <p className="text-sm">{selectedPatent.application_no || 'Not available'}</p>
              </div>
            </CardContent>
          </Card>

          {/* Financial Entry Form */}
          <FinancialEntryForm patent={selectedPatent} />
        </div>
      )}
    </div>
  );
};

export default Accounts;
