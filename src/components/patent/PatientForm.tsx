
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { PatentFormData } from '@/lib/types';
import { Form } from '@/components/ui/form';
import BasicInfoSection from './form-sections/BasicInfoSection';
import InventorsSection from './form-sections/InventorsSection';
import AssignmentSection from './form-sections/AssignmentSection';
import StatusSection from './form-sections/StatusSection';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

// Define validation schema
const patentFormSchema = z.object({
  tracking_id: z.string().min(1, { message: 'Tracking ID is required' }),
  patent_applicant: z.string().min(1, { message: 'Patent applicant is required' }),
  client_id: z.string().min(1, { message: 'Client ID is required' }),
  patent_title: z.string().min(1, { message: 'Patent title is required' }),
  applicant_addr: z.string().optional(),
  inventor_ph_no: z.string().optional(),
  inventor_email: z.string().email({ message: 'Invalid email address' }).optional().or(z.literal('')),
  application_no: z.string().optional(),
  date_of_filing: z.string().optional().nullable(),
  internal_tracking_id: z.string().optional(),
  ps_drafter_assgn: z.string().optional(),
  ps_drafter_deadline: z.string().optional().nullable(),
  ps_filer_assgn: z.string().optional(),
  ps_filer_deadline: z.string().optional().nullable(),
  cs_drafter_assgn: z.string().optional(),
  cs_drafter_deadline: z.string().optional().nullable(),
  cs_filer_assgn: z.string().optional(),
  cs_filer_deadline: z.string().optional().nullable(),
  fer_status: z.number().default(0),
  fer_drafter_assgn: z.string().optional().nullable(),
  fer_drafter_deadline: z.string().optional().nullable(),
  fer_filer_assgn: z.string().optional().nullable(),
  fer_filer_deadline: z.string().optional().nullable(),
  idf_sent: z.boolean().optional(),
  idf_received: z.boolean().optional(),
  cs_data: z.boolean().optional(),
  cs_data_received: z.boolean().optional(),
});

type PatentFormProps = {
  initialData?: PatentFormData;
  onSubmit: (data: PatentFormData) => Promise<void>;
  isEditMode: boolean;
  isLoading: boolean;
};

const PatentForm: React.FC<PatentFormProps> = ({
  initialData,
  onSubmit,
  isEditMode,
  isLoading
}) => {
  const [inventors, setInventors] = useState<{ inventor_name: string; inventor_addr: string }[]>(
    initialData?.inventors || [{ inventor_name: '', inventor_addr: '' }]
  );

  const form = useForm<PatentFormData>({
    resolver: zodResolver(patentFormSchema),
    defaultValues: initialData || {
      tracking_id: '',
      patent_applicant: '',
      client_id: '',
      patent_title: '',
      applicant_addr: '',
      inventor_ph_no: '',
      inventor_email: '',
      application_no: '',
      date_of_filing: null,
      internal_tracking_id: '',
      ps_drafter_assgn: '',
      ps_drafter_deadline: null,
      ps_filer_assgn: '',
      ps_filer_deadline: null,
      cs_drafter_assgn: '',
      cs_drafter_deadline: null,
      cs_filer_assgn: '',
      cs_filer_deadline: null,
      fer_status: 0,
      fer_drafter_assgn: null,
      fer_drafter_deadline: null,
      fer_filer_assgn: null,
      fer_filer_deadline: null,
      idf_sent: false,
      idf_received: false,
      cs_data: false,
      cs_data_received: false,
      inventors: [{ inventor_name: '', inventor_addr: '' }]
    }
  });

  const handleInventorChange = (inventors: { inventor_name: string; inventor_addr: string }[]) => {
    setInventors(inventors);
    form.setValue('inventors', inventors);
  };

  const handleFormSubmit = async (data: PatentFormData) => {
    try {
      data.inventors = inventors.filter(inv => inv.inventor_name.trim() !== '');
      await onSubmit(data);
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Failed to save patent data');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
        <BasicInfoSection form={form} />
        
        <InventorsSection 
          inventors={inventors} 
          onChange={handleInventorChange} 
        />
        
        <AssignmentSection form={form} />
        
        <StatusSection form={form} />
        
        <div className="flex justify-end gap-4 pt-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : isEditMode ? 'Update Patent' : 'Create Patent'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default PatentForm;
