
import { supabase } from "@/integrations/supabase/client";
import { Patent, FEREntry } from "../types";
import { toast } from "sonner";

// Fetch patents pending review (drafts or filings ready for admin approval)
export const fetchPendingReviews = async (): Promise<Patent[]> => {
  try {
    const { data, error } = await supabase
      .from("patents")
      .select(`
        *,
        inventors(*),
        fer_history(*)
      `)
      .or('ps_review_draft_status.eq.1,ps_review_file_status.eq.1,cs_review_draft_status.eq.1,cs_review_file_status.eq.1,fer_review_draft_status.eq.1,fer_review_file_status.eq.1');

    if (error) {
      throw error;
    }
    
    // Fetch FER entries separately for each patent
    for (const patent of (data || [])) {
      const { data: ferEntries, error: ferError } = await supabase
        .from("fer_entries")
        .select("*")
        .eq("patent_id", patent.id);
        
      if (!ferError && ferEntries) {
        patent.fer_entries = ferEntries;
      }
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching pending reviews:", error);
    toast.error("Failed to load reviews");
    return [];
  }
};

// Approve a draft review
export const approveDraftReview = async (patent: Patent, stage: 'ps' | 'cs' | 'fer'): Promise<boolean> => {
  try {
    const updates: Record<string, any> = {};
    
    if (stage === 'ps') {
      updates.ps_review_draft_status = 0; // Mark as reviewed (no longer pending)
    } else if (stage === 'cs') {
      updates.cs_review_draft_status = 0;
    } else if (stage === 'fer') {
      updates.fer_review_draft_status = 0;
    } else {
      toast.error("Invalid review stage");
      return false;
    }
    
    const { error } = await supabase
      .from("patents")
      .update(updates)
      .eq("id", patent.id);
      
    if (error) {
      throw error;
    }
    
    // Update completion status for PS or CS if both drafting and filing are complete
    if (stage === 'ps' && patent.ps_filing_status === 1) {
      await updateCompletionStatus(patent.id, 'ps');
    } else if (stage === 'cs' && patent.cs_filing_status === 1) {
      await updateCompletionStatus(patent.id, 'cs');
    }
    
    return true;
  } catch (error) {
    console.error("Error approving draft review:", error);
    toast.error("Failed to approve review");
    return false;
  }
};

// Approve a filing review
export const approveFilingReview = async (patent: Patent, stage: 'ps' | 'cs' | 'fer'): Promise<boolean> => {
  try {
    const updates: Record<string, any> = {};
    
    if (stage === 'ps') {
      updates.ps_review_file_status = 0; // Mark as reviewed (no longer pending)
    } else if (stage === 'cs') {
      updates.cs_review_file_status = 0;
    } else if (stage === 'fer') {
      updates.fer_review_file_status = 0;
    } else {
      toast.error("Invalid review stage");
      return false;
    }
    
    const { error } = await supabase
      .from("patents")
      .update(updates)
      .eq("id", patent.id);
      
    if (error) {
      throw error;
    }
    
    // Update completion status for PS or CS if both drafting and filing are approved
    if (stage === 'ps' && patent.ps_drafting_status === 1) {
      await updateCompletionStatus(patent.id, 'ps');
    } else if (stage === 'cs' && patent.cs_drafting_status === 1) {
      await updateCompletionStatus(patent.id, 'cs');
    }
    
    return true;
  } catch (error) {
    console.error("Error approving filing review:", error);
    toast.error("Failed to approve review");
    return false;
  }
};

// Approve a FER entry draft review
export const approveFERDraftReview = async (ferEntry: FEREntry): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("fer_entries")
      .update({
        fer_review_draft_status: 0 // Mark as reviewed
      })
      .eq("id", ferEntry.id);
      
    if (error) {
      throw error;
    }
    
    // Update FER entry completion status if both drafting and filing are complete
    if (ferEntry.fer_filing_status === 1) {
      await updateFEREntryCompletionStatus(ferEntry.id);
    }
    
    return true;
  } catch (error) {
    console.error("Error approving FER draft review:", error);
    toast.error("Failed to approve FER review");
    return false;
  }
};

// Approve a FER entry filing review
export const approveFERFilingReview = async (ferEntry: FEREntry): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("fer_entries")
      .update({
        fer_review_file_status: 0 // Mark as reviewed
      })
      .eq("id", ferEntry.id);
      
    if (error) {
      throw error;
    }
    
    // Update FER entry completion status if both drafting and filing are complete
    if (ferEntry.fer_drafter_status === 1) {
      await updateFEREntryCompletionStatus(ferEntry.id);
    }
    
    return true;
  } catch (error) {
    console.error("Error approving FER filing review:", error);
    toast.error("Failed to approve FER review");
    return false;
  }
};

// Helper function to update completion status for a patent stage
const updateCompletionStatus = async (patentId: string, stage: 'ps' | 'cs'): Promise<void> => {
  try {
    const updates: Record<string, any> = {};
    
    if (stage === 'ps') {
      updates.ps_completion_status = 1;
    } else if (stage === 'cs') {
      updates.cs_completion_status = 1;
    }
    
    const { error } = await supabase
      .from("patents")
      .update(updates)
      .eq("id", patentId);
      
    if (error) {
      throw error;
    }
  } catch (error) {
    console.error(`Error updating ${stage} completion status:`, error);
    toast.error(`Failed to update ${stage.toUpperCase()} completion status`);
  }
};

// Helper function to update completion status for a FER entry
const updateFEREntryCompletionStatus = async (ferEntryId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from("fer_entries")
      .update({
        fer_completion_status: 1
      })
      .eq("id", ferEntryId);
      
    if (error) {
      throw error;
    }
  } catch (error) {
    console.error("Error updating FER entry completion status:", error);
    toast.error("Failed to update FER completion status");
  }
};
