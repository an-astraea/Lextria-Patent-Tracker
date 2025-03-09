
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface FormSelectionProps {
  onSelectForm: (formName: string, checked: boolean) => void;
}

const FormSelection: React.FC<FormSelectionProps> = ({ onSelectForm }) => {
  const forms = [
    { id: 'form_01', label: 'Form 1' },
    { id: 'form_02_ps', label: 'Form 2 (PS)' },
    { id: 'form_02_cs', label: 'Form 2 (CS)' },
    { id: 'form_03', label: 'Form 3' },
    { id: 'form_09', label: 'Form 9' },
    { id: 'form_09a', label: 'Form 9A' },
    { id: 'form_13', label: 'Form 13' },
    { id: 'form_18', label: 'Form 18' },
    { id: 'form_18a', label: 'Form 18A' },
    { id: 'form_26', label: 'Form 26' }
  ];

  return (
    <div className="mt-4 border p-3 rounded-md bg-gray-50">
      <h4 className="font-medium mb-2">Select Forms for CS Filing</h4>
      <div className="grid grid-cols-2 gap-2">
        {forms.map((form) => (
          <div key={form.id} className="flex items-center space-x-2">
            <Checkbox 
              id={form.id} 
              onCheckedChange={(checked) => onSelectForm(form.id, checked === true)}
            />
            <Label htmlFor={form.id} className="text-sm">{form.label}</Label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FormSelection;
