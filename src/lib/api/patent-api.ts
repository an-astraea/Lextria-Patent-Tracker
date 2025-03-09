
import { supabase } from "@/integrations/supabase/client";
import { Inventor, Patent, PatentFormData, PatentTimeline, FEREntry } from "../types";
import { toast } from "sonner";

// Patent Functions
export const fetchPatents = async (): Promise<Patent[]> => {
  try {
    const { data: patents, error } = await supabase
      .from("patents")
      .select(`
        *,
        inventors(*),
        fer_history(*)
      `);

    if (error) {
      throw error;
    }

    // Fetch FER entries separately for each patent
    for (const patent of (patents || [])) {
      const { data: ferEntries, error: ferError } = await supabase
        .from("fer_entries")
        .select("*")
        .eq("patent_id", patent.id);
        
      if (!ferError && ferEntries) {
        patent.fer_entries = ferEntries;
      }
    }

    return patents || [];
  } catch (error) {
    console.error("Error fetching patents:", error);
    toast.error("Failed to load patents");
    return [];
  }
};

export const fetchPatentById = async (id: string): Promise<Patent | null> => {
  try {
    const { data, error } = await supabase
      .from("patents")
      .select(`
        *,
        inventors(*),
        fer_history(*)
      `)
      .eq("id", id)
      .single();

    if (error) {
      throw error;
    }

    if (data) {
      // Fetch FER entries
      const { data: ferEntries, error: ferError } = await supabase
        .from("fer_entries")
        .select("*")
        .eq("patent_id", id);
        
      if (!ferError && ferEntries) {
        data.fer_entries = ferEntries;
      }
    }

    return data || null;
  } catch (error) {
    console.error("Error fetching patent:", error);
    toast.error("Failed to load patent details");
    return null;
  }
};

export const updatePatentStatus = async (
  id: string, 
  statusType: string, 
  value: number
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("patents")
      .update({ [statusType]: value })
      .eq("id", id);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error(`Error updating patent ${statusType}:`, error);
    toast.error("Failed to update patent status");
    return false;
  }
};

export const deletePatent = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("patents")
      .delete()
      .eq("id", id);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error("Error deleting patent:", error);
    toast.error("Failed to delete patent");
    return false;
  }
};

export const updatePatentForms = async (
  id: string,
  formData: {
    form_26?: boolean;
    form_18?: boolean;
    form_18a?: boolean;
    form_9?: boolean;
    form_9a?: boolean;
    form_13?: boolean;
    // Add all other form fields as needed
    form_01?: boolean;
    form_02_ps?: boolean;
    form_02_cs?: boolean;
    form_03?: boolean;
    form_04?: boolean;
    form_05?: boolean;
    form_06?: boolean;
    form_07?: boolean;
    form_07a?: boolean;
    form_08?: boolean;
    form_08a?: boolean;
    form_09?: boolean;
    form_10?: boolean;
    form_11?: boolean;
    form_12?: boolean;
    form_14?: boolean;
    form_15?: boolean;
    form_16?: boolean;
    form_17?: boolean;
    form_19?: boolean;
    form_20?: boolean;
    form_21?: boolean;
    form_22?: boolean;
    form_23?: boolean;
    form_24?: boolean;
    form_25?: boolean;
    form_27?: boolean;
    form_28?: boolean;
    form_29?: boolean;
    form_30?: boolean;
    form_31?: boolean;
  }
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("patents")
      .update(formData)
      .eq("id", id);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error("Error updating patent forms:", error);
    toast.error("Failed to update forms");
    return false;
  }
};

// Added function to fetch patents assigned to a specific employee
export const fetchPatentsByEmployee = async (employeeName: string): Promise<Patent[]> => {
  try {
    const { data, error } = await supabase
      .from("patents")
      .select(`
        *,
        inventors(*),
        fer_history(*)
      `)
      .or(`ps_drafter_assgn.eq.${employeeName},cs_drafter_assgn.eq.${employeeName},fer_drafter_assgn.eq.${employeeName},ps_filer_assgn.eq.${employeeName},cs_filer_assgn.eq.${employeeName},fer_filer_assgn.eq.${employeeName}`);

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
    console.error("Error fetching patents by employee:", error);
    toast.error("Failed to load patents for employee");
    return [];
  }
};

