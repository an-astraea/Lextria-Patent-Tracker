
import { supabase } from "@/integrations/supabase/client";
import { Patent, FEREntry } from "../types";

export const fetchPendingReviews = async () => {
  try {
    const { data, error } = await supabase
      .from('patents')
      .select('*, fer_entries(*)')
      .or('ps_review_draft_status.eq.1,ps_review_file_status.eq.1,cs_review_draft_status.eq.1,cs_review_file_status.eq.1');
    
    if (error) {
      console.error("Error fetching pending reviews:", error);
      return { error: error.message, patents: [] };
    }
    
    // Filter to include FER entries that need review
    const patentsWithFERReviews = data.filter(patent => 
      patent.fer_entries && 
      patent.fer_entries.some((entry: any) => 
        entry.fer_review_draft_status === 1 || entry.fer_review_file_status === 1
      )
    );
    
    // Combine regular patents with FER review patents, deduplicating by ID
    const allPatents = [...data, ...patentsWithFERReviews.filter(p => 
      !data.some(existingP => existingP.id === p.id)
    )];
    
    return allPatents;
  } catch (error: any) {
    console.error("Exception fetching pending reviews:", error);
    return { error: error.message, patents: [] };
  }
};

export const approvePatentReview = async (patent: Patent, reviewType: string) => {
  try {
    let updateData: any = {};
    
    switch(reviewType) {
      case 'ps_draft':
        updateData = { 
          ps_review_draft_status: 0,
          ps_drafting_status: 1
        };
        break;
      case 'ps_file':
        updateData = { 
          ps_review_file_status: 0,
          ps_filing_status: 1,
          ps_completion_status: 1
        };
        break;
      case 'cs_draft':
        updateData = { 
          cs_review_draft_status: 0,
          cs_drafting_status: 1
        };
        break;
      case 'cs_file':
        updateData = { 
          cs_review_file_status: 0,
          cs_filing_status: 1,
          cs_completion_status: 1
        };
        break;
      case 'fer_draft':
        // FER draft approval is handled separately for a specific FER entry
        if (patent.fer_entries && patent.fer_entries.length > 0) {
          const ferEntry = patent.fer_entries.find(entry => entry.fer_review_draft_status === 1);
          if (ferEntry) {
            await supabase
              .from('fer_entries')
              .update({ 
                fer_review_draft_status: 0,
                fer_drafter_status: 1
              })
              .eq('id', ferEntry.id);
          }
        }
        return { success: true };
      case 'fer_file':
        // FER file approval is handled separately for a specific FER entry
        if (patent.fer_entries && patent.fer_entries.length > 0) {
          const ferEntry = patent.fer_entries.find(entry => entry.fer_review_file_status === 1);
          if (ferEntry) {
            await supabase
              .from('fer_entries')
              .update({ 
                fer_review_file_status: 0,
                fer_filing_status: 1,
                fer_completion_status: 1
              })
              .eq('id', ferEntry.id);
            
            // Also check if this was the last FER entry to be completed
            await updateFERCompletionStatus(patent.id);
          }
        }
        return { success: true };
    }
    
    if (Object.keys(updateData).length > 0) {
      const { error } = await supabase
        .from('patents')
        .update(updateData)
        .eq('id', patent.id);
      
      if (error) {
        console.error("Error approving review:", error);
        return { error: error.message, success: false };
      }
    }
    
    return { success: true };
  } catch (error: any) {
    console.error("Exception approving review:", error);
    return { error: error.message, success: false };
  }
};

export const rejectPatentReview = async (patent: Patent, reviewType: string) => {
  try {
    let updateData: any = {};
    
    switch(reviewType) {
      case 'ps_draft':
        updateData = { 
          ps_review_draft_status: 0,
          ps_drafting_status: 0
        };
        break;
      case 'ps_file':
        updateData = { 
          ps_review_file_status: 0,
          ps_filing_status: 0
        };
        break;
      case 'cs_draft':
        updateData = { 
          cs_review_draft_status: 0,
          cs_drafting_status: 0
        };
        break;
      case 'cs_file':
        updateData = { 
          cs_review_file_status: 0,
          cs_filing_status: 0
        };
        break;
      case 'fer_draft':
        // FER draft rejection is handled separately for a specific FER entry
        if (patent.fer_entries && patent.fer_entries.length > 0) {
          const ferEntry = patent.fer_entries.find(entry => entry.fer_review_draft_status === 1);
          if (ferEntry) {
            await supabase
              .from('fer_entries')
              .update({ 
                fer_review_draft_status: 0,
                fer_drafter_status: 0
              })
              .eq('id', ferEntry.id);
          }
        }
        return { success: true };
      case 'fer_file':
        // FER file rejection is handled separately for a specific FER entry
        if (patent.fer_entries && patent.fer_entries.length > 0) {
          const ferEntry = patent.fer_entries.find(entry => entry.fer_review_file_status === 1);
          if (ferEntry) {
            await supabase
              .from('fer_entries')
              .update({ 
                fer_review_file_status: 0,
                fer_filing_status: 0
              })
              .eq('id', ferEntry.id);
          }
        }
        return { success: true };
    }
    
    if (Object.keys(updateData).length > 0) {
      const { error } = await supabase
        .from('patents')
        .update(updateData)
        .eq('id', patent.id);
      
      if (error) {
        console.error("Error rejecting review:", error);
        return { error: error.message, success: false };
      }
    }
    
    return { success: true };
  } catch (error: any) {
    console.error("Exception rejecting review:", error);
    return { error: error.message, success: false };
  }
};

export const approveFERReview = async (ferEntry: FEREntry, reviewType: string) => {
  try {
    let updateData: any = {};
    
    if (reviewType === 'draft') {
      updateData = { 
        fer_review_draft_status: 0
      };
    } else if (reviewType === 'file') {
      updateData = { 
        fer_review_file_status: 0,
        fer_completion_status: 1
      };
    }
    
    const { error } = await supabase
      .from('fer_entries')
      .update(updateData)
      .eq('id', ferEntry.id);
    
    if (error) {
      console.error("Error approving FER review:", error);
      return { error: error.message, success: false };
    }
    
    // Update the patent's FER completion status
    if (reviewType === 'file') {
      await updateFERCompletionStatus(ferEntry.patent_id);
    }
    
    return { success: true };
  } catch (error: any) {
    console.error("Exception approving FER review:", error);
    return { error: error.message, success: false };
  }
};

// Helper function to update FER completion status
const updateFERCompletionStatus = async (patentId: string) => {
  try {
    // Get all FER entries for the patent
    const { data: ferEntries, error: ferError } = await supabase
      .from('fer_entries')
      .select('*')
      .eq('patent_id', patentId);
    
    if (ferError) {
      console.error("Error fetching FER entries:", ferError);
      return false;
    }
    
    // Check if all FER entries are completed
    const allCompleted = ferEntries.every(entry => entry.fer_completion_status === 1);
    
    if (allCompleted) {
      // Update the patent's fer_completion_status
      const { error: updateError } = await supabase
        .from('patents')
        .update({ fer_completion_status: 1 })
        .eq('id', patentId);
      
      if (updateError) {
        console.error("Error updating patent FER completion status:", updateError);
        return false;
      }
    }
    
    return true;
  } catch (error: any) {
    console.error("Exception updating FER completion status:", error);
    return false;
  }
};
