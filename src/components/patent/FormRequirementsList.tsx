
import React from 'react';
import { Patent } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, X } from 'lucide-react';

interface FormRequirementsListProps {
  patent: Patent;
  userRole?: string;
  onUpdate?: (formName: string, value: number) => void;
}

const FormRequirementsList: React.FC<FormRequirementsListProps> = ({ 
  patent, 
  userRole,
  onUpdate 
}) => {
  const isEditable = userRole === 'filer' && patent.cs_filer_assgn === userRole;
  
  const formFields = [
    { name: 'form_26', label: 'Form 26', value: patent.form_26 },
    { name: 'form_18', label: 'Form 18', value: patent.form_18 },
    { name: 'form_18a', label: 'Form 18A', value: patent.form_18a },
    { name: 'form_9', label: 'Form 9', value: patent.form_9 },
    { name: 'form_9a', label: 'Form 9A', value: patent.form_9a },
    { name: 'form_13', label: 'Form 13', value: patent.form_13 }
  ];
  
  const handleToggle = (formName: string, currentValue: number | null) => {
    if (onUpdate && isEditable) {
      onUpdate(formName, currentValue === 1 ? 0 : 1);
    }
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">CS Filing Forms</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {formFields.map((form) => (
            <div 
              key={form.name}
              className={`flex items-center justify-between p-2 rounded-md ${isEditable ? 'cursor-pointer hover:bg-muted/50' : ''} ${form.value === 1 ? 'bg-green-50' : 'bg-gray-50'}`}
              onClick={() => handleToggle(form.name, form.value)}
            >
              <span className="font-medium">{form.label}</span>
              {form.value === 1 ? (
                <div className="flex items-center text-green-600">
                  <Check className="h-4 w-4 mr-1" />
                  <span className="text-sm">Completed</span>
                </div>
              ) : (
                <div className="flex items-center text-gray-400">
                  <X className="h-4 w-4 mr-1" />
                  <span className="text-sm">Not Completed</span>
                </div>
              )}
            </div>
          ))}
          {patent.cs_filing_status === 0 && isEditable && (
            <p className="text-xs text-muted-foreground mt-2">
              Click on a form to toggle its status
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FormRequirementsList;
