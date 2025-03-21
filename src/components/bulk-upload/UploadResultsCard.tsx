
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface UploadResultsCardProps {
  uploadResults: {
    success: number;
    failed: number;
    errors: string[];
  };
  show: boolean;
}

const UploadResultsCard: React.FC<UploadResultsCardProps> = ({ uploadResults, show }) => {
  if (!show) return null;
  
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Upload Results</CardTitle>
        <CardDescription>
          Summary of the bulk upload operation.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <div className="font-semibold">Successfully Uploaded</div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {uploadResults.success}
              </div>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
              <div className="font-semibold">Failed to Upload</div>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {uploadResults.failed}
              </div>
            </div>
          </div>
          
          {uploadResults.errors.length > 0 && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Errors:</h3>
              <div className="max-h-60 overflow-y-auto">
                {uploadResults.errors.map((error, index) => (
                  <Alert key={index} variant="destructive" className="mb-2">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UploadResultsCard;
