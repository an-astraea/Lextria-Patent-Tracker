
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const InstructionsCard: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Instructions</CardTitle>
        <CardDescription>
          How to use the bulk upload feature.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ol className="list-decimal pl-5 space-y-2">
          <li>Click "Download Template" to get the Excel template with required fields.</li>
          <li>Or click "Download Sample Data" to get a pre-filled Excel file with example data.</li>
          <li>Fill the template with your patent data. Fields marked with * are required.</li>
          <li>You can add multiple inventors by adding columns: inventor_name2, inventor_addr2, etc.</li>
          <li>Save the file and click "Upload" to submit your data.</li>
          <li>The system will validate your data before uploading. Fix any reported errors.</li>
          <li>After validation, click "Confirm Upload" to complete the process.</li>
          <li>Review the upload results for any errors.</li>
          <li>For quick testing, use the "Upload Sample Patent" option to add a pre-filled sample patent.</li>
        </ol>
        
        <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
          <h3 className="font-semibold text-amber-800 dark:text-amber-400">Important Notes:</h3>
          <ul className="list-disc pl-5 space-y-1 text-sm text-amber-700 dark:text-amber-300">
            <li>Each patent requires at least one inventor.</li>
            <li>The tracking_id must be unique for each patent.</li>
            <li>Use YYYY-MM-DD format for all date fields.</li>
            <li>Employee assignments must match existing employee names in the system.</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default InstructionsCard;
