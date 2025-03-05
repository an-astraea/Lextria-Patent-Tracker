
import { supabase } from "@/integrations/supabase/client";
import { Patent } from "../types";
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

    // Filter for proper queue order and dependencies: PS -> CS -> FER
    return (data || []).filter(patent => {
      // If assigned to PS filing and it's not completed and PS drafting is completed
      if (patent.ps_filer_assgn === filerName && patent.ps_filing_status === 0) {
        return patent.ps_drafting_status === 1;
      }
      
      // If assigned to CS filing and PS is not required or PS filing is completed
      if (patent.cs_filer_assgn === filerName && patent.cs_filing_status === 0) {
        const psNotRequired = !patent.ps_filer_assgn;
        const psCompleted = patent.ps_filing_status === 1;
        return (psNotRequired || psCompleted) && patent.cs_drafting_status === 1;
      }
      
      // If assigned to FER filing and previous stages are completed or not required
      if (patent.fer_filer_assgn === filerName && patent.fer_filing_status === 0 && patent.fer_status === 1) {
        const psNotRequired = !patent.ps_filer_assgn;
        const csNotRequired = !patent.cs_filer_assgn;
        const psCompleted = patent.ps_filing_status === 1;
        const csCompleted = patent.cs_filing_status === 1;
        return (psNotRequired || psCompleted) && (csNotRequired || csCompleted) && patent.fer_drafter_status === 1;
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
