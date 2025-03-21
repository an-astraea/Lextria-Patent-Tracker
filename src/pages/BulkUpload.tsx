
import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';
import { bulkUploadPatents } from '@/lib/api/bulk-upload-api';
import { PatentFormData } from '@/lib/types';
import PageHeader from '@/components/common/PageHeader';

// Import our components
import TemplateDownloadCard from '@/components/bulk-upload/TemplateDownloadCard';
import UploadCardSection from '@/components/bulk-upload/UploadCardSection';
import SampleDataCard from '@/components/bulk-upload/SampleDataCard';
import ValidationErrorsCard from '@/components/bulk-upload/ValidationErrorsCard';
import UploadResultsCard from '@/components/bulk-upload/UploadResultsCard';
import InstructionsCard from '@/components/bulk-upload/InstructionsCard';
import ConfirmUploadDialog from '@/components/bulk-upload/ConfirmUploadDialog';

// Import utility functions
import { 
  downloadExcelTemplate, 
  downloadSampleExcelData, 
  getSamplePatentData,
  validatePatentData
} from '@/utils/excel-utils';

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
    downloadExcelTemplate();
    toast({
      title: "Template Downloaded",
      description: "The Excel template has been downloaded. Fill it with patent data and upload.",
    });
  };

  const downloadSampleExcel = () => {
    downloadSampleExcelData();
    toast({
      title: "Sample Data Downloaded",
      description: "An Excel file with sample patent data has been downloaded.",
    });
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

          // Updated to use async validation
          const { patentData, errors } = await validatePatentData(jsonData);
          
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

  return (
    <MainLayout>
      <div className="p-6">
        <PageHeader title="Patent Bulk Upload" />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <TemplateDownloadCard downloadTemplate={downloadTemplate} />
          
          <UploadCardSection 
            isValidating={isValidating}
            isUploading={isUploading}
            uploadProgress={uploadProgress}
            selectedFile={selectedFile}
            validationComplete={validationComplete}
            validationErrors={validationErrors}
            handleFileSelect={handleFileSelect}
            resetUploadStates={resetUploadStates}
            setShowConfirmDialog={setShowConfirmDialog}
          />

          <SampleDataCard 
            downloadSampleExcel={downloadSampleExcel}
            handleSampleUpload={handleSampleUpload}
            isUploading={isUploading}
            isValidating={isValidating}
          />
        </div>
        
        {validationComplete && validationErrors.length > 0 && (
          <ValidationErrorsCard validationErrors={validationErrors} />
        )}
        
        <UploadResultsCard 
          uploadResults={uploadResults} 
          show={showResults} 
        />
        
        <InstructionsCard />
        
        <ConfirmUploadDialog 
          showConfirmDialog={showConfirmDialog}
          setShowConfirmDialog={setShowConfirmDialog}
          parsedData={parsedData}
          selectedFile={selectedFile}
          confirmUpload={confirmUpload}
          isUploading={isUploading}
        />
      </div>
    </MainLayout>
  );
};

export default BulkUpload;
