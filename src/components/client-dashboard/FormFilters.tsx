
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';

interface FormFiltersProps {
  formStatus: Record<string, boolean>;
  handleFilterChange: (filterGroup: string, filterName: string, value: boolean) => void;
}

const FormFilters: React.FC<FormFiltersProps> = ({
  formStatus,
  handleFilterChange
}) => {
  return (
    <div>
      <h5 className="mb-2 text-sm font-medium">Form Status</h5>
      <div className="space-y-2">
        {Object.entries(formStatus).map(([key, value]) => (
          <div key={key} className="flex items-center">
            <Checkbox 
              id={key}
              checked={value}
              onCheckedChange={(checked) => 
                handleFilterChange('formStatus', key, checked as boolean)
              }
            />
            <label htmlFor={key} className="ml-2 text-sm">
              {key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FormFilters;
