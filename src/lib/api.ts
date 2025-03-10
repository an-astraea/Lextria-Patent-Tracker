// If this file contains implementation of approval functions, add the new ones below
// Otherwise add these functions to the appropriate API file

/**
 * Approve a FER draft review
 * @param ferId - ID of the FER entry
 * @returns True if successfully approved
 */
export const approveFERDraft = async (ferId: string): Promise<boolean> => {
  try {
    // Find the FER entry
    const { data: ferEntry, error: ferError } = await supabase
      .from('fer_entries')
      .select('*')
      .eq('id', ferId)
      .single();
      
    if (ferError || !ferEntry) {
      console.error('Error fetching FER entry:', ferError);
      return false;
    }
    
    // Update the FER entry to approve the draft
    const { error: updateError } = await supabase
      .from('fer_entries')
      .update({
        fer_review_draft_status: 0
      })
      .eq('id', ferId);
    
    if (updateError) {
      console.error('Error approving FER draft:', updateError);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error approving FER draft:', error);
    return false;
  }
};

/**
 * Approve a FER filing review
 * @param ferId - ID of the FER entry
 * @returns True if successfully approved
 */
export const approveFERFiling = async (ferId: string): Promise<boolean> => {
  try {
    // Find the FER entry
    const { data: ferEntry, error: ferError } = await supabase
      .from('fer_entries')
      .select('*')
      .eq('id', ferId)
      .single();
      
    if (ferError || !ferEntry) {
      console.error('Error fetching FER entry:', ferError);
      return false;
    }
    
    // Update the FER entry status
    const { error: updateError } = await supabase
      .from('fer_entries')
      .update({
        fer_review_file_status: 0
      })
      .eq('id', ferId);
    
    if (updateError) {
      console.error('Error approving FER filing:', updateError);
      return false;
    }
    
    // Check if both draft and file are completed to update completion status
    if (ferEntry.fer_drafter_status === 1 && ferEntry.fer_filing_status === 1) {
      const { error: completionError } = await supabase
        .from('fer_entries')
        .update({
          fer_completion_status: 1
        })
        .eq('id', ferId);
      
      if (completionError) {
        console.error('Error updating FER completion status:', completionError);
        // Still return true as the main approval was successful
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error approving FER filing:', error);
    return false;
  }
};
