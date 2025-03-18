
import { supabase } from "@/integrations/supabase/client";
import { FEREntry } from "@/lib/types";

/**
 * Updates an existing FER entry
 * @param ferEntryId - ID of the FER entry to update
 * @param ferData - Data to update in the FER entry
 * @returns Object with success status and message
 */
export const updateFEREntry = async (ferEntryId: string, ferData: Partial<FEREntry>) => {
  try {
    const { data, error } = await supabase
      .from('fer_entries')
      .update(ferData)
      .eq('id', ferEntryId)
      .select();
    
    if (error) {
      console.error('Error updating FER entry:', error);
      return { success: false, message: error.message };
    }
    
    return { success: true, message: 'FER entry updated successfully' };
  } catch (error: any) {
    console.error('Error updating FER entry:', error);
    return { success: false, message: error.message || 'An unexpected error occurred' };
  }
};

/**
 * Creates a new FER entry for a patent
 * @param patentId - ID of the patent
 * @param ferNumber - FER number identifier
 * @param ferDrafter - Optional drafter assigned to the FER
 * @param ferDrafterDeadline - Optional deadline for the drafter
 * @param ferFiler - Optional filer assigned to the FER
 * @param ferFilerDeadline - Optional deadline for the filer
 * @param ferDate - Optional FER date
 * @returns Object with success status, message, and created data
 */
export const createFEREntry = async (
  patentId: string, 
  ferNumber: number, 
  ferDrafter?: string, 
  ferDrafterDeadline?: string,
  ferFiler?: string,
  ferFilerDeadline?: string,
  ferDate?: string
) => {
  try {
    // Create the new FER entry
    const { data, error } = await supabase
      .from('fer_entries')
      .insert({
        patent_id: patentId,
        fer_number: ferNumber,
        fer_drafter_assgn: ferDrafter || null,
        fer_drafter_deadline: ferDrafterDeadline || null,
        fer_drafter_status: 0,
        fer_filer_assgn: ferFiler || null,
        fer_filer_deadline: ferFilerDeadline || null,
        fer_filing_status: 0,
        fer_review_draft_status: 0,
        fer_review_file_status: 0,
        fer_completion_status: 0,
        fer_date: ferDate || null
      })
      .select();
    
    if (error) {
      console.error('Error creating FER entry:', error);
      return { success: false, message: error.message, data: null };
    }
    
    // Also update the patent to reflect there's a new FER entry
    await supabase
      .from('patents')
      .update({
        fer_status: 1,
        fer_completion_status: 0
      })
      .eq('id', patentId);
    
    return { success: true, message: 'FER entry created successfully', data: data?.[0] || null };
  } catch (error: any) {
    console.error('Error creating FER entry:', error);
    return { success: false, message: error.message || 'An unexpected error occurred', data: null };
  }
};

/**
 * Deletes an FER entry
 * @param ferEntryId - ID of the FER entry to delete
 * @returns Object with success status and message
 */
export const deleteFEREntry = async (ferEntryId: string) => {
  try {
    const { error } = await supabase
      .from('fer_entries')
      .delete()
      .eq('id', ferEntryId);
    
    if (error) {
      console.error('Error deleting FER entry:', error);
      return { success: false, message: error.message };
    }
    
    return { success: true, message: 'FER entry deleted successfully' };
  } catch (error: any) {
    console.error('Error deleting FER entry:', error);
    return { success: false, message: error.message || 'An unexpected error occurred' };
  }
};
