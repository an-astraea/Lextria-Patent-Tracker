
import { supabase } from "@/integrations/supabase/client";
import { Inventor, Patent, PatentFormData } from "../types";
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
export const updatePatent = async (id: string, patentData: PatentFormData): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("patents")
      .update({
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
        fer_filer_deadline: patentData.fer_filer_deadline || null
      })
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
            // Fix: use existingInventors[i].id instead of inventor.id
            await updateInventor(existingInventors[i].id, {
              inventor_name: inventor.inventor_name,
              inventor_addr: inventor.inventor_addr
            });
          } else {
            await createInventor({
              tracking_id: patentData.tracking_id,
              inventor_name: inventor.inventor_name,
              inventor_addr: inventor.inventor_addr
            });
          }
        }
      } else {
        // No existing inventors, create all new ones
        for (const inventor of patentData.inventors) {
          await createInventor({
            tracking_id: patentData.tracking_id,
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
