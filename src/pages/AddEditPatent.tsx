import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { fetchPatentById, createPatent, updatePatent } from '@/lib/api/patent-api';
import { fetchEmployees } from '@/lib/api/employee-api';
import { Plus, Trash2, Save, ArrowLeft } from 'lucide-react';
import { Patent, Employee, PatentFormData } from '@/lib/types';

const inventorSchema = z.object({
  inventor_name: z.string().min(1, 'Inventor name is required'),
  inventor_addr: z.string().min(1, 'Inventor address is required'),
});

const patentSchema = z.object({
  tracking_id: z.string().min(1, 'Tracking ID is required'),
  patent_applicant: z.string().min(1, 'Patent applicant is required'),
  client_id: z.string().min(1, 'Client ID is required'),
  application_no: z.string().optional(),
  date_of_filing: z.string().optional(),
  patent_title: z.string().min(1, 'Patent title is required'),
  applicant_addr: z.string().min(1, 'Applicant address is required'),
  inventor_ph_no: z.string().min(1, 'Inventor phone number is required'),
  inventor_email: z.string().email('Valid email is required'),
  ps_drafter_assgn: z.string().optional(),
  ps_drafter_deadline: z.string().optional(),
  ps_filer_assgn: z.string().optional(),
  ps_filer_deadline: z.string().optional(),
  cs_drafter_assgn: z.string().optional(),
  cs_drafter_deadline: z.string().optional(),
  cs_filer_assgn: z.string().optional(),
  cs_filer_deadline: z.string().optional(),
  fer_status: z.number().default(0),
  fer_drafter_assgn: z.string().optional(),
  fer_drafter_deadline: z.string().optional(),
  fer_filer_assgn: z.string().optional(),
  fer_filer_deadline: z.string().optional(),
  inventors: z.array(inventorSchema).optional(),
  // Status fields for drafters and filers
  idf_sent: z.boolean().optional(),
  idf_received: z.boolean().optional(),
  cs_data: z.boolean().optional(),
  cs_data_received: z.boolean().optional(),
  ps_drafting_status: z.number().optional(),
  ps_filing_status: z.number().optional(),
  cs_drafting_status: z.number().optional(),
  cs_filing_status: z.number().optional(),
  fer_drafter_status: z.number().optional(),
  fer_filing_status: z.number().optional(),
});

type FormData = z.infer<typeof patentSchema>;

