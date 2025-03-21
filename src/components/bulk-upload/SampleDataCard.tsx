
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileUp } from 'lucide-react';

interface SampleDataCardProps {
  downloadSampleExcel: () => void;
  handleSampleUpload: () => void;
  isUploading: boolean;
  isValidating: boolean;
}

const SampleDataCard: React.FC<SampleDataCardProps> = ({ 
  downloadSampleExcel, 
  handleSampleUpload, 
  isUploading, 
  isValidating 
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sample Data</CardTitle>
        <CardDescription>
          Download or upload sample patent data for testing.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={downloadSampleExcel} 
          className="w-full" 
          variant="outline"
        >
          <Download className="mr-2 h-4 w-4" />
          Download Sample Data
        </Button>
        
        <Button 
          onClick={handleSampleUpload} 
          className="w-full" 
          variant="secondary"
          disabled={isUploading || isValidating}
        >
          <FileUp className="mr-2 h-4 w-4" />
          Upload Sample Patent
        </Button>
      </CardContent>
    </Card>
  );
};

export default SampleDataCard;
