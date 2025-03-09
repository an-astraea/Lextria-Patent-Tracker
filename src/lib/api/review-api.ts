import { createClient } from '@supabase/supabase-js';
import { Database } from '../database.types';
import { Patent, FEREntry } from '../types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient<Database>(supabaseUrl, supabaseKey);

// Function to fetch pending reviews for admin
export const fetchPendingReviews = async () => {
  const { data, error } = await supabase
    .from('patents')
    .select(`
      *,
      inventors (*),
      fer_entries (*)
    `)
    .or('ps_review_draft_status.eq.1,ps_review_file_status.eq.1,cs_review_draft_status.eq.1,cs_review_file_status.eq.1,fer_review_draft_status.eq.1,fer_review_file_status.eq.1');

  if (error) {
    console.error('Error fetching pending reviews:', error);
    return [];
  }

  return data || [];
};

// Function to approve a patent review
export const approvePatentReview = async (patent: Patent, reviewType: string) => {
  try {
    const updateData: any = {};
    
    // Set the appropriate review status field to 0 (marking it as approved)
    switch (reviewType) {
      case 'ps_draft':
        updateData.ps_review_draft_status = 0;
        break;
      case 'ps_file':
        updateData.ps_review_file_status = 0;
        break;
      case 'cs_draft':
        updateData.cs_review_draft_status = 0;
        break;
      case 'cs_file':
        updateData.cs_review_file_status = 0;
        break;
      case 'fer_draft':
        // For FER drafts, we need to find the specific FER entry
        if (patent.fer_entries && patent.fer_entries.length > 0) {
          const ferEntry = patent.fer_entries.find(fer => fer.fer_review_draft_status === 1);
          if (ferEntry) {
            return await approveFERReview(ferEntry, 'draft');
          }
        }
        break;
      case 'fer_file':
        // For FER filings, we need to find the specific FER entry
        if (patent.fer_entries && patent.fer_entries.length > 0) {
          const ferEntry = patent.fer_entries.find(fer => fer.fer_review_file_status === 1);
          if (ferEntry) {
            return await approveFERReview(ferEntry, 'file');
          }
        }
        break;
    }
    
    // Only update if we have fields to update (not FER)
    if (Object.keys(updateData).length > 0) {
      const { error } = await supabase
        .from('patents')
        .update(updateData)
        .eq('id', patent.id);
      
      if (error) {
        console.error('Error approving review:', error);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error approving review:', error);
    return false;
  }
};

// Function to reject a patent review
export const rejectPatentReview = async (patent: Patent, reviewType: string) => {
  try {
    const updateData: any = {};
    
    // Set the appropriate status fields based on which review is being rejected
    switch (reviewType) {
      case 'ps_draft':
        updateData.ps_review_draft_status = 0;
        updateData.ps_drafting_status = 0;
        break;
      case 'ps_file':
        updateData.ps_review_file_status = 0;
        updateData.ps_filing_status = 0;
        break;
      case 'cs_draft':
        updateData.cs_review_draft_status = 0;
        updateData.cs_drafting_status = 0;
        break;
      case 'cs_file':
        updateData.cs_review_file_status = 0;
        updateData.cs_filing_status = 0;
        break;
      case 'fer_draft':
        // For FER drafts, we need to find the specific FER entry
        if (patent.fer_entries && patent.fer_entries.length > 0) {
          const ferEntry = patent.fer_entries.find(fer => fer.fer_review_draft_status === 1);
          if (ferEntry) {
            const { error } = await supabase
              .from('fer_entries')
              .update({
                fer_review_draft_status: 0,
                fer_drafter_status: 0
              })
              .eq('id', ferEntry.id);
            
            if (error) {
              console.error('Error rejecting FER review:', error);
              return false;
            }
            return true;
          }
        }
        break;
      case 'fer_file':
        // For FER filings, we need to find the specific FER entry
        if (patent.fer_entries && patent.fer_entries.length > 0) {
          const ferEntry = patent.fer_entries.find(fer => fer.fer_review_file_status === 1);
          if (ferEntry) {
            const { error } = await supabase
              .from('fer_entries')
              .update({
                fer_review_file_status: 0,
                fer_filing_status: 0
              })
              .eq('id', ferEntry.id);
            
            if (error) {
              console.error('Error rejecting FER review:', error);
              return false;
            }
            return true;
          }
        }
        break;
    }
    
    // Only update if we have fields to update (not FER)
    if (Object.keys(updateData).length > 0) {
      const { error } = await supabase
        .from('patents')
        .update(updateData)
        .eq('id', patent.id);
      
      if (error) {
        console.error('Error rejecting review:', error);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error rejecting review:', error);
    return false;
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
