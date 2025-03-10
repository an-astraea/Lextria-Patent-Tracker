
import React from 'react';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/date-picker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Employee } from '@/lib/types';

interface AssignmentsFormProps {
  formValues: {
    ps_drafter_assgn: string;
    ps_drafter_deadline: string;
    ps_filer_assgn: string;
    ps_filer_deadline: string;
    cs_drafter_assgn: string;
    cs_drafter_deadline: string;
    cs_filer_assgn: string;
    cs_filer_deadline: string;
    fer_status: number;
    fer_drafter_assgn: string;
    fer_drafter_deadline: string;
    fer_filer_assgn: string;
    fer_filer_deadline: string;
  };
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div>
        <Label htmlFor="ps_drafter_assgn">PS Drafter Assigned</Label>
        <Select 
          value={formValues.ps_drafter_assgn} 
          onValueChange={(value) => handleSelectChange('ps_drafter_assgn', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select drafter" />
          </SelectTrigger>
          <SelectContent>
            {employees.map((employee) => (
              <SelectItem key={employee.id} value={employee.full_name}>{employee.full_name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="ps_drafter_deadline">PS Drafter Deadline</Label>
        <DatePicker
          id="ps_drafter_deadline"
          name="ps_drafter_deadline"
          date={formValues.ps_drafter_deadline ? new Date(formValues.ps_drafter_deadline) : undefined}
          onSelect={(date) => handleDateChange('ps_drafter_deadline', date)}
        />
      </div>
      <div>
        <Label htmlFor="ps_filer_assgn">PS Filer Assigned</Label>
        <Select 
          value={formValues.ps_filer_assgn} 
          onValueChange={(value) => handleSelectChange('ps_filer_assgn', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select filer" />
          </SelectTrigger>
          <SelectContent>
            {employees.map((employee) => (
              <SelectItem key={employee.id} value={employee.full_name}>{employee.full_name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="ps_filer_deadline">PS Filer Deadline</Label>
        <DatePicker
          id="ps_filer_deadline"
          name="ps_filer_deadline"
          date={formValues.ps_filer_deadline ? new Date(formValues.ps_filer_deadline) : undefined}
          onSelect={(date) => handleDateChange('ps_filer_deadline', date)}
        />
      </div>
      <div>
        <Label htmlFor="cs_drafter_assgn">CS Drafter Assigned</Label>
        <Select 
          value={formValues.cs_drafter_assgn} 
          onValueChange={(value) => handleSelectChange('cs_drafter_assgn', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select drafter" />
          </SelectTrigger>
          <SelectContent>
            {employees.map((employee) => (
              <SelectItem key={employee.id} value={employee.full_name}>{employee.full_name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="cs_drafter_deadline">CS Drafter Deadline</Label>
        <DatePicker
          id="cs_drafter_deadline"
          name="cs_drafter_deadline"
          date={formValues.cs_drafter_deadline ? new Date(formValues.cs_drafter_deadline) : undefined}
          onSelect={(date) => handleDateChange('cs_drafter_deadline', date)}
        />
      </div>
      <div>
        <Label htmlFor="cs_filer_assgn">CS Filer Assigned</Label>
        <Select 
          value={formValues.cs_filer_assgn} 
          onValueChange={(value) => handleSelectChange('cs_filer_assgn', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select filer" />
          </SelectTrigger>
          <SelectContent>
            {employees.map((employee) => (
              <SelectItem key={employee.id} value={employee.full_name}>{employee.full_name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="cs_filer_deadline">CS Filer Deadline</Label>
        <DatePicker
          id="cs_filer_deadline"
          name="cs_filer_deadline"
          date={formValues.cs_filer_deadline ? new Date(formValues.cs_filer_deadline) : undefined}
          onSelect={(date) => handleDateChange('cs_filer_deadline', date)}
        />
      </div>
      <div>
        <Label htmlFor="fer_status">FER Status</Label>
        <Select 
          value={formValues.fer_status.toString()} 
          onValueChange={(value) => handleSelectChange('fer_status', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">Inactive</SelectItem>
            <SelectItem value="1">Active</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="fer_drafter_assgn">FER Drafter Assigned</Label>
        <Select 
          value={formValues.fer_drafter_assgn} 
          onValueChange={(value) => handleSelectChange('fer_drafter_assgn', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select drafter" />
          </SelectTrigger>
          <SelectContent>
            {employees.map((employee) => (
              <SelectItem key={employee.id} value={employee.full_name}>{employee.full_name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="fer_drafter_deadline">FER Drafter Deadline</Label>
        <DatePicker
          id="fer_drafter_deadline"
          name="fer_drafter_deadline"
          date={formValues.fer_drafter_deadline ? new Date(formValues.fer_drafter_deadline) : undefined}
          onSelect={(date) => handleDateChange('fer_drafter_deadline', date)}
        />
      </div>
      <div>
        <Label htmlFor="fer_filer_assgn">FER Filer Assigned</Label>
        <Select 
          value={formValues.fer_filer_assgn} 
          onValueChange={(value) => handleSelectChange('fer_filer_assgn', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select filer" />
          </SelectTrigger>
          <SelectContent>
            {employees.map((employee) => (
              <SelectItem key={employee.id} value={employee.full_name}>{employee.full_name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="fer_filer_deadline">FER Filer Deadline</Label>
        <DatePicker
          id="fer_filer_deadline"
          name="fer_filer_deadline"
          date={formValues.fer_filer_deadline ? new Date(formValues.fer_filer_deadline) : undefined}
          onSelect={(date) => handleDateChange('fer_filer_deadline', date)}
        />
      </div>
    </div>
  );
};

export default AssignmentsForm;
