import * as XLSX from 'xlsx';
import { PatentFormData } from '@/lib/types';
import { supabase } from '@/integrations/supabase/client';

export const downloadExcelTemplate = () => {
  const headers = [
    'tracking_id*',
    'patent_applicant*',
    'client_id*',
    'patent_title*',
    'applicant_addr*',
    'inventor_ph_no*',
    'inventor_email*',
    'application_no',
    'date_of_filing',
    'ps_drafter_assgn',
    'ps_drafter_deadline',
    'ps_filer_assgn',
    'ps_filer_deadline',
    'cs_drafter_assgn',
    'cs_drafter_deadline',
    'cs_filer_assgn',
    'cs_filer_deadline',
    'fer_status',
    'inventor_name*',
    'inventor_addr*'
  ];

  const ws = XLSX.utils.aoa_to_sheet([headers]);

  const sampleRow = [
    'PAT-123456',
    'Example Applicant',
    'CLIENT-001',
    'Example Patent Title',
    '123 Applicant Street, City, Country',
    '1234567890',
    'inventor@example.com',
    'APP-12345 (optional)',
    '2023-01-01 (YYYY-MM-DD, optional)',
    'John Doe (employee full name)',
    '2023-02-01 (YYYY-MM-DD)',
    'Jane Smith (employee full name)',
    '2023-03-01 (YYYY-MM-DD)',
    'John Doe (employee full name)',
    '2023-04-01 (YYYY-MM-DD)',
    'Jane Smith (employee full name)',
    '2023-05-01 (YYYY-MM-DD)',
    '0 (use 0 for no, 1 for yes)',
    'John Inventor',
    '456 Inventor Avenue, City, Country'
  ];

  XLSX.utils.sheet_add_aoa(ws, [sampleRow], { origin: 1 });

  const wscols = headers.map(() => ({ wch: 25 }));
  ws['!cols'] = wscols;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Patent Template');

  XLSX.writeFile(wb, 'patent_upload_template.xlsx');
  
  return true;
};

export const convertPatentsToBulkFormat = (patents) => {
  if (!patents || patents.length === 0) return [];
  
  return patents.map(patent => {
    const formattedPatent = {
      'tracking_id*': patent.tracking_id || '',
      'patent_applicant*': patent.patent_applicant || '',
      'client_id*': patent.client_id || '',
      'patent_title*': patent.patent_title || '',
      'applicant_addr*': patent.applicant_addr || '',
      'inventor_ph_no*': patent.inventor_ph_no || '',
      'inventor_email*': patent.inventor_email || '',
      'application_no': patent.application_no || '',
      'date_of_filing': patent.date_of_filing || '',
      'ps_drafter_assgn': patent.ps_drafter_assgn || '',
      'ps_drafter_deadline': patent.ps_drafter_deadline || '',
      'ps_filer_assgn': patent.ps_filer_assgn || '',
      'ps_filer_deadline': patent.ps_filer_deadline || '',
      'cs_drafter_assgn': patent.cs_drafter_assgn || '',
      'cs_drafter_deadline': patent.cs_drafter_deadline || '',
      'cs_filer_assgn': patent.cs_filer_assgn || '',
      'cs_filer_deadline': patent.cs_filer_deadline || '',
      'fer_status': patent.fer_status ? '1' : '0',
    };
    
    if (patent.fer_status) {
      formattedPatent['fer_drafter_assgn'] = patent.fer_drafter_assgn || '';
      formattedPatent['fer_drafter_deadline'] = patent.fer_drafter_deadline || '';
      formattedPatent['fer_filer_assgn'] = patent.fer_filer_assgn || '';
      formattedPatent['fer_filer_deadline'] = patent.fer_filer_deadline || '';
    }
    
    if (patent.inventors && patent.inventors.length > 0) {
      patent.inventors.forEach((inventor, index) => {
        const inventorNumPrefix = index === 0 ? '' : (index + 1).toString();
        formattedPatent[`inventor_name${inventorNumPrefix}*`] = inventor.inventor_name || '';
        formattedPatent[`inventor_addr${inventorNumPrefix}*`] = inventor.inventor_addr || '';
      });
    } else {
      formattedPatent['inventor_name*'] = 'Unknown Inventor';
      formattedPatent['inventor_addr*'] = 'Unknown Address';
    }
    
    return formattedPatent;
  });
};

