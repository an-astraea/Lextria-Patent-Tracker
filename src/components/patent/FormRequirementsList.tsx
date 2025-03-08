
import React from 'react';
import { Patent } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, X } from 'lucide-react';

interface FormRequirementsListProps {
  patent: Patent;
  userRole?: string;
  onUpdate?: (formName: string, value: boolean) => void;
}

const FormRequirementsList: React.FC<FormRequirementsListProps> = ({ 
  patent, 
  userRole,
  onUpdate 
}) => {
  const isEditable = userRole === 'filer' || userRole === 'admin';
  
  const formatFormName = (formKey: string): string => {
    const formMap: Record<string, string> = {
      'form_01': 'Form 01 - Application for Grant of Patent',
      'form_02_ps': 'Form 02 - Provisional Specification',
      'form_02_cs': 'Form 02 - Complete Specification',
      'form_03': 'Form 03 - Statement and Undertaking Under Section 8',
      'form_04': 'Form 04 - Request for Extension of Time',
      'form_05': 'Form 05 - Declaration as to Inventorship',
      'form_06': 'Form 06 - Claim or Request Regarding Any Change in Applicant',
      'form_07': 'Form 07 - Notice of Opposition',
      'form_07a': 'Form 07(A) - Representation for Opposition to Grant of Patent',
      'form_08': 'Form 08 - Claim or Request Regarding Mention of Inventor',
      'form_08a': 'Form 08(A) - Certificate of Inventorship',
      'form_09': 'Form 09 - Request for Publication',
      'form_09a': 'Form 09(A) - Representation for Publication',
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
    { name: 'form_01', value: patent.form_01 },
    { name: 'form_02_ps', value: patent.form_02_ps },
    { name: 'form_02_cs', value: patent.form_02_cs },
    { name: 'form_03', value: patent.form_03 },
    { name: 'form_04', value: patent.form_04 },
    { name: 'form_05', value: patent.form_05 },
    { name: 'form_06', value: patent.form_06 },
    { name: 'form_07', value: patent.form_07 },
    { name: 'form_07a', value: patent.form_07a },
    { name: 'form_08', value: patent.form_08 },
    { name: 'form_08a', value: patent.form_08a },
    { name: 'form_09', value: patent.form_09 },
    { name: 'form_09a', value: patent.form_09a },
    { name: 'form_10', value: patent.form_10 },
    { name: 'form_11', value: patent.form_11 },
    { name: 'form_12', value: patent.form_12 },
    { name: 'form_13', value: patent.form_13 },
    { name: 'form_14', value: patent.form_14 },
    { name: 'form_15', value: patent.form_15 },
    { name: 'form_16', value: patent.form_16 },
    { name: 'form_17', value: patent.form_17 },
    { name: 'form_18', value: patent.form_18 },
    { name: 'form_18a', value: patent.form_18a },
    { name: 'form_19', value: patent.form_19 },
    { name: 'form_20', value: patent.form_20 },
    { name: 'form_21', value: patent.form_21 },
    { name: 'form_22', value: patent.form_22 },
    { name: 'form_23', value: patent.form_23 },
    { name: 'form_24', value: patent.form_24 },
    { name: 'form_25', value: patent.form_25 },
    { name: 'form_26', value: patent.form_26 },
    { name: 'form_27', value: patent.form_27 },
    { name: 'form_28', value: patent.form_28 },
    { name: 'form_29', value: patent.form_29 },
    { name: 'form_30', value: patent.form_30 },
    { name: 'form_31', value: patent.form_31 }
  ];
  
  const handleToggle = (formName: string, currentValue: boolean | null) => {
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
