
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/date-picker';
import { format } from 'date-fns';
import { PatentFormData } from '@/lib/types';

interface PatentBasicInfoFormProps {
  formValues: Pick<PatentFormData, 'tracking_id' | 'patent_applicant' | 'client_id' | 
    'application_no' | 'date_of_filing' | 'patent_title' | 'applicant_addr' | 
    'inventor_ph_no' | 'inventor_email'>;
  formErrors: Record<string, string>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleDateChange: (name: string, date: Date | undefined) => void;
}

const PatentBasicInfoForm: React.FC<PatentBasicInfoFormProps> = ({
  formValues,
  formErrors,
  handleChange,
  handleDateChange
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label htmlFor="tracking_id">Tracking ID</Label>
        <Input 
          type="text" 
          id="tracking_id" 
          name="tracking_id" 
          value={formValues.tracking_id} 
          onChange={handleChange} 
          placeholder="Enter tracking ID" 
        />
        {formErrors.tracking_id && <p className="text-red-500 text-sm mt-1">{formErrors.tracking_id}</p>}
      </div>
      <div>
        <Label htmlFor="patent_applicant">Patent Applicant</Label>
        <Input 
          type="text" 
          id="patent_applicant" 
          name="patent_applicant" 
          value={formValues.patent_applicant} 
          onChange={handleChange} 
          placeholder="Enter patent applicant" 
        />
        {formErrors.patent_applicant && <p className="text-red-500 text-sm mt-1">{formErrors.patent_applicant}</p>}
      </div>
      <div>
        <Label htmlFor="client_id">Client ID</Label>
        <Input 
          type="text" 
          id="client_id" 
          name="client_id" 
          value={formValues.client_id} 
          onChange={handleChange} 
          placeholder="Enter client ID" 
        />
        {formErrors.client_id && <p className="text-red-500 text-sm mt-1">{formErrors.client_id}</p>}
      </div>
      <div>
        <Label htmlFor="application_no">Application No</Label>
        <Input 
          type="text" 
          id="application_no" 
          name="application_no" 
          value={formValues.application_no || ''} 
          onChange={handleChange} 
          placeholder="Enter application no" 
        />
      </div>
      <div>
        <Label htmlFor="date_of_filing">Date of Filing</Label>
        <DatePicker
          id="date_of_filing"
          name="date_of_filing"
          date={formValues.date_of_filing ? new Date(formValues.date_of_filing) : undefined}
          onSelect={(date) => handleDateChange('date_of_filing', date)}
        />
      </div>
      <div>
        <Label htmlFor="patent_title">Patent Title</Label>
        <Input 
          type="text" 
          id="patent_title" 
          name="patent_title" 
          value={formValues.patent_title} 
          onChange={handleChange} 
          placeholder="Enter patent title" 
        />
        {formErrors.patent_title && <p className="text-red-500 text-sm mt-1">{formErrors.patent_title}</p>}
      </div>
      <div>
        <Label htmlFor="applicant_addr">Applicant Address</Label>
        <Input 
          type="text" 
          id="applicant_addr" 
          name="applicant_addr" 
          value={formValues.applicant_addr} 
          onChange={handleChange} 
          placeholder="Enter applicant address" 
        />
        {formErrors.applicant_addr && <p className="text-red-500 text-sm mt-1">{formErrors.applicant_addr}</p>}
      </div>
      <div>
        <Label htmlFor="inventor_ph_no">Inventor Phone No</Label>
        <Input 
          type="text" 
          id="inventor_ph_no" 
          name="inventor_ph_no" 
          value={formValues.inventor_ph_no} 
          onChange={handleChange} 
          placeholder="Enter inventor phone no" 
        />
        {formErrors.inventor_ph_no && <p className="text-red-500 text-sm mt-1">{formErrors.inventor_ph_no}</p>}
      </div>
      <div>
        <Label htmlFor="inventor_email">Inventor Email</Label>
        <Input 
          type="email" 
          id="inventor_email" 
          name="inventor_email" 
          value={formValues.inventor_email} 
          onChange={handleChange} 
          placeholder="Enter inventor email" 
        />
        {formErrors.inventor_email && <p className="text-red-500 text-sm mt-1">{formErrors.inventor_email}</p>}
      </div>
    </div>
  );
};

export default PatentBasicInfoForm;
