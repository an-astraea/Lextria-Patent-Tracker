
import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';
import { bulkUploadPatents } from '@/lib/api/bulk-upload-api';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Patent, PatentFormData } from '@/lib/types';

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

  // Generate the template Excel file
  const downloadTemplate = () => {
    // Define the column headers for the template
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

    // Create a worksheet with headers
    const ws = XLSX.utils.aoa_to_sheet([headers]);

    // Create a sample row with explanations
    const sampleRow = [
      'PAT-123456', // tracking_id
      'Example Applicant', // patent_applicant
      'CLIENT-001', // client_id
      'Example Patent Title', // patent_title
      '123 Applicant Street, City, Country', // applicant_addr
      '1234567890', // inventor_ph_no
      'inventor@example.com', // inventor_email
      'APP-12345 (optional)', // application_no
      '2023-01-01 (YYYY-MM-DD, optional)', // date_of_filing
      'John Doe (employee full name)', // ps_drafter_assgn
      '2023-02-01 (YYYY-MM-DD)', // ps_drafter_deadline
      'Jane Smith (employee full name)', // ps_filer_assgn
      '2023-03-01 (YYYY-MM-DD)', // ps_filer_deadline
      'John Doe (employee full name)', // cs_drafter_assgn
      '2023-04-01 (YYYY-MM-DD)', // cs_drafter_deadline
      'Jane Smith (employee full name)', // cs_filer_assgn
      '2023-05-01 (YYYY-MM-DD)', // cs_filer_deadline
      '0 (use 0 for no, 1 for yes)', // fer_status
      'John Inventor', // inventor_name
      '456 Inventor Avenue, City, Country' // inventor_addr
    ];

    // Add the sample row (optional)
    XLSX.utils.sheet_add_aoa(ws, [sampleRow], { origin: 1 });

    // Add column width specifications
    const wscols = headers.map(() => ({ wch: 25 }));
    ws['!cols'] = wscols;

    // Create a workbook and add the worksheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Patent Template');

    // Generate the Excel file and trigger download
    XLSX.writeFile(wb, 'patent_upload_template.xlsx');
    
    toast({
      title: "Template Downloaded",
      description: "The Excel template has been downloaded. Fill it with patent data and upload.",
    });
  };

  // Handle file upload and processing
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setUploadProgress(10);
      setShowResults(false);

      // Read the Excel file
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          setUploadProgress(30);
          
          // Get the first worksheet
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          
          // Convert the worksheet to JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet) as Record<string, any>[];
          
          setUploadProgress(50);
          
          if (jsonData.length === 0) {
            throw new Error('No data found in the uploaded file');
          }

          // Validate and transform the data
          const patentData = preparePatentData(jsonData);
          
          setUploadProgress(70);

          // Upload the data to the server
          const results = await bulkUploadPatents(patentData);
          
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
        } catch (error) {
          console.error("Error processing file:", error);
          toast({
            variant: "destructive",
            title: "Error Processing File",
            description: error instanceof Error ? error.message : "Failed to process the Excel file",
          });
        } finally {
          setIsUploading(false);
          e.target!.value = '';
        }
      };
      
      reader.readAsArrayBuffer(file);
    } catch (error) {
      setIsUploading(false);
      console.error("File upload error:", error);
      toast({
        variant: "destructive",
        title: "Upload Error",
        description: "An error occurred during file upload.",
      });
    }
  };

  // Transform and validate Excel data to match our PatentFormData structure
  const preparePatentData = (jsonData: Record<string, any>[]): PatentFormData[] => {
    const patentData: PatentFormData[] = [];
    const errors: string[] = [];

    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i];
      const rowIndex = i + 2; // +2 because Excel is 1-indexed and we have a header row

      try {
        // Validate required fields
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

        // Create a patent object from the row
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

        // Add more inventors if they exist (inventor_name2, inventor_addr2, etc.)
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

    return patentData;
  };

  return (
    <MainLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Patent Bulk Upload</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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
                    disabled={isUploading}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {isUploading ? "Uploading..." : "Select & Upload File"}
                  </Button>
                </label>
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  accept=".xlsx, .xls"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                />
                
                {isUploading && (
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">
                      Processing... {uploadProgress}%
                    </div>
                    <Progress value={uploadProgress} className="w-full" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
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
                          <AlertTitle>Error in Row {index + 2}</AlertTitle>
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
              <li>Fill the template with your patent data. Fields marked with * are required.</li>
              <li>You can add multiple inventors by adding columns: inventor_name2, inventor_addr2, etc.</li>
              <li>Save the file and click "Upload" to submit your data.</li>
              <li>Review the upload results for any errors.</li>
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
      </div>
    </MainLayout>
  );
};

export default BulkUpload;
