
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ValidationErrorsCardProps {
  validationErrors: string[];
}

const ValidationErrorsCard: React.FC<ValidationErrorsCardProps> = ({ validationErrors }) => {
  if (validationErrors.length === 0) return null;
  
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-destructive">Validation Errors</CardTitle>
        <CardDescription>
          Please fix the following issues in your Excel file and try again.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="max-h-60 overflow-y-auto">
          {validationErrors.map((error, index) => (
            <Alert key={index} variant="destructive" className="mb-2">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ValidationErrorsCard;
