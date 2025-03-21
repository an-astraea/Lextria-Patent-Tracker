import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Upload, FileUp, X, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';
import { bulkUploadPatents } from '@/lib/api/bulk-upload-api';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { PatentFormData } from '@/lib/types';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import LoadingState from '@/components/common/LoadingState';

const BulkUpload: React.FC = () => {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResults, setUploadResults] = useState<{
    success: number;
    failed: number;
    errors: string[];
  }>({ success: 0, failed: 0, errors: [] });
  const [showResults, setShowResults] = useState(false);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<PatentFormData[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [validationComplete, setValidationComplete] = useState(false);

  const downloadTemplate = () => {
    const headers = [
      'tracking_id*',
      'patent_applicant*',
      'client_id*',
      'patent_title*',
      'applicant_addr*',
      'inventor_ph_no*',
      'inventor_email*',
      'application_no',
      'date_of_filing',
      'ps_drafter_assgn',
      'ps_drafter_deadline',
      'ps_filer_assgn',
      'ps_filer_deadline',
      'cs_drafter_assgn',
      'cs_drafter_deadline',
      'cs_filer_assgn',
      'cs_filer_deadline',
      'fer_status',
      'inventor_name*',
      'inventor_addr*'
    ];

    const ws = XLSX.utils.aoa_to_sheet([headers]);

    const sampleRow = [
      'PAT-123456',
      'Example Applicant',
      'CLIENT-001',
      'Example Patent Title',
      '123 Applicant Street, City, Country',
      '1234567890',
      'inventor@example.com',
      'APP-12345 (optional)',
      '2023-01-01 (YYYY-MM-DD, optional)',
      'John Doe (employee full name)',
      '2023-02-01 (YYYY-MM-DD)',
      'Jane Smith (employee full name)',
      '2023-03-01 (YYYY-MM-DD)',
      'John Doe (employee full name)',
      '2023-04-01 (YYYY-MM-DD)',
      'Jane Smith (employee full name)',
      '2023-05-01 (YYYY-MM-DD)',
      '0 (use 0 for no, 1 for yes)',
      'John Inventor',
      '456 Inventor Avenue, City, Country'
    ];

    XLSX.utils.sheet_add_aoa(ws, [sampleRow], { origin: 1 });

    const wscols = headers.map(() => ({ wch: 25 }));
    ws['!cols'] = wscols;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Patent Template');

    XLSX.writeFile(wb, 'patent_upload_template.xlsx');
    
    toast({
      title: "Template Downloaded",
      description: "The Excel template has been downloaded. Fill it with patent data and upload.",
    });
  };

  const downloadSampleExcel = () => {
    const sampleData = [{
      'tracking_id*': 'PAT-123456',
      'patent_applicant*': 'Sample Applicant Ltd.',
      'client_id*': 'CLIENT-001',
      'patent_title*': 'Method and System for AI-Based Patent Analysis',
      'applicant_addr*': '123 Innovation Street, Tech City, 10001',
      'inventor_ph_no*': '9876543210',
      'inventor_email*': 'inventor@example.com',
      'application_no': 'APP-2023-12345',
      'date_of_filing': '2023-05-15',
      'ps_drafter_assgn': 'John Smith',
      'ps_drafter_deadline': '2023-06-15',
      'ps_filer_assgn': 'Jane Doe',
      'ps_filer_deadline': '2023-07-15',
      'cs_drafter_assgn': 'Robert Johnson',
      'cs_drafter_deadline': '2023-08-15',
      'cs_filer_assgn': 'Emily Wilson',
      'cs_filer_deadline': '2023-09-15',
      'fer_status': '0',
      'inventor_name*': 'Dr. Alan Inventor',
      'inventor_addr*': '456 Research Avenue, Innovation Park, 20002',
      'inventor_name2': 'Sarah Co-Inventor',
      'inventor_addr2': '789 Technology Road, Science District, 30003'
    }];

    const ws = XLSX.utils.json_to_sheet(sampleData);

    const wscols = Object.keys(sampleData[0]).map(() => ({ wch: 25 }));
    ws['!cols'] = wscols;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sample Patent Data');

    XLSX.writeFile(wb, 'sample_patent_data.xlsx');
    
    toast({
      title: "Sample Data Downloaded",
      description: "An Excel file with sample patent data has been downloaded.",
    });
  };

  const getSamplePatentData = (): PatentFormData[] => {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + 30);
    
    const formattedToday = today.toISOString().split('T')[0];
    const formattedFuture = futureDate.toISOString().split('T')[0];
    
    return [
      {
        tracking_id: `SAMPLE-${Date.now()}`,
        patent_applicant: "Sample Company Ltd.",
        client_id: "CLIENT-SAMPLE",
        patent_title: "Sample Innovative Technology Patent",
        applicant_addr: "123 Sample Street, Sample City, 12345",
        inventor_ph_no: "1234567890",
        inventor_email: "inventor@example.com",
        application_no: "APP-SAMPLE-123",
        date_of_filing: formattedToday,
        ps_drafter_assgn: "John Doe",
        ps_drafter_deadline: formattedFuture,
        ps_filer_assgn: "Jane Smith",
        ps_filer_deadline: formattedFuture,
        cs_drafter_assgn: "John Doe",
        cs_drafter_deadline: formattedFuture,
        cs_filer_assgn: "Jane Smith",
        cs_filer_deadline: formattedFuture,
        fer_status: 0,
        inventors: [
          {
            inventor_name: "Sample Inventor",
            inventor_addr: "456 Inventor Avenue, Invention City, 67890"
          },
          {
            inventor_name: "Second Inventor",
            inventor_addr: "789 Innovation Road, Tech Town, 54321"
          }
        ]
      }
    ];
  };

  const handleSampleUpload = async () => {
    setIsUploading(true);
    setUploadProgress(20);
    setShowResults(false);
    
    try {
      const sampleData = getSamplePatentData();
      setUploadProgress(50);
      
      const results = await bulkUploadPatents(sampleData);
      
      setUploadProgress(100);
      setUploadResults(results);
      setShowResults(true);
      
      if (results.success > 0) {
        toast({
          title: "Sample Patent Uploaded",
          description: `${results.success} sample patent(s) uploaded successfully.`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Upload Failed",
          description: "Failed to upload sample patent. Please check the errors.",
        });
      }
    } catch (error) {
      console.error("Error uploading sample patent:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to upload sample patent."
      });
    } finally {
      setIsUploading(false);
    }
  };

  const resetUploadStates = () => {
    setSelectedFile(null);
    setParsedData([]);
    setValidationErrors([]);
    setValidationComplete(false);
    setShowConfirmDialog(false);
    setIsValidating(false);
    setUploadProgress(0);
    setShowResults(false);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setSelectedFile(file);
      setIsValidating(true);
      setValidationErrors([]);
      setUploadProgress(10);
      setValidationComplete(false);
      
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const result = e.target?.result;
          if (!result) throw new Error('Failed to read file');
          
          const data = new Uint8Array(result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          setUploadProgress(30);
          
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          
          const jsonData = XLSX.utils.sheet_to_json(worksheet) as Record<string, any>[];
          
          setUploadProgress(50);
          
          if (jsonData.length === 0) {
            throw new Error('No data found in the uploaded file');
          }

          const { patentData, errors } = validatePatentData(jsonData);
          
          setUploadProgress(90);
          setParsedData(patentData);
          
          if (errors.length > 0) {
            setValidationErrors(errors);
            toast({
              variant: "destructive",
              title: "Validation Failed",
              description: `Found ${errors.length} errors in your data. Please review and fix them.`,
            });
          } else if (patentData.length > 0) {
            setShowConfirmDialog(true);
            toast({
              title: "Validation Successful",
              description: `${patentData.length} patents ready to upload. Please confirm to proceed.`,
            });
          }
          
          setUploadProgress(100);
          
        } catch (error) {
          console.error("Error processing file:", error);
          setValidationErrors([error instanceof Error ? error.message : "Unknown error during file processing"]);
          toast({
            variant: "destructive",
            title: "Error Processing File",
            description: error instanceof Error ? error.message : "Failed to process the Excel file",
          });
        } finally {
          setIsValidating(false);
          setValidationComplete(true);
          if (e.target) {
            (e.target as any).value = '';
          }
        }
      };
      
      reader.readAsArrayBuffer(file);
    } catch (error) {
      setIsValidating(false);
      console.error("File upload error:", error);
      toast({
        variant: "destructive",
        title: "Upload Error",
        description: "An error occurred during file upload.",
      });
    }
  };

  const confirmUpload = async () => {
    if (parsedData.length === 0) {
      toast({
        variant: "destructive",
        title: "No Data",
        description: "No valid patent data to upload.",
      });
      return;
    }

    try {
      setIsUploading(true);
      setShowConfirmDialog(false);
      setUploadProgress(20);
      
      const results = await bulkUploadPatents(parsedData);
      
      setUploadProgress(100);
      setUploadResults(results);
      setShowResults(true);
      
      if (results.success > 0) {
        toast({
          title: "Upload Successful",
          description: `${results.success} patents uploaded successfully. ${results.failed} failed.`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Upload Failed",
          description: "No patents were successfully uploaded. Please check the errors.",
        });
      }
      
      setSelectedFile(null);
      setParsedData([]);
      
    } catch (error) {
      console.error("Error uploading patents:", error);
      toast({
        variant: "destructive",
        title: "Upload Error",
        description: error instanceof Error ? error.message : "An error occurred during upload.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const validatePatentData = (jsonData: Record<string, any>[]): { patentData: PatentFormData[], errors: string[] } => {
    const patentData: PatentFormData[] = [];
    const errors: string[] = [];

    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i];
      const rowIndex = i + 2; // +2 because Excel is 1-indexed and we have a header row

      try {
        const requiredFields = [
          'tracking_id',
          'patent_applicant',
          'client_id',
          'patent_title',
          'applicant_addr',
          'inventor_ph_no',
          'inventor_email',
          'inventor_name',
          'inventor_addr'
        ];

        for (const field of requiredFields) {
          if (!row[field + '*'] && !row[field]) {
            throw new Error(`Missing required field: ${field}`);
          }
        }

        const patent: PatentFormData = {
          tracking_id: row['tracking_id*'] || row['tracking_id'],
          patent_applicant: row['patent_applicant*'] || row['patent_applicant'],
          client_id: row['client_id*'] || row['client_id'],
          patent_title: row['patent_title*'] || row['patent_title'],
          applicant_addr: row['applicant_addr*'] || row['applicant_addr'],
          inventor_ph_no: row['inventor_ph_no*'] || row['inventor_ph_no'],
          inventor_email: row['inventor_email*'] || row['inventor_email'],
          application_no: row['application_no'] || null,
          date_of_filing: row['date_of_filing'] || null,
          ps_drafter_assgn: row['ps_drafter_assgn'] || null,
          ps_drafter_deadline: row['ps_drafter_deadline'] || null,
          ps_filer_assgn: row['ps_filer_assgn'] || null,
          ps_filer_deadline: row['ps_filer_deadline'] || null,
          cs_drafter_assgn: row['cs_drafter_assgn'] || null,
          cs_drafter_deadline: row['cs_drafter_deadline'] || null,
          cs_filer_assgn: row['cs_filer_assgn'] || null,
          cs_filer_deadline: row['cs_filer_deadline'] || null,
          fer_status: row['fer_status'] ? parseInt(row['fer_status'], 10) : 0,
          inventors: [
            {
              inventor_name: row['inventor_name*'] || row['inventor_name'],
              inventor_addr: row['inventor_addr*'] || row['inventor_addr']
            }
          ]
        };

        const dateFields = ['date_of_filing', 'ps_drafter_deadline', 'ps_filer_deadline', 'cs_drafter_deadline', 'cs_filer_deadline'];
        for (const field of dateFields) {
          if (patent[field as keyof PatentFormData] && !/^\d{4}-\d{2}-\d{2}$/.test(patent[field as keyof PatentFormData] as string)) {
            throw new Error(`Invalid date format for ${field}. Use YYYY-MM-DD format.`);
          }
        }

        for (let j = 2; j <= 10; j++) {
          const nameField = `inventor_name${j}`;
          const addrField = `inventor_addr${j}`;
          
          if ((row[nameField] || row[`${nameField}*`]) && (row[addrField] || row[`${addrField}*`])) {
            patent.inventors.push({
              inventor_name: row[`${nameField}*`] || row[nameField],
              inventor_addr: row[`${addrField}*`] || row[addrField]
            });
          }
        }

        patentData.push(patent);
      } catch (error) {
        console.error(`Error in row ${rowIndex}:`, error);
        errors.push(`Row ${rowIndex}: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    }

    return { patentData, errors };
  };

  return (
    <MainLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Patent Bulk Upload</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Download Template</CardTitle>
              <CardDescription>
                Download an Excel template with the required fields for bulk patent upload.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={downloadTemplate} className="w-full" variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Download Template
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Upload Patents</CardTitle>
              <CardDescription>
                Upload a filled Excel file to add multiple patents at once.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <label 
                  htmlFor="file-upload"
                  className="w-full cursor-pointer"
                >
                  <Button
                    className="w-full cursor-pointer"
                    variant="default"
                    disabled={isValidating || isUploading}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {isValidating ? "Validating..." : isUploading ? "Uploading..." : "Select & Upload File"}
                  </Button>
                </label>
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  accept=".xlsx, .xls"
                  onChange={handleFileSelect}
                  disabled={isValidating || isUploading}
                />
                
                {(isValidating || isUploading) && (
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">
                      {isValidating ? "Validating..." : "Processing..."} {uploadProgress}%
                    </div>
                    <Progress value={uploadProgress} className="w-full" />
                  </div>
                )}
                
                {selectedFile && !isValidating && !isUploading && (
                  <div className="p-3 border rounded-md bg-muted/30">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium truncate">
                        {selectedFile.name}
                      </span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={resetUploadStates}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    {validationComplete && validationErrors.length === 0 && (
                      <div className="mt-2 flex justify-end">
                        <Button 
                          size="sm"
                          onClick={() => setShowConfirmDialog(true)}
                        >
                          <Check className="mr-1 h-3 w-3" />
                          Confirm Upload
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sample Data</CardTitle>
              <CardDescription>
                Download or upload sample patent data for testing.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={downloadSampleExcel} 
                className="w-full" 
                variant="outline"
              >
                <Download className="mr-2 h-4 w-4" />
                Download Sample Data
              </Button>
              
              <Button 
                onClick={handleSampleUpload} 
                className="w-full" 
                variant="secondary"
                disabled={isUploading || isValidating}
              >
                <FileUp className="mr-2 h-4 w-4" />
                Upload Sample Patent
              </Button>
            </CardContent>
          </Card>
        </div>
        
        {validationComplete && validationErrors.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-destructive">Validation Errors</CardTitle>
              <CardDescription>
                Please fix the following issues in your Excel file and try again.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-h-60 overflow-y-auto">
                {validationErrors.map((error, index) => (
                  <Alert key={index} variant="destructive" className="mb-2">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
        
        {showResults && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Upload Results</CardTitle>
              <CardDescription>
                Summary of the bulk upload operation.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <div className="font-semibold">Successfully Uploaded</div>
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {uploadResults.success}
                    </div>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                    <div className="font-semibold">Failed to Upload</div>
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {uploadResults.failed}
                    </div>
                  </div>
                </div>
                
                {uploadResults.errors.length > 0 && (
                  <div className="mt-4">
                    <h3 className="font-semibold mb-2">Errors:</h3>
                    <div className="max-h-60 overflow-y-auto">
                      {uploadResults.errors.map((error, index) => (
                        <Alert key={index} variant="destructive" className="mb-2">
                          <AlertTitle>Error</AlertTitle>
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
        
        <Card>
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
            <CardDescription>
              How to use the bulk upload feature.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Click "Download Template" to get the Excel template with required fields.</li>
              <li>Or click "Download Sample Data" to get a pre-filled Excel file with example data.</li>
              <li>Fill the template with your patent data. Fields marked with * are required.</li>
              <li>You can add multiple inventors by adding columns: inventor_name2, inventor_addr2, etc.</li>
              <li>Save the file and click "Upload" to submit your data.</li>
              <li>The system will validate your data before uploading. Fix any reported errors.</li>
              <li>After validation, click "Confirm Upload" to complete the process.</li>
              <li>Review the upload results for any errors.</li>
              <li>For quick testing, use the "Upload Sample Patent" option to add a pre-filled sample patent.</li>
            </ol>
            
            <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
              <h3 className="font-semibold text-amber-800 dark:text-amber-400">Important Notes:</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm text-amber-700 dark:text-amber-300">
                <li>Each patent requires at least one inventor.</li>
                <li>The tracking_id must be unique for each patent.</li>
                <li>Use YYYY-MM-DD format for all date fields.</li>
                <li>Employee assignments must match existing employee names in the system.</li>
              </ul>
            </div>
          </CardContent>
        </Card>
        
        <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Patent Upload</DialogTitle>
              <DialogDescription>
                You're about to upload {parsedData.length} patents to the system. This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-md">
                <p className="text-sm text-green-700 dark:text-green-300 flex items-center">
                  <Check className="mr-2 h-4 w-4" />
                  Data validation successful
                </p>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium">Upload Summary:</p>
                <ul className="text-sm space-y-1">
                  <li>• Total patents: {parsedData.length}</li>
                  <li>• Total inventors: {parsedData.reduce((acc, patent) => acc + patent.inventors.length, 0)}</li>
                  <li>• File: {selectedFile?.name}</li>
                </ul>
              </div>
            </div>
            
            <DialogFooter className="sm:justify-between">
              <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
                Cancel
              </Button>
              <Button onClick={confirmUpload} disabled={isUploading}>
                {isUploading ? <LoadingState size="sm" text="Uploading..." /> : "Confirm Upload"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default BulkUpload;
