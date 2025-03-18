
import { supabase } from "@/integrations/supabase/client";
import { PatentFormData } from "@/lib/types";

// Create a new patent
export const createPatent = async (patentData: PatentFormData) => {
  try {
    const { data, error } = await supabase
      .from("patents")
      .insert([
        {
          tracking_id: patentData.tracking_id,
          internal_tracking_id: patentData.internal_tracking_id || null,
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
    const { data, error } = await supabase
      .from("patents")
      .update({
        ...patentData,
      })
      .eq("id", id)
      .select();

    if (error) {
      console.error("Error updating patent:", error);
      return { success: false, message: error.message };
    }

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
