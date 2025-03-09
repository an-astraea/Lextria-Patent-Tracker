
import { FERHistory, Patent } from "../types";

/**
 * Converts form field names from the database format to the standardized format used in our types.
 * For example, "form_01" becomes "form_1"
 */
export function standardizePatentFormFields(patent: any): Patent {
  const standardizedPatent = { ...patent };
  
  // Map form_01 to form_1, etc.
  if (standardizedPatent.form_01 !== undefined) standardizedPatent.form_1 = standardizedPatent.form_01;
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
  
  // Standardize FER history if it exists
  if (standardizedPatent.fer_history && Array.isArray(standardizedPatent.fer_history)) {
    standardizedPatent.fer_history = standardizedPatent.fer_history.map((history: any) => {
      // Ensure that all required fields are present
      if (!history.patent_id && standardizedPatent.id) {
        history.patent_id = standardizedPatent.id;
      }
      
      if (!history.fer_number) {
        history.fer_number = 1; // Default to 1 if not present
      }
      
      if (!history.date) {
        history.date = history.created_at ? new Date(history.created_at).toISOString().split('T')[0] : 
                      new Date().toISOString().split('T')[0];
      }
      
      if (!history.action) {
        history.action = "FER History Entry";
      }
      
      return history as FERHistory;
    });
  }
  
  return standardizedPatent as Patent;
}

/**
 * Normalizes an array of patents to ensure they conform to our types
 */
export function normalizePatents(patents: any[]): Patent[] {
  return patents.map(patent => standardizePatentFormFields(patent));
}
