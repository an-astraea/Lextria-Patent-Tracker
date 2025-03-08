import React from 'react';
import { Patent } from '@/lib/types';
import { CheckCircle2, XCircle } from 'lucide-react';

interface FormRequirementsListProps {
  patent: Patent;
}

const FormRequirementsList = ({ patent }: FormRequirementsListProps) => {
  // Determine the current stage of the patent
  const isInPSStage = patent.ps_completion_status === 0;
  const isInCSStage = patent.ps_completion_status === 1 && patent.cs_completion_status === 0;
  const isInFERStage = patent.fer_status === 1 && patent.fer_completion_status === 0;
  const isCompleted = patent.ps_completion_status === 1 && patent.cs_completion_status === 1 && 
                      (patent.fer_status === 0 || patent.fer_completion_status === 1);

  // Helper function to render form status
  const renderFormStatus = (formStatus: boolean | null, formName: string) => {
    return (
      <div className="flex items-center justify-between py-2 border-b">
        <span className="text-sm">{formName}</span>
        {formStatus ? (
          <CheckCircle2 className="h-5 w-5 text-green-500" />
        ) : (
          <XCircle className="h-5 w-5 text-gray-300" />
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Provisional Specification Forms */}
      {(isInPSStage || !isInPSStage) && (
        <div>
          <h3 className="text-sm font-medium mb-2">Provisional Specification Forms</h3>
          <div className="space-y-1">
            {renderFormStatus(patent.form_01, "Form 1 - Application for Patent")}
            {renderFormStatus(patent.form_02_ps, "Form 2 - Provisional Specification")}
            {/* Add other PS forms here */}
          </div>
        </div>
      )}

      {/* Complete Specification Forms */}
      {(isInCSStage || isCompleted) && (
        <div>
          <h3 className="text-sm font-medium mb-2 mt-4">Complete Specification Forms</h3>
          <div className="space-y-1">
            {renderFormStatus(patent.form_01, "Form 1 - Application for Patent")}
            {renderFormStatus(patent.form_02_cs, "Form 2 - Complete Specification")}
            {renderFormStatus(patent.form_03, "Form 3 - Declaration of Inventorship")}
            {renderFormStatus(patent.form_04, "Form 4 - Request for Early Publication")}
            {renderFormStatus(patent.form_18, "Form 18 - Request for Examination")}
            {renderFormStatus(patent.form_18a, "Form 18A - International Application")}
            {/* Add other CS forms here */}
          </div>
        </div>
      )}

      {/* FER Forms */}
      {(isInFERStage || (isCompleted && patent.fer_status === 1)) && (
        <div>
          <h3 className="text-sm font-medium mb-2 mt-4">FER Response Forms</h3>
          <div className="space-y-1">
            {renderFormStatus(patent.form_13, "Form 13 - FER Response")}
            {/* Add other FER forms here */}
          </div>
        </div>
      )}
      
      {/* Other forms if specified */}
      {patent.other_forms && (
        <div className="mt-4">
          <h3 className="text-sm font-medium mb-2">Other Forms</h3>
          <div className="text-sm p-2 bg-gray-50 rounded">
            {patent.other_forms}
          </div>
        </div>
      )}
    </div>
  );
};

export default FormRequirementsList;
