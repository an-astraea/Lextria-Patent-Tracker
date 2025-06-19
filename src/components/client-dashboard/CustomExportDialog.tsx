
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Download, Settings } from 'lucide-react';
import { Patent } from '@/lib/types';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CustomExportDialogProps {
  patents: Patent[];
}

interface ExportColumn {
  key: string;
  label: string;
  category: string;
  getValue: (patent: Patent) => string | number;
}

const CustomExportDialog: React.FC<CustomExportDialogProps> = ({ patents }) => {
  const [open, setOpen] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);

  const exportColumns: ExportColumn[] = [
    // Basic Information
    { key: 'tracking_id', label: 'Tracking ID', category: 'Basic Info', getValue: (p) => p.tracking_id || '' },
    { key: 'patent_applicant', label: 'Patent Applicant', category: 'Basic Info', getValue: (p) => p.patent_applicant || '' },
    { key: 'client_id', label: 'Client ID', category: 'Basic Info', getValue: (p) => p.client_id || '' },
    { key: 'patent_title', label: 'Patent Title', category: 'Basic Info', getValue: (p) => p.patent_title || '' },
    { key: 'application_no', label: 'Application No', category: 'Basic Info', getValue: (p) => p.application_no || '' },
    { key: 'date_of_filing', label: 'Date of Filing', category: 'Basic Info', getValue: (p) => p.date_of_filing ? format(new Date(p.date_of_filing), 'dd/MM/yyyy') : '' },
    { key: 'applicant_addr', label: 'Applicant Address', category: 'Basic Info', getValue: (p) => p.applicant_addr || '' },
    { key: 'inventor_ph_no', label: 'Inventor Phone', category: 'Basic Info', getValue: (p) => p.inventor_ph_no || '' },
    { key: 'inventor_email', label: 'Inventor Email', category: 'Basic Info', getValue: (p) => p.inventor_email || '' },

    // PS Information
    { key: 'ps_drafter_assgn', label: 'PS Drafter', category: 'PS (Provisional)', getValue: (p) => p.ps_drafter_assgn || '' },
    { key: 'ps_drafter_deadline', label: 'PS Drafter Deadline', category: 'PS (Provisional)', getValue: (p) => p.ps_drafter_deadline ? format(new Date(p.ps_drafter_deadline), 'dd/MM/yyyy') : '' },
    { key: 'ps_filer_assgn', label: 'PS Filer', category: 'PS (Provisional)', getValue: (p) => p.ps_filer_assgn || '' },
    { key: 'ps_filer_deadline', label: 'PS Filer Deadline', category: 'PS (Provisional)', getValue: (p) => p.ps_filer_deadline ? format(new Date(p.ps_filer_deadline), 'dd/MM/yyyy') : '' },
    { key: 'ps_drafting_status', label: 'PS Drafting Status', category: 'PS (Provisional)', getValue: (p) => p.ps_drafting_status === 1 ? 'Completed' : 'Pending' },
    { key: 'ps_filing_status', label: 'PS Filing Status', category: 'PS (Provisional)', getValue: (p) => p.ps_filing_status === 1 ? 'Completed' : 'Pending' },
    { key: 'ps_completion_status', label: 'PS Completion Status', category: 'PS (Provisional)', getValue: (p) => p.ps_completion_status === 1 ? 'Completed' : 'Pending' },

    // CS Information
    { key: 'cs_drafter_assgn', label: 'CS Drafter', category: 'CS (Complete)', getValue: (p) => p.cs_drafter_assgn || '' },
    { key: 'cs_drafter_deadline', label: 'CS Drafter Deadline', category: 'CS (Complete)', getValue: (p) => p.cs_drafter_deadline ? format(new Date(p.cs_drafter_deadline), 'dd/MM/yyyy') : '' },
    { key: 'cs_filer_assgn', label: 'CS Filer', category: 'CS (Complete)', getValue: (p) => p.cs_filer_assgn || '' },
    { key: 'cs_filer_deadline', label: 'CS Filer Deadline', category: 'CS (Complete)', getValue: (p) => p.cs_filer_deadline ? format(new Date(p.cs_filer_deadline), 'dd/MM/yyyy') : '' },
    { key: 'cs_drafting_status', label: 'CS Drafting Status', category: 'CS (Complete)', getValue: (p) => p.cs_drafting_status === 1 ? 'Completed' : 'Pending' },
    { key: 'cs_filing_status', label: 'CS Filing Status', category: 'CS (Complete)', getValue: (p) => p.cs_filing_status === 1 ? 'Completed' : 'Pending' },
    { key: 'cs_completion_status', label: 'CS Completion Status', category: 'CS (Complete)', getValue: (p) => p.cs_completion_status === 1 ? 'Completed' : 'Pending' },

    // FER Information
    { key: 'fer_status', label: 'FER Status', category: 'FER', getValue: (p) => p.fer_status === 1 ? 'Active' : 'Inactive' },
    { key: 'fer_drafter_assgn', label: 'FER Drafter', category: 'FER', getValue: (p) => p.fer_drafter_assgn || '' },
    { key: 'fer_drafter_deadline', label: 'FER Drafter Deadline', category: 'FER', getValue: (p) => p.fer_drafter_deadline ? format(new Date(p.fer_drafter_deadline), 'dd/MM/yyyy') : '' },
    { key: 'fer_filer_assgn', label: 'FER Filer', category: 'FER', getValue: (p) => p.fer_filer_assgn || '' },
    { key: 'fer_filer_deadline', label: 'FER Filer Deadline', category: 'FER', getValue: (p) => p.fer_filer_deadline ? format(new Date(p.fer_filer_deadline), 'dd/MM/yyyy') : '' },
    { key: 'fer_drafter_status', label: 'FER Drafter Status', category: 'FER', getValue: (p) => p.fer_drafter_status === 1 ? 'Completed' : 'Pending' },
    { key: 'fer_filing_status', label: 'FER Filing Status', category: 'FER', getValue: (p) => p.fer_filing_status === 1 ? 'Completed' : 'Pending' },

    // Financial Information
    { key: 'payment_status', label: 'Payment Status', category: 'Financial', getValue: (p) => p.payment_status || 'Not Set' },
    { key: 'payment_amount', label: 'Payment Amount', category: 'Financial', getValue: (p) => p.payment_amount || 0 },
    { key: 'payment_received', label: 'Payment Received', category: 'Financial', getValue: (p) => p.payment_received || 0 },
    { key: 'professional_fees', label: 'Professional Fees', category: 'Financial', getValue: (p) => p.professional_fees || 0 },
    { key: 'reimbursement', label: 'Reimbursement', category: 'Financial', getValue: (p) => p.reimbursement || 0 },
    { key: 'gst_amount', label: 'GST Amount', category: 'Financial', getValue: (p) => p.gst_amount || 0 },
    { key: 'tds_amount', label: 'TDS Amount', category: 'Financial', getValue: (p) => p.tds_amount || 0 },
    { key: 'expected_amount', label: 'Expected Amount', category: 'Financial', getValue: (p) => p.expected_amount || 0 },
    { key: 'invoice_sent', label: 'Invoice Sent', category: 'Financial', getValue: (p) => p.invoice_sent ? 'Yes' : 'No' },

    // Status Information
    { key: 'idf_sent', label: 'IDF Sent', category: 'Status', getValue: (p) => p.idf_sent ? 'Yes' : 'No' },
    { key: 'idf_received', label: 'IDF Received', category: 'Status', getValue: (p) => p.idf_received ? 'Yes' : 'No' },
    { key: 'cs_data', label: 'CS Data Sent', category: 'Status', getValue: (p) => p.cs_data ? 'Yes' : 'No' },
    { key: 'cs_data_received', label: 'CS Data Received', category: 'Status', getValue: (p) => p.cs_data_received ? 'Yes' : 'No' },
    { key: 'completed', label: 'Overall Completed', category: 'Status', getValue: (p) => p.completed ? 'Yes' : 'No' },
    { key: 'withdrawn', label: 'Withdrawn', category: 'Status', getValue: (p) => p.withdrawn ? 'Yes' : 'No' },

    // Forms (Sample - you can add more)
    { key: 'form_01', label: 'Form 1', category: 'Forms', getValue: (p) => p.form_01 ? 'Yes' : 'No' },
    { key: 'form_02_ps', label: 'Form 2 PS', category: 'Forms', getValue: (p) => p.form_02_ps ? 'Yes' : 'No' },
    { key: 'form_02_cs', label: 'Form 2 CS', category: 'Forms', getValue: (p) => p.form_02_cs ? 'Yes' : 'No' },
    { key: 'form_18', label: 'Form 18', category: 'Forms', getValue: (p) => p.form_18 ? 'Yes' : 'No' },
    { key: 'form_26', label: 'Form 26', category: 'Forms', getValue: (p) => p.form_26 ? 'Yes' : 'No' },

    // Inventors
    { key: 'inventors', label: 'Inventors', category: 'Additional', getValue: (p) => p.inventors?.map(inv => `${inv.inventor_name} - ${inv.inventor_addr}`).join('; ') || '' },

    // Dates
    { key: 'created_at', label: 'Created At', category: 'Additional', getValue: (p) => p.created_at ? format(new Date(p.created_at), 'dd/MM/yyyy HH:mm') : '' },
    { key: 'updated_at', label: 'Updated At', category: 'Additional', getValue: (p) => p.updated_at ? format(new Date(p.updated_at), 'dd/MM/yyyy HH:mm') : '' },
  ];

  const categories = Array.from(new Set(exportColumns.map(col => col.category)));

  const handleColumnToggle = (columnKey: string) => {
    setSelectedColumns(prev => 
      prev.includes(columnKey) 
        ? prev.filter(key => key !== columnKey)
        : [...prev, columnKey]
    );
  };

  const handleCategoryToggle = (category: string) => {
    const categoryColumns = exportColumns.filter(col => col.category === category).map(col => col.key);
    const allSelected = categoryColumns.every(key => selectedColumns.includes(key));
    
    if (allSelected) {
      setSelectedColumns(prev => prev.filter(key => !categoryColumns.includes(key)));
    } else {
      setSelectedColumns(prev => [...new Set([...prev, ...categoryColumns])]);
    }
  };

  const handleExport = () => {
    if (selectedColumns.length === 0) {
      toast.error('Please select at least one column to export');
      return;
    }

    if (patents.length === 0) {
      toast.error('No patents to export');
      return;
    }

    const selectedColumnObjects = exportColumns.filter(col => selectedColumns.includes(col.key));
    
    const exportData = patents.map(patent => {
      const row: Record<string, any> = {};
      selectedColumnObjects.forEach(col => {
        row[col.label] = col.getValue(patent);
      });
      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    
    // Auto-size columns
    const cols = selectedColumnObjects.map(() => ({ wch: 20 }));
    worksheet['!cols'] = cols;
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Custom_Export');
    
    const clientId = patents[0]?.client_id || 'Unknown_Client';
    XLSX.writeFile(workbook, `${clientId}_Custom_Export.xlsx`);
    
    toast.success('Custom export completed successfully');
    setOpen(false);
  };

  const selectAll = () => {
    setSelectedColumns(exportColumns.map(col => col.key));
  };

  const clearAll = () => {
    setSelectedColumns([]);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center">
          <Settings className="mr-2 h-4 w-4" />
          Custom Export
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Custom Export - Select Columns</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Select the columns you want to export ({selectedColumns.length} selected)
            </p>
            <div className="space-x-2">
              <Button variant="outline" size="sm" onClick={selectAll}>Select All</Button>
              <Button variant="outline" size="sm" onClick={clearAll}>Clear All</Button>
            </div>
          </div>

          <ScrollArea className="h-[400px] border rounded-md p-4">
            <div className="space-y-6">
              {categories.map(category => {
                const categoryColumns = exportColumns.filter(col => col.category === category);
                const selectedCount = categoryColumns.filter(col => selectedColumns.includes(col.key)).length;
                const allSelected = selectedCount === categoryColumns.length;
                const someSelected = selectedCount > 0 && selectedCount < categoryColumns.length;

                return (
                  <div key={category} className="space-y-2">
                    <div className="flex items-center space-x-2 pb-2 border-b">
                      <Checkbox
                        id={`category-${category}`}
                        checked={allSelected}
                        ref={(el) => {
                          if (el) el.indeterminate = someSelected;
                        }}
                        onCheckedChange={() => handleCategoryToggle(category)}
                      />
                      <label 
                        htmlFor={`category-${category}`} 
                        className="font-medium text-sm cursor-pointer"
                      >
                        {category} ({selectedCount}/{categoryColumns.length})
                      </label>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 ml-6">
                      {categoryColumns.map(column => (
                        <div key={column.key} className="flex items-center space-x-2">
                          <Checkbox
                            id={column.key}
                            checked={selectedColumns.includes(column.key)}
                            onCheckedChange={() => handleColumnToggle(column.key)}
                          />
                          <label 
                            htmlFor={column.key} 
                            className="text-sm cursor-pointer"
                          >
                            {column.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleExport}
              disabled={selectedColumns.length === 0}
              className="flex items-center"
            >
              <Download className="mr-2 h-4 w-4" />
              Export Selected ({selectedColumns.length})
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CustomExportDialog;
