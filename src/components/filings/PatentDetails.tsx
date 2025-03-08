import React from 'react';
import { Patent } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import FormSection from './FormSection';

interface PatentDetailsProps {
  patent: Patent;
  user: any;
  formValues: { [key: string]: boolean };
  otherForms: string;
  onFormChange: (formId: string, checked: boolean) => void;
  onOtherFormsChange: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
  submitting: boolean;
}

const PatentDetails: React.FC<PatentDetailsProps> = ({
  patent,
  user,
  formValues,
  otherForms,
  onFormChange,
  onOtherFormsChange,
  onClose,
  onSubmit,
  submitting
}) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">{patent.patent_title}</h2>
          <p className="text-muted-foreground">ID: {patent.tracking_id}</p>
        </div>
        <Button variant="outline" onClick={onClose}>
          Back to List
        </Button>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Patent Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="grid grid-cols-3 gap-1">
                <span className="text-sm font-medium">Applicant:</span>
                <span className="text-sm col-span-2">{patent.patent_applicant}</span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <span className="text-sm font-medium">Client ID:</span>
                <span className="text-sm col-span-2">{patent.client_id}</span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <span className="text-sm font-medium">Application No:</span>
                <span className="text-sm col-span-2">{patent.application_no || "Not assigned yet"}</span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <span className="text-sm font-medium">Filing Date:</span>
                <span className="text-sm col-span-2">{new Date(patent.date_of_filing).toLocaleDateString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Filing Requirements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Stage-specific filing details */}
            {user?.full_name === patent.ps_filer_assgn && patent.ps_filing_status === 0 && (
              <div className="bg-blue-50 text-blue-700 px-3 py-2 rounded text-sm">
                <strong>Provisional Specification Filing</strong>
                <p className="text-xs mt-1">Deadline: {new Date(patent.ps_filer_deadline).toLocaleDateString()}</p>
              </div>
            )}
            {user?.full_name === patent.cs_filer_assgn && patent.cs_filing_status === 0 && (
              <div className="bg-green-50 text-green-700 px-3 py-2 rounded text-sm">
                <strong>Complete Specification Filing</strong>
                <p className="text-xs mt-1">Deadline: {new Date(patent.cs_filer_deadline).toLocaleDateString()}</p>
              </div>
            )}
            {user?.full_name === patent.fer_filer_assgn && patent.fer_filing_status === 0 && (
              <div className="bg-yellow-50 text-yellow-700 px-3 py-2 rounded text-sm">
                <strong>FER Response Filing</strong>
                <p className="text-xs mt-1">Deadline: {new Date(patent.fer_filer_deadline).toLocaleDateString()}</p>
              </div>
            )}
            
            {/* Forms section */}
            <div className="pt-4">
              <h3 className="text-lg font-semibold mb-4">Required Forms</h3>
              <FormSection 
                patent={patent}
                user={user}
                formValues={formValues}
                onFormChange={onFormChange}
              />
            </div>
            
            {/* Other forms */}
            <div className="pt-4">
              <h3 className="text-sm font-medium mb-2">Additional Forms/Notes</h3>
              <Textarea
                className="w-full min-h-[100px]"
                value={otherForms}
                onChange={e => onOtherFormsChange(e.target.value)}
                placeholder="List any additional forms or special requirements..."
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={onSubmit} disabled={submitting}>
              {submitting ? "Submitting..." : "Complete Filing"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default PatentDetails;
