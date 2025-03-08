
import React from 'react';
import { Patent } from '@/lib/types';
import { Checkbox } from '@/components/ui/checkbox';

interface FormSectionProps {
  patent: Patent;
  user: any;
  formValues: { [key: string]: boolean };
  onFormChange: (formId: string, checked: boolean) => void;
}

const FormSection: React.FC<FormSectionProps> = ({ 
  patent, 
  user, 
  formValues, 
  onFormChange 
}) => {
  // Common forms that appear in all filing stages
  const CommonForms = () => (
    <div className="space-y-4 mt-6 pt-4 border-t">
      <h3 className="text-lg font-medium">Common Forms</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="form_01" 
            checked={formValues.form_01 || false}
            onCheckedChange={(checked) => onFormChange('form_01', checked as boolean)}
          />
          <label htmlFor="form_01" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Form 1 - Application for Patent
          </label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="form_03" 
            checked={formValues.form_03 || false}
            onCheckedChange={(checked) => onFormChange('form_03', checked as boolean)}
          />
          <label htmlFor="form_03" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Form 3 - Declaration of Inventorship
          </label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="form_05" 
            checked={formValues.form_05 || false}
            onCheckedChange={(checked) => onFormChange('form_05', checked as boolean)}
          />
          <label htmlFor="form_05" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Form 5 - Declaration of Inventorship
          </label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="form_26" 
            checked={formValues.form_26 || false}
            onCheckedChange={(checked) => onFormChange('form_26', checked as boolean)}
          />
          <label htmlFor="form_26" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Form 26 - Power of Attorney
          </label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="form_28" 
            checked={formValues.form_28 || false}
            onCheckedChange={(checked) => onFormChange('form_28', checked as boolean)}
          />
          <label htmlFor="form_28" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Form 28 - Small Entity Declaration
          </label>
        </div>
      </div>
    </div>
  );
  
  // PS Filing stage
  if (user?.full_name === patent.ps_filer_assgn && patent.ps_filing_status === 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Provisional Specification Forms</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="form_02_ps" 
              checked={formValues.form_02_ps || false}
              onCheckedChange={(checked) => onFormChange('form_02_ps', checked as boolean)}
            />
            <label htmlFor="form_02_ps" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Form 2 - Provisional Specification
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="form_04" 
              checked={formValues.form_04 || false}
              onCheckedChange={(checked) => onFormChange('form_04', checked as boolean)}
            />
            <label htmlFor="form_04" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Form 4 - Request for Early Publication
            </label>
          </div>
          {/* Add any additional PS specific forms here */}
        </div>
        <CommonForms />
      </div>
    );
  }
  
  // CS Filing stage
  if (user?.full_name === patent.cs_filer_assgn && patent.cs_filing_status === 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Complete Specification Forms</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="form_02_cs" 
              checked={formValues.form_02_cs || false}
              onCheckedChange={(checked) => onFormChange('form_02_cs', checked as boolean)}
            />
            <label htmlFor="form_02_cs" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Form 2 - Complete Specification
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="form_18" 
              checked={formValues.form_18 || false}
              onCheckedChange={(checked) => onFormChange('form_18', checked as boolean)}
            />
            <label htmlFor="form_18" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Form 18 - Request for Examination
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="form_18a" 
              checked={formValues.form_18a || false}
              onCheckedChange={(checked) => onFormChange('form_18a', checked as boolean)}
            />
            <label htmlFor="form_18a" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Form 18A - Expedited Examination
            </label>
          </div>
        </div>
        <CommonForms />
      </div>
    );
  }
  
  // FER Filing stage
  if (user?.full_name === patent.fer_filer_assgn && patent.fer_filing_status === 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium">FER Response Forms</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="form_13" 
              checked={formValues.form_13 || false}
              onCheckedChange={(checked) => onFormChange('form_13', checked as boolean)}
            />
            <label htmlFor="form_13" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Form 13 - FER Response
            </label>
          </div>
        </div>
        <CommonForms />
      </div>
    );
  }
  
  return null;
};

export default FormSection;