export const downloadBulkUploadTemplate = (patents = null) => {
  if (patents && patents.length > 0) {
    const patentsInBulkFormat = convertPatentsToBulkFormat(patents);
    
    const ws = XLSX.utils.json_to_sheet(patentsInBulkFormat);
    
    const wscols = Object.keys(patentsInBulkFormat[0]).map(() => ({ wch: 25 }));
    ws['!cols'] = wscols;
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Patents Bulk Data');
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
    XLSX.writeFile(wb, `patents_bulk_data_${timestamp}.xlsx`);
    
    return true;
  } else {
    return downloadExcelTemplate();
  }
};

export const downloadSampleExcelData = () => {
  const sampleData = [{
    'tracking_id*': 'PAT-123456',
    'patent_applicant*': 'Sample Applicant Ltd.',
    'client_id*': 'CLIENT-001',
    'patent_title*': 'Method and System for AI-Based Patent Analysis',
    'applicant_addr*': '123 Innovation Street, Tech City, 10001',
    'inventor_ph_no*': '9876543210',
    'inventor_email*': 'inventor@example.com',
    'application_no': 'APP-2023-12345',
    'date_of_filing': '2023-05-15',
    'ps_drafter_assgn': 'John Smith',
    'ps_drafter_deadline': '2023-06-15',
    'ps_filer_assgn': 'Jane Doe',
    'ps_filer_deadline': '2023-07-15',
    'cs_drafter_assgn': 'Robert Johnson',
    'cs_drafter_deadline': '2023-08-15',
    'cs_filer_assgn': 'Emily Wilson',
    'cs_filer_deadline': '2023-09-15',
    'fer_status': '0',
    'inventor_name*': 'Dr. Alan Inventor',
    'inventor_addr*': '456 Research Avenue, Innovation Park, 20002',
    'inventor_name2': 'Sarah Co-Inventor',
    'inventor_addr2': '789 Technology Road, Science District, 30003'
  }];

  const ws = XLSX.utils.json_to_sheet(sampleData);

  const wscols = Object.keys(sampleData[0]).map(() => ({ wch: 25 }));
  ws['!cols'] = wscols;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sample Patent Data');

  XLSX.writeFile(wb, 'sample_patent_data.xlsx');
  
  return true;
};

export const getSamplePatentData = (): PatentFormData[] => {
  const today = new Date();
  const futureDate = new Date();
  futureDate.setDate(today.getDate() + 30);
  
  const formattedToday = today.toISOString().split('T')[0];
  const formattedFuture = futureDate.toISOString().split('T')[0];
  
  return [
    {
      tracking_id: `SAMPLE-${Date.now()}`,
      patent_applicant: "Sample Company Ltd.",
      client_id: "CLIENT-SAMPLE",
      patent_title: "Sample Innovative Technology Patent",
      applicant_addr: "123 Sample Street, Sample City, 12345",
      inventor_ph_no: "1234567890",
      inventor_email: "inventor@example.com",
      application_no: "APP-SAMPLE-123",
      date_of_filing: formattedToday,
      ps_drafter_assgn: "John Doe",
      ps_drafter_deadline: formattedFuture,
      ps_filer_assgn: "Jane Smith",
      ps_filer_deadline: formattedFuture,
      cs_drafter_assgn: "John Doe",
      cs_drafter_deadline: formattedFuture,
      cs_filer_assgn: "Jane Smith",
      cs_filer_deadline: formattedFuture,
      fer_status: 0,
      inventors: [
        {
          inventor_name: "Sample Inventor",
          inventor_addr: "456 Inventor Avenue, Invention City, 67890"
        },
        {
          inventor_name: "Second Inventor",
          inventor_addr: "789 Innovation Road, Tech Town, 54321"
        }
      ]
    }
  ];
};

const validateEmployeeExistence = async (employeeName: string | null | undefined): Promise<boolean> => {
  if (!employeeName) return true; // Null assignments are valid (not assigned)
  
  const { data, error } = await supabase
    .from('employees')
    .select('id')
    .eq('full_name', employeeName)
    .single();
  
  if (error) {
    console.error("Error validating employee:", error);
    return false;
  }
  
  return !!data;
};

