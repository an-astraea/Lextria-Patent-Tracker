
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { PatentFormData } from '@/lib/types';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';

interface BasicInfoSectionProps {
  form: UseFormReturn<PatentFormData>;
}

const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({ form }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Patent Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="tracking_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tracking ID*</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter tracking ID" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="internal_tracking_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Internal Tracking ID</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter internal tracking ID" />
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
                <FormLabel>Patent Applicant*</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter patent applicant" />
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
                <FormLabel>Client ID*</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter client ID" />
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
                <FormLabel>Patent Title*</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter patent title" />
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
                  <Input {...field} placeholder="Enter application number" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="date_of_filing"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date of Filing</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(new Date(field.value), "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
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
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="applicant_addr"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Applicant Address</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter applicant address" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="inventor_ph_no"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Inventor Phone Number</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter inventor phone number" />
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
                <FormLabel>Inventor Email</FormLabel>
                <FormControl>
                  <Input {...field} type="email" placeholder="Enter inventor email" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default BasicInfoSection;
