
import { supabase } from './client';
import { Patent, PatentFormData } from '../types';
import { createTimelineEvent } from './timeline-api';

// Function to fetch all patents
export const fetchPatents = async () => {
  const { data: patents, error } = await supabase
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

  return patents || [];
};

// Function to fetch a single patent by ID
export const fetchPatentById = async (id: string) => {
  const { data: patent, error } = await supabase
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

  return patent;
};

// Function to fetch patents and employees
export const fetchPatentsAndEmployees = async () => {
  const patents = await fetchPatents();
  const { data: employees, error } = await supabase.from('employees').select('*');
  
  return { 
    patents, 
    employees: employees || [], 
    error: error ? error.message : null 
  };
};

// Function to create a new patent
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
        fer_status: patentData.fer_status || 0,
        fer_drafter_status: 0,
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
    .select();

  if (error) {
    console.error('Error creating patent:', error);
    return null;
  }

  // Create inventors if provided
  if (patentData.inventors && patentData.inventors.length > 0 && data && data.length > 0) {
    const patent = data[0];
    
    for (const inventor of patentData.inventors) {
      await createInventor({
        tracking_id: patent.tracking_id,
        inventor_name: inventor.inventor_name,
        inventor_addr: inventor.inventor_addr
      });
    }
  }

  return data && data.length > 0 ? data[0] : null;
};

// Function to update an existing patent
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

  // Update or create inventors if provided
  if (patentData.inventors && data && data.length > 0) {
    const patent = data[0];
    
    // Fetch existing inventors
    const { data: existingInventors } = await supabase
      .from('inventors')
      .select('*')
      .eq('tracking_id', patent.tracking_id);
    
    // Delete inventors not in the updated list
    if (existingInventors) {
      for (const existingInventor of existingInventors) {
        const stillExists = patentData.inventors.some(
          inv => inv.id === existingInventor.id
        );
        
        if (!stillExists) {
          await supabase
            .from('inventors')
            .delete()
            .eq('id', existingInventor.id);
        }
      }
    }
    
    // Add or update inventors
    for (const inventor of patentData.inventors) {
      if (inventor.id) {
        // Update existing inventor
        await supabase
          .from('inventors')
          .update({
            inventor_name: inventor.inventor_name,
            inventor_addr: inventor.inventor_addr
          })
          .eq('id', inventor.id);
      } else {
        // Create new inventor
        await createInventor({
          tracking_id: patent.tracking_id,
          inventor_name: inventor.inventor_name,
          inventor_addr: inventor.inventor_addr
        });
      }
    }
  }

  return true;
};

// Function to delete a patent
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

// Function to create a new inventor
export const createInventor = async (inventorData: { tracking_id: string; inventor_name: string; inventor_addr: string }) => {
  const { data, error } = await supabase
    .from('inventors')
    .insert([
      {
        tracking_id: inventorData.tracking_id,
        inventor_name: inventorData.inventor_name,
        inventor_addr: inventorData.inventor_addr,
      },
    ])
    .select();

  if (error) {
    console.error('Error creating inventor:', error);
    return null;
  }

  return data && data.length > 0 ? data[0] : null;
};

// Function to update patent notes
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

// Function to update patent forms
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

// Function to update patent status fields
export const updatePatentStatus = async (patentId: string, statusField: string, value: number) => {
  try {
    // Create data object with just the field to update
    const updateData: any = {
      [statusField]: value
    };
    
    // If PS Drafting and PS Filing are both complete, update PS Completion Status
    if (statusField === 'ps_drafting_status' || statusField === 'ps_filing_status') {
      const patent = await fetchPatentById(patentId);
      if (patent) {
        const psDraftComplete = statusField === 'ps_drafting_status' ? value : patent.ps_drafting_status;
        const psFileComplete = statusField === 'ps_filing_status' ? value : patent.ps_filing_status;
        
        if (psDraftComplete === 1 && psFileComplete === 1) {
          updateData.ps_completion_status = 1;
        } else {
          updateData.ps_completion_status = 0;
        }
      }
    }
    
    // If CS Drafting and CS Filing are both complete, update CS Completion Status
    if (statusField === 'cs_drafting_status' || statusField === 'cs_filing_status') {
      const patent = await fetchPatentById(patentId);
      if (patent) {
        const csDraftComplete = statusField === 'cs_drafting_status' ? value : patent.cs_drafting_status;
        const csFileComplete = statusField === 'cs_filing_status' ? value : patent.cs_filing_status;
        
        if (csDraftComplete === 1 && csFileComplete === 1) {
          updateData.cs_completion_status = 1;
        } else {
          updateData.cs_completion_status = 0;
        }
      }
    }
    
    // If FER status is changed, handle appropriately
    if (statusField === 'fer_status') {
      // If FER is being disabled, update all FER-related statuses to 0
      if (value === 0) {
        updateData.fer_drafter_status = 0;
        updateData.fer_filing_status = 0;
        updateData.fer_completion_status = 0;
      } else {
        // If we're enabling FER, make sure to check current FER entries to determine completion status
        const patent = await fetchPatentById(patentId);
        if (patent && patent.fer_entries) {
          // Check if all existing FER entries are complete
          const allFERsComplete = patent.fer_entries.every(
            fer => fer.fer_drafter_status === 1 && fer.fer_filing_status === 1
          );
          
          updateData.fer_completion_status = allFERsComplete ? 1 : 0;
        } else {
          // No FER entries yet, so completion is 0
          updateData.fer_completion_status = 0;
        }
      }
    }
    
    // Update the patent
    const { data, error } = await supabase
      .from('patents')
      .update(updateData)
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
