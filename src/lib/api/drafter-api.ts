
import { supabase } from "@/integrations/supabase/client";
import { Patent } from "../types";
import { toast } from "sonner";

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

    // Now we need to filter for proper queue order: PS -> CS -> FER
    return (data || []).filter(patent => {
      // If assigned to PS drafting and it's not completed
      if (patent.ps_drafter_assgn === drafterName && patent.ps_drafting_status === 0) {
        return true;
      }
      
      // If assigned to CS drafting and PS is not assigned or PS is completed
      if (patent.cs_drafter_assgn === drafterName && patent.cs_drafting_status === 0) {
        return !patent.ps_drafter_assgn || patent.ps_drafting_status === 1;
      }
      
      // If assigned to FER drafting and (PS and CS not assigned or they are completed)
      if (patent.fer_drafter_assgn === drafterName && patent.fer_drafter_status === 0 && patent.fer_status === 1) {
        const psCompleted = !patent.ps_drafter_assgn || patent.ps_drafting_status === 1;
        const csCompleted = !patent.cs_drafter_assgn || patent.cs_drafting_status === 1;
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

    return data || [];
  } catch (error) {
    console.error("Error fetching completed drafting assignments:", error);
    toast.error("Failed to load completed assignments");
    return [];
  }
};
