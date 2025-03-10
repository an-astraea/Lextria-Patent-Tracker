
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/date-picker';
import { Switch } from '@/components/ui/switch';
import { Employee, PatentFormData } from '@/lib/types';

interface AssignmentsFormProps {
  formValues: PatentFormData;
  employees: Employee[];
  handleSelectChange: (name: string, value: string) => void;
  handleDateChange: (name: string, date: Date | undefined) => void;
}

const AssignmentsForm: React.FC<AssignmentsFormProps> = ({
  formValues,
  employees,
  handleSelectChange,
  handleDateChange
}) => {
  const drafters = employees.filter(emp => emp.role === 'drafter');
  const filers = employees.filter(emp => emp.role === 'filer');

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Provisional Specification</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="ps_drafter_assgn">PS Drafter</Label>
            <Select 
              value={formValues.ps_drafter_assgn || ''} 
              onValueChange={value => handleSelectChange('ps_drafter_assgn', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select drafter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                {drafters.map(drafter => (
                  <SelectItem key={drafter.id} value={drafter.full_name}>
                    {drafter.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="ps_drafter_deadline">Drafter Deadline</Label>
            <DatePicker
              id="ps_drafter_deadline"
              name="ps_drafter_deadline"
              date={formValues.ps_drafter_deadline ? new Date(formValues.ps_drafter_deadline) : undefined}
              onSelect={(date) => handleDateChange('ps_drafter_deadline', date)}
            />
          </div>
          <div>
            <Label htmlFor="ps_filer_assgn">PS Filer</Label>
            <Select 
              value={formValues.ps_filer_assgn || ''} 
              onValueChange={value => handleSelectChange('ps_filer_assgn', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select filer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                {filers.map(filer => (
                  <SelectItem key={filer.id} value={filer.full_name}>
                    {filer.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="ps_filer_deadline">Filer Deadline</Label>
            <DatePicker
              id="ps_filer_deadline"
              name="ps_filer_deadline"
              date={formValues.ps_filer_deadline ? new Date(formValues.ps_filer_deadline) : undefined}
              onSelect={(date) => handleDateChange('ps_filer_deadline', date)}
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Complete Specification</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="cs_drafter_assgn">CS Drafter</Label>
            <Select 
              value={formValues.cs_drafter_assgn || ''} 
              onValueChange={value => handleSelectChange('cs_drafter_assgn', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select drafter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                {drafters.map(drafter => (
                  <SelectItem key={drafter.id} value={drafter.full_name}>
                    {drafter.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="cs_drafter_deadline">Drafter Deadline</Label>
            <DatePicker
              id="cs_drafter_deadline"
              name="cs_drafter_deadline"
              date={formValues.cs_drafter_deadline ? new Date(formValues.cs_drafter_deadline) : undefined}
              onSelect={(date) => handleDateChange('cs_drafter_deadline', date)}
            />
          </div>
          <div>
            <Label htmlFor="cs_filer_assgn">CS Filer</Label>
            <Select 
              value={formValues.cs_filer_assgn || ''} 
              onValueChange={value => handleSelectChange('cs_filer_assgn', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select filer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                {filers.map(filer => (
                  <SelectItem key={filer.id} value={filer.full_name}>
                    {filer.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="cs_filer_deadline">Filer Deadline</Label>
            <DatePicker
              id="cs_filer_deadline"
              name="cs_filer_deadline"
              date={formValues.cs_filer_deadline ? new Date(formValues.cs_filer_deadline) : undefined}
              onSelect={(date) => handleDateChange('cs_filer_deadline', date)}
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">First Examination Report (FER)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <Switch 
                id="fer_status" 
                checked={formValues.fer_status === 1}
                onCheckedChange={checked => handleSelectChange('fer_status', checked ? '1' : '0')}
              />
              <Label htmlFor="fer_status">Enable FER</Label>
            </div>
          </div>
          {formValues.fer_status === 1 && (
            <>
              <div>
                <Label htmlFor="fer_drafter_assgn">FER Drafter</Label>
                <Select 
                  value={formValues.fer_drafter_assgn || ''} 
                  onValueChange={value => handleSelectChange('fer_drafter_assgn', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select drafter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {drafters.map(drafter => (
                      <SelectItem key={drafter.id} value={drafter.full_name}>
                        {drafter.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="fer_drafter_deadline">Drafter Deadline</Label>
                <DatePicker
                  id="fer_drafter_deadline"
                  name="fer_drafter_deadline"
                  date={formValues.fer_drafter_deadline ? new Date(formValues.fer_drafter_deadline) : undefined}
                  onSelect={(date) => handleDateChange('fer_drafter_deadline', date)}
                />
              </div>
              <div>
                <Label htmlFor="fer_filer_assgn">FER Filer</Label>
                <Select 
                  value={formValues.fer_filer_assgn || ''} 
                  onValueChange={value => handleSelectChange('fer_filer_assgn', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select filer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {filers.map(filer => (
                      <SelectItem key={filer.id} value={filer.full_name}>
                        {filer.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="fer_filer_deadline">Filer Deadline</Label>
                <DatePicker
                  id="fer_filer_deadline"
                  name="fer_filer_deadline"
                  date={formValues.fer_filer_deadline ? new Date(formValues.fer_filer_deadline) : undefined}
                  onSelect={(date) => handleDateChange('fer_filer_deadline', date)}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssignmentsForm;
