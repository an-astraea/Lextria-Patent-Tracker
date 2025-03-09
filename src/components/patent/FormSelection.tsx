
import React, { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Patent } from '@/lib/types';

interface FormSelectionProps {
  patent?: Patent;
  onSelectForm: (formName: string, checked: boolean) => void;
  initialForms?: Record<string, boolean>;
}

const FormSelection: React.FC<FormSelectionProps> = ({ 
  patent, 
  onSelectForm, 
  initialForms = {} 
}) => {
  const formGroups = [
    {
      name: 'Essential Forms',
      forms: [
        { key: 'form_01', label: 'Form 01 - Application for Grant of Patent' },
        { key: 'form_02_ps', label: 'Form 02 - Provisional Specification' },
        { key: 'form_02_cs', label: 'Form 02 - Complete Specification' },
        { key: 'form_03', label: 'Form 03 - Statement and Undertaking Under Section 8' },
        { key: 'form_05', label: 'Form 05 - Declaration as to Inventorship' },
        { key: 'form_18', label: 'Form 18 - Request for Examination' },
        { key: 'form_26', label: 'Form 26 - Authorization of Patent Agent' },
      ]
    },
    {
      name: 'Additional Forms',
      forms: [
        { key: 'form_04', label: 'Form 04 - Request for Extension of Time' },
        { key: 'form_06', label: 'Form 06 - Application for Change in Applicant' },
        { key: 'form_08', label: 'Form 08 - Claim/Request for Mention of Inventor' },
        { key: 'form_09', label: 'Form 09 - Request for Publication' },
        { key: 'form_13', label: 'Form 13 - Application for Amendment' },
        { key: 'form_18a', label: 'Form 18(A) - Request for Expedited Examination' },
      ]
    },
    {
      name: 'Specialized Forms',
      forms: [
        { key: 'form_07', label: 'Form 07 - Notice of Opposition' },
        { key: 'form_07a', label: 'Form 07(A) - Representation for Opposition' },
        { key: 'form_08a', label: 'Form 08(A) - Certificate of Inventorship' },
        { key: 'form_09a', label: 'Form 09(A) - Representation for Publication' },
        { key: 'form_10', label: 'Form 10 - Application for Amendment of Patent' },
        { key: 'form_11', label: 'Form 11 - Application for Direction of Controller' },
        { key: 'form_12', label: 'Form 12 - Request for Grant of Patent' },
        { key: 'form_14', label: 'Form 14 - Notice of Opposition to Amendment' },
        { key: 'form_15', label: 'Form 15 - Application for Restoration of Patent' },
        { key: 'form_16', label: 'Form 16 - Application for Restoration of Rights' },
        { key: 'form_17', label: 'Form 17 - Application for Compulsory License' },
        { key: 'form_19', label: 'Form 19 - Application for Revocation' },
        { key: 'form_20', label: 'Form 20 - Application for Revision of Terms' },
        { key: 'form_21', label: 'Form 21 - Request for Termination of License' },
        { key: 'form_22', label: 'Form 22 - Application for Registration as Agent' },
        { key: 'form_23', label: 'Form 23 - Application for Restoration in Register' },
        { key: 'form_24', label: 'Form 24 - Application for Review' },
        { key: 'form_25', label: 'Form 25 - Request for Permission for Foreign Filing' },
        { key: 'form_27', label: 'Form 27 - Statement of Working of Patent' },
        { key: 'form_28', label: 'Form 28 - Small Entity/Startup Declaration' },
        { key: 'form_29', label: 'Form 29 - Request for Withdrawal of Application' },
        { key: 'form_30', label: 'Form 30 - General Form' },
        { key: 'form_31', label: 'Form 31 - Grace Period' },
      ]
    }
  ];

  // Initialize a state for checkboxes using initialForms or default to empty object
  const [checkedForms, setCheckedForms] = useState<Record<string, boolean>>(initialForms);

  // Handle checkbox changes
  const handleCheckboxChange = (formKey: string, checked: boolean) => {
    setCheckedForms({
      ...checkedForms,
      [formKey]: checked
    });
    onSelectForm(formKey, checked);
  };

  return (
    <div className="rounded-md border p-4 mt-4">
      <h3 className="font-medium text-sm mb-2">Required Forms for Filing</h3>
      <p className="text-xs text-muted-foreground mb-4">
        Select the forms that are included in this filing
      </p>

      <ScrollArea className="h-[300px] pr-4">
        <Accordion type="multiple" className="w-full">
          {formGroups.map((group, index) => (
            <AccordionItem key={index} value={`group-${index}`}>
              <AccordionTrigger className="text-sm font-medium hover:no-underline">
                {group.name}
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  {group.forms.map((form) => (
                    <div key={form.key} className="flex items-center space-x-2 py-1">
                      <Checkbox 
                        id={form.key} 
                        checked={checkedForms[form.key] || false}
                        onCheckedChange={(checked) => 
                          handleCheckboxChange(form.key, checked === true)
                        }
                      />
                      <Label 
                        htmlFor={form.key} 
                        className="cursor-pointer text-sm"
                      >
                        {form.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </ScrollArea>
    </div>
  );
};

export default FormSelection;
