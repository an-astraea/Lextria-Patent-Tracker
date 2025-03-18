
import { supabase } from "@/integrations/supabase/client";
import { normalizePatents } from "../utils/type-converters";
import { Patent } from "../types";
import { fetchPatents, fetchPatentById } from "./patents";
import { fetchEmployees } from "./employees";

/**
 * Fetches patents pending review for admin
 * @returns Array of patents with pending reviews
 */
export const fetchPendingReviews = async () => {
  try {
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
  
    // Normalize the patents data
    return data ? normalizePatents(data) : [];
  } catch (error) {
    console.error('Error fetching pending reviews:', error);
    return [];
  }
};

/**
 * Approves a patent review
 * @param patent - Patent object
 * @param reviewType - Type of review to approve
 * @returns Object with success status and message
 */
export const approvePatentReview = async (patent: Patent, reviewType: string): Promise<{ success: boolean; message: string }> => {
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
            const { error } = await supabase
              .from('fer_entries')
              .update({ fer_review_draft_status: 0 })
              .eq('id', ferEntry.id);
              
            if (error) {
              console.error('Error approving FER review:', error);
              return { success: false, message: error.message };
            }
            return { success: true, message: 'FER review approved successfully' };
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
              .update({ fer_review_file_status: 0 })
              .eq('id', ferEntry.id);
              
            if (error) {
              console.error('Error approving FER review:', error);
              return { success: false, message: error.message };
            }
            return { success: true, message: 'FER review approved successfully' };
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
        return { success: false, message: error.message };
      }
    }
    
    return { success: true, message: 'Review approved successfully' };
  } catch (error: any) {
    console.error('Error approving review:', error);
    return { success: false, message: error.message || 'An unexpected error occurred' };
  }
};

/**
 * Rejects a patent review
 * @param patent - Patent object
 * @param reviewType - Type of review to reject
 * @returns Object with success status and message
 */
export const rejectPatentReview = async (patent: Patent, reviewType: string): Promise<{ success: boolean; message: string }> => {
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
              return { success: false, message: error.message };
            }
            return { success: true, message: 'FER review rejected successfully' };
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
              return { success: false, message: error.message };
            }
            return { success: true, message: 'FER review rejected successfully' };
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
        return { success: false, message: error.message };
      }
    }
    
    return { success: true, message: 'Review rejected successfully' };
  } catch (error: any) {
    console.error('Error rejecting review:', error);
    return { success: false, message: error.message || 'An unexpected error occurred' };
  }
};

/**
 * Fetches both patents and employees in a single function call
 * @returns Object containing patents and employees arrays
 */
export const fetchPatentsAndEmployees = async () => {
  try {
    // Make both requests in parallel using Promise.all
    const [patents, employees] = await Promise.all([
      fetchPatents(),
      fetchEmployees()
    ]);
    
    return { patents, employees };
  } catch (error) {
    console.error('Error fetching patents and employees:', error);
    return { patents: [], employees: [] };
  }
};
