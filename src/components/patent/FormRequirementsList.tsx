import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckSquare, FileDigit } from 'lucide-react';
import { Patent } from '@/lib/types';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface FormRequirementsListProps {
  patent: Patent;
  userRole: string;
  onUpdate?: (formName: string, value: boolean) => void;
  formValues?: Record<string, boolean>; // Add formValues prop
}

const FormRequirementsList: React.FC<FormRequirementsListProps> = ({ 
  patent, 
  userRole, 
  onUpdate,
  formValues // Use formValues if provided
}) => {
  // Whether the forms can be edited
  const isEditable = !!onUpdate && (userRole === 'admin' || userRole === 'filer');

  const handleFormChange = (formName: string) => (checked: boolean) => {
    if (onUpdate) {
      onUpdate(formName, checked);
    }
  };

  // Form items with label and corresponding property in Patent type
  const formItems = [
    { label: 'Form 1', field: 'form_1' },
    { label: 'Form 2 (PS)', field: 'form_2_ps' },
    { label: 'Form 2 (CS)', field: 'form_2_cs' },
    { label: 'Form 3', field: 'form_3' },
    { label: 'Form 4', field: 'form_4' },
    { label: 'Form 5', field: 'form_5' },
    { label: 'Form 6', field: 'form_6' },
    { label: 'Form 7', field: 'form_7' },
    { label: 'Form 7A', field: 'form_7a' },
    { label: 'Form 8', field: 'form_8' },
    { label: 'Form 8A', field: 'form_8a' },
    { label: 'Form 9', field: 'form_9' },
    { label: 'Form 9A', field: 'form_9a' },
    { label: 'Form 10', field: 'form_10' },
    { label: 'Form 11', field: 'form_11' },
    { label: 'Form 12', field: 'form_12' },
    { label: 'Form 13', field: 'form_13' },
    { label: 'Form 14', field: 'form_14' },
    { label: 'Form 15', field: 'form_15' },
    { label: 'Form 16', field: 'form_16' },
    { label: 'Form 17', field: 'form_17' },
    { label: 'Form 18', field: 'form_18' },
    { label: 'Form 18A', field: 'form_18a' },
    { label: 'Form 19', field: 'form_19' },
    { label: 'Form 20', field: 'form_20' },
    { label: 'Form 21', field: 'form_21' },
    { label: 'Form 22', field: 'form_22' },
    { label: 'Form 23', field: 'form_23' },
    { label: 'Form 24', field: 'form_24' },
    { label: 'Form 25', field: 'form_25' },
    { label: 'Form 26', field: 'form_26' },
    { label: 'Form 27', field: 'form_27' },
    { label: 'Form 28', field: 'form_28' },
    { label: 'Form 29', field: 'form_29' },
    { label: 'Form 30', field: 'form_30' },
    { label: 'Form 31', field: 'form_31' },
  ];

  // Get form value from either formValues prop or patent object
  const getFormValue = (field: string): boolean => {
    // First check formValues if provided
    if (formValues && field in formValues) {
      return !!formValues[field];
    }
    
    // Otherwise check the patent object
    const standardField = field;
    
    // Check if the standardized field exists in the patent
    if (patent[standardField as keyof Patent] !== undefined) {
      return !!patent[standardField as keyof Patent];
    }
    
    // Map to legacy field names if needed
    const legacyFieldMap: Record<string, string> = {
      'form_1': 'form_01',
      'form_2_ps': 'form_02_ps',
      'form_2_cs': 'form_02_cs',
      'form_3': 'form_03',
      'form_4': 'form_04',
      'form_5': 'form_05',
      'form_6': 'form_06',
      'form_7': 'form_07',
      'form_7a': 'form_07a',
      'form_8': 'form_08',
      'form_8a': 'form_08a',
      'form_9': 'form_09',
      'form_9a': 'form_09a',
    };
    
    const legacyField = legacyFieldMap[field];
    if (legacyField && patent[legacyField as keyof Patent] !== undefined) {
      return !!patent[legacyField as keyof Patent];
    }
    
    return false;
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <FileDigit className="h-5 w-5 text-muted-foreground" />
          Form Requirements
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-2">
          {formItems.map((item) => (
            <div key={item.field} className="flex items-center space-x-2">
              {isEditable ? (
                <Checkbox 
                  id={item.field} 
                  checked={getFormValue(item.field)} 
                  onCheckedChange={handleFormChange(item.field)}
                />
              ) : (
                <div className={`h-4 w-4 flex items-center justify-center rounded-sm border border-primary ${getFormValue(item.field) ? 'bg-primary text-primary-foreground' : 'opacity-50'}`}>
                  {getFormValue(item.field) && <CheckSquare className="h-3 w-3" />}
                </div>
              )}
              <Label 
                htmlFor={item.field} 
                className={`text-sm ${getFormValue(item.field) ? 'font-medium' : 'text-muted-foreground'}`}
              >
                {item.label}
              </Label>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default FormRequirementsList;
