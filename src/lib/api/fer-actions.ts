
import { supabase } from '@/integrations/supabase/client';
import { FEREntry } from '../types';

// Function for completing a FER draft by a drafter
export const completeFERDrafterTask = async (ferEntry: FEREntry, employeeName: string) => {
  try {
    const { error } = await supabase
      .from('fer_entries')
      .update({
        fer_drafter_status: 1,
        fer_review_draft_status: 1 // Set to under review
      })
      .eq('id', ferEntry.id);

    if (error) {
      console.error('Error completing FER draft:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error completing FER draft:', error);
    return false;
  }
};

// Function for completing a FER filing by a filer
export const completeFERFilerTask = async (ferEntry: FEREntry, employeeName: string) => {
  try {
    const { error } = await supabase
      .from('fer_entries')
      .update({
        fer_filing_status: 1,
        fer_review_file_status: 1 // Set to under review
      })
      .eq('id', ferEntry.id);

    if (error) {
      console.error('Error completing FER filing:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error completing FER filing:', error);
    return false;
  }
};

// Function for admin to approve FER draft or filing
export const approveFERReview = async (ferEntry: FEREntry, type: 'draft' | 'file') => {
  try {
    const updates: Record<string, any> = {};
    
    if (type === 'draft') {
      updates.fer_review_draft_status = 0; // Approved
      
      // Check if this completes the entire FER process
      if (ferEntry.fer_filing_status === 1 && ferEntry.fer_review_file_status === 0) {
        updates.fer_completion_status = 1;
      }
    } else {
      updates.fer_review_file_status = 0; // Approved
      
      // Check if this completes the entire FER process
      if (ferEntry.fer_drafter_status === 1 && ferEntry.fer_review_draft_status === 0) {
        updates.fer_completion_status = 1;
      }
    }
    
    const { error } = await supabase
      .from('fer_entries')
      .update(updates)
      .eq('id', ferEntry.id);

    if (error) {
      console.error(`Error approving FER ${type}:`, error);
      return false;
    }

    // Update parent patent if needed
    if (updates.fer_completion_status === 1) {
      // Get patent to check if all FERs are now complete
      const { data: patent } = await supabase
        .from('patents')
        .select('id, fer_entries(*)')
        .eq('id', ferEntry.patent_id)
        .single();
      
      if (patent && patent.fer_entries) {
        const allFERsComplete = patent.fer_entries.every((fer: any) => fer.fer_completion_status === 1);
        
        if (allFERsComplete) {
          await supabase
            .from('patents')
            .update({
              fer_completion_status: 1
            })
            .eq('id', ferEntry.patent_id);
        }
      }
    }

    return true;
  } catch (error) {
    console.error(`Error approving FER ${type}:`, error);
    return false;
  }
};
