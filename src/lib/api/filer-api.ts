
import { supabase } from "@/integrations/supabase/client";
import { Patent } from "@/lib/types";
import { toast } from "sonner";

export const fetchFilerAssignments = async (filerName: string): Promise<Patent[]> => {
  try {
    // Get patents where filer is assigned with status 0 (pending)
    const { data, error } = await supabase
      .from("patents")
      .select(`
        *,
        inventors(*),
        fer_history(*)
      `)
      .or(`ps_filer_assgn.eq.${filerName},cs_filer_assgn.eq.${filerName},fer_filer_assgn.eq.${filerName}`)
      .or('ps_filing_status.eq.0,cs_filing_status.eq.0,fer_filing_status.eq.0');

    if (error) {
      throw error;
    }

    // Filter for proper queue order and dependencies with approval requirements
    return (data || []).filter(patent => {
      // If assigned to PS filing and it's not completed
      if (patent.ps_filer_assgn === filerName && patent.ps_filing_status === 0) {
        // PS drafting must be completed and approved
        return patent.ps_drafting_status === 1 && patent.ps_review_draft_status === 0;
      }
      
      // If assigned to CS filing
      if (patent.cs_filer_assgn === filerName && patent.cs_filing_status === 0) {
        // Case 1: Patent starts from CS (no PS filer assigned)
        if (!patent.ps_filer_assgn) {
          // CS drafting must be completed and approved
          return patent.cs_drafting_status === 1 && patent.cs_review_draft_status === 0;
        }
        
        // Case 2: Normal flow - PS must be completed
        const psCompleted = patent.ps_completion_status === 1;
        // CS drafting must be completed and approved
        const csDraftApproved = patent.cs_drafting_status === 1 && patent.cs_review_draft_status === 0;
        return psCompleted && csDraftApproved;
      }
      
      // If assigned to FER filing
      if (patent.fer_filer_assgn === filerName && patent.fer_filing_status === 0 && patent.fer_status === 1) {
        // Case 1: Patent starts from FER (no PS/CS assignees)
        if (!patent.ps_filer_assgn && !patent.cs_filer_assgn) {
          // FER drafting must be completed and approved
          return patent.fer_drafter_status === 1 && patent.fer_review_draft_status === 0;
        }
        
        // Case 2: Normal flow - Previous stages must be completed if they were assigned
        const psCompleted = !patent.ps_filer_assgn || patent.ps_completion_status === 1;
        const csCompleted = !patent.cs_filer_assgn || patent.cs_completion_status === 1;
        // FER drafting must be completed and approved
        const ferDraftApproved = patent.fer_drafter_status === 1 && patent.fer_review_draft_status === 0;
        return psCompleted && csCompleted && ferDraftApproved;
      }
      
      return false;
    });
  } catch (error) {
    console.error("Error fetching filer assignments:", error);
    toast.error("Failed to load filing assignments");
    return [];
  }
};

export const fetchFilerCompletedAssignments = async (filerName: string): Promise<Patent[]> => {
  try {
    const { data, error } = await supabase
      .from("patents")
      .select(`
        *,
        inventors(*),
        fer_history(*)
      `)
      .or(`ps_filer_assgn.eq.${filerName},cs_filer_assgn.eq.${filerName},fer_filer_assgn.eq.${filerName}`)
      .or('ps_filing_status.eq.1,cs_filing_status.eq.1,fer_filing_status.eq.1');

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching completed filing assignments:", error);
    toast.error("Failed to load completed assignments");
    return [];
  }
};

export const completeFilerTask = async (
  patent: Patent,
  filerName: string,
  formData?: Record<string, boolean>
): Promise<boolean> => {
  try {
    const updateData: Record<string, any> = {};
    
    if (patent.ps_filer_assgn === filerName && patent.ps_filing_status === 0) {
      updateData.ps_filing_status = 1;
      updateData.ps_review_file_status = 1; // Set for review
      // Update PS completion status if both drafting and filing are done
      if (patent.ps_drafting_status === 1) {
        updateData.ps_completion_status = 1;
      }
    } else if (patent.cs_filer_assgn === filerName && patent.cs_filing_status === 0) {
      updateData.cs_filing_status = 1;
      updateData.cs_review_file_status = 1; // Set for review
      // Add form data for CS filing
      if (formData) {
        Object.assign(updateData, formData);
      }
      // Update CS completion status if both drafting and filing are done
      if (patent.cs_drafting_status === 1) {
        updateData.cs_completion_status = 1;
      }
    } else if (patent.fer_filer_assgn === filerName && patent.fer_filing_status === 0) {
      updateData.fer_filing_status = 1;
      updateData.fer_review_file_status = 1; // Set for review
      // Update FER completion status if both drafting and filing are done
      if (patent.fer_drafter_status === 1) {
        updateData.fer_completion_status = 1;
      }
    } else {
      toast.error("No valid filing task found");
      return false;
    }

    const { error } = await supabase
      .from("patents")
      .update(updateData)
      .eq("id", patent.id);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error("Error completing filing task:", error);
    toast.error("Failed to complete filing task");
    return false;
  }
};
