
import { supabase } from "@/integrations/supabase/client";
import { Patent, FEREntry, Task } from "../types";
import { toast } from "sonner";

// Fetch active filing tasks assigned to a filer
export const fetchFilerAssignments = async (filerName: string): Promise<Patent[]> => {
  try {
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
    console.error("Error fetching filer assignments:", error);
    toast.error("Failed to load assignments");
    return [];
  }
};

// Complete a filing task
export const completeFilerTask = async (task: Task): Promise<boolean> => {
  try {
    const { patent, ferEntry, type } = task;
    
    if (type === "fer_filing" && ferEntry) {
      // Handle FER entry filing status update
      const { error } = await supabase
        .from("fer_entries")
        .update({
          fer_filing_status: 1,
          fer_review_file_status: 1 // Mark for review
        })
        .eq("id", ferEntry.id);
        
      if (error) {
        throw error;
      }
    } else {
      // Handle patent filing status update
      const updates: Record<string, any> = {};
      
      if (type === "filing") {
        // Determine which status to update
        if (patent.ps_filing_status === 0) {
          updates.ps_filing_status = 1;
          updates.ps_review_file_status = 1; // Mark for review
        } else if (patent.cs_filing_status === 0) {
          updates.cs_filing_status = 1;
          updates.cs_review_file_status = 1; // Mark for review
        } else {
          // No matching assignment found
          toast.error("No active filing task found for this patent");
          return false;
        }
      }
      
      const { error } = await supabase
        .from("patents")
        .update(updates)
        .eq("id", patent.id);
        
      if (error) {
        throw error;
      }
    }
    
    return true;
  } catch (error) {
    console.error("Error completing filing task:", error);
    toast.error("Failed to complete task");
    return false;
  }
};

// Fetch completed filing tasks
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
    console.error("Error fetching completed filer assignments:", error);
    toast.error("Failed to load completed assignments");
    return [];
  }
};

// Create list of tasks for the filer dashboard
export const createFilerTasks = (patents: Patent[]): Task[] => {
  const tasks: Task[] = [];

  patents.forEach(patent => {
    // Check for PS filing tasks
    if (patent.ps_drafting_status === 1 && patent.ps_filing_status === 0) {
      tasks.push({
        id: `ps-${patent.id}`,
        title: `File PS for ${patent.patent_title}`,
        assignedTo: patent.ps_filer_assgn,
        deadline: patent.ps_filer_deadline,
        status: "active",
        type: "filing",
        patent
      });
    }

    // Check for CS filing tasks
    if (patent.cs_drafting_status === 1 && patent.cs_filing_status === 0) {
      tasks.push({
        id: `cs-${patent.id}`,
        title: `File CS for ${patent.patent_title}`,
        assignedTo: patent.cs_filer_assgn,
        deadline: patent.cs_filer_deadline,
        status: "active",
        type: "filing",
        patent
      });
    }

    // Check for FER filing tasks from FER entries
    if (patent.fer_entries && patent.fer_entries.length > 0) {
      patent.fer_entries.forEach(ferEntry => {
        if (ferEntry.fer_drafter_status === 1 && ferEntry.fer_filing_status === 0) {
          tasks.push({
            id: `fer-${ferEntry.id}`,
            title: `File FER #${ferEntry.fer_number} for ${patent.patent_title}`,
            assignedTo: ferEntry.fer_filer_assgn || "",
            deadline: ferEntry.fer_filer_deadline || "",
            status: "active",
            type: "fer_filing",
            patent,
            ferEntry
          });
        }
      });
    }
  });

  return tasks;
};
