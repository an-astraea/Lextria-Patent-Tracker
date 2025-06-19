import { supabase } from "@/integrations/supabase/client";
import { Patent, EmployeeFormData, PatentFormData, FEREntry } from "@/lib/types";
import { addPatentTimelineEntry } from "@/lib/api/timeline-api";

// Helper function to get current user
const getCurrentUser = () => {
  try {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  } catch (error) {
    console.error('Error getting user from localStorage:', error);
    return null;
  }
};

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
    const currentUser = getCurrentUser();
    const creatorName = currentUser?.full_name || 'Unknown User';

    const { data, error } = await supabase
      .from("patents")
      .insert([
        {
          tracking_id: patentData.tracking_id,
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
      throw new Error(error.message);
    }

    const createdPatent = data[0];

    // Add timeline entry for patent creation
    await addPatentTimelineEntry(
      createdPatent.id,
      'patent_created',
      `Patent "${patentData.patent_title}" was created by ${creatorName}`,
      1,
      creatorName
    );

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
          patent: createdPatent,
        };
      }

      // Add timeline entry for inventors
      await addPatentTimelineEntry(
        createdPatent.id,
        'inventors_added',
        `${patentData.inventors.length} inventor(s) added by ${creatorName}`,
        1,
        creatorName
      );
    }

    return { success: true, message: "Patent created successfully", patent: createdPatent };
  } catch (error: any) {
    console.error("Error in createPatent:", error);
    throw new Error(error.message || "An unexpected error occurred");
  }
};

