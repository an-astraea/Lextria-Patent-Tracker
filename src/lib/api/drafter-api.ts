
import { supabase } from "@/integrations/supabase/client";
import { Patent } from "@/lib/types";
import { toast } from "sonner";
import { normalizePatents } from "../utils/type-converters";

export const fetchDrafterAssignments = async (drafterName: string): Promise<Patent[]> => {
  try {
    // Get patents where drafter is assigned with status 0 (pending)
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

    // Normalize data to ensure type compatibility
    const normalizedData = normalizePatents(data || []);

    // Now we need to filter for proper queue order with approval dependencies
    return normalizedData.filter(patent => {
      // If assigned to PS drafting and it's not completed
      if (patent.ps_drafter_assgn === drafterName && patent.ps_drafting_status === 0) {
        return true;
      }
      
      // If assigned to CS drafting
      if (patent.cs_drafter_assgn === drafterName && patent.cs_drafting_status === 0) {
        // Case 1: Patent starts from CS (no PS drafter assigned)
        if (!patent.ps_drafter_assgn) {
          return true;
        }
        
        // Case 2: PS must be completed or admin has manually set CS as ready
        const psCompleted = patent.ps_completion_status === 1;
        return psCompleted;
      }
      
      // If assigned to FER drafting and previous stages are completed or not required
      if (patent.fer_drafter_assgn === drafterName && patent.fer_drafter_status === 0 && patent.fer_status === 1) {
        // Case 1: Patent starts from FER (no PS/CS assignees)
        if (!patent.ps_drafter_assgn && !patent.cs_drafter_assgn) {
          return true;
        }
        
        // Case 2: PS and CS must be completed if they were assigned
        const psCompleted = !patent.ps_drafter_assgn || patent.ps_completion_status === 1;
        const csCompleted = !patent.cs_drafter_assgn || patent.cs_completion_status === 1;
        return psCompleted && csCompleted;
      }
      
      return false;
    });
  } catch (error) {
    console.error("Error fetching drafter assignments:", error);
    toast.error("Failed to load drafting assignments");
    return [];
  }
};

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

    return normalizePatents(data || []);
  } catch (error) {
    console.error("Error fetching completed drafting assignments:", error);
    toast.error("Failed to load completed assignments");
    return [];
  }
};

export const completeDrafterTask = async (
  patent: Patent,
  drafterName: string
): Promise<boolean> => {
  try {
    const updateData: Record<string, any> = {};
    
    if (patent.ps_drafter_assgn === drafterName && patent.ps_drafting_status === 0) {
      updateData.ps_drafting_status = 1;
      updateData.ps_review_draft_status = 1; // Set for review
    } else if (patent.cs_drafter_assgn === drafterName && patent.cs_drafting_status === 0) {
      updateData.cs_drafting_status = 1;
      updateData.cs_review_draft_status = 1; // Set for review
    } else if (patent.fer_drafter_assgn === drafterName && patent.fer_drafter_status === 0) {
      updateData.fer_drafter_status = 1;
      updateData.fer_review_draft_status = 1; // Set for review
    } else {
      toast.error("No valid drafting task found");
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
    console.error("Error completing drafting task:", error);
    toast.error("Failed to complete drafting task");
    return false;
  }
};
