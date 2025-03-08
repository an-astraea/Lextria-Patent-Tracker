
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
  
  // Regular form formatting
  const formNumber = formKey.replace('form_', '');
  return `Form ${formNumber}`;
};
