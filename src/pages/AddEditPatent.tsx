import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/date-picker';
import { Separator } from '@/components/ui/separator';
import { Loader2, ArrowLeft, Plus, Trash2, CalendarIcon, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  createPatent,
  fetchPatentById,
  updatePatent,
  fetchEmployees,
  createFEREntry,
} from '@/lib/api';
import { PatentFormData, FEREntry, Employee } from '@/lib/types';

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
      const loadPatent = async () => {
        try {
          const patent = await fetchPatentById(id);
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
      
      loadPatent();
    }
  }, [id, navigate]);

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

  const addFER = () => {
    if (id) {
      createFEREntry(
        id,
        {
          fer_number: nextFerNumber,
          fer_drafter_assgn: formValues.fer_drafter_assgn || undefined,
          fer_drafter_deadline: formValues.fer_drafter_deadline || undefined,
          fer_filer_assgn: formValues.fer_filer_assgn || undefined,
          fer_filer_deadline: formValues.fer_filer_deadline || undefined,
        }
      ).then(newFer => {
        if (newFer) {
          setFerEntries(prev => [...prev, newFer]);
          setNextFerNumber(nextFerNumber + 1);
          toast.success('FER entry added successfully');
        } else {
          toast.error('Failed to add FER entry');
        }
      }).catch(error => {
        console.error('Error adding FER entry:', error);
        toast.error('Error adding FER entry');
      });
    }
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

            <Separator className="my-4" />

            <div>
              <CardTitle>Inventors</CardTitle>
              {formValues.inventors.map((inventor, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label htmlFor={`inventor_name_${index}`}>Inventor Name</Label>
                    <Input
                      type="text"
                      id={`inventor_name_${index}`}
                      name={`inventor_name_${index}`}
                      value={inventor.inventor_name}
                      onChange={(e) => handleInventorChange(index, 'inventor_name', e.target.value)}
                      placeholder="Enter inventor name"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`inventor_addr_${index}`}>Inventor Address</Label>
                    <Input
                      type="text"
                      id={`inventor_addr_${index}`}
                      name={`inventor_addr_${index}`}
                      value={inventor.inventor_addr}
                      onChange={(e) => handleInventorChange(index, 'inventor_addr', e.target.value)}
                      placeholder="Enter inventor address"
                    />
                  </div>
                  {formValues.inventors.length > 1 && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeInventor(index)}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addInventor}>
                <Plus className="h-4 w-4 mr-2" />
                Add Inventor
              </Button>
              {formErrors.inventors && <p className="text-red-500 text-sm mt-1">{formErrors.inventors}</p>}
            </div>

            <Separator className="my-4" />

            <CardTitle>Assignments</CardTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="ps_drafter_assgn">PS Drafter Assigned</Label>
                <Select onValueChange={(value) => handleSelectChange('ps_drafter_assgn', value)}>
                  <SelectTrigger>
                    <SelectValue>
                      {formValues.ps_drafter_assgn || "Select drafter"}
                    </SelectValue>
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
                  onSelect={(date) => handleDateChange('ps_drafter_deadline', date)}
                />
              </div>
              <div>
                <Label htmlFor="ps_filer_assgn">PS Filer Assigned</Label>
                <Select onValueChange={(value) => handleSelectChange('ps_filer_assgn', value)}>
                  <SelectTrigger>
                    <SelectValue>
                      {formValues.ps_filer_assgn || "Select filer"}
                    </SelectValue>
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
                  onSelect={(date) => handleDateChange('ps_filer_deadline', date)}
                />
              </div>
              <div>
                <Label htmlFor="cs_drafter_assgn">CS Drafter Assigned</Label>
                <Select onValueChange={(value) => handleSelectChange('cs_drafter_assgn', value)}>
                  <SelectTrigger>
                    <SelectValue>
                      {formValues.cs_drafter_assgn || "Select drafter"}
                    </SelectValue>
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
                  onSelect={(date) => handleDateChange('cs_drafter_deadline', date)}
                />
              </div>
              <div>
                <Label htmlFor="cs_filer_assgn">CS Filer Assigned</Label>
                <Select onValueChange={(value) => handleSelectChange('cs_filer_assgn', value)}>
                  <SelectTrigger>
                    <SelectValue>
                      {formValues.cs_filer_assgn || "Select filer"}
                    </SelectValue>
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
                  onSelect={(date) => handleDateChange('cs_filer_deadline', date)}
                />
              </div>
              <div>
                <Label htmlFor="fer_status">FER Status</Label>
                <Select onValueChange={(value) => handleSelectChange('fer_status', value)}>
                  <SelectTrigger>
                    <SelectValue>
                      {formValues.fer_status === 1 ? "Active" : "Inactive"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Inactive</SelectItem>
                    <SelectItem value="1">Active</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="fer_drafter_assgn">FER Drafter Assigned</Label>
                <Select onValueChange={(value) => handleSelectChange('fer_drafter_assgn', value)}>
                  <SelectTrigger>
                    <SelectValue>
                      {formValues.fer_drafter_assgn || "Select drafter"}
                    </SelectValue>
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
                  onSelect={(date) => handleDateChange('fer_drafter_deadline', date)}
                />
              </div>
              <div>
                <Label htmlFor="fer_filer_assgn">FER Filer Assigned</Label>
                <Select onValueChange={(value) => handleSelectChange('fer_filer_assgn', value)}>
                  <SelectTrigger>
                    <SelectValue>
                      {formValues.fer_filer_assgn || "Select filer"}
                    </SelectValue>
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
                  onSelect={(date) => handleDateChange('fer_filer_deadline', date)}
                />
              </div>
            </div>

            <Separator className="my-4" />

            <CardTitle>FER Entries</CardTitle>
            <div className="mb-4">
              <Button type="button" variant="outline" size="sm" onClick={addFER}>
                <Plus className="h-4 w-4 mr-2" />
                Add FER Entry
              </Button>
            </div>
            {ferEntries.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        FER Number
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Drafter
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Filer
                      </th>
                      {/* Add more headers as needed */}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {ferEntries.map((fer) => (
                      <tr key={fer.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {fer.fer_number}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {fer.fer_drafter_assgn}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {fer.fer_filer_assgn}
                        </td>
                        {/* Add more data cells as needed */}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>No FER entries yet.</p>
            )}

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
