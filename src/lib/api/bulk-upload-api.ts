
import { supabase } from "@/integrations/supabase/client";
import { PatentFormData } from "../types";
import { validateEmployeeExists } from "./employee-api";

export interface BulkUploadValidationError {
  row: number;
  field: string;
  message: string;
}

export interface BulkUploadResult {
  success: boolean;
  successCount: number;
  errorCount: number;
  errors: BulkUploadValidationError[];
  data?: PatentFormData[];
}

export const validatePatentData = async (data: any[], startRow: number = 2): Promise<BulkUploadValidationError[]> => {
  const errors: BulkUploadValidationError[] = [];
  const employeeFields = [
    'ps_drafter_assgn',
    'ps_filer_assgn', 
    'cs_drafter_assgn',
    'cs_filer_assgn',
    'fer_drafter_assgn',
    'fer_filer_assgn'
  ];

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const rowNumber = startRow + i;

    // Required field validation
    if (!row.tracking_id?.trim()) {
      errors.push({
        row: rowNumber,
        field: 'tracking_id',
        message: 'Tracking ID is required'
      });
    }

    if (!row.patent_applicant?.trim()) {
      errors.push({
        row: rowNumber,
        field: 'patent_applicant',
        message: 'Patent Applicant is required'
      });
    }

    if (!row.client_id?.trim()) {
      errors.push({
        row: rowNumber,
        field: 'client_id',
        message: 'Client ID is required'
      });
    }

    if (!row.patent_title?.trim()) {
      errors.push({
        row: rowNumber,
        field: 'patent_title',
        message: 'Patent Title is required'
      });
    }

    if (!row.applicant_addr?.trim()) {
      errors.push({
        row: rowNumber,
        field: 'applicant_addr',
        message: 'Applicant Address is required'
      });
    }

    if (!row.inventor_ph_no?.trim()) {
      errors.push({
        row: rowNumber,
        field: 'inventor_ph_no',
        message: 'Inventor Phone Number is required'
      });
    }

    if (!row.inventor_email?.trim()) {
      errors.push({
        row: rowNumber,
        field: 'inventor_email',
        message: 'Inventor Email is required'
      });
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.inventor_email.trim())) {
      errors.push({
        row: rowNumber,
        field: 'inventor_email',
        message: 'Invalid email format'
      });
    }

    // Employee name validation - check if assigned employees exist in the employees table
    for (const field of employeeFields) {
      const employeeName = row[field]?.trim();
      if (employeeName) {
        const employeeExists = await validateEmployeeExists(employeeName);
        if (!employeeExists) {
          errors.push({
            row: rowNumber,
            field: field,
            message: `Employee "${employeeName}" does not exist in the employees table. Please use exact name match.`
          });
        }
      }
    }

    // Date validation
    if (row.date_of_filing && isNaN(Date.parse(row.date_of_filing))) {
      errors.push({
        row: rowNumber,
        field: 'date_of_filing',
        message: 'Invalid date format for date of filing'
      });
    }

    if (row.ps_drafter_deadline && isNaN(Date.parse(row.ps_drafter_deadline))) {
      errors.push({
        row: rowNumber,
        field: 'ps_drafter_deadline',
        message: 'Invalid date format for PS drafter deadline'
      });
    }

    if (row.ps_filer_deadline && isNaN(Date.parse(row.ps_filer_deadline))) {
      errors.push({
        row: rowNumber,
        field: 'ps_filer_deadline',
        message: 'Invalid date format for PS filer deadline'
      });
    }

    if (row.cs_drafter_deadline && isNaN(Date.parse(row.cs_drafter_deadline))) {
      errors.push({
        row: rowNumber,
        field: 'cs_drafter_deadline',
        message: 'Invalid date format for CS drafter deadline'
      });
    }

    if (row.cs_filer_deadline && isNaN(Date.parse(row.cs_filer_deadline))) {
      errors.push({
        row: rowNumber,
        field: 'cs_filer_deadline',
        message: 'Invalid date format for CS filer deadline'
      });
    }

    if (row.fer_drafter_deadline && isNaN(Date.parse(row.fer_drafter_deadline))) {
      errors.push({
        row: rowNumber,
        field: 'fer_drafter_deadline',
        message: 'Invalid date format for FER drafter deadline'
      });
    }

    if (row.fer_filer_deadline && isNaN(Date.parse(row.fer_filer_deadline))) {
      errors.push({
        row: rowNumber,
        field: 'fer_filer_deadline',
        message: 'Invalid date format for FER filer deadline'
      });
    }

    // FER status validation
    if (row.fer_status !== undefined && row.fer_status !== null) {
      const ferStatus = parseInt(row.fer_status);
      if (isNaN(ferStatus) || (ferStatus !== 0 && ferStatus !== 1)) {
        errors.push({
          row: rowNumber,
          field: 'fer_status',
          message: 'FER status must be 0 or 1'
        });
      }
    }

    // Check for duplicate tracking IDs within the upload
    const duplicateIndex = data.findIndex((item, index) => 
      index !== i && item.tracking_id?.trim() === row.tracking_id?.trim()
    );
    if (duplicateIndex !== -1) {
      errors.push({
        row: rowNumber,
        field: 'tracking_id',
        message: `Duplicate tracking ID found at row ${startRow + duplicateIndex}`
      });
    }
  }

  return errors;
};

