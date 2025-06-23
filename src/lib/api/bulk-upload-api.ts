
import { supabase } from '@/integrations/supabase/client';
import { PatentFormData } from '@/lib/types';

/**
 * Uploads multiple patents from Excel data
 */
export const bulkUploadPatents = async (patentDataList: PatentFormData[]) => {
  const results = {
    success: 0,
    failed: 0,
    errors: [] as string[]
  };

  // Process each patent one by one to ensure we can track individual errors
  for (let i = 0; i < patentDataList.length; i++) {
    const patentData = patentDataList[i];
    try {
      // First check if a patent with this tracking ID already exists
      const { data: existingPatent, error: checkError } = await supabase
        .from('patents')
        .select('id')
        .eq('tracking_id', patentData.tracking_id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "no rows returned" which is what we want
        throw new Error(`Error checking existing patent: ${checkError.message}`);
      }

      if (existingPatent) {
        throw new Error(`A patent with tracking ID ${patentData.tracking_id} already exists`);
      }

      // Insert the patent
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
            fer_status: patentData.fer_status || 0,
            ps_drafting_status: 0,
            ps_filing_status: 0,
            ps_review_draft_status: 0,
            ps_review_file_status: 0,
            ps_completion_status: 0,
            cs_drafting_status: 0,
            cs_filing_status: 0,
            cs_review_draft_status: 0,
            cs_review_file_status: 0,
            cs_completion_status: 0,
            fer_drafter_status: 0,
            fer_filing_status: 0,
            fer_review_draft_status: 0,
            fer_review_file_status: 0,
            fer_completion_status: 0,
          },
        ])
        .select();

      if (error) {
        throw new Error(`Error inserting patent: ${error.message}`);
      }

      // If we have inventors, add them too
      if (patentData.inventors && patentData.inventors.length > 0) {
        const inventorsToInsert = patentData.inventors.map((inventor) => ({
          tracking_id: patentData.tracking_id,
          inventor_name: inventor.inventor_name,
          inventor_addr: inventor.inventor_addr,
        }));

        const { error: inventorsError } = await supabase
          .from('inventors')
          .insert(inventorsToInsert);

        if (inventorsError) {
          throw new Error(`Error adding inventors: ${inventorsError.message}`);
        }
      }

      results.success++;
    } catch (error) {
      console.error(`Error uploading patent ${patentData.tracking_id}:`, error);
      results.failed++;
      results.errors.push(`Patent ${patentData.tracking_id}: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  return results;
};