// Add new function to create a patent
export const createPatent = async (patentData: PatentFormData): Promise<Patent | null> => {
  try {
    // Calculate initial completion statuses
    const psCompletionStatus = 0; // Will be set to 1 when both drafting and filing are done
    const csCompletionStatus = 0; // Will be set to 1 when both drafting and filing are done
    const ferCompletionStatus = 0; // Will be set to 1 when both drafting and filing are done

    const { data, error } = await supabase
      .from("patents")
      .insert({
        tracking_id: patentData.tracking_id,
        patent_applicant: patentData.patent_applicant,
        client_id: patentData.client_id,
        application_no: patentData.application_no || null,
        date_of_filing: patentData.date_of_filing || null,
        patent_title: patentData.patent_title,
        applicant_addr: patentData.applicant_addr,
        inventor_ph_no: patentData.inventor_ph_no,
        inventor_email: patentData.inventor_email,
        ps_drafter_assgn: patentData.ps_drafter_assgn || null,
        ps_drafter_deadline: patentData.ps_drafter_deadline || null,
        ps_filer_assgn: patentData.ps_filer_assgn || null,
        ps_filer_deadline: patentData.ps_filer_deadline || null,
        cs_drafter_assgn: patentData.cs_drafter_assgn || null,
        cs_drafter_deadline: patentData.cs_drafter_deadline || null,
        cs_filer_assgn: patentData.cs_filer_assgn || null,
        cs_filer_deadline: patentData.cs_filer_deadline || null,
        fer_status: patentData.fer_status,
        fer_drafter_assgn: patentData.fer_drafter_assgn || null,
        fer_drafter_deadline: patentData.fer_drafter_deadline || null,
        fer_filer_assgn: patentData.fer_filer_assgn || null,
        fer_filer_deadline: patentData.fer_filer_deadline || null,
        ps_completion_status: psCompletionStatus,
        cs_completion_status: csCompletionStatus,
        fer_completion_status: ferCompletionStatus
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    if (patentData.inventors && patentData.inventors.length > 0) {
      for (const inventor of patentData.inventors) {
        await createInventor({
          tracking_id: data.tracking_id,
          inventor_name: inventor.inventor_name,
          inventor_addr: inventor.inventor_addr
        });
      }
    }

    return data;
  } catch (error) {
    console.error("Error creating patent:", error);
    toast.error("Failed to create patent");
    return null;
  }
};

// Add function to update a patent
export const updatePatent = async (id: string, patentData: Partial<PatentFormData>): Promise<boolean> => {
  try {
    const updateData: any = {
      patent_applicant: patentData.patent_applicant,
      client_id: patentData.client_id,
      application_no: patentData.application_no || null,
      date_of_filing: patentData.date_of_filing || null,
      patent_title: patentData.patent_title,
      applicant_addr: patentData.applicant_addr,
      inventor_ph_no: patentData.inventor_ph_no,
      inventor_email: patentData.inventor_email,
      ps_drafter_assgn: patentData.ps_drafter_assgn || null,
      ps_drafter_deadline: patentData.ps_drafter_deadline || null,
      ps_filer_assgn: patentData.ps_filer_assgn || null,
      ps_filer_deadline: patentData.ps_filer_deadline || null,
      cs_drafter_assgn: patentData.cs_drafter_assgn || null,
      cs_drafter_deadline: patentData.cs_drafter_deadline || null,
      cs_filer_assgn: patentData.cs_filer_assgn || null,
      cs_filer_deadline: patentData.cs_filer_deadline || null
    };
    
    // Only update fer fields if they're present in patentData
    if ('fer_status' in patentData) {
      updateData.fer_status = patentData.fer_status;
    }
    if ('fer_drafter_assgn' in patentData) {
      updateData.fer_drafter_assgn = patentData.fer_drafter_assgn || null;
    }
    if ('fer_drafter_deadline' in patentData) {
      updateData.fer_drafter_deadline = patentData.fer_drafter_deadline || null;
    }
    if ('fer_filer_assgn' in patentData) {
      updateData.fer_filer_assgn = patentData.fer_filer_assgn || null;
    }
    if ('fer_filer_deadline' in patentData) {
      updateData.fer_filer_deadline = patentData.fer_filer_deadline || null;
    }

    const { error } = await supabase
      .from("patents")
      .update(updateData)
      .eq("id", id);

    if (error) {
      throw error;
    }

    if (patentData.inventors && patentData.inventors.length > 0) {
      // Get existing inventors
      const { data: existingInventors, error: fetchError } = await supabase
        .from("inventors")
        .select("*")
        .eq("tracking_id", patentData.tracking_id);
      
      if (fetchError) {
        throw fetchError;
      }
      
      // Update existing inventors or create new ones
      if (existingInventors && existingInventors.length > 0) {
        for (let i = 0; i < patentData.inventors.length; i++) {
          const inventor = patentData.inventors[i];
          if (i < existingInventors.length) {
            await updateInventor(existingInventors[i].id, {
              inventor_name: inventor.inventor_name,
              inventor_addr: inventor.inventor_addr
            });
          } else {
            await createInventor({
              tracking_id: patentData.tracking_id!,
              inventor_name: inventor.inventor_name,
              inventor_addr: inventor.inventor_addr
            });
          }
        }
      } else {
        // No existing inventors, create all new ones
        for (const inventor of patentData.inventors) {
          await createInventor({
            tracking_id: patentData.tracking_id!,
            inventor_name: inventor.inventor_name,
            inventor_addr: inventor.inventor_addr
          });
        }
      }
    }

    return true;
  } catch (error) {
    console.error("Error updating patent:", error);
    toast.error("Failed to update patent");
    return false;
  }
};

// Add function to create an inventor
export const createInventor = async (inventorData: { tracking_id: string, inventor_name: string, inventor_addr: string }): Promise<Inventor | null> => {
  try {
    const { data, error } = await supabase
      .from("inventors")
      .insert({
        tracking_id: inventorData.tracking_id,
        inventor_name: inventorData.inventor_name,
        inventor_addr: inventorData.inventor_addr
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error creating inventor:", error);
    toast.error("Failed to add inventor");
    return null;
  }
};

// Add function to update inventors
export const updateInventor = async (id: string, inventorData: { inventor_name: string, inventor_addr: string }): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("inventors")
      .update({
        inventor_name: inventorData.inventor_name,
        inventor_addr: inventorData.inventor_addr
      })
      .eq("id", id);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error("Error updating inventor:", error);
    toast.error("Failed to update inventor");
    return false;
  }
};

// Function to update patent notes
export const updatePatentNotes = async (
  patentId: string,
  notes: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("patents")
      .update({ notes })
      .eq("id", patentId);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error("Error updating patent notes:", error);
    toast.error("Failed to update notes");
    return false;
  }
};

// Function to fetch patent timeline
export const fetchPatentTimeline = async (patentId: string): Promise<PatentTimeline[]> => {
  try {
    const { data, error } = await supabase
      .from("patent_timeline")
      .select("*")
      .eq("patent_id", patentId)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching patent timeline:", error);
    toast.error("Failed to load timeline");
    return [];
  }
};

// Create a FER entry
export const createFEREntry = async (
  patentId: string,
  ferNumber: number,
  ferData: {
    fer_date?: string;
    fer_drafter_assgn?: string;
    fer_drafter_deadline?: string;
    fer_filer_assgn?: string;
    fer_filer_deadline?: string;
  }
): Promise<FEREntry | null> => {
  try {
    const { data, error } = await supabase
      .from("fer_entries")
      .insert({
        patent_id: patentId,
        fer_number: ferNumber,
        fer_date: ferData.fer_date || null,
        fer_drafter_assgn: ferData.fer_drafter_assgn || null,
        fer_drafter_deadline: ferData.fer_drafter_deadline || null,
        fer_filer_assgn: ferData.fer_filer_assgn || null,
        fer_filer_deadline: ferData.fer_filer_deadline || null,
        fer_drafter_status: 0,
        fer_filing_status: 0,
        fer_review_draft_status: 0,
        fer_review_file_status: 0,
        fer_completion_status: 0
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error creating FER entry:", error);
    toast.error("Failed to create FER entry");
    return null;
  }
};

// Update a FER entry
export const updateFEREntry = async (
  id: string,
  ferData: {
    fer_date?: string;
    fer_drafter_assgn?: string;
    fer_drafter_deadline?: string;
    fer_drafter_status?: number;
    fer_filer_assgn?: string;
    fer_filer_deadline?: string;
    fer_filing_status?: number;
    fer_review_draft_status?: number;
    fer_review_file_status?: number;
    fer_completion_status?: number;
  }
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("fer_entries")
      .update(ferData)
      .eq("id", id);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error("Error updating FER entry:", error);
    toast.error("Failed to update FER entry");
    return false;
  }
};

// Delete a FER entry
export const deleteFEREntry = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("fer_entries")
      .delete()
      .eq("id", id);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error("Error deleting FER entry:", error);
    toast.error("Failed to delete FER entry");
    return false;
  }
};
