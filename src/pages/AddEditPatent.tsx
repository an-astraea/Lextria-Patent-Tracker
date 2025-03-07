import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';

import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils";
import { CalendarIcon, X } from "lucide-react";
import { createPatent, fetchPatentById, updatePatent, updateInventor } from '@/lib/api';
import { PatentFormData } from '@/lib/types';
import InventorFields from '@/components/form/InventorFields';
import { Separator } from '@/components/ui/separator';

const AddEditPatent = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [isEditMode, setIsEditMode] = useState(false);
  const [initialFormValues, setInitialFormValues] = useState<PatentFormData | null>(null);

  useEffect(() => {
    if (id) {
      setIsEditMode(true);
      fetchPatentById(id).then(patent => {
        if (patent) {
          setInitialFormValues({
            tracking_id: patent.tracking_id,
            patent_applicant: patent.patent_applicant,
            client_id: patent.client_id,
            application_no: patent.application_no || undefined,
            date_of_filing: patent.date_of_filing || undefined,
            patent_title: patent.patent_title,
            applicant_addr: patent.applicant_addr,
            inventor_ph_no: patent.inventor_ph_no,
            inventor_email: patent.inventor_email,
            ps_drafter_assgn: patent.ps_drafter_assgn || undefined,
            ps_drafter_deadline: patent.ps_drafter_deadline || undefined,
            ps_filer_assgn: patent.ps_filer_assgn || undefined,
            ps_filer_deadline: patent.ps_filer_deadline || undefined,
            cs_drafter_assgn: patent.cs_drafter_assgn || undefined,
            cs_drafter_deadline: patent.cs_drafter_deadline || undefined,
            cs_filer_assgn: patent.cs_filer_assgn || undefined,
            cs_filer_deadline: patent.cs_filer_deadline || undefined,
            fer_status: patent.fer_status,
            fer_drafter_assgn: patent.fer_drafter_assgn || undefined,
            fer_drafter_deadline: patent.fer_drafter_deadline || undefined,
            fer_filer_assgn: patent.fer_filer_assgn || undefined,
            fer_filer_deadline: patent.fer_filer_deadline || undefined,
            inventors: patent.inventors ? patent.inventors.map(inv => ({
              inventor_name: inv.inventor_name,
              inventor_addr: inv.inventor_addr
            })) : undefined,
          });
        }
      });
    } else {
      setIsEditMode(false);
      setInitialFormValues({
        tracking_id: '',
        patent_applicant: '',
        client_id: '',
        patent_title: '',
        applicant_addr: '',
        inventor_ph_no: '',
        inventor_email: '',
        fer_status: 0
      });
    }
  }, [id]);

  // Create the form with validation schema
  const form = useForm<PatentFormData>({
    resolver: zodResolver(
      z.object({
        tracking_id: z.string().min(1, { message: "Tracking ID is required" }),
        patent_applicant: z.string().min(1, { message: "Patent Applicant is required" }),
        client_id: z.string().min(1, { message: "Client ID is required" }),
        application_no: z.string().nullable().optional(),
        date_of_filing: z.string().nullable().optional(), // Made optional to match database change
        patent_title: z.string().min(1, { message: "Patent Title is required" }),
        applicant_addr: z.string().min(1, { message: "Applicant Address is required" }),
        inventor_ph_no: z.string().min(1, { message: "Inventor Phone Number is required" }),
        inventor_email: z.string().email({ message: "Invalid email address" }),
        ps_drafter_assgn: z.string().nullable().optional(),
        ps_drafter_deadline: z.string().nullable().optional(),
        ps_filer_assgn: z.string().nullable().optional(),
        ps_filer_deadline: z.string().nullable().optional(),
        cs_drafter_assgn: z.string().nullable().optional(),
        cs_drafter_deadline: z.string().nullable().optional(),
        cs_filer_assgn: z.string().nullable().optional(),
        cs_filer_deadline: z.string().nullable().optional(),
        fer_status: z.number(),
        fer_drafter_assgn: z.string().nullable().optional(),
        fer_drafter_deadline: z.string().nullable().optional(),
        fer_filer_assgn: z.string().nullable().optional(),
        fer_filer_deadline: z.string().nullable().optional(),
        inventors: z.array(
          z.object({
            inventor_name: z.string().min(1, { message: "Inventor Name is required" }),
            inventor_addr: z.string().min(1, { message: "Inventor Address is required" }),
          })
        ).optional(),
      })
    ),
    defaultValues: initialFormValues || {
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
      inventors: []
    },
  });

  useEffect(() => {
    if (initialFormValues) {
      form.reset(initialFormValues);
    }
  }, [initialFormValues, form]);

  // Form submission handler
  const onSubmit = async (values: PatentFormData) => {
    try {
      if (isEditMode && id) {
        // Update existing patent
        const success = await updatePatent(id, values);
        if (success) {
          toast.success("Patent updated successfully!");
          navigate('/patents');
        } else {
          toast.error("Failed to update patent.");
        }
      } else {
        // Create new patent
        const newPatent = await createPatent(values);
        if (newPatent) {
          toast.success("Patent created successfully!");
          navigate('/patents');
        } else {
          toast.error("Failed to create patent.");
        }
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("An unexpected error occurred.");
    }
  };

  const formatDate = (date: string | null | undefined): string => {
    if (!date) return "";
    return new Date(date).toLocaleDateString();
  };

  if (!initialFormValues) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditMode ? "Edit Patent" : "Add Patent"}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="tracking_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tracking ID</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter tracking ID" {...field} />
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
                    <FormLabel>Patent Applicant</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter patent applicant" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="client_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client ID</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter client ID" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="patent_title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Patent Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter patent title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="applicant_addr"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Applicant Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter applicant address" {...field} />
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
                    <FormLabel>Inventor Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter inventor phone number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="inventor_email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Inventor Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter inventor email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fer_status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>FER Status</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter FER status" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <Separator className="my-4" />

            <InventorFields form={form} />

            <Separator className="my-4" />

            <h3 className="text-xl font-semibold">PS (Provisional Specification)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="ps_drafter_assgn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>PS Drafter Assignment (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter PS drafter assignment" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ps_drafter_deadline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>PS Drafter Deadline (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter PS drafter deadline" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="ps_filer_assgn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>PS Filer Assignment (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter PS filer assignment" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ps_filer_deadline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>PS Filer Deadline (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter PS filer deadline" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator className="my-4" />

            <h3 className="text-xl font-semibold">CS (Complete Specification)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="cs_drafter_assgn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CS Drafter Assignment (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter CS drafter assignment" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cs_drafter_deadline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CS Drafter Deadline (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter CS drafter deadline" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="cs_filer_assgn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CS Filer Assignment (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter CS filer assignment" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cs_filer_deadline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CS Filer Deadline (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter CS filer deadline" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator className="my-4" />

            <h3 className="text-xl font-semibold">FER (Further Examination Report)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="fer_drafter_assgn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>FER Drafter Assignment (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter FER drafter assignment" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fer_drafter_deadline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>FER Drafter Deadline (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter FER drafter deadline" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="fer_filer_assgn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>FER Filer Assignment (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter FER filer assignment" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fer_filer_deadline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>FER Filer Deadline (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter FER filer deadline" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <FormField
        control={form.control}
        name="application_no"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Application Number (Optional)</FormLabel>
            <FormControl>
              <Input placeholder="Enter application number" {...field} value={field.value || ""} />
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
            <FormLabel>Date of Filing (Optional)</FormLabel>
            <div className="flex items-center">
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal flex justify-between",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? formatDate(field.value) : "Filing date will be set automatically"}
                      <CalendarIcon className="h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value ? new Date(field.value) : undefined}
                    onSelect={(date) => field.onChange(date ? date.toISOString() : null)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {field.value && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="ml-2 h-8 w-8 p-0"
                  onClick={() => field.onChange(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <FormDescription>
              This will be set automatically when filing is completed.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
    
            <Button type="submit" className="w-full">{isEditMode ? "Update Patent" : "Create Patent"}</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default AddEditPatent;
