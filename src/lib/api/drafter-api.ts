
import { supabase } from "@/integrations/supabase/client";
import { Patent } from "../types";
import { toast } from "sonner";

// Fetch active drafting tasks assigned to a drafter
export const fetchDrafterAssignments = async (drafterName: string): Promise<Patent[]> => {
  try {
    const { data, error } = await supabase
      .from("patents")
      .select(`
        *,
        inventors(*),
        fer_history(*)
      `)
      .or(`ps_drafter_assgn.eq.${drafterName},cs_drafter_assgn.eq.${drafterName},fer_drafter_assgn.eq.${drafterName}`)
      .or('ps_drafting_status.eq.0,cs_drafting_status.eq.0,fer_drafter_status.eq.0');

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
    console.error("Error fetching drafter assignments:", error);
    toast.error("Failed to load assignments");
    return [];
  }
};

// Complete a drafting task
export const completeDrafterTask = async (patent: Patent, drafterName: string): Promise<boolean> => {
  try {
    const updates: Record<string, any> = {};
    
    // Determine which status to update based on which role is assigned to this drafter
    if (patent.ps_drafter_assgn === drafterName && patent.ps_drafting_status === 0) {
      updates.ps_drafting_status = 1;
      updates.ps_review_draft_status = 1; // Mark for review
    } else if (patent.cs_drafter_assgn === drafterName && patent.cs_drafting_status === 0) {
      updates.cs_drafting_status = 1;
      updates.cs_review_draft_status = 1; // Mark for review
    } else if (patent.fer_drafter_assgn === drafterName && patent.fer_drafter_status === 0) {
      updates.fer_drafter_status = 1;
      updates.fer_review_draft_status = 1; // Mark for review
    } else {
      // No matching assignment found
      toast.error("No active drafting task found for this patent");
      return false;
    }
    
    const { error } = await supabase
      .from("patents")
      .update(updates)
      .eq("id", patent.id);
      
    if (error) {
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error("Error completing drafting task:", error);
    toast.error("Failed to complete task");
    return false;
  }
};

// Fetch completed drafting tasks
export const fetchDrafterCompletedAssignments = async (drafterName: string): Promise<Patent[]> => {
  try {
    const { data, error } = await supabase
      .from("patents")
      .select(`
        *,
        inventors(*),
        fer_history(*)
      `)
      .or(`ps_drafter_assgn.eq.${drafterName},cs_drafter_assgn.eq.${drafterName},fer_drafter_assgn.eq.${drafterName}`)
      .or('ps_drafting_status.eq.1,cs_drafting_status.eq.1,fer_drafter_status.eq.1');
      
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
    console.error("Error fetching completed drafter assignments:", error);
    toast.error("Failed to load completed assignments");
    return [];
  }
};
