
import React from 'react';
import { Patent } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, X } from 'lucide-react';

interface FormRequirementsListProps {
  patent: Patent;
  userRole?: string;
  onUpdate?: (formName: string, value: boolean) => void;
  formValues?: Record<string, boolean>;
}

const FormRequirementsList: React.FC<FormRequirementsListProps> = ({ 
  patent, 
  userRole,
  onUpdate,
  formValues
}) => {
  const isEditable = userRole === 'filer' || userRole === 'admin';
  
  const formatFormName = (formKey: string): string => {
    const formMap: Record<string, string> = {
      'form_1': 'Form 01 - Application for Grant of Patent',
      'form_2': 'Form 02 - Provisional/Complete Specification',
      'form_3': 'Form 03 - Statement and Undertaking Under Section 8',
      'form_4': 'Form 04 - Request for Extension of Time',
      'form_5': 'Form 05 - Declaration as to Inventorship',
      'form_6': 'Form 06 - Claim or Request Regarding Any Change in Applicant',
      'form_7': 'Form 07 - Notice of Opposition',
      'form_9': 'Form 09 - Request for Publication',
      'form_9a': 'Form 09(A) - Representation for Publication',
      'form_8': 'Form 08 - Claim or Request Regarding Mention of Inventor',
      'form_10': 'Form 10 - Application for Amendment of Patent',
      'form_11': 'Form 11 - Application for Direction of the Controller',
      'form_12': 'Form 12 - Request for Grant of Patent Under Section 26(1) and 52(2)',
      'form_13': 'Form 13 - Application for Amendment of Application/Complete Specification',
      'form_14': 'Form 14 - Notice of Opposition to Amendment/Restoration/Surrender',
      'form_15': 'Form 15 - Application for Restoration of Patent',
      'form_16': 'Form 16 - Application for Restoration of Title/Interest',
      'form_17': 'Form 17 - Application for Compulsory Licence',
      'form_18': 'Form 18 - Request for Examination of Patent Application',
      'form_18a': 'Form 18(A) - Request for Expedited Examination of Application',
      'form_19': 'Form 19 - Application for Revocation of a Patent for Non-Working',
      'form_20': 'Form 20 - Application for Revision of Terms and Conditions of Licence',
      'form_21': 'Form 21 - Request for Termination of Compulsory Licence',
      'form_22': 'Form 22 - Application for Registration of Patent Agent',
      'form_23': 'Form 23 - Application for Restoration of Name in Register of Patent Agents',
      'form_24': 'Form 24 - Application for Review/Setting Aside Controller Decision',
      'form_25': 'Form 25 - Request for Permission for Making Patent Application Outside India',
      'form_26': 'Form 26 - Authorisation of a Patent Agent/Any Person',
      'form_27': 'Form 27 - Statement Regarding the Working of the Patented Invention',
      'form_28': 'Form 28 - To Be Submitted by Small Entity/Startup',
      'form_29': 'Form 29 - Request for Withdrawal of the Application for Patent',
      'form_30': 'Form 30 - To Be Used When No Other Form Is Prescribed',
      'form_31': 'Form 31 - Grace Period'
    };
    
    return formMap[formKey] || formKey.replace('_', ' ').toUpperCase();
  };
  
  const formFields = [
    { name: 'form_1', value: formValues ? formValues['form_1'] : patent.form_1 },
    { name: 'form_2', value: formValues ? formValues['form_2'] : patent.form_2 },
    { name: 'form_3', value: formValues ? formValues['form_3'] : patent.form_3 },
    { name: 'form_4', value: formValues ? formValues['form_4'] : patent.form_4 },
    { name: 'form_5', value: formValues ? formValues['form_5'] : patent.form_5 },
    { name: 'form_6', value: formValues ? formValues['form_6'] : patent.form_6 },
    { name: 'form_7', value: formValues ? formValues['form_7'] : patent.form_7 },
    { name: 'form_8', value: formValues ? formValues['form_8'] : patent.form_8 },
    { name: 'form_9', value: formValues ? formValues['form_9'] : patent.form_9 },
    { name: 'form_9a', value: formValues ? formValues['form_9a'] : patent.form_9a },
    { name: 'form_10', value: formValues ? formValues['form_10'] : patent.form_10 },
    { name: 'form_11', value: formValues ? formValues['form_11'] : patent.form_11 },
    { name: 'form_12', value: formValues ? formValues['form_12'] : patent.form_12 },
    { name: 'form_13', value: formValues ? formValues['form_13'] : patent.form_13 },
    { name: 'form_14', value: formValues ? formValues['form_14'] : patent.form_14 },
    { name: 'form_15', value: formValues ? formValues['form_15'] : patent.form_15 },
    { name: 'form_16', value: formValues ? formValues['form_16'] : patent.form_16 },
    { name: 'form_17', value: formValues ? formValues['form_17'] : patent.form_17 },
    { name: 'form_18', value: formValues ? formValues['form_18'] : patent.form_18 },
    { name: 'form_18a', value: formValues ? formValues['form_18a'] : patent.form_18a },
    { name: 'form_19', value: formValues ? formValues['form_19'] : patent.form_19 },
    { name: 'form_20', value: formValues ? formValues['form_20'] : patent.form_20 },
    { name: 'form_21', value: formValues ? formValues['form_21'] : patent.form_21 },
    { name: 'form_22', value: formValues ? formValues['form_22'] : patent.form_22 },
    { name: 'form_23', value: formValues ? formValues['form_23'] : patent.form_23 },
    { name: 'form_24', value: formValues ? formValues['form_24'] : patent.form_24 },
    { name: 'form_25', value: formValues ? formValues['form_25'] : patent.form_25 },
    { name: 'form_26', value: formValues ? formValues['form_26'] : patent.form_26 },
    { name: 'form_27', value: formValues ? formValues['form_27'] : patent.form_27 },
    { name: 'form_28', value: formValues ? formValues['form_28'] : patent.form_28 },
    { name: 'form_29', value: formValues ? formValues['form_29'] : patent.form_29 },
    { name: 'form_30', value: formValues ? formValues['form_30'] : patent.form_30 },
    { name: 'form_31', value: formValues ? formValues['form_31'] : patent.form_31 }
  ];
  
  const handleToggle = (formName: string, currentValue: boolean | null | undefined) => {
    if (onUpdate && isEditable) {
      onUpdate(formName, currentValue === true ? false : true);
    }
  };
  
  return (
    <Card className="mt-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Patent Forms</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
          {formFields.map((form) => (
            <div 
              key={form.name}
              className={`flex items-center justify-between p-2 rounded-md ${isEditable ? 'cursor-pointer hover:bg-muted/50' : ''} ${form.value === true ? 'bg-green-50' : 'bg-gray-50'}`}
              onClick={() => handleToggle(form.name, form.value)}
            >
              <span className="font-medium text-sm">{formatFormName(form.name)}</span>
              {form.value === true ? (
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
        </div>
        {isEditable && (
          <p className="text-xs text-muted-foreground mt-4">
            Click on a form to toggle its status
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default FormRequirementsList;
