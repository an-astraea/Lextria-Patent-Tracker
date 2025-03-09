
import { FERHistory, Patent } from "../types";

/**
 * Converts form field names from the database format to the standardized format used in our types.
 * For example, "form_01" becomes "form_1"
 */
export function standardizePatentFormFields(patent: any): Patent {
  const standardizedPatent = { ...patent };
  
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
  
  // Standardize FER history if it exists
  if (standardizedPatent.fer_history && Array.isArray(standardizedPatent.fer_history)) {
    standardizedPatent.fer_history = standardizedPatent.fer_history.map((history: any) => {
      // Create a standardized FERHistory entry with all required fields
      return {
        id: history.id,
        patent_id: history.patent_id || standardizedPatent.id || '',
        tracking_id: history.tracking_id || standardizedPatent.tracking_id || '',
        fer_number: history.fer_number || 1,
        date: history.date || (history.created_at ? new Date(history.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]),
        action: history.action || "FER History Entry",
        fer_drafter_assgn: history.fer_drafter_assgn || null,
        fer_drafter_deadline: history.fer_drafter_deadline || null,
        fer_filer_assgn: history.fer_filer_assgn || null,
        fer_filer_deadline: history.fer_filer_deadline || null,
        notes: history.notes || null,
        created_at: history.created_at || null,
        updated_at: history.updated_at || null
      } as FERHistory;
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
