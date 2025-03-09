import { supabase } from '@/integrations/supabase/client';
import { Patent, PatentFormData } from '@/lib/types';

// Exports all the patent-related API functions
export const fetchPatents = async () => {
  const { data, error } = await supabase
    .from('patents')
    .select(`
      *,
      inventors (*),
      fer_history (*),
      fer_entries (*)
    `);

  if (error) {
    console.error('Error fetching patents:', error);
    return [];
  }

  return data || [];
};

export const fetchPatentById = async (id: string) => {
  const { data, error } = await supabase
    .from('patents')
    .select(`
      *,
      inventors (*),
      fer_history (*),
      fer_entries (*)
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching patent by ID:', error);
    return null;
  }

  return data;
};

export const fetchPatentTimeline = async (patentId: string) => {
  const { data, error } = await supabase
    .from('patient_timeline')
    .select('*')
    .eq('patent_id', patentId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching patent timeline:', error);
    return [];
  }

  return data;
};

export const createPatent = async (patentData: PatentFormData) => {
  const { data, error } = await supabase
    .from('patents')
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
        ps_drafting_status: 0, // Set initial status to 0
        ps_drafter_assgn: patentData.ps_drafter_assgn,
        ps_drafter_deadline: patentData.ps_drafter_deadline,
        ps_review_draft_status: 0,
        ps_filing_status: 0, // Set initial status to 0
        ps_filer_assgn: patentData.ps_filer_assgn,
        ps_filer_deadline: patentData.ps_filer_deadline,
        ps_review_file_status: 0,
        ps_completion_status: 0, // Set initial status to 0
        cs_drafting_status: 0, // Set initial status to 0
        cs_drafter_assgn: patentData.cs_drafter_assgn,
        cs_drafter_deadline: patentData.cs_drafter_deadline,
        cs_review_draft_status: 0,
        cs_filing_status: 0, // Set initial status to 0
        cs_filer_assgn: patentData.cs_filer_assgn,
        cs_filer_deadline: patentData.cs_filer_deadline,
        cs_review_file_status: 0,
        cs_completion_status: 0, // Set initial status to 0
        fer_status: patentData.fer_status,
        fer_drafter_assgn: patentData.fer_drafter_assgn,
        fer_drafter_deadline: patentData.fer_drafter_deadline,
        fer_review_draft_status: 0,
        fer_filing_status: 0,
        fer_filer_assgn: patentData.fer_filer_assgn,
        fer_filer_deadline: patentData.fer_filer_deadline,
        fer_review_file_status: 0,
        fer_completion_status: 0,
      },
    ])
    .select()

  if (error) {
    console.error('Error creating patent:', error);
    return null;
  }

  return data && data.length > 0 ? data[0] : null;
};

export const updatePatent = async (id: string, patentData: PatentFormData) => {
  const { data, error } = await supabase
    .from('patents')
    .update({
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
      fer_status: patentData.fer_status,
      fer_drafter_assgn: patentData.fer_drafter_assgn,
      fer_drafter_deadline: patentData.fer_drafter_deadline,
      fer_filer_assgn: patentData.fer_filer_assgn,
      fer_filer_deadline: patentData.fer_filer_deadline,
    })
    .eq('id', id)
    .select();

  if (error) {
    console.error('Error updating patent:', error);
    return false;
  }

  return true;
};

export const deletePatent = async (id: string) => {
  const { error } = await supabase
    .from('patents')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting patent:', error);
    return false;
  }

  return true;
};

export const updatePatentStatus = async (patentId: string, statusData: Record<string, any>) => {
  try {
    const { data, error } = await supabase
      .from('patents')
      .update(statusData)
      .eq('id', patentId)
      .select();
    
    if (error) {
      console.error('Error updating patent status:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error updating patent status:', error);
    return false;
  }
};

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

export const updatePatentNotes = async (patentId: string, notes: string) => {
  const { data, error } = await supabase
    .from('patents')
    .update({ notes })
    .eq('id', patentId)
    .select();

  if (error) {
    console.error('Error updating patent notes:', error);
    return false;
  }

  return true;
};

export const createFEREntry = async (
  patentId: string, 
  ferNumber: number, 
  ferDrafter?: string, 
  ferDrafterDeadline?: string,
  ferFiler?: string,
  ferFilerDeadline?: string,
  ferDate?: string
) => {
  try {
    // Create the new FER entry
    const { data, error } = await supabase
      .from('fer_entries')
      .insert({
        patent_id: patentId,
        fer_number: ferNumber,
        fer_drafter_assgn: ferDrafter || null,
        fer_drafter_deadline: ferDrafterDeadline || null,
        fer_drafter_status: 0,
        fer_filer_assgn: ferFiler || null,
        fer_filer_deadline: ferFilerDeadline || null,
        fer_filing_status: 0,
        fer_review_draft_status: 0,
        fer_review_file_status: 0,
        fer_completion_status: 0,
        fer_date: ferDate || null
      })
      .select();
    
    if (error) {
      console.error('Error creating FER entry:', error);
      return null;
    }
    
    // Also update the patent to reflect there's a new FER entry (should set fer_completion_status to 0)
    await supabase
      .from('patents')
      .update({
        fer_status: 1,
        fer_completion_status: 0
      })
      .eq('id', patentId);
    
    return data[0];
  } catch (error) {
    console.error('Error creating FER entry:', error);
    return null;
  }
};

export const updateFEREntry = async (ferEntryId: string, ferData: Partial<any>) => {
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

export const deleteFEREntry = async (ferEntryId: string) => {
  const { error } = await supabase
    .from('fer_entries')
    .delete()
    .eq('id', ferEntryId);
  
  if (error) {
    console.error('Error deleting FER entry:', error);
    return false;
  }
  
  return true;
};

export const updatePatentPayment = async (patentId: string, paymentData: { 
  payment_status?: string;
  payment_amount?: number;
  payment_received?: number;
  invoice_sent?: boolean;
}) => {
  try {
    const { data, error } = await supabase
      .from('patents')
      .update(paymentData)
      .eq('id', patentId)
      .select();
    
    if (error) {
      console.error('Error updating patent payment:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error updating patent payment:', error);
    return false;
  }
};
