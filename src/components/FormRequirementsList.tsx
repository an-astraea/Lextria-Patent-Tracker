
import React from 'react';
import { Patent } from '@/lib/types';

export interface FormRequirementsListProps {
  patent: Patent;
  userRole: string;
  onUpdate?: (formName: string, value: boolean) => void;
  formValues?: Record<string, boolean>;
}

export const FormRequirementsList: React.FC<FormRequirementsListProps> = ({ 
  patent, 
  userRole, 
  onUpdate,
  formValues
}) => {
  const formFields = [
    { name: 'form_01', label: 'Form 1', description: 'Application for Grant of Patent' },
    { name: 'form_02', label: 'Form 2', description: 'Provisional/Complete Specification' },
    { name: 'form_02_ps', label: 'Form 2 (PS)', description: 'Provisional Specification' },
    { name: 'form_02_cs', label: 'Form 2 (CS)', description: 'Complete Specification' },
    { name: 'form_03', label: 'Form 3', description: 'Statement and Undertaking' },
    { name: 'form_04', label: 'Form 4', description: 'Request for Extension of Time' },
    { name: 'form_05', label: 'Form 5', description: 'Declaration as to Inventorship' },
    { name: 'form_06', label: 'Form 6', description: 'Application for Patent of Addition' },
    { name: 'form_07', label: 'Form 7', description: 'Application for Restoration of Patent' },
    { name: 'form_07a', label: 'Form 7A', description: 'Additional Fee for Restoration' },
    { name: 'form_08', label: 'Form 8', description: 'Statement of Working of Patented Invention' },
    { name: 'form_08a', label: 'Form 8A', description: 'Statement Regarding Working of Patented Invention' },
    { name: 'form_09', label: 'Form 9', description: 'Request for Termination of Compulsory License' },
    { name: 'form_09a', label: 'Form 9A', description: 'Request for Settlement of Terms of License' },
    { name: 'form_10', label: 'Form 10', description: 'Request for Making Specification Available for Public Inspection' },
    { name: 'form_11', label: 'Form 11', description: 'Application for Direction of Controller' },
    { name: 'form_12', label: 'Form 12', description: 'Request for Grant of Patent' },
    { name: 'form_13', label: 'Form 13', description: 'Application for Amendment of Application for Patent' },
    { name: 'form_14', label: 'Form 14', description: 'Request for Controller\'s Certificate' },
    { name: 'form_15', label: 'Form 15', description: 'Application for Revocation of Patent' },
    { name: 'form_16', label: 'Form 16', description: 'Application for Registration of Title' },
    { name: 'form_17', label: 'Form 17', description: 'Application for Compulsory License' },
    { name: 'form_18', label: 'Form 18', description: 'Request for Examination of Application for Patent' },
    { name: 'form_18a', label: 'Form 18A', description: 'Request for Expedited Examination of Application for Patent' },
    { name: 'form_19', label: 'Form 19', description: 'Form for International Application' },
    { name: 'form_20', label: 'Form 20', description: 'Application for Deletion of Inventor' },
    { name: 'form_21', label: 'Form 21', description: 'Request for Hearing' },
    { name: 'form_22', label: 'Form 22', description: 'Application for Registration as Patent Agent' },
    { name: 'form_23', label: 'Form 23', description: 'Application for Restoration of Right of Priority' },
    { name: 'form_24', label: 'Form 24', description: 'Request for Certificate of Invention' },
    { name: 'form_25', label: 'Form 25', description: 'Request for Information' },
    { name: 'form_26', label: 'Form 26', description: 'Form for Authorization of a Patent Agent' },
    { name: 'form_27', label: 'Form 27', description: 'Request for Certified Copy' },
    { name: 'form_28', label: 'Form 28', description: 'Request for Information' },
    { name: 'form_29', label: 'Form 29', description: 'Notice of Opposition' },
    { name: 'form_30', label: 'Form 30', description: 'Form for Registration of Design' },
    { name: 'form_31', label: 'Form 31', description: 'Application for Registration of Copyright' },
  ];

  const getValue = (formName: string): boolean => {
    // First check in formValues if it exists (for editing scenarios)
    if (formValues && formName in formValues) {
      return !!formValues[formName];
    }

    // Then check the patent object directly
    const formKey = formName as keyof Patent;
    return !!patent[formKey];
  };

  const handleToggle = (formName: string) => {
    if (onUpdate) {
      onUpdate(formName, !getValue(formName));
    }
  };

  const canEdit = userRole === 'admin' || userRole === 'filer';

  // Display only relevant forms based on role and patent stage
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {formFields.map((field) => (
          <div key={field.name} className="flex items-center space-x-2 p-2 border rounded hover:bg-gray-50">
            <input
              type="checkbox"
              id={field.name}
              checked={getValue(field.name)}
              onChange={() => handleToggle(field.name)}
              disabled={!canEdit || !onUpdate}
              className="rounded border-gray-300"
            />
            <label htmlFor={field.name} className="flex-1 cursor-pointer">
              <div className="font-medium">{field.label}</div>
              <div className="text-sm text-gray-500">{field.description}</div>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FormRequirementsList;
