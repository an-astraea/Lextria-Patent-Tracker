
import React, { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FormSelectionProps {
  onSelectForm: (formName: string, checked: boolean) => void;
  selectedForms?: Record<string, boolean>;
}

const FormSelection: React.FC<FormSelectionProps> = ({ onSelectForm, selectedForms = {} }) => {
  const [isOpen, setIsOpen] = useState(false);

  const formGroups = [
    {
      title: 'Common Forms',
      forms: [
        { id: 'form_01', label: 'Form 1' },
        { id: 'form_02_ps', label: 'Form 2 (PS)' },
        { id: 'form_02_cs', label: 'Form 2 (CS)' },
        { id: 'form_03', label: 'Form 3' },
        { id: 'form_13', label: 'Form 13' },
        { id: 'form_18', label: 'Form 18' },
      ]
    },
    {
      title: 'Other Forms',
      forms: [
        { id: 'form_04', label: 'Form 4' },
        { id: 'form_05', label: 'Form 5' },
        { id: 'form_09', label: 'Form 9' },
        { id: 'form_09a', label: 'Form 9A' },
        { id: 'form_18a', label: 'Form 18A' },
        { id: 'form_26', label: 'Form 26' },
        { id: 'form_27', label: 'Form 27' },
      ]
    }
  ];

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="mt-4 p-2 border rounded-md"
    >
      <CollapsibleTrigger asChild>
        <Button variant="ghost" className="flex w-full justify-between p-2">
          <span>Required Forms</span>
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-2">
        <div className="grid gap-4">
          {formGroups.map((group) => (
            <div key={group.title} className="space-y-2">
              <h4 className="text-sm font-medium">{group.title}</h4>
              <div className="grid grid-cols-2 gap-2">
                {group.forms.map((form) => (
                  <div key={form.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={form.id}
                      checked={selectedForms[form.id] || false}
                      onCheckedChange={(checked) => 
                        onSelectForm(form.id, checked === true)
                      }
                    />
                    <Label htmlFor={form.id} className="text-sm">
                      {form.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default FormSelection;
