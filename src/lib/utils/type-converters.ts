import { Patent } from '@/lib/types';

export const standardizePatent = (rawPatent: any): Patent => {
  const standardizedPatent = { ...rawPatent };
  
  // Format dates if they exist
  if (standardizedPatent.date_of_filing) {
    standardizedPatent.date_of_filing = new Date(standardizedPatent.date_of_filing).toISOString();
  }
  
  // Map form_01 to form_1, etc. for consistent access in the frontend
  Object.keys(standardizedPatent).forEach(key => {
    // Check if it's a form field with padded zero (form_01, form_02, etc.)
    if (key.match(/^form_0\d$/)) {
      const newKey = key.replace('_0', '_'); // form_01 -> form_1
      standardizedPatent[newKey] = standardizedPatent[key];
    }
    
    // Also handle double-digit forms like form_10
    if (key.match(/^form_\d\d$/) && !key.startsWith('form_0')) {
      // Keep the key as is, but ensure the value is properly converted to boolean if needed
      if (typeof standardizedPatent[key] === 'number') {
        standardizedPatent[key] = !!standardizedPatent[key];
      }
    }
    
    // Handle special form names like form_18a
    if (key.match(/^form_\d+[a-z]$/)) {
      // Keep these as is, just ensure proper boolean conversion
      if (typeof standardizedPatent[key] === 'number') {
        standardizedPatent[key] = !!standardizedPatent[key];
      }
    }
  });
  
  return standardizedPatent as Patent;
};

export const normalizePatents = (patents: any[]): Patent[] => {
  return patents.map(patent => standardizePatent(patent));
};
