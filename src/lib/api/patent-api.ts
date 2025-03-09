import { supabase } from '@/integrations/supabase/client';
import { Patent, PatentFormData, FEREntry } from '../types';

// Export all functions used by the app
export const fetchPatentById = async (id: string): Promise<Patent | null> => {
  try {
    // First, fetch the patent data
    const { data: patent, error } = await supabase
      .from('patents')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    // Fetch inventors related to this patent
    const { data: inventors, error: inventorsError } = await supabase
      .from('inventors')
      .select('*')
      .eq('tracking_id', patent.tracking_id);

    if (inventorsError) throw inventorsError;

    // Fetch FER entries for this patent
    const { data: ferEntries, error: ferError } = await supabase
      .from('fer_entries')
      .select('*')
      .eq('patent_id', id)
      .order('fer_number', { ascending: true });

    if (ferError) throw ferError;

    // Combine the data
    return {
      ...patent,
      inventors: inventors || [],
      fer_entries: ferEntries || []
    } as Patent;
  } catch (error) {
    console.error('Error fetching patent:', error);
    return null;
  }
};

export const fetchPatents = async (
  page = 1, 
  limit = 10, 
  searchTerm = '', 
  statuses: string[] = []
): Promise<{ patents: Patent[], total: number }> => {
  try {
    let query = supabase
      .from('patents')
      .select('*', { count: 'exact' });

    // Apply search if provided
    if (searchTerm) {
      query = query.or(`tracking_id.ilike.%${searchTerm}%,patent_applicant.ilike.%${searchTerm}%,patent_title.ilike.%${searchTerm}%,client_id.ilike.%${searchTerm}%`);
    }

    // Apply status filters if provided
    if (statuses.length > 0) {
      // Build complex filter based on statuses
      statuses.forEach(status => {
        switch (status) {
          case 'ps_drafting':
            query = query.eq('ps_drafting_status', 1);
            break;
          case 'ps_filing':
            query = query.eq('ps_filing_status', 1);
            break;
          case 'cs_drafting':
            query = query.eq('cs_drafting_status', 1);
            break;
          case 'cs_filing':
            query = query.eq('cs_filing_status', 1);
            break;
          case 'fer_drafting':
            query = query.eq('fer_drafter_status', 1);
            break;
          case 'fer_filing':
            query = query.eq('fer_filing_status', 1);
            break;
          case 'completed':
            query = query.eq('completed', true);
            break;
          case 'withdrawn':
            query = query.eq('withdrawn', true);
            break;
          // Add other status filters as needed
        }
      });
    }
    
    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    
    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;
    
    return {
      patents: data as Patent[],
      total: count || 0
    };
  } catch (error) {
    console.error('Error fetching patents:', error);
    return { patents: [], total: 0 };
  }
};

export const createPatent = async (patentData: PatentFormData): Promise<Patent | null> => {
  try {
    // Insert the patent record
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
        }
      ])
      .select()
      .single();

    if (error) throw error;

    if (data && patentData.inventors.length > 0) {
      // Insert inventors
      const inventorsToInsert = patentData.inventors.map(inventor => ({
        tracking_id: patentData.tracking_id,
        inventor_name: inventor.inventor_name,
        inventor_addr: inventor.inventor_addr
      }));

      const { error: inventorsError } = await supabase
        .from('inventors')
        .insert(inventorsToInsert);

      if (inventorsError) throw inventorsError;
    }

    return data as Patent;
  } catch (error) {
    console.error('Error creating patent:', error);
    return null;
  }
};

export const updatePatent = async (id: string, patentData: Partial<Patent>): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('patents')
      .update(patentData)
      .eq('id', id);

    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error updating patent:', error);
    return false;
  }
};

export const deletePatent = async (id: string): Promise<boolean> => {
  try {
    // First, get the tracking_id to delete related inventors
    const { data: patent, error: fetchError } = await supabase
      .from('patents')
      .select('tracking_id')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    if (patent && patent.tracking_id) {
      // Delete related inventors
      const { error: inventorsError } = await supabase
        .from('inventors')
        .delete()
        .eq('tracking_id', patent.tracking_id);

      if (inventorsError) throw inventorsError;
    }

    // Delete FER entries
    const { error: ferError } = await supabase
      .from('fer_entries')
      .delete()
      .eq('patent_id', id);

    if (ferError) throw ferError;

    // Finally delete the patent
    const { error } = await supabase
      .from('patents')
      .delete()
      .eq('id', id);

    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error deleting patent:', error);
    return false;
  }
};

export const updatePatentStatus = async (
  id: string, 
  statusUpdate: Record<string, boolean | number>
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('patents')
      .update(statusUpdate)
      .eq('id', id);

    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error updating patent status:', error);
    return false;
  }
};

export const updatePatentForms = async (
  id: string, 
  formsUpdate: Record<string, boolean>
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('patents')
      .update(formsUpdate)
      .eq('id', id);

    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error updating patent forms:', error);
    return false;
  }
};

export const updatePatentNotes = async (
  id: string, 
  notes: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('patents')
      .update({ notes })
      .eq('id', id);

    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error updating patent notes:', error);
    return false;
  }
};

export const updatePatentPayment = async (patentId: string, paymentData: {
  payment_status?: string,
  payment_amount?: number,
  payment_received?: number,
  invoice_sent?: boolean
}) => {
  try {
    const { error } = await supabase
      .from('patents')
      .update(paymentData)
      .eq('id', patentId);

    if (error) {
      console.error('Error updating payment information:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error updating payment information:', error);
    return false;
  }
};

export const fetchPatentTimeline = async (patentId: string) => {
  try {
    const { data, error } = await supabase
      .from('patent_timeline')
      .select('*')
      .eq('patent_id', patentId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching patent timeline:', error);
    return [];
  }
};

export const createFEREntry = async (
  patentId: string,
  ferNumber: number,
  drafterAssignee?: string,
  drafterDeadline?: string,
  filerAssignee?: string, 
  filerDeadline?: string,
  ferDate?: string
): Promise<FEREntry | null> => {
  try {
    const newFER = {
      patent_id: patentId,
      fer_number: ferNumber,
      fer_drafter_assgn: drafterAssignee || null,
      fer_drafter_deadline: drafterDeadline || null,
      fer_filer_assgn: filerAssignee || null,
      fer_filer_deadline: filerDeadline || null,
      fer_date: ferDate || null,
      fer_drafter_status: 0,
      fer_filing_status: 0,
      fer_review_draft_status: 0,
      fer_review_file_status: 0,
      fer_completion_status: 0
    };
    
    const { data, error } = await supabase
      .from('fer_entries')
      .insert([newFER])
      .select()
      .single();

    if (error) throw error;
    
    // Also update the patent's fer_status to 1 if it's the first FER
    if (ferNumber === 1) {
      await supabase
        .from('patents')
        .update({ fer_status: 1 })
        .eq('id', patentId);
    }
    
    return data as FEREntry;
  } catch (error) {
    console.error('Error creating FER entry:', error);
    return null;
  }
};

export const updateFEREntry = async (
  ferId: string,
  ferData: Partial<FEREntry>
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('fer_entries')
      .update(ferData)
      .eq('id', ferId);

    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error updating FER entry:', error);
    return false;
  }
};

export const deleteFEREntry = async (ferId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('fer_entries')
      .delete()
      .eq('id', ferId);

    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error deleting FER entry:', error);
    return false;
  }
};
