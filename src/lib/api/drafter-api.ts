
import { supabase } from "@/integrations/supabase/client";
import { Patent } from "@/lib/types";
import { normalizePatents } from "@/lib/utils/type-converters";
import { toast } from "sonner";

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

    const normalizedData = normalizePatents(data || []);

    return normalizedData.filter(patent => {
      if (patent.ps_drafter_assgn === drafterName && patent.ps_drafting_status === 0) {
        return true;
      }
      
      if (patent.cs_drafter_assgn === drafterName && patent.cs_drafting_status === 0) {
        if (!patent.ps_drafter_assgn) {
          return true;
        }
        
        const psCompleted = patent.ps_completion_status === 1;
        return psCompleted;
      }
      
      if (patent.fer_drafter_assgn === drafterName && patent.fer_drafter_status === 0 && patent.fer_status === 1) {
        if (!patent.ps_drafter_assgn && !patent.cs_drafter_assgn) {
          return true;
        }
        
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

export const fetchDrafterPatents = async (drafterName: string) => {
  try {
    const { data: psPatents, error: psError } = await supabase
      .from('patents')
      .select('*')
      .eq('ps_drafter_assgn', drafterName)
      .eq('ps_drafting_status', 0)
      .is('withdrawn', false)
      .filter('idf_received', 'eq', true); // Only show patents where IDF has been received

    if (psError) throw psError;

    const { data: csPatents, error: csError } = await supabase
      .from('patents')
      .select('*')
      .eq('cs_drafter_assgn', drafterName)
      .eq('cs_drafting_status', 0)
      .is('withdrawn', false)
      .filter('cs_data_received', 'eq', true)
      .filter('idf_received', 'eq', true); // Also ensure IDF has been received

    if (csError) throw csError;

    const { data: ferEntries, error: ferError } = await supabase
      .from('fer_entries')
      .select('*, patent:patents(*)')
      .eq('fer_drafter_assgn', drafterName)
      .eq('fer_drafter_status', 0)
      .is('patent.withdrawn', false);

    if (ferError) throw ferError;

    const combinedPatents = [
      ...psPatents.map(patent => ({ ...patent, draftType: 'ps' })),
      ...csPatents.map(patent => ({ ...patent, draftType: 'cs' })),
    ];

    const ferPatents = ferEntries.map(entry => ({
      ...entry.patent,
      fer_entry_id: entry.id,
      fer_number: entry.fer_number,
      draftType: 'fer'
    }));

    return [...combinedPatents, ...ferPatents];
  } catch (error) {
    console.error('Error fetching drafter patents:', error);
    throw error;
  }
};
