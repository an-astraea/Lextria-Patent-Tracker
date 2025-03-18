import { supabase } from "@/integrations/supabase/client";
import { Patent, EmployeeFormData, PatentFormData, FEREntry } from "@/lib/types";

// Fetch all patents with their relationships
export const fetchPatents = async () => {
  try {
    const { data, error } = await supabase
      .from("patents")
      .select(`
        *,
        inventors (*),
        fer_entries (*)
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching patents:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error in fetchPatents:", error);
    return [];
  }
};

// Fetch a single patent by ID
export const fetchPatentById = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from("patents")
      .select(`
        *,
        inventors (*),
        fer_entries (*)
      `)
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching patent by ID:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error in fetchPatentById:", error);
    return null;
  }
};

// Fetch patent timeline
export const fetchPatentTimeline = async (patentId: string) => {
  try {
    const { data, error } = await supabase
      .from("patent_timeline")
      .select("*")
      .eq("patent_id", patentId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching patent timeline:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error in fetchPatentTimeline:", error);
    return [];
  }
};

// Create a new patent
export const createPatent = async (patentData: PatentFormData) => {
  try {
    const { data, error } = await supabase
      .from("patents")
      .insert([
        {
          tracking_id: patentData.tracking_id,
          internal_tracking_id: patentData.internal_tracking_id || patentData.tracking_id,
          patent_applicant: patentData.patent_applicant,
          client_id: patentData.client_id,
          application_no: patentData.application_no,
          date_of_filing: patentData.date_of_filing,
          patent_title: patentData.patent_title,
          applicant_addr: patentData.applicant_addr,
          inventor_ph_no: patentData.inventor_ph_no,
          inventor_email: patentData.inventor_email,
          ps_drafter_assgn: patentData.ps_drafter_assgn,
          ps_drafter_deadline: patentData.ps_drafter_deadline,
          ps_filer_assgn: patentData.ps_filer_assgn,
          ps_filer_deadline: patentData.ps_filer_deadline,
          cs_drafter_assgn: patentData.cs_drafter_assgn,
          cs_drafter_deadline: patentData.cs_drafter_deadline,
          cs_filer_assgn: patentData.cs_filer_assgn,
          cs_filer_deadline: patentData.cs_filer_deadline,
          fer_status: patentData.fer_status || 0,
          fer_drafter_assgn: patentData.fer_drafter_assgn,
          fer_drafter_deadline: patentData.fer_drafter_deadline,
          fer_filer_assgn: patentData.fer_filer_assgn,
          fer_filer_deadline: patentData.fer_filer_deadline,
        },
      ])
      .select();

    if (error) {
      console.error("Error creating patent:", error);
      return { success: false, message: error.message };
    }

    if (patentData.inventors && patentData.inventors.length > 0) {
      const inventorsToInsert = patentData.inventors.map((inventor) => ({
        tracking_id: patentData.tracking_id,
        inventor_name: inventor.inventor_name,
        inventor_addr: inventor.inventor_addr,
      }));

      const { error: inventorsError } = await supabase
        .from("inventors")
        .insert(inventorsToInsert);

      if (inventorsError) {
        console.error("Error adding inventors:", inventorsError);
        return {
          success: true,
          message: "Patent created but failed to add inventors",
          patent: data[0],
        };
      }
    }

    return { success: true, message: "Patent created successfully", patent: data[0] };
  } catch (error: any) {
    console.error("Error in createPatent:", error);
    return { success: false, message: error.message || "An unexpected error occurred" };
  }
};

// Update an existing patent
export const updatePatent = async (id: string, patentData: Partial<PatentFormData>) => {
  try {
    console.log("Updating patent with ID:", id);
    console.log("Update data:", JSON.stringify(patentData, null, 2));
    
    // Create a copy of the data to update to avoid modifying the original
    const dataToUpdate = { ...patentData };
    
    // Explicitly handle internal_tracking_id
    console.log("Internal tracking ID in update:", dataToUpdate.internal_tracking_id);
    
    const { data, error } = await supabase
      .from("patents")
      .update(dataToUpdate)
      .eq("id", id)
      .select();

    if (error) {
      console.error("Error updating patent:", error);
      return { success: false, message: error.message };
    }

    console.log("Patent updated successfully:", data);
    return { success: true, message: "Patent updated successfully", patent: data[0] };
  } catch (error: any) {
    console.error("Error in updatePatent:", error);
    return { success: false, message: error.message || "An unexpected error occurred" };
  }
};

// Delete a patent
export const deletePatent = async (id: string) => {
  try {
    const { error } = await supabase.from("patents").delete().eq("id", id);

    if (error) {
      console.error("Error deleting patent:", error);
      return { success: false, message: error.message };
    }

    return { success: true, message: "Patent deleted successfully" };
  } catch (error: any) {
    console.error("Error in deletePatent:", error);
    return { success: false, message: error.message || "An unexpected error occurred" };
  }
};

// Update patent status fields
export const updatePatentStatus = async (
  patentId: string,
  statusData: Record<string, any>
) => {
  try {
    const { error } = await supabase
      .from("patents")
      .update(statusData)
      .eq("id", patentId);

    if (error) {
      console.error("Error updating patent status:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in updatePatentStatus:", error);
    return false;
  }
};

// Update patent notes
export const updatePatentNotes = async (patentId: string, notes: string) => {
  try {
    const { error } = await supabase
      .from("patents")
      .update({ notes })
      .eq("id", patentId);

    if (error) {
      console.error("Error updating patent notes:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in updatePatentNotes:", error);
    return false;
  }
};

// Update patent forms
export const updatePatentForms = async (patentId: string, formData: Record<string, boolean>) => {
  const { data, error } = await supabase
    .from('patents')
    .update(formData)
    .eq('id', patentId)
    .select();
  
  if (error) {
    console.error('Error updating patent forms:', error);
    return false;
  }
  
  return true;
};

// Function to update FER entry
export const updateFEREntry = async (ferEntryId: string, ferData: Partial<FEREntry>) => {
  const { data, error } = await supabase
    .from('fer_entries')
    .update(ferData)
    .eq('id', ferEntryId)
    .select();
  
  if (error) {
    console.error('Error updating FER entry:', error);
    return false;
  }
  
  return true;
};

// Function to update patent payment information
export const updatePatentPayment = async (
  patentId: string,
  paymentData: {
    payment_status?: string;
    payment_amount?: number;
    payment_received?: number;
    invoice_sent?: boolean;
  }
) => {
  try {
    const { error } = await supabase
      .from("patents")
      .update(paymentData)
      .eq("id", patentId);

    if (error) {
      console.error("Error updating patent payment:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in updatePatentPayment:", error);
    return false;
  }
};