// Update an existing patent - fixed for better error handling
export const updatePatent = async (id: string, patentData: Partial<PatentFormData>) => {
  try {
    const currentUser = getCurrentUser();
    const updaterName = currentUser?.full_name || 'Unknown User';
    
    console.log('Updating patent with data:', patentData);
    
    // Get the current patent data to compare changes
    const currentPatent = await fetchPatentById(id);
    
    // Ensure we have the updated_at field
    const updateData = {
      ...patentData,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from("patents")
      .update(updateData)
      .eq("id", id)
      .select();

    if (error) {
      console.error("Error updating patent:", error);
      throw new Error(error.message);
    }

    if (!data || data.length === 0) {
      throw new Error("No patent was updated. Please check if the patent exists.");
    }

    // Track specific changes made
    const changes = [];
    if (currentPatent) {
      if (patentData.patent_title && patentData.patent_title !== currentPatent.patent_title) {
        changes.push(`Patent title changed from "${currentPatent.patent_title}" to "${patentData.patent_title}"`);
      }
      if (patentData.patent_applicant && patentData.patent_applicant !== currentPatent.patent_applicant) {
        changes.push(`Patent applicant changed from "${currentPatent.patent_applicant}" to "${patentData.patent_applicant}"`);
      }
      if (patentData.ps_drafter_assgn !== undefined && patentData.ps_drafter_assgn !== currentPatent.ps_drafter_assgn) {
        changes.push(`PS Drafter assignment changed from "${currentPatent.ps_drafter_assgn || 'None'}" to "${patentData.ps_drafter_assgn || 'None'}"`);
      }
      if (patentData.ps_filer_assgn !== undefined && patentData.ps_filer_assgn !== currentPatent.ps_filer_assgn) {
        changes.push(`PS Filer assignment changed from "${currentPatent.ps_filer_assgn || 'None'}" to "${patentData.ps_filer_assgn || 'None'}"`);
      }
      if (patentData.cs_drafter_assgn !== undefined && patentData.cs_drafter_assgn !== currentPatent.cs_drafter_assgn) {
        changes.push(`CS Drafter assignment changed from "${currentPatent.cs_drafter_assgn || 'None'}" to "${patentData.cs_drafter_assgn || 'None'}"`);
      }
      if (patentData.cs_filer_assgn !== undefined && patentData.cs_filer_assgn !== currentPatent.cs_filer_assgn) {
        changes.push(`CS Filer assignment changed from "${currentPatent.cs_filer_assgn || 'None'}" to "${patentData.cs_filer_assgn || 'None'}"`);
      }
      if (patentData.ps_drafter_deadline && patentData.ps_drafter_deadline !== currentPatent.ps_drafter_deadline) {
        changes.push(`PS Drafter deadline changed to ${new Date(patentData.ps_drafter_deadline).toLocaleDateString()}`);
      }
      if (patentData.ps_filer_deadline && patentData.ps_filer_deadline !== currentPatent.ps_filer_deadline) {
        changes.push(`PS Filer deadline changed to ${new Date(patentData.ps_filer_deadline).toLocaleDateString()}`);
      }
      if (patentData.cs_drafter_deadline && patentData.cs_drafter_deadline !== currentPatent.cs_drafter_deadline) {
        changes.push(`CS Drafter deadline changed to ${new Date(patentData.cs_drafter_deadline).toLocaleDateString()}`);
      }
      if (patentData.cs_filer_deadline && patentData.cs_filer_deadline !== currentPatent.cs_filer_deadline) {
        changes.push(`CS Filer deadline changed to ${new Date(patentData.cs_filer_deadline).toLocaleDateString()}`);
      }
    }

    // Add timeline entry for updates
    if (changes.length > 0) {
      await addPatentTimelineEntry(
        id,
        'patent_updated',
        `Patent updated by ${updaterName}: ${changes.join('; ')}`,
        1,
        updaterName
      );
    }

    console.log('Patent updated successfully:', data);
    return { success: true, message: "Patent updated successfully", patent: data[0] };
  } catch (error: any) {
    console.error("Error in updatePatent:", error);
    throw new Error(error.message || "An unexpected error occurred");
  }
};

// Delete a patent
export const deletePatent = async (id: string) => {
  try {
    const currentUser = getCurrentUser();
    const deleterName = currentUser?.full_name || 'Unknown User';

    // Get patent info before deletion for timeline
    const patent = await fetchPatentById(id);
    
    const { error } = await supabase.from("patents").delete().eq("id", id);

    if (error) {
      console.error("Error deleting patent:", error);
      return { success: false, message: error.message };
    }

    // Add timeline entry for deletion (if patent existed)
    if (patent) {
      await addPatentTimelineEntry(
        id,
        'patent_deleted',
        `Patent "${patent.patent_title}" was deleted by ${deleterName}`,
        1,
        deleterName
      );
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
    const currentUser = getCurrentUser();
    const updaterName = currentUser?.full_name || 'Unknown User';

    const { error } = await supabase
      .from("patents")
      .update({
        ...statusData,
        updated_at: new Date().toISOString()
      })
      .eq("id", patentId);

    if (error) {
      console.error("Error updating patent status:", error);
      return false;
    }

    // Add timeline entry for status updates
    const statusChanges = Object.entries(statusData)
      .filter(([key, value]) => key !== 'updated_at')
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');

    await addPatentTimelineEntry(
      patentId,
      'status_updated',
      `Patent status updated by ${updaterName}: ${statusChanges}`,
      1,
      updaterName
    );

    return true;
  } catch (error) {
    console.error("Error in updatePatentStatus:", error);
    return false;
  }
};

// Update patent notes
export const updatePatentNotes = async (patentId: string, notes: string) => {
  try {
    const currentUser = getCurrentUser();
    const updaterName = currentUser?.full_name || 'Unknown User';

    const { error } = await supabase
      .from("patents")
      .update({ 
        notes,
        updated_at: new Date().toISOString()
      })
      .eq("id", patentId);

    if (error) {
      console.error("Error updating patent notes:", error);
      return false;
    }

    // Add timeline entry for notes update
    await addPatentTimelineEntry(
      patentId,
      'notes_updated',
      `Patent notes updated by ${updaterName}`,
      1,
      updaterName
    );

    return true;
  } catch (error) {
    console.error("Error in updatePatentNotes:", error);
    return false;
  }
};

// Update patent forms
export const updatePatentForms = async (patentId: string, formData: Record<string, boolean>) => {
  const currentUser = getCurrentUser();
  const updaterName = currentUser?.full_name || 'Unknown User';

  const { data, error } = await supabase
    .from('patents')
    .update({
      ...formData,
      updated_at: new Date().toISOString()
    })
    .eq('id', patentId)
    .select();
  
  if (error) {
    console.error('Error updating patent forms:', error);
    return false;
  }

  // Add timeline entry for forms update
  const formsUpdated = Object.entries(formData)
    .filter(([key, value]) => key.startsWith('form_'))
    .map(([key, value]) => `${key}: ${value ? 'checked' : 'unchecked'}`)
    .join(', ');

  if (formsUpdated) {
    await addPatentTimelineEntry(
      patentId,
      'forms_updated',
      `Patent forms updated by ${updaterName}: ${formsUpdated}`,
      1,
      updaterName
    );
  }
  
  return true;
};

// Function to update FER entry
export const updateFEREntry = async (ferEntryId: string, ferData: Partial<FEREntry>) => {
  const currentUser = getCurrentUser();
  const updaterName = currentUser?.full_name || 'Unknown User';

  const { data, error } = await supabase
    .from('fer_entries')
    .update({
      ...ferData,
      updated_at: new Date().toISOString()
    })
    .eq('id', ferEntryId)
    .select();
  
  if (error) {
    console.error('Error updating FER entry:', error);
    return false;
  }

  // Get patent ID from FER entry to add timeline
  if (data && data[0]) {
    await addPatentTimelineEntry(
      data[0].patent_id,
      'fer_updated',
      `FER entry updated by ${updaterName}`,
      1,
      updaterName
    );
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
    const currentUser = getCurrentUser();
    const updaterName = currentUser?.full_name || 'Unknown User';

    const { error } = await supabase
      .from("patents")
      .update({
        ...paymentData,
        updated_at: new Date().toISOString()
      })
      .eq("id", patentId);

    if (error) {
      console.error("Error updating patent payment:", error);
      return false;
    }

    // Add timeline entry for payment updates
    const paymentChanges = Object.entries(paymentData)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');

    await addPatentTimelineEntry(
      patentId,
      'payment_updated',
      `Payment information updated by ${updaterName}: ${paymentChanges}`,
      1,
      updaterName
    );

    return true;
  } catch (error) {
    console.error("Error in updatePatentPayment:", error);
    return false;
  }
};
