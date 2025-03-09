
import { Patent } from '@/lib/types';

export const standardizePatent = (rawPatent: any): Patent => {
  const standardizedPatent = { ...rawPatent };
  
  // Format dates if they exist
  if (standardizedPatent.date_of_filing) {
    standardizedPatent.date_of_filing = new Date(standardizedPatent.date_of_filing).toISOString();
  }
  
  // Map form_01 to form_1, etc.
  if (standardizedPatent.form_01 !== undefined) standardizedPatent.form_1 = standardizedPatent.form_01;
  if (standardizedPatent.form_02 !== undefined) standardizedPatent.form_2 = standardizedPatent.form_02;
  if (standardizedPatent.form_02_ps !== undefined) standardizedPatent.form_2_ps = standardizedPatent.form_02_ps;
  if (standardizedPatent.form_02_cs !== undefined) standardizedPatent.form_2_cs = standardizedPatent.form_02_cs;
  if (standardizedPatent.form_03 !== undefined) standardizedPatent.form_3 = standardizedPatent.form_03;
  if (standardizedPatent.form_04 !== undefined) standardizedPatent.form_4 = standardizedPatent.form_04;
  if (standardizedPatent.form_05 !== undefined) standardizedPatent.form_5 = standardizedPatent.form_05;
  if (standardizedPatent.form_06 !== undefined) standardizedPatent.form_6 = standardizedPatent.form_06;
  if (standardizedPatent.form_07 !== undefined) standardizedPatent.form_7 = standardizedPatent.form_07;
  if (standardizedPatent.form_07a !== undefined) standardizedPatent.form_7a = standardizedPatent.form_07a;
  if (standardizedPatent.form_08 !== undefined) standardizedPatent.form_8 = standardizedPatent.form_08;
  if (standardizedPatent.form_08a !== undefined) standardizedPatent.form_8a = standardizedPatent.form_08a;
  if (standardizedPatent.form_09 !== undefined) standardizedPatent.form_9 = standardizedPatent.form_09;
  if (standardizedPatent.form_09a !== undefined) standardizedPatent.form_9a = standardizedPatent.form_09a;
  
  return standardizedPatent as Patent;
};

export const normalizePatents = (patents: any[]): Patent[] => {
  return patents.map(patent => standardizePatent(patent));
};
