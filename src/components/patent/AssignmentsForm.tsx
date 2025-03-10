
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/date-picker';
import { format } from 'date-fns';
import { PatentFormData, Employee } from '@/lib/types';

interface AssignmentsFormProps {
  formValues: Pick<PatentFormData, 'ps_drafter_assgn' | 'ps_drafter_deadline' | 'ps_filer_assgn' | 
    'ps_filer_deadline' | 'cs_drafter_assgn' | 'cs_drafter_deadline' | 'cs_filer_assgn' | 
    'cs_filer_deadline' | 'fer_status' | 'fer_drafter_assgn' | 'fer_drafter_deadline' | 
    'fer_filer_assgn' | 'fer_filer_deadline'>;
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
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="space-y-2">
          <Label htmlFor="ps_drafter_assgn">PS Drafter Assignment</Label>
          <Select
            value={formValues.ps_drafter_assgn || "none"}
            onValueChange={(value) => handleSelectChange('ps_drafter_assgn', value === "none" ? "" : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select drafter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {employees
                .filter(emp => emp.role === 'drafter' || emp.role === 'admin')
                .map(emp => (
                  <SelectItem key={emp.id} value={emp.full_name}>{emp.full_name}</SelectItem>
                ))
              }
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="ps_drafter_deadline">PS Drafter Deadline</Label>
          <DatePicker 
            id="ps_drafter_deadline"
            name="ps_drafter_deadline"
            date={formValues.ps_drafter_deadline ? new Date(formValues.ps_drafter_deadline) : undefined}
            onSelect={(date) => handleDateChange('ps_drafter_deadline', date)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="space-y-2">
          <Label htmlFor="ps_filer_assgn">PS Filer Assignment</Label>
          <Select
            value={formValues.ps_filer_assgn || "none"}
            onValueChange={(value) => handleSelectChange('ps_filer_assgn', value === "none" ? "" : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select filer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {employees
                .filter(emp => emp.role === 'filer' || emp.role === 'admin')
                .map(emp => (
                  <SelectItem key={emp.id} value={emp.full_name}>{emp.full_name}</SelectItem>
                ))
              }
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="ps_filer_deadline">PS Filer Deadline</Label>
          <DatePicker 
            id="ps_filer_deadline"
            name="ps_filer_deadline"
            date={formValues.ps_filer_deadline ? new Date(formValues.ps_filer_deadline) : undefined}
            onSelect={(date) => handleDateChange('ps_filer_deadline', date)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="space-y-2">
          <Label htmlFor="cs_drafter_assgn">CS Drafter Assignment</Label>
          <Select
            value={formValues.cs_drafter_assgn || "none"}
            onValueChange={(value) => handleSelectChange('cs_drafter_assgn', value === "none" ? "" : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select drafter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {employees
                .filter(emp => emp.role === 'drafter' || emp.role === 'admin')
                .map(emp => (
                  <SelectItem key={emp.id} value={emp.full_name}>{emp.full_name}</SelectItem>
                ))
              }
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="cs_drafter_deadline">CS Drafter Deadline</Label>
          <DatePicker 
            id="cs_drafter_deadline"
            name="cs_drafter_deadline"
            date={formValues.cs_drafter_deadline ? new Date(formValues.cs_drafter_deadline) : undefined}
            onSelect={(date) => handleDateChange('cs_drafter_deadline', date)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="space-y-2">
          <Label htmlFor="cs_filer_assgn">CS Filer Assignment</Label>
          <Select
            value={formValues.cs_filer_assgn || "none"}
            onValueChange={(value) => handleSelectChange('cs_filer_assgn', value === "none" ? "" : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select filer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {employees
                .filter(emp => emp.role === 'filer' || emp.role === 'admin')
                .map(emp => (
                  <SelectItem key={emp.id} value={emp.full_name}>{emp.full_name}</SelectItem>
                ))
              }
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="cs_filer_deadline">CS Filer Deadline</Label>
          <DatePicker 
            id="cs_filer_deadline"
            name="cs_filer_deadline"
            date={formValues.cs_filer_deadline ? new Date(formValues.cs_filer_deadline) : undefined}
            onSelect={(date) => handleDateChange('cs_filer_deadline', date)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="space-y-2">
          <Label htmlFor="fer_status">FER Status</Label>
          <Select
            value={formValues.fer_status.toString()}
            onValueChange={(value) => handleSelectChange('fer_status', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select FER status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Inactive</SelectItem>
              <SelectItem value="1">Active</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {formValues.fer_status === 1 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="space-y-2">
              <Label htmlFor="fer_drafter_assgn">FER Drafter Assignment</Label>
              <Select
                value={formValues.fer_drafter_assgn || "none"}
                onValueChange={(value) => handleSelectChange('fer_drafter_assgn', value === "none" ? "" : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select drafter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {employees
                    .filter(emp => emp.role === 'drafter' || emp.role === 'admin')
                    .map(emp => (
                      <SelectItem key={emp.id} value={emp.full_name}>{emp.full_name}</SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fer_drafter_deadline">FER Drafter Deadline</Label>
              <DatePicker 
                id="fer_drafter_deadline"
                name="fer_drafter_deadline"
                date={formValues.fer_drafter_deadline ? new Date(formValues.fer_drafter_deadline) : undefined}
                onSelect={(date) => handleDateChange('fer_drafter_deadline', date)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="space-y-2">
              <Label htmlFor="fer_filer_assgn">FER Filer Assignment</Label>
              <Select
                value={formValues.fer_filer_assgn || "none"}
                onValueChange={(value) => handleSelectChange('fer_filer_assgn', value === "none" ? "" : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select filer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {employees
                    .filter(emp => emp.role === 'filer' || emp.role === 'admin')
                    .map(emp => (
                      <SelectItem key={emp.id} value={emp.full_name}>{emp.full_name}</SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fer_filer_deadline">FER Filer Deadline</Label>
              <DatePicker 
                id="fer_filer_deadline"
                name="fer_filer_deadline"
                date={formValues.fer_filer_deadline ? new Date(formValues.fer_filer_deadline) : undefined}
                onSelect={(date) => handleDateChange('fer_filer_deadline', date)}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AssignmentsForm;