export const checkExistingTrackingIds = async (trackingIds: string[]): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from("patents")
      .select("tracking_id")
      .in("tracking_id", trackingIds);

    if (error) {
      throw error;
    }

    return data?.map(item => item.tracking_id) || [];
  } catch (error) {
    console.error("Error checking existing tracking IDs:", error);
    return [];
  }
};

export const bulkUploadPatents = async (patents: PatentFormData[]): Promise<BulkUploadResult> => {
  try {
    const errors: BulkUploadValidationError[] = [];
    let successCount = 0;
    let errorCount = 0;

    // Check for existing tracking IDs in the database
    const trackingIds = patents.map(p => p.tracking_id).filter(Boolean);
    const existingIds = await checkExistingTrackingIds(trackingIds);

    for (let i = 0; i < patents.length; i++) {
      const patent = patents[i];
      const rowNumber = i + 2; // Assuming header is row 1

      if (existingIds.includes(patent.tracking_id)) {
        errors.push({
          row: rowNumber,
          field: 'tracking_id',
          message: `Tracking ID ${patent.tracking_id} already exists in database`
        });
        errorCount++;
        continue;
      }

      try {
        // Insert patent
        const { data: patentData, error: patentError } = await supabase
          .from("patents")
          .insert({
            tracking_id: patent.tracking_id,
            patent_applicant: patent.patent_applicant,
            client_id: patent.client_id,
            application_no: patent.application_no,
            date_of_filing: patent.date_of_filing,
            patent_title: patent.patent_title,
            applicant_addr: patent.applicant_addr,
            inventor_ph_no: patent.inventor_ph_no,
            inventor_email: patent.inventor_email,
            ps_drafter_assgn: patent.ps_drafter_assgn,
            ps_drafter_deadline: patent.ps_drafter_deadline,
            ps_filer_assgn: patent.ps_filer_assgn,
            ps_filer_deadline: patent.ps_filer_deadline,
            cs_drafter_assgn: patent.cs_drafter_assgn,
            cs_drafter_deadline: patent.cs_drafter_deadline,
            cs_filer_assgn: patent.cs_filer_assgn,
            cs_filer_deadline: patent.cs_filer_deadline,
            fer_status: patent.fer_status || 0,
            fer_drafter_assgn: patent.fer_drafter_assgn,
            fer_drafter_deadline: patent.fer_drafter_deadline,
            fer_filer_assgn: patent.fer_filer_assgn,
            fer_filer_deadline: patent.fer_filer_deadline,
            idf_sent: patent.idf_sent || false,
            idf_received: patent.idf_received || false,
            cs_data: patent.cs_data || false,
            cs_data_received: patent.cs_data_received || false,
            professional_fees: patent.professional_fees || 0,
            gst_amount: patent.gst_amount || 0,
            tds_amount: patent.tds_amount || 0,
            reimbursement: patent.reimbursement || 0,
            payment_amount: patent.payment_amount || 0,
            expected_amount: patent.expected_amount || 0,
            payment_received: patent.payment_received || 0,
            invoice_status: patent.invoice_status || 'not_sent',
            payment_status: patent.payment_status || 'not_sent',
            date_of_receipt: patent.date_of_receipt,
            invoice_sent: patent.invoice_sent || false
          })
          .select()
          .single();

        if (patentError) {
          throw patentError;
        }

        // Insert inventors if provided
        if (patent.inventors && patent.inventors.length > 0) {
          const inventorInserts = patent.inventors.map(inventor => ({
            tracking_id: patent.tracking_id,
            inventor_name: inventor.inventor_name,
            inventor_addr: inventor.inventor_addr
          }));

          const { error: inventorError } = await supabase
            .from("inventors")
            .insert(inventorInserts);

          if (inventorError) {
            console.error(`Error inserting inventors for ${patent.tracking_id}:`, inventorError);
            // Continue with patent creation even if inventor insertion fails
          }
        }

        successCount++;
      } catch (error) {
        console.error(`Error inserting patent ${patent.tracking_id}:`, error);
        errors.push({
          row: rowNumber,
          field: 'general',
          message: `Failed to insert patent: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
        errorCount++;
      }
    }

    return {
      success: errorCount === 0,
      successCount,
      errorCount,
      errors,
      data: patents
    };
  } catch (error) {
    console.error("Bulk upload error:", error);
    return {
      success: false,
      successCount: 0,
      errorCount: patents.length,
      errors: [{
        row: 0,
        field: 'general',
        message: `Bulk upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      }]
    };
  }
};
