
import React from 'react';
import { Patent } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import PatentCard from '@/components/PatentCard';
import EmptyState from '@/components/common/EmptyState';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface PatentListProps {
  patents: Patent[];
  onExportToExcel: () => void;
}

const PatentList: React.FC<PatentListProps> = ({ patents, onExportToExcel }) => {
  
  const handleDetailedExport = () => {
    if (patents.length === 0) {
      toast.error('No patents to export');
      return;
    }

    const exportData = patents.map(patent => ({
      // Patent Information
      'Tracking ID': patent.tracking_id,
      'Patent Applicant': patent.patent_applicant,
      'Client ID': patent.client_id,
      'Application No': patent.application_no || '',
      'Date of Filing': patent.date_of_filing ? format(new Date(patent.date_of_filing), 'dd/MM/yyyy') : '',
      'Patent Title': patent.patent_title,
      'Applicant Address': patent.applicant_addr,
      'Inventor Phone No': patent.inventor_ph_no || '',
      'Inventor Email': patent.inventor_email,
      
      // Assignment Information
      'PS Drafter': patent.ps_drafter_assgn || '',
      'PS Drafter Deadline': patent.ps_drafter_deadline ? format(new Date(patent.ps_drafter_deadline), 'dd/MM/yyyy') : '',
      'PS Filer': patent.ps_filer_assgn || '',
      'PS Filer Deadline': patent.ps_filer_deadline ? format(new Date(patent.ps_filer_deadline), 'dd/MM/yyyy') : '',
      'CS Drafter': patent.cs_drafter_assgn || '',
      'CS Drafter Deadline': patent.cs_drafter_deadline ? format(new Date(patent.cs_drafter_deadline), 'dd/MM/yyyy') : '',
      'CS Filer': patent.cs_filer_assgn || '',
      'CS Filer Deadline': patent.cs_filer_deadline ? format(new Date(patent.cs_filer_deadline), 'dd/MM/yyyy') : '',
      'FER Drafter': patent.fer_drafter_assgn || '',
      'FER Drafter Deadline': patent.fer_drafter_deadline ? format(new Date(patent.fer_drafter_deadline), 'dd/MM/yyyy') : '',
      'FER Filer': patent.fer_filer_assgn || '',
      'FER Filer Deadline': patent.fer_filer_deadline ? format(new Date(patent.fer_filer_deadline), 'dd/MM/yyyy') : '',
      
      // Status Information
      'IDF Status': `${patent.idf_sent ? 'Sent' : 'Not Sent'} | ${patent.idf_received ? 'Received' : 'Not Received'}`,
      'CS Data Status': `${patent.cs_data ? 'Sent' : 'Not Sent'} | ${patent.cs_data_received ? 'Received' : 'Not Received'}`,
      'PS Drafting Status': patent.ps_drafting_status === 1 ? 'Completed' : 'Pending',
      'PS Drafting Review Status': patent.ps_review_draft_status === 1 ? 'Approved' : 'Pending',
      'PS Filing Status': patent.ps_filing_status === 1 ? 'Completed' : 'Pending',
      'PS Filing Review Status': patent.ps_review_file_status === 1 ? 'Approved' : 'Pending',
      'PS Completion Status': patent.ps_completion_status === 1 ? 'Completed' : 'Pending',
      'CS Drafting Status': patent.cs_drafting_status === 1 ? 'Completed' : 'Pending',
      'CS Drafting Review Status': patent.cs_review_draft_status === 1 ? 'Approved' : 'Pending',
      'CS Filing Status': patent.cs_filing_status === 1 ? 'Completed' : 'Pending',
      'CS Filing Review Status': patent.cs_review_file_status === 1 ? 'Approved' : 'Pending',
      'CS Completion Status': patent.cs_completion_status === 1 ? 'Completed' : 'Pending',
      'FER Status': patent.fer_status === 1 ? 'Active' : 'Inactive',
      'FER Drafter Status': patent.fer_drafter_status === 1 ? 'Completed' : 'Pending',
      'FER Filing Status': patent.fer_filing_status === 1 ? 'Completed' : 'Pending',
      'FER Completion Status': patent.fer_completion_status === 1 ? 'Completed' : 'Pending',
      
      // Patent Completion Status
      'Overall Completion Status': patent.completed ? 'Completed' : 'In Progress',
      'Withdrawn Status': patent.withdrawn ? 'Yes' : 'No',
      
      // Confirmation Status
      'PS Confirmation Pending': patent.pending_ps_confirmation ? 'Yes' : 'No',
      'PS Confirmed': patent.ps_confirmed ? 'Yes' : 'No',
      'CS Confirmation Pending': patent.pending_cs_confirmation ? 'Yes' : 'No',
      'CS Confirmed': patent.cs_confirmed ? 'Yes' : 'No',
      
      // Financial Information
      'Payment Status': patent.payment_status || 'Not Set',
      'Payment Amount': patent.payment_amount || 0,
      'Payment Received': patent.payment_received || 0,
      'Invoice Sent': patent.invoice_sent ? 'Yes' : 'No',
      
      // Forms Information
      'Form 1': patent.form_1 ? 'Yes' : 'No',
      'Form 2 PS': patent.form_2_ps ? 'Yes' : 'No',
      'Form 2 CS': patent.form_2_cs ? 'Yes' : 'No',
      'Form 3': patent.form_3 ? 'Yes' : 'No',
      'Form 4': patent.form_4 ? 'Yes' : 'No',
      'Form 5': patent.form_5 ? 'Yes' : 'No',
      'Form 6': patent.form_6 ? 'Yes' : 'No',
      'Form 7': patent.form_7 ? 'Yes' : 'No',
      'Form 7A': patent.form_7a ? 'Yes' : 'No',
      'Form 8': patent.form_8 ? 'Yes' : 'No',
      'Form 8A': patent.form_8a ? 'Yes' : 'No',
      'Form 9': patent.form_9 ? 'Yes' : 'No',
      'Form 9A': patent.form_9a ? 'Yes' : 'No',
      'Form 10': patent.form_10 ? 'Yes' : 'No',
      'Form 11': patent.form_11 ? 'Yes' : 'No',
      'Form 12': patent.form_12 ? 'Yes' : 'No',
      'Form 13': patent.form_13 ? 'Yes' : 'No',
      'Form 14': patent.form_14 ? 'Yes' : 'No',
      'Form 15': patent.form_15 ? 'Yes' : 'No',
      'Form 16': patent.form_16 ? 'Yes' : 'No',
      'Form 17': patent.form_17 ? 'Yes' : 'No',
      'Form 18': patent.form_18 ? 'Yes' : 'No',
      'Form 18A': patent.form_18a ? 'Yes' : 'No',
      'Form 19': patent.form_19 ? 'Yes' : 'No',
      'Form 20': patent.form_20 ? 'Yes' : 'No',
      'Form 21': patent.form_21 ? 'Yes' : 'No',
      'Form 22': patent.form_22 ? 'Yes' : 'No',
      'Form 23': patent.form_23 ? 'Yes' : 'No',
      'Form 24': patent.form_24 ? 'Yes' : 'No',
      'Form 25': patent.form_25 ? 'Yes' : 'No',
      'Form 26': patent.form_26 ? 'Yes' : 'No',
      'Form 27': patent.form_27 ? 'Yes' : 'No',
      'Form 28': patent.form_28 ? 'Yes' : 'No',
      'Form 29': patent.form_29 ? 'Yes' : 'No',
      'Form 30': patent.form_30 ? 'Yes' : 'No',
      'Form 31': patent.form_31 ? 'Yes' : 'No',
      'Other Forms': patent.other_forms || '',
      
      // Inventors Information (concatenated)
      'Inventors': patent.inventors?.map(inv => `${inv.inventor_name} - ${inv.inventor_addr}`).join('; ') || '',
      
      // Additional Information
      'Notes': patent.notes || '',
      'Internal Tracking ID': patent.internal_tracking_id || '',
      'Follow Up Status': patent.follow_up_status || 'Active',
      'Follow Up Count': patent.follow_up_count || 0,
      'Last Follow Up Date': patent.last_follow_up_date ? format(new Date(patent.last_follow_up_date), 'dd/MM/yyyy') : '',
      'Current Stage': patent.current_stage || '',
      'Created At': patent.created_at ? format(new Date(patent.created_at), 'dd/MM/yyyy HH:mm') : '',
      'Updated At': patent.updated_at ? format(new Date(patent.updated_at), 'dd/MM/yyyy HH:mm') : ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    
    // Auto-size columns
    const cols = [];
    const maxColWidth = 50;
    for (let i = 0; i < Object.keys(exportData[0] || {}).length; i++) {
      cols.push({ wch: Math.min(maxColWidth, 20) });
    }
    worksheet['!cols'] = cols;
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Patent_Details');
    
    const clientId = patents[0]?.client_id || 'Unknown_Client';
    XLSX.writeFile(workbook, `${clientId}_Detailed_Patent_Report.xlsx`);
    toast.success('Detailed patent report exported successfully');
  };

  return (
    <>
      <div className="flex justify-end mb-4 gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onExportToExcel}
          disabled={patents.length === 0}
          className="flex items-center"
        >
          <Download className="mr-2 h-4 w-4" />
          Quick Export
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={handleDetailedExport}
          disabled={patents.length === 0}
          className="flex items-center"
        >
          <Download className="mr-2 h-4 w-4" />
          Detailed Export
        </Button>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Patents</TabsTrigger>
          <TabsTrigger value="provisional">Provisional</TabsTrigger>
          <TabsTrigger value="complete">Complete</TabsTrigger>
          <TabsTrigger value="fer">FER</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          {patents.length > 0 ? (
            patents.map(patent => (
              <PatentCard key={patent.id} patent={patent} />
            ))
          ) : (
            <EmptyState 
              title="No Patents Found" 
              message="No patents match your search criteria or none have been assigned to this client." 
            />
          )}
        </TabsContent>
        
        <TabsContent value="provisional" className="space-y-4">
          {patents.filter(p => p.ps_completion_status === 1 && p.cs_completion_status === 0).length > 0 ? (
            patents
              .filter(p => p.ps_completion_status === 1 && p.cs_completion_status === 0)
              .map(patent => (
                <PatentCard key={patent.id} patent={patent} />
              ))
          ) : (
            <EmptyState 
              title="No Provisional Patents" 
              message="No provisional patents found for this client." 
            />
          )}
        </TabsContent>
        
        <TabsContent value="complete" className="space-y-4">
          {patents.filter(p => p.ps_completion_status === 1 && p.cs_completion_status === 1).length > 0 ? (
            patents
              .filter(p => p.ps_completion_status === 1 && p.cs_completion_status === 1)
              .map(patent => (
                <PatentCard key={patent.id} patent={patent} />
              ))
          ) : (
            <EmptyState 
              title="No Complete Patents" 
              message="No complete patents found for this client." 
            />
          )}
        </TabsContent>
        
        <TabsContent value="fer" className="space-y-4">
          {patents.filter(p => p.fer_status === 1).length > 0 ? (
            patents
              .filter(p => p.fer_status === 1)
              .map(patent => (
                <PatentCard key={patent.id} patent={patent} />
              ))
          ) : (
            <EmptyState 
              title="No FER Patents" 
              message="No patents with active FER found for this client." 
            />
          )}
        </TabsContent>
      </Tabs>
    </>
  );
};

export default PatentList;
