import { supabase } from "@/integrations/supabase/client";
import { Inventor, Patent, PatentFormData } from "../types";
import { toast } from "sonner";

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

export const completeFilerTask = async (
  patent: Patent,
  filerName: string,
  formData?: {
    form_26?: boolean;
    form_18?: boolean;
    form_18a?: boolean;
    form_9?: boolean;
    form_9a?: boolean;
    form_13?: boolean;
  }
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

export const approvePatentReview = async (
  patent: Patent,
  reviewType: 'ps_draft' | 'ps_file' | 'cs_draft' | 'cs_file' | 'fer_draft' | 'fer_file'
): Promise<boolean> => {
  try {
    const updateData: Record<string, any> = {};
    
    switch (reviewType) {
      case 'ps_draft':
        updateData.ps_review_draft_status = 0; // Approve the review (reset to 0 since it's approved)
        break;
      case 'ps_file':
        updateData.ps_review_file_status = 0; // Approve the review
        updateData.ps_completion_status = 1; // Set PS as completed
        break;
      case 'cs_draft':
        updateData.cs_review_draft_status = 0; // Approve the review
        break;
      case 'cs_file':
        updateData.cs_review_file_status = 0; // Approve the review
        updateData.cs_completion_status = 1; // Set CS as completed
        break;
      case 'fer_draft':
        updateData.fer_review_draft_status = 0; // Approve the review
        break;
      case 'fer_file':
        updateData.fer_review_file_status = 0; // Approve the review
        updateData.fer_completion_status = 1; // Set FER as completed
        break;
      default:
        toast.error("Invalid review type");
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
    console.error("Error approving review:", error);
    toast.error("Failed to approve review");
    return false;
  }
};

export const updatePatentNotes = async (patentId: string, notes: string): Promise<boolean> => {
  try {
    // In a real application, this would make an API call to update notes
    // For this demo, we'll simulate it with local storage
    
    // Get all patents from storage
    const storedPatents = localStorage.getItem('patents');
    const patents = storedPatents ? JSON.parse(storedPatents) : [];
    
    // Find and update the specific patent
    const updatedPatents = patents.map((patent: Patent) => {
      if (patent.id === patentId) {
        return { ...patent, notes };
      }
      return patent;
    });
    
    // Save back to storage
    localStorage.setItem('patents', JSON.stringify(updatedPatents));
    
    return true;
  } catch (error) {
    console.error('Error updating patent notes:', error);
    return false;
  }
};

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
