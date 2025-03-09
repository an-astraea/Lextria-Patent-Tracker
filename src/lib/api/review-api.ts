
import { supabase } from './client';
import { Patent } from '../types';
import { approveFERReview } from './fer-api';

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
