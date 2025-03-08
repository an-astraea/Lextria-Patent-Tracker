
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Patent } from '@/lib/types';
import { getSelectedForms, formatFormName } from '@/lib/data';
import { Check } from 'lucide-react';

interface SelectedFormsListProps {
  patent: Patent;
  title?: string;
}

const SelectedFormsList: React.FC<SelectedFormsListProps> = ({
  patent,
  title = "Selected Forms"
}) => {
  const selectedForms = getSelectedForms(patent);
  
  if (selectedForms.length === 0) {
    return null;
  }
  
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {selectedForms.map((formKey) => (
            <div key={formKey} className="flex items-center space-x-2 bg-secondary/30 p-2 rounded-md">
              <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
              <span className="text-sm">{formatFormName(formKey)}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SelectedFormsList;