const AddEditPatent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  
  const [patent, setPatent] = useState<Patent | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Get user from localStorage
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  const form = useForm<FormData>({
    resolver: zodResolver(patentSchema),
    defaultValues: {
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
      idf_sent: false,
      idf_received: false,
      cs_data: false,
      cs_data_received: false,
      ps_drafting_status: 0,
      ps_filing_status: 0,
      cs_drafting_status: 0,
      cs_filing_status: 0,
      fer_drafter_status: 0,
      fer_filing_status: 0,
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "inventors"
  });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Load employees for assignment dropdowns
        const employeesData = await fetchEmployees();
        setEmployees(employeesData);

        // If editing, load patent data
        if (isEditMode && id) {
          const patentData = await fetchPatentById(id);
          if (patentData) {
            setPatent(patentData);
            
            // Reset form with patent data
            form.reset({
              tracking_id: patentData.tracking_id,
              patent_applicant: patentData.patent_applicant,
              client_id: patentData.client_id,
              application_no: patentData.application_no || '',
              date_of_filing: patentData.date_of_filing || '',
              patent_title: patentData.patent_title,
              applicant_addr: patentData.applicant_addr,
              inventor_ph_no: patentData.inventor_ph_no,
              inventor_email: patentData.inventor_email,
              ps_drafter_assgn: patentData.ps_drafter_assgn || '',
              ps_drafter_deadline: patentData.ps_drafter_deadline || '',
              ps_filer_assgn: patentData.ps_filer_assgn || '',
              ps_filer_deadline: patentData.ps_filer_deadline || '',
              cs_drafter_assgn: patentData.cs_drafter_assgn || '',
              cs_drafter_deadline: patentData.cs_drafter_deadline || '',
              cs_filer_assgn: patentData.cs_filer_assgn || '',
              cs_filer_deadline: patentData.cs_filer_deadline || '',
              fer_status: patentData.fer_status || 0,
              fer_drafter_assgn: patentData.fer_drafter_assgn || '',
              fer_drafter_deadline: patentData.fer_drafter_deadline || '',
              fer_filer_assgn: patentData.fer_filer_assgn || '',
              fer_filer_deadline: patentData.fer_filer_deadline || '',
              inventors: patentData.inventors && patentData.inventors.length > 0 
                ? patentData.inventors.map(inv => ({
                    inventor_name: inv.inventor_name,
                    inventor_addr: inv.inventor_addr
                  }))
                : [{ inventor_name: '', inventor_addr: '' }],
              idf_sent: patentData.idf_sent || false,
              idf_received: patentData.idf_received || false,
              cs_data: patentData.cs_data || false,
              cs_data_received: patentData.cs_data_received || false,
              ps_drafting_status: patentData.ps_drafting_status || 0,
              ps_filing_status: patentData.ps_filing_status || 0,
              cs_drafting_status: patentData.cs_drafting_status || 0,
              cs_filing_status: patentData.cs_filing_status || 0,
              fer_drafter_status: patentData.fer_drafter_status || 0,
              fer_filing_status: patentData.fer_filing_status || 0,
            });
          } else {
            toast.error('Patent not found');
            navigate('/patents');
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, isEditMode, form, navigate]);

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    try {
      // Ensure inventors have required fields
      const processedInventors = data.inventors?.filter(inv => 
        inv.inventor_name && inv.inventor_addr
      ) || [];

      if (isEditMode && id) {
        // For updates, create properly typed update data
        const updateData: Partial<PatentFormData> = {
          ...data,
          inventors: processedInventors
        };
        
        const result = await updatePatent(id, updateData);
        if (result.success) {
          toast.success(result.message);
          navigate('/patents');
        } else {
          toast.error(result.message);
        }
      } else {
        // For creation, ensure all required fields are present and properly typed
        if (!data.tracking_id || !data.patent_applicant || !data.client_id || 
            !data.patent_title || !data.applicant_addr || !data.inventor_ph_no || 
            !data.inventor_email) {
          toast.error('Please fill in all required fields');
          return;
        }

        const createData: PatentFormData = {
          tracking_id: data.tracking_id,
          patent_applicant: data.patent_applicant,
          client_id: data.client_id,
          patent_title: data.patent_title,
          applicant_addr: data.applicant_addr,
          inventor_ph_no: data.inventor_ph_no,
          inventor_email: data.inventor_email,
          inventors: processedInventors,
          // Optional fields with defaults
          application_no: data.application_no || undefined,
          date_of_filing: data.date_of_filing || undefined,
          ps_drafter_assgn: data.ps_drafter_assgn || undefined,
          ps_drafter_deadline: data.ps_drafter_deadline || undefined,
          ps_filer_assgn: data.ps_filer_assgn || undefined,
          ps_filer_deadline: data.ps_filer_deadline || undefined,
          cs_drafter_assgn: data.cs_drafter_assgn || undefined,
          cs_drafter_deadline: data.cs_drafter_deadline || undefined,
          cs_filer_assgn: data.cs_filer_assgn || undefined,
          cs_filer_deadline: data.cs_filer_deadline || undefined,
          fer_status: data.fer_status || 0,
          fer_drafter_assgn: data.fer_drafter_assgn || undefined,
          fer_drafter_deadline: data.fer_drafter_deadline || undefined,
          fer_filer_assgn: data.fer_filer_assgn || undefined,
          fer_filer_deadline: data.fer_filer_deadline || undefined,
          idf_sent: data.idf_sent,
          idf_received: data.idf_received,
          cs_data: data.cs_data,
          cs_data_received: data.cs_data_received,
          ps_drafting_status: data.ps_drafting_status,
          ps_filing_status: data.ps_filing_status,
          cs_drafting_status: data.cs_drafting_status,
          cs_filing_status: data.cs_filing_status,
          fer_drafter_status: data.fer_drafter_status,
          fer_filing_status: data.fer_filing_status,
        };
        
        const result = await createPatent(createData);
        if (result.success) {
          toast.success(result.message);
          navigate('/patents');
        } else {
          toast.error(result.message);
        }
      }
    } catch (error: any) {
      console.error('Error submitting form:', error);
      toast.error(error.message || 'Failed to save patent');
    } finally {
      setSubmitting(false);
    }
  };

  // Check if user can edit status fields based on their role and assignments
  const canEditStatus = (statusType: string) => {
    if (user?.role === 'admin') return true;
    
    if (!patent || !user) return false;
    
    const userName = user.full_name;
    
    switch (statusType) {
      case 'ps_drafting':
        return user.role === 'drafter' && patent.ps_drafter_assgn === userName;
      case 'ps_filing':
        return user.role === 'filer' && patent.ps_filer_assgn === userName;
      case 'cs_drafting':
        return user.role === 'drafter' && patent.cs_drafter_assgn === userName;
      case 'cs_filing':
        return user.role === 'filer' && patent.cs_filer_assgn === userName;
      case 'fer_drafting':
        return user.role === 'drafter' && patent.fer_drafter_assgn === userName;
      case 'fer_filing':
        return user.role === 'filer' && patent.fer_filer_assgn === userName;
      case 'idf':
      case 'cs_data':
        return user.role === 'drafter' || user.role === 'filer';
      default:
        return false;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/patents')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Patents
        </Button>
        <h1 className="text-2xl font-bold">
          {isEditMode ? 'Edit Patent' : 'Add New Patent'}
        </h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="tracking_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tracking ID *</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isEditMode} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="client_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client ID *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="patent_applicant"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Patent Applicant *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="application_no"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Application Number</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date_of_filing"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Filing</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="patent_title"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Patent Title *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="applicant_addr"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Applicant Address *</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="inventor_ph_no"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Inventor Phone Number *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="inventor_email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Inventor Email *</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Status Controls for Drafters and Filers */}
          {isEditMode && (user?.role === 'drafter' || user?.role === 'filer' || user?.role === 'admin') && (
            <Card>
              <CardHeader>
                <CardTitle>Status Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* IDF Status */}
                {canEditStatus('idf') && (
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="idf_sent"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>IDF Sent</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="idf_received"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>IDF Received</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {/* CS Data Status */}
                {canEditStatus('cs_data') && (
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="cs_data"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>CS Data Sent</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="cs_data_received"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>CS Data Received</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {/* PS Status */}
                <div className="grid grid-cols-2 gap-4">
                  {canEditStatus('ps_drafting') && (
                    <FormField
                      control={form.control}
                      name="ps_drafting_status"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value === 1}
                              onCheckedChange={(checked) => field.onChange(checked ? 1 : 0)}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>PS Drafting Complete</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                  )}

                  {canEditStatus('ps_filing') && (
                    <FormField
                      control={form.control}
                      name="ps_filing_status"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value === 1}
                              onCheckedChange={(checked) => field.onChange(checked ? 1 : 0)}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>PS Filing Complete</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                  )}
                </div>

                {/* CS Status */}
                <div className="grid grid-cols-2 gap-4">
                  {canEditStatus('cs_drafting') && (
                    <FormField
                      control={form.control}
                      name="cs_drafting_status"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value === 1}
                              onCheckedChange={(checked) => field.onChange(checked ? 1 : 0)}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>CS Drafting Complete</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                  )}

                  {canEditStatus('cs_filing') && (
                    <FormField
                      control={form.control}
                      name="cs_filing_status"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value === 1}
                              onCheckedChange={(checked) => field.onChange(checked ? 1 : 0)}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>CS Filing Complete</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                  )}
                </div>

                {/* FER Status */}
                <div className="grid grid-cols-2 gap-4">
                  {canEditStatus('fer_drafting') && (
                    <FormField
                      control={form.control}
                      name="fer_drafter_status"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value === 1}
                              onCheckedChange={(checked) => field.onChange(checked ? 1 : 0)}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>FER Drafting Complete</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                  )}

                  {canEditStatus('fer_filing') && (
                    <FormField
                      control={form.control}
                      name="fer_filing_status"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value === 1}
                              onCheckedChange={(checked) => field.onChange(checked ? 1 : 0)}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>FER Filing Complete</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Assignment Section */}
          {(user?.role === 'admin' || (!isEditMode)) && (
            <Card>
              <CardHeader>
                <CardTitle>Assignments</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* PS Assignments */}
                <div>
                  <h3 className="text-lg font-medium mb-3">Provisional Specification (PS)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="ps_drafter_assgn"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>PS Drafter</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || ''}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select drafter" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {employees.filter(emp => emp.role === 'drafter').map((employee) => (
                                <SelectItem key={employee.id} value={employee.full_name}>
                                  {employee.full_name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="ps_drafter_deadline"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>PS Drafter Deadline</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="ps_filer_assgn"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>PS Filer</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || ''}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select filer" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {employees.filter(emp => emp.role === 'filer').map((employee) => (
                                <SelectItem key={employee.id} value={employee.full_name}>
                                  {employee.full_name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="ps_filer_deadline"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>PS Filer Deadline</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <Separator />

                {/* CS Assignments */}
                <div>
                  <h3 className="text-lg font-medium mb-3">Complete Specification (CS)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="cs_drafter_assgn"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CS Drafter</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || ''}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select drafter" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {employees.filter(emp => emp.role === 'drafter').map((employee) => (
                                <SelectItem key={employee.id} value={employee.full_name}>
                                  {employee.full_name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="cs_drafter_deadline"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CS Drafter Deadline</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="cs_filer_assgn"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CS Filer</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || ''}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select filer" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {employees.filter(emp => emp.role === 'filer').map((employee) => (
                                <SelectItem key={employee.id} value={employee.full_name}>
                                  {employee.full_name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="cs_filer_deadline"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CS Filer Deadline</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <Separator />

                {/* FER Section */}
                <div>
                  <h3 className="text-lg font-medium mb-3">First Examination Report (FER)</h3>
                  
                  <FormField
                    control={form.control}
                    name="fer_status"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 mb-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value === 1}
                            onCheckedChange={(checked) => field.onChange(checked ? 1 : 0)}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Enable FER</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="fer_drafter_assgn"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>FER Drafter</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || ''}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select drafter" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {employees.filter(emp => emp.role === 'drafter').map((employee) => (
                                <SelectItem key={employee.id} value={employee.full_name}>
                                  {employee.full_name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="fer_drafter_deadline"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>FER Drafter Deadline</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="fer_filer_assgn"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>FER Filer</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || ''}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select filer" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {employees.filter(emp => emp.role === 'filer').map((employee) => (
                                <SelectItem key={employee.id} value={employee.full_name}>
                                  {employee.full_name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="fer_filer_deadline"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>FER Filer Deadline</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Inventors Section */}
          <Card>
            <CardHeader>
              <CardTitle>Inventors</CardTitle>
            </CardHeader>
            <CardContent>
              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 border rounded-lg">
                  <FormField
                    control={form.control}
                    name={`inventors.${index}.inventor_name`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Inventor Name *</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`inventors.${index}.inventor_addr`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Inventor Address *</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {fields.length > 1 && (
                    <div className="md:col-span-2">
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove Inventor
                      </Button>
                    </div>
                  )}
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={() => append({ inventor_name: '', inventor_addr: '' })}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Inventor
              </Button>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/patents')}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isEditMode ? 'Update Patent' : 'Create Patent'}
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default AddEditPatent;
