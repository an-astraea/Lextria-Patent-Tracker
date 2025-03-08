
import { Patent } from './types';

export interface DataItem {
  id: string;
  name: string;
  value: number;
}

// Sample data for dashboard
export const data: DataItem[] = [
  { id: '1', name: 'Pending Patents', value: 13 },
  { id: '2', name: 'Completed Patents', value: 45 },
  { id: '3', name: 'Drafting Pending', value: 7 },
  { id: '4', name: 'Filing Pending', value: 5 },
];

// Create a function to determine if a form has been selected in a Patent
export const isFormSelected = (patent: Patent, formKey: string): boolean => {
  if (!patent) return false;
  return Boolean(patent[formKey as keyof Patent]);
};

// Get all selected forms for a patent as an array
export const getSelectedForms = (patent: Patent): string[] => {
  if (!patent) return [];
  
  const formKeys = Object.keys(patent).filter(key => 
    key.startsWith('form_') && Boolean(patent[key as keyof Patent])
  );
  
  return formKeys;
};

// Format form name for display
export const formatFormName = (formKey: string): string => {
  // Handle special cases
  if (formKey === 'form_02_ps') return 'Form 02 - Provisional Specification';
  if (formKey === 'form_02_cs') return 'Form 02 - Complete Specification';
  if (formKey === 'form_01') return 'Form 01 - Application for Grant of Patent';
  if (formKey === 'form_03') return 'Form 03 - Statement Under Section 8';
  if (formKey === 'form_04') return 'Form 04 - Request for Extension of Time';
  if (formKey === 'form_05') return 'Form 05 - Declaration of Inventorship';
  if (formKey === 'form_06') return 'Form 06 - Change in Applicant';
  if (formKey === 'form_07') return 'Form 07 - Notice of Opposition';
  if (formKey === 'form_07a') return 'Form 07A - Representation for Opposition';
  if (formKey === 'form_08') return 'Form 08 - Mention of Inventor';
  if (formKey === 'form_08a') return 'Form 08A - Certificate of Inventorship';
  if (formKey === 'form_09') return 'Form 09 - Request for Publication';
  if (formKey === 'form_10') return 'Form 10 - Amendment of Patent';
  if (formKey === 'form_11') return 'Form 11 - Direction of Controller';
  if (formKey === 'form_12') return 'Form 12 - Grant Under Section 26/52';
  if (formKey === 'form_13') return 'Form 13 - Amendment of Application';
  if (formKey === 'form_14') return 'Form 14 - Opposition to Amendment';
  if (formKey === 'form_15') return 'Form 15 - Restoration of Patent';
  if (formKey === 'form_16') return 'Form 16 - Restoration of Title';
  if (formKey === 'form_17') return 'Form 17 - Compulsory Licence';
  if (formKey === 'form_18') return 'Form 18 - Request for Examination';
  if (formKey === 'form_18a') return 'Form 18A - Expedited Examination';
  if (formKey === 'form_19') return 'Form 19 - Revocation for Non-Working';
  if (formKey === 'form_20') return 'Form 20 - Revision of Licence Terms';
  if (formKey === 'form_21') return 'Form 21 - Termination of Licence';
  if (formKey === 'form_22') return 'Form 22 - Registration of Patent Agent';
  if (formKey === 'form_23') return 'Form 23 - Restoration of Agent Name';
  if (formKey === 'form_24') return 'Form 24 - Review of Controller Decision';
  if (formKey === 'form_25') return 'Form 25 - Permission for Foreign Filing';
  if (formKey === 'form_26') return 'Form 26 - Agent Authorization';
  if (formKey === 'form_27') return 'Form 27 - Working Statement';
  if (formKey === 'form_28') return 'Form 28 - Small Entity/Startup';
  if (formKey === 'form_29') return 'Form 29 - Withdrawal of Application';
  if (formKey === 'form_30') return 'Form 30 - General Purpose Form';
  if (formKey === 'form_31') return 'Form 31 - Grace Period';
  
  // Regular form formatting for any new forms that might be added later
  const formNumber = formKey.replace('form_', '');
  return `Form ${formNumber}`;
};
