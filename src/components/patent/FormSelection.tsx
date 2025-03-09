
import React, { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface FormSelectionProps {
  onSelectForm: (formName: string, checked: boolean) => void;
}

const FormSelection: React.FC<FormSelectionProps> = ({ onSelectForm }) => {
  const [selectedForms, setSelectedForms] = useState<Record<string, boolean>>({});
  
  const handleCheckboxChange = (formName: string, checked: boolean) => {
    setSelectedForms(prev => ({
      ...prev,
      [formName]: checked
    }));
    onSelectForm(formName, checked);
  };
  
  const formGroups = [
    {
      title: 'Basic Forms',
      forms: [
        { name: 'form_01', label: 'Form 1' },
        { name: 'form_02_ps', label: 'Form 2 (PS)' },
        { name: 'form_02_cs', label: 'Form 2 (CS)' },
        { name: 'form_03', label: 'Form 3' },
        { name: 'form_04', label: 'Form 4' },
        { name: 'form_05', label: 'Form 5' }
      ]
    },
    {
      title: 'Additional Forms',
      forms: [
        { name: 'form_06', label: 'Form 6' },
        { name: 'form_07', label: 'Form 7' },
        { name: 'form_07a', label: 'Form 7a' },
        { name: 'form_08', label: 'Form 8' },
        { name: 'form_08a', label: 'Form 8a' },
        { name: 'form_09', label: 'Form 9' },
        { name: 'form_09a', label: 'Form 9a' },
        { name: 'form_10', label: 'Form 10' }
      ]
    },
    {
      title: 'Supplementary Forms',
      forms: [
        { name: 'form_11', label: 'Form 11' },
        { name: 'form_12', label: 'Form 12' },
        { name: 'form_13', label: 'Form 13' },
        { name: 'form_14', label: 'Form 14' },
        { name: 'form_15', label: 'Form 15' },
        { name: 'form_16', label: 'Form 16' },
        { name: 'form_17', label: 'Form 17' },
        { name: 'form_18', label: 'Form 18' },
        { name: 'form_18a', label: 'Form 18a' },
        { name: 'form_19', label: 'Form 19' },
        { name: 'form_20', label: 'Form 20' }
      ]
    },
    {
      title: 'Special Forms',
      forms: [
        { name: 'form_21', label: 'Form 21' },
        { name: 'form_22', label: 'Form 22' },
        { name: 'form_23', label: 'Form 23' },
        { name: 'form_24', label: 'Form 24' },
        { name: 'form_25', label: 'Form 25' },
        { name: 'form_26', label: 'Form 26' },
        { name: 'form_27', label: 'Form 27' },
        { name: 'form_28', label: 'Form 28' },
        { name: 'form_29', label: 'Form 29' },
        { name: 'form_30', label: 'Form 30' },
        { name: 'form_31', label: 'Form 31' }
      ]
    }
  ];
  
  return (
    <div className="mt-4">
      <h3 className="text-sm font-semibold mb-2">Required Forms</h3>
      <Accordion type="multiple" className="bg-gray-50 rounded-md p-2">
        {formGroups.map((group, groupIndex) => (
          <AccordionItem key={groupIndex} value={`item-${groupIndex}`}>
            <AccordionTrigger className="text-sm">{group.title}</AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-2 gap-2">
                {group.forms.map((form, formIndex) => (
                  <div key={formIndex} className="flex items-center space-x-2">
                    <Checkbox
                      id={form.name}
                      checked={selectedForms[form.name] || false}
                      onCheckedChange={(checked) => handleCheckboxChange(form.name, checked === true)}
                    />
                    <Label htmlFor={form.name} className="text-xs cursor-pointer">
                      {form.label}
                    </Label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default FormSelection;
