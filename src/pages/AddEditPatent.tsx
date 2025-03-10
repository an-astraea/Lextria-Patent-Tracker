
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
  createPatent,
  fetchPatentById,
  updatePatent,
  fetchEmployees,
} from '@/lib/api';
import { PatentFormData, FEREntry, Employee } from '@/lib/types';
import PatentBasicInfoForm from '@/components/patent/PatentBasicInfoForm';
import InventorsForm from '@/components/patent/InventorsForm';
import AssignmentsForm from '@/components/patent/AssignmentsForm';
import FEREntryForm from '@/components/patent/FEREntryForm';

const AddEditPatent = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(id ? true : false);
  const [saving, setSaving] = useState(false);
  const [formValues, setFormValues] = useState<PatentFormData>({
    tracking_id: '',
    patent_applicant: '',
    client_id: '',
    application_no: '',
    date_of_filing: '',
    patent_title: '',
    applicant_addr: '',
    inventor_ph_no: '',
    inventor_email: '',
    ps_drafter_assgn: '',
    ps_drafter_deadline: '',
    ps_filer_assgn: '',
    ps_filer_deadline: '',
    cs_drafter_assgn: '',
    cs_drafter_deadline: '',
    cs_filer_assgn: '',
    cs_filer_deadline: '',
    fer_status: 0,
    fer_drafter_assgn: '',
    fer_drafter_deadline: '',
    fer_filer_assgn: '',
    fer_filer_deadline: '',
    inventors: [{ inventor_name: '', inventor_addr: '' }],
  });
  
  const [ferEntries, setFerEntries] = useState<FEREntry[]>([]);
  const [nextFerNumber, setNextFerNumber] = useState(1);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadEmployees = async () => {
      try {
        const employeesData = await fetchEmployees();
        setEmployees(employeesData);
      } catch (error) {
        console.error('Error loading employees:', error);
        toast.error('Failed to load employees data');
      }
    };
    
    loadEmployees();
    
    if (id) {
      loadPatentData();
    }
  }, [id]);

  const loadPatentData = async () => {
    try {
      const patent = await fetchPatentById(id!);
      if (patent) {
        // Transform patent data to form data
        const patentFormData: PatentFormData = {
          tracking_id: patent.tracking_id,
          patent_applicant: patent.patent_applicant,
          client_id: patent.client_id,
          application_no: patent.application_no || '',
          date_of_filing: patent.date_of_filing || '',
          patent_title: patent.patent_title,
          applicant_addr: patent.applicant_addr,
          inventor_ph_no: patent.inventor_ph_no,
          inventor_email: patent.inventor_email,
          ps_drafter_assgn: patent.ps_drafter_assgn || '',
          ps_drafter_deadline: patent.ps_drafter_deadline || '',
          ps_filer_assgn: patent.ps_filer_assgn || '',
          ps_filer_deadline: patent.ps_filer_deadline || '',
          cs_drafter_assgn: patent.cs_drafter_assgn || '',
          cs_drafter_deadline: patent.cs_drafter_deadline || '',
          cs_filer_assgn: patent.cs_filer_assgn || '',
          cs_filer_deadline: patent.cs_filer_deadline || '',
          fer_status: patent.fer_status,
          fer_drafter_assgn: patent.fer_drafter_assgn || '',
          fer_drafter_deadline: patent.fer_drafter_deadline || '',
          fer_filer_assgn: patent.fer_filer_assgn || '',
          fer_filer_deadline: patent.fer_filer_deadline || '',
          inventors: patent.inventors?.map(inv => ({
            inventor_name: inv.inventor_name,
            inventor_addr: inv.inventor_addr
          })) || [{ inventor_name: '', inventor_addr: '' }],
        };
        
        setFormValues(patentFormData);
        
        // Set up FER entries if present
        if (patent.fer_entries && patent.fer_entries.length > 0) {
          setFerEntries(patent.fer_entries);
          
          // Calculate next FER number
          const maxFerNumber = Math.max(...patent.fer_entries.map(fer => fer.fer_number));
          setNextFerNumber(maxFerNumber + 1);
        }
      } else {
        toast.error('Patent not found');
        navigate('/patents');
      }
    } catch (error) {
      console.error('Error loading patent:', error);
      toast.error('Failed to load patent data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormValues(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field if it exists
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormValues(prev => ({
      ...prev,
      [name]: name === 'fer_status' ? parseInt(value) : value
    }));
    
    // Clear error for this field if it exists
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleDateChange = (name: string, date: Date | undefined) => {
    setFormValues(prev => ({
      ...prev,
      [name]: date ? format(date, 'yyyy-MM-dd') : ''
    }));
    
    // Clear error for this field if it exists
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleInventorChange = (index: number, field: string, value: string) => {
    setFormValues(prev => {
      const updatedInventors = [...prev.inventors];
      updatedInventors[index] = {
        ...updatedInventors[index],
        [field]: value
      };
      return {
        ...prev,
        inventors: updatedInventors
      };
    });
  };

  const addInventor = () => {
    setFormValues(prev => ({
      ...prev,
      inventors: [...prev.inventors, { inventor_name: '', inventor_addr: '' }]
    }));
  };

  const removeInventor = (index: number) => {
    if (formValues.inventors.length <= 1) {
      toast.error('At least one inventor is required');
      return;
    }
    
    setFormValues(prev => ({
      ...prev,
      inventors: prev.inventors.filter((_, i) => i !== index)
    }));
  };

  const validateForm = (): boolean => {
    const requiredFields = ['tracking_id', 'patent_applicant', 'client_id', 'patent_title', 'applicant_addr', 'inventor_ph_no', 'inventor_email'];
    const errors: Record<string, string> = {};
    
    requiredFields.forEach(field => {
      if (!formValues[field as keyof PatentFormData]) {
        errors[field] = `${field.replace('_', ' ')} is required`;
      }
    });
    
    // Check if at least one inventor has a name
    if (formValues.inventors.length === 0 || !formValues.inventors.some(inv => inv.inventor_name.trim())) {
      errors.inventors = 'At least one inventor with a name is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fill all required fields');
      return;
    }
    
    setSaving(true);
    
    try {
      if (id) {
        // Update existing patent
        const success = await updatePatent(id, formValues);
        
        if (success) {
          toast.success('Patent updated successfully');
          navigate(`/patents/${id}`);
        } else {
          toast.error('Failed to update patent');
        }
      } else {
        // Create new patent
        const newPatent = await createPatent(formValues);
        
        if (newPatent) {
          toast.success('Patent created successfully');
          navigate(`/patents/${newPatent.id}`);
        } else {
          toast.error('Failed to create patent');
        }
      }
    } catch (error) {
      console.error('Error saving patent:', error);
      toast.error('Error saving patent');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading patent data...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6 flex items-center justify-between">
        <Button variant="outline" onClick={() => navigate('/patents')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">{id ? 'Edit Patent' : 'Add Patent'}</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>{id ? 'Edit Patent Details' : 'Enter Patent Details'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Basic Patent Information */}
            <PatentBasicInfoForm 
              formValues={formValues} 
              formErrors={formErrors}
              handleChange={handleChange}
              handleDateChange={handleDateChange}
            />

            <Separator className="my-4" />

            {/* Inventors Section */}
            <CardTitle>Inventors</CardTitle>
            <InventorsForm
              inventors={formValues.inventors}
              onInventorChange={handleInventorChange}
              onAddInventor={addInventor}
              onRemoveInventor={removeInventor}
              formErrors={formErrors}
            />

            <Separator className="my-4" />

            {/* Assignments Section */}
            <CardTitle>Assignments</CardTitle>
            <AssignmentsForm
              formValues={formValues}
              employees={employees}
              handleSelectChange={handleSelectChange}
              handleDateChange={handleDateChange}
            />

            <Separator className="my-4" />

            {/* FER Entries Section */}
            <CardTitle>FER Entries</CardTitle>
            <FEREntryForm 
              patentId={id} 
              ferEntries={ferEntries}
              nextFerNumber={nextFerNumber}
              refreshPatentData={loadPatentData}
            />

            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Patent'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddEditPatent;
