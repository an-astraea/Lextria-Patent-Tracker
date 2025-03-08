
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { formatFormName, isFormSelected } from '@/lib/data';
import { Patent } from '@/lib/types';
import { Label } from '@/components/ui/label';

interface FormRequirementsListProps {
  patent: Patent;
  onChange?: (formKey: string, checked: boolean) => void;
  stage: 'ps' | 'cs' | 'fer';
  readonly?: boolean;
}

const FormRequirementsList: React.FC<FormRequirementsListProps> = ({
  patent,
  onChange,
  stage,
  readonly = false
}) => {
  // Define common forms that should be available in all stages
  const commonForms = [
    'form_01', 'form_03', 'form_04', 'form_05', 'form_06', 'form_07', 'form_07a', 
    'form_08', 'form_08a', 'form_09', 'form_10', 'form_11', 'form_12', 'form_13', 
    'form_14', 'form_15', 'form_16', 'form_17', 'form_18', 'form_18a', 'form_19', 
    'form_20', 'form_21', 'form_22', 'form_23', 'form_24', 'form_25', 'form_26', 
    'form_27', 'form_28', 'form_29', 'form_30', 'form_31'
  ];
  
  // Define stage-specific forms
  const stageSpecificForms = {
    ps: ['form_02_ps'],
    cs: ['form_02_cs'],
    fer: []
  };
  
  // Combine common forms with stage-specific forms
  const relevantForms = [...commonForms, ...stageSpecificForms[stage]];

  const handleCheckboxChange = (formKey: string, checked: boolean) => {
    if (onChange) {
      onChange(formKey, checked);
    }
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {relevantForms.map((formKey) => (
        <div key={formKey} className="flex items-center space-x-2">
          <Checkbox
            id={`${stage}-${formKey}`}
            checked={isFormSelected(patent, formKey)}
            onCheckedChange={(checked) => handleCheckboxChange(formKey, !!checked)}
            disabled={readonly}
          />
          <Label htmlFor={`${stage}-${formKey}`} className="cursor-pointer">
            {formatFormName(formKey)}
          </Label>
        </div>
      ))}
    </div>
  );
};

export default FormRequirementsList;
