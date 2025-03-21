
import React, { useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, X, Check } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { PatentFormData } from '@/lib/types';
import LoadingState from '@/components/common/LoadingState';

interface UploadCardSectionProps {
  isValidating: boolean;
  isUploading: boolean;
  uploadProgress: number;
  selectedFile: File | null;
  validationComplete: boolean;
  validationErrors: string[];
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  resetUploadStates: () => void;
  setShowConfirmDialog: (show: boolean) => void;
}

const UploadCardSection: React.FC<UploadCardSectionProps> = ({
  isValidating,
  isUploading,
  uploadProgress,
  selectedFile,
  validationComplete,
  validationErrors,
  handleFileSelect,
  resetUploadStates,
  setShowConfirmDialog,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Patents</CardTitle>
        <CardDescription>
          Upload a filled Excel file to add multiple patents at once.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button
            className="w-full cursor-pointer"
            variant="default"
            disabled={isValidating || isUploading}
            onClick={triggerFileInput}
          >
            <Upload className="mr-2 h-4 w-4" />
            {isValidating ? "Validating..." : isUploading ? "Uploading..." : "Select & Upload File"}
          </Button>
          
          <input
            ref={fileInputRef}
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
  );
};

export default UploadCardSection;
