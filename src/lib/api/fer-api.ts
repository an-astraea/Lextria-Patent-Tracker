
import { supabase } from './client';
import { FEREntry } from '../types';
import { createTimelineEvent } from './timeline-api';

// Function to update FER entry
export const updateFEREntry = async (ferEntryId: string, ferData: Partial<FEREntry>) => {
  const { data, error } = await supabase
    .from('fer_entries')
    .update(ferData)
    .eq('id', ferEntryId)
    .select();
  
  if (error) {
    console.error('Error updating FER entry:', error);
    return false;
  }
  
  return true;
};

// Function to delete FER entry
export const deleteFEREntry = async (ferEntryId: string) => {
  const { error } = await supabase
    .from('fer_entries')
    .delete()
    .eq('id', ferEntryId);
  
  if (error) {
    console.error('Error deleting FER entry:', error);
    return false;
  }
  
  return true;
};

// Function to complete FER drafter task
export const completeFERDrafterTask = async (ferEntry: FEREntry, userName: string) => {
  try {
    // Update the FER entry
    const { error } = await supabase
      .from('fer_entries')
      .update({
        fer_drafter_status: 1, // Mark as completed
        fer_review_draft_status: 1 // Mark as under review
      })
      .eq('id', ferEntry.id);
    
    if (error) {
      console.error('Error completing FER drafter task:', error);
      return false;
    }

    // Create a timeline event
    await createTimelineEvent(ferEntry.patent_id, 'FER Drafting Completed', `FER drafting completed by ${userName}`, 1, userName, ferEntry.fer_drafter_deadline);
    
    return true;
  } catch (error) {
    console.error('Error completing FER drafter task:', error);
    return false;
  }
};

// Function to complete FER filer task
export const completeFERFilerTask = async (ferEntry: FEREntry, userName: string) => {
  try {
    // Update the FER entry
    const { error } = await supabase
      .from('fer_entries')
      .update({
        fer_filing_status: 1, // Mark as completed
        fer_review_file_status: 1 // Mark as under review
      })
      .eq('id', ferEntry.id);
    
    if (error) {
      console.error('Error completing FER filer task:', error);
      return false;
    }

    // Create a timeline event
    await createTimelineEvent(ferEntry.patent_id, 'FER Filing Completed', `FER filing completed by ${userName}`, 1, userName, ferEntry.fer_filer_deadline);
    
    return true;
  } catch (error) {
    console.error('Error completing FER filer task:', error);
    return false;
  }
};

// Function to create a new FER entry
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
      return null;
    }
    
    // Also update the patent to reflect there's a new FER entry (should set fer_completion_status to 0)
    await supabase
      .from('patents')
      .update({
        fer_status: 1,
        fer_completion_status: 0
      })
      .eq('id', patentId);
    
    return data[0];
  } catch (error) {
    console.error('Error creating FER entry:', error);
    return null;
  }
};

// Approve a FER review
export const approveFERReview = async (ferEntry: FEREntry, reviewType: 'draft' | 'file') => {
  try {
    const updateData: any = {};
    
    if (reviewType === 'draft') {
      updateData.fer_review_draft_status = 0; // Clear the review status
    } else {
      updateData.fer_review_file_status = 0; // Clear the review status
    }
    
    const { error } = await supabase
      .from('fer_entries')
      .update(updateData)
      .eq('id', ferEntry.id);
    
    if (error) {
      console.error(`Error approving FER ${reviewType}:`, error);
      return false;
    }
    
    // After approving the last FER filing, check if all FERs are complete to update the patent status
    if (reviewType === 'file') {
      await updatePatentFERCompletionStatus(ferEntry.patent_id);
    }
    
    return true;
  } catch (error) {
    console.error(`Error approving FER ${reviewType}:`, error);
    return false;
  }
};

// New function to update the patent's FER completion status based on all FER entries
export const updatePatentFERCompletionStatus = async (patentId: string) => {
  try {
    // Fetch all FER entries for this patent
    const { data: ferEntries, error } = await supabase
      .from('fer_entries')
      .select('*')
      .eq('patent_id', patentId);
    
    if (error) {
      console.error('Error fetching FER entries:', error);
      return false;
    }
    
    // Check if all FER entries are complete
    const allFERsComplete = ferEntries.length > 0 && ferEntries.every(
      fer => fer.fer_drafter_status === 1 && fer.fer_filing_status === 1 && 
             fer.fer_review_draft_status === 0 && fer.fer_review_file_status === 0
    );
    
    // Update the patent's FER completion status
    const { error: updateError } = await supabase
      .from('patents')
      .update({
        fer_completion_status: allFERsComplete ? 1 : 0
      })
      .eq('id', patentId);
    
    if (updateError) {
      console.error('Error updating patent FER completion status:', updateError);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error updating patent FER completion status:', error);
    return false;
  }
};