export const validatePatentData = async (jsonData: Record<string, any>[]): Promise<{ patentData: PatentFormData[], errors: string[] }> => {
  const patentData: PatentFormData[] = [];
  const errors: string[] = [];
  const employeeValidationPromises: Promise<{rowIndex: number, field: string, employeeName: string, isValid: boolean}>[] = [];

  for (let i = 0; i < jsonData.length; i++) {
    const row = jsonData[i];
    const rowIndex = i + 2; // +2 because Excel is 1-indexed and we have a header row

    try {
      const requiredFields = [
        'tracking_id',
        'patent_applicant',
        'client_id',
        'patent_title',
        'applicant_addr',
        'inventor_ph_no',
        'inventor_email',
        'inventor_name',
        'inventor_addr'
      ];

      for (const field of requiredFields) {
        if (!row[field + '*'] && !row[field]) {
          throw new Error(`Missing required field: ${field}`);
        }
      }

      const patent: PatentFormData = {
        tracking_id: row['tracking_id*'] || row['tracking_id'],
        patent_applicant: row['patent_applicant*'] || row['patent_applicant'],
        client_id: row['client_id*'] || row['client_id'],
        patent_title: row['patent_title*'] || row['patent_title'],
        applicant_addr: row['applicant_addr*'] || row['applicant_addr'],
        inventor_ph_no: row['inventor_ph_no*'] || row['inventor_ph_no'],
        inventor_email: row['inventor_email*'] || row['inventor_email'],
        application_no: row['application_no'] || null,
        date_of_filing: row['date_of_filing'] || null,
        ps_drafter_assgn: row['ps_drafter_assgn'] || null,
        ps_drafter_deadline: row['ps_drafter_deadline'] || null,
        ps_filer_assgn: row['ps_filer_assgn'] || null,
        ps_filer_deadline: row['ps_filer_deadline'] || null,
        cs_drafter_assgn: row['cs_drafter_assgn'] || null,
        cs_drafter_deadline: row['cs_drafter_deadline'] || null,
        cs_filer_assgn: row['cs_filer_assgn'] || null,
        cs_filer_deadline: row['cs_filer_deadline'] || null,
        fer_status: row['fer_status'] ? parseInt(row['fer_status'], 10) : 0,
        inventors: [
          {
            inventor_name: row['inventor_name*'] || row['inventor_name'],
            inventor_addr: row['inventor_addr*'] || row['inventor_addr']
          }
        ]
      };

      if (patent.fer_status === 1) {
        patent.fer_drafter_assgn = row['fer_drafter_assgn'] || null;
        patent.fer_drafter_deadline = row['fer_drafter_deadline'] || null;
        patent.fer_filer_assgn = row['fer_filer_assgn'] || null;
        patent.fer_filer_deadline = row['fer_filer_deadline'] || null;
      }

      const dateFields = ['date_of_filing', 'ps_drafter_deadline', 'ps_filer_deadline', 'cs_drafter_deadline', 'cs_filer_deadline', 'fer_drafter_deadline', 'fer_filer_deadline'];
      for (const field of dateFields) {
        if (patent[field as keyof PatentFormData] && !/^\d{4}-\d{2}-\d{2}$/.test(patent[field as keyof PatentFormData] as string)) {
          throw new Error(`Invalid date format for ${field}. Use YYYY-MM-DD format.`);
        }
      }

      for (let j = 2; j <= 10; j++) {
        const nameField = `inventor_name${j}`;
        const addrField = `inventor_addr${j}`;
        
        if ((row[nameField] || row[`${nameField}*`]) && (row[addrField] || row[`${addrField}*`])) {
          patent.inventors.push({
            inventor_name: row[`${nameField}*`] || row[nameField],
            inventor_addr: row[`${addrField}*`] || row[addrField]
          });
        }
      }

      const employeeFields = [
        { field: 'ps_drafter_assgn', value: patent.ps_drafter_assgn },
        { field: 'ps_filer_assgn', value: patent.ps_filer_assgn },
        { field: 'cs_drafter_assgn', value: patent.cs_drafter_assgn },
        { field: 'cs_filer_assgn', value: patent.cs_filer_assgn },
        { field: 'fer_drafter_assgn', value: patent.fer_drafter_assgn },
        { field: 'fer_filer_assgn', value: patent.fer_filer_assgn }
      ];

      for (const { field, value } of employeeFields) {
        if (value) {
          employeeValidationPromises.push(
            validateEmployeeExistence(value).then(isValid => ({
              rowIndex,
              field,
              employeeName: value as string,
              isValid
            }))
          );
        }
      }

      patentData.push(patent);
    } catch (error) {
      console.error(`Error in row ${rowIndex}:`, error);
      errors.push(`Row ${rowIndex}: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  const employeeValidationResults = await Promise.all(employeeValidationPromises);
  
  for (const result of employeeValidationResults) {
    if (!result.isValid) {
      errors.push(`Row ${result.rowIndex}: Employee "${result.employeeName}" assigned to ${result.field} does not exist in the system.`);
    }
  }

  const validPatentData = patentData.filter((patent, index) => {
    const rowIndex = index + 2;
    return !employeeValidationResults.some(result => 
      result.rowIndex === rowIndex && !result.isValid
    );
  });

  return { patentData: validPatentData, errors };
};

export const downloadPatentsDatabase = (patents: any[]) => {
  const processedData = patents.map(patent => {
    return {
      'Tracking ID': patent.tracking_id || '',
      'Patent Applicant': patent.patent_applicant || '',
      'Client ID': patent.client_id || '',
      'Patent Title': patent.patent_title || '',
      'Application No': patent.application_no || '',
      'Date of Filing': patent.date_of_filing || '',
      'Applicant Address': patent.applicant_addr || '',
      'Inventor Phone': patent.inventor_ph_no || '',
      'Inventor Email': patent.inventor_email || '',
      'PS Drafter': patent.ps_drafter_assgn || '',
      'PS Drafter Deadline': patent.ps_drafter_deadline || '',
      'PS Drafting Status': patent.ps_drafting_status ? 'Completed' : 'Pending',
      'PS Filer': patent.ps_filer_assgn || '',
      'PS Filer Deadline': patent.ps_filer_deadline || '',
      'PS Filing Status': patent.ps_filing_status ? 'Completed' : 'Pending',
      'PS Completion': patent.ps_completion_status ? 'Completed' : 'Pending',
      'CS Drafter': patent.cs_drafter_assgn || '',
      'CS Drafter Deadline': patent.cs_drafter_deadline || '',
      'CS Drafting Status': patent.cs_drafting_status ? 'Completed' : 'Pending',
      'CS Filer': patent.cs_filer_assgn || '',
      'CS Filer Deadline': patent.cs_filer_deadline || '',
      'CS Filing Status': patent.cs_filing_status ? 'Completed' : 'Pending',
      'CS Completion': patent.cs_completion_status ? 'Completed' : 'Pending',
      'FER Status': patent.fer_status ? 'Active' : 'Not Required',
      'FER Drafter': patent.fer_drafter_assgn || '',
      'FER Drafter Deadline': patent.fer_drafter_deadline || '',
      'FER Filing Status': patent.fer_filing_status ? 'Completed' : 'Pending',
      'Form 9': patent.form_9 ? 'Yes' : 'No',
      'Form 9a': patent.form_9a ? 'Yes' : 'No',
      'Form 13': patent.form_13 ? 'Yes' : 'No',
      'Form 18': patent.form_18 ? 'Yes' : 'No',
      'Form 18a': patent.form_18a ? 'Yes' : 'No',
      'Form 26': patent.form_26 ? 'Yes' : 'No',
      'Created At': patent.created_at || '',
      'Updated At': patent.updated_at || ''
    };
  });

  const ws = XLSX.utils.json_to_sheet(processedData);
  
  const wscols = Object.keys(processedData[0] || {}).map(() => ({ wch: 20 }));
  ws['!cols'] = wscols;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Patents Database');

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
  XLSX.writeFile(wb, `patents_database_${timestamp}.xlsx`);
  
  return true;
};
