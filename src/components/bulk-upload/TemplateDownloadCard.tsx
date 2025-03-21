
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface TemplateDownloadCardProps {
  downloadTemplate: () => void;
}

const TemplateDownloadCard: React.FC<TemplateDownloadCardProps> = ({ downloadTemplate }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Download Template</CardTitle>
        <CardDescription>
          Download an Excel template with the required fields for bulk patent upload.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={downloadTemplate} className="w-full" variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Download Template
        </Button>
      </CardContent>
    </Card>
  );
};

export default TemplateDownloadCard;
