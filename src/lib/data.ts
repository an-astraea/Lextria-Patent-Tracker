import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  CheckSquare, 
  Upload, 
  PenTool, 
  FileCheck,
  Search,
  UserCheck,
  Building
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Employee, Patent, PatentFormData, FERHistory, FEREntry, Inventor, InventorInfo } from './types';

export const navigationItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    description: 'Overview of all patents',
    roles: ['admin', 'drafter', 'filer']
  },
  {
    title: 'Patents',
    href: '/patents',
    icon: FileText,
    description: 'View all patents',
    roles: ['admin', 'drafter', 'filer']
  },
  {
    title: 'Drafts',
    href: '/drafts',
    icon: PenTool,
    description: 'View all drafts',
    roles: ['admin', 'drafter']
  },
  {
    title: 'Filings',
    href: '/filings',
    icon: FileCheck,
    description: 'View all filings',
    roles: ['admin', 'filer']
  },
  {
    title: 'FERs',
    href: '/fers',
    icon: CheckSquare,
    description: 'View all FERs',
    roles: ['admin', 'drafter', 'filer']
  },
  {
    title: 'Employees',
    href: '/employees',
    icon: Users,
    description: 'Manage employees',
    roles: ['admin']
  },
  {
    title: 'Clients',
    href: '/clients',
    icon: UserCheck,
    description: 'Manage clients',
    roles: ['admin', 'filer']
  },
  {
    title: 'Bulk Upload',
    href: '/bulk-upload',
    icon: Upload,
    description: 'Bulk upload patents',
    roles: ['admin']
  },
  {
    title: 'Organizations',
    href: '/organizations',
    icon: Building,
    description: 'Manage organizations',
    roles: ['admin']
  }
];

export const fetchPatents = async (): Promise<Patent[]> => {
  try {
    const { data, error } = await supabase
      .from('patents')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching patents:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching patents:', error);
    return [];
  }
};

export const fetchPatentById = async (id: string): Promise<Patent | null> => {
  try {
    const { data, error } = await supabase
      .from('patents')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching patent by ID:', error);
      return null;
    }

    return data || null;
  } catch (error) {
    console.error('Error fetching patent by ID:', error);
    return null;
  }
};

export const createPatent = async (patentData: PatentFormData): Promise<Patent | null> => {
  try {
    // Prepare inventors data
    const inventorsData = patentData.inventors.map(inventor => ({
      inventor_name: inventor.inventor_name,
      inventor_addr: inventor.inventor_addr,
      tracking_id: patentData.tracking_id, // Associate with the patent's tracking ID
    }));

    const { data: patent, error: patentError } = await supabase
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
          // Ensure fer_status is correctly handled as a number (0 or 1)
          fer_status: patentData.fer_status,
          fer_drafter_assgn: patentData.fer_drafter_assgn,
          fer_drafter_deadline: patentData.fer_drafter_deadline,
          fer_filer_assgn: patentData.fer_filer_assgn,
          fer_filer_deadline: patentData.fer_filer_deadline,
          idf_sent: patentData.idf_sent,
          idf_received: patentData.idf_received,
          cs_data: patentData.cs_data,
          cs_data_received: patentData.cs_data_received,
        },
      ])
      .select()
      .single();

    if (patentError) {
      console.error('Error creating patent:', patentError);
      throw patentError;
    }

    // After creating the patent, create the inventor entries
    if (inventorsData.length > 0) {
      const { error: inventorError } = await supabase
        .from('inventors')
        .insert(inventorsData);

      if (inventorError) {
        console.error('Error creating inventors:', inventorError);
        // Optionally, you might want to handle this error by deleting the created patent
        // or taking other corrective actions.
        throw inventorError;
      }
    }

    return patent;
  } catch (error) {
    console.error('Error in createPatent:', error);
    return null;
  }
};

export const updatePatent = async (id: string, patentData: PatentFormData): Promise<boolean> => {
  try {
    // Prepare inventors data
    const inventorsData = patentData.inventors.map(inventor => ({
      inventor_name: inventor.inventor_name,
      inventor_addr: inventor.inventor_addr,
      tracking_id: patentData.tracking_id, // Associate with the patent's tracking ID
    }));

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
        idf_sent: patentData.idf_sent,
        idf_received: patentData.idf_received,
        cs_data: patentData.cs_data,
        cs_data_received: patentData.cs_data_received,
      })
      .eq('id', id);

    if (error) {
      console.error('Error updating patent:', error);
      return false;
    }

    // Handle inventors - this is a simplified example
    // In a real scenario, you'd want to handle updates, inserts, and deletes more carefully
    // to avoid data duplication or orphaned records.
    if (inventorsData.length > 0) {
        // First, delete existing inventors for this patent
        const { error: deleteError } = await supabase
            .from('inventors')
            .delete()
            .eq('tracking_id', patentData.tracking_id);

        if (deleteError) {
            console.error('Error deleting existing inventors:', deleteError);
            return false; // Or throw an error, depending on your error handling strategy
        }

        // Then, insert the new set of inventors
        const { error: insertError } = await supabase
            .from('inventors')
            .insert(inventorsData);

        if (insertError) {
            console.error('Error creating inventors:', insertError);
            return false; // Or throw an error
        }
    }

    return true;
  } catch (error) {
    console.error('Error in updatePatent:', error);
    return false;
  }
};

export const deletePatent = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('patents')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting patent:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deletePatent:', error);
    return false;
  }
};

export const fetchEmployees = async (): Promise<Employee[]> => {
  try {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching employees:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching employees:', error);
    return [];
  }
};

export const fetchEmployeeById = async (id: string): Promise<Employee | null> => {
  try {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching employee by ID:', error);
      return null;
    }

    return data || null;
  } catch (error) {
    console.error('Error fetching employee by ID:', error);
    return null;
  }
};

export const createEmployee = async (employeeData: Employee): Promise<Employee | null> => {
  try {
    const { data, error } = await supabase
      .from('employees')
      .insert([employeeData])
      .select()
      .single();

    if (error) {
      console.error('Error creating employee:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in createEmployee:', error);
    return null;
  }
};

export const updateEmployee = async (id: string, employeeData: Employee): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('employees')
      .update(employeeData)
      .eq('id', id);

    if (error) {
      console.error('Error updating employee:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in updateEmployee:', error);
    return false;
  }
};

export const deleteEmployee = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting employee:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteEmployee:', error);
    return false;
  }
};

export const fetchInventorsByPatentId = async (patentId: string): Promise<Inventor[] | null> => {
  try {
    const { data, error } = await supabase
      .from('inventors')
      .select('*')
      .eq('patent_id', patentId);

    if (error) {
      console.error('Error fetching inventors by patent ID:', error);
      return null;
    }

    return data || null;
  } catch (error) {
    console.error('Error in fetchInventorsByPatentId:', error);
    return null;
  }
};

export const createInventor = async (inventorData: InventorInfo): Promise<Inventor | null> => {
  try {
    const { data, error } = await supabase
      .from('inventors')
      .insert([inventorData])
      .select()
      .single();

    if (error) {
      console.error('Error creating inventor:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in createInventor:', error);
    return null;
  }
};

export const updateInventor = async (id: string, inventorData: InventorInfo): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('inventors')
      .update(inventorData)
      .eq('id', id);

    if (error) {
      console.error('Error updating inventor:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in updateInventor:', error);
    return false;
  }
};

export const deleteInventor = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('inventors')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting inventor:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteInventor:', error);
    return false;
  }
};

export const fetchFEREntriesByPatentId = async (patentId: string): Promise<FEREntry[]> => {
  try {
    const { data, error } = await supabase
      .from('fer_entries')
      .select('*')
      .eq('patent_id', patentId)
      .order('fer_number', { ascending: true });

    if (error) {
      console.error('Error fetching FER entries:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in fetchFEREntriesByPatentId:', error);
    return [];
  }
};

export const createFERHistory = async (ferHistoryData: Omit<FERHistory, 'id' | 'created_at'>): Promise<FERHistory | null> => {
  try {
    console.log('Creating FER history entry:', ferHistoryData);
    
    // Ensure tracking_id is provided
    if (!ferHistoryData.tracking_id) {
      throw new Error('tracking_id is required for FER history');
    }

    const { data, error } = await supabase
      .from('fer_history')
      .insert({
        tracking_id: ferHistoryData.tracking_id,
        fer_drafter_assgn: ferHistoryData.fer_drafter_assgn || null,
        fer_drafter_deadline: ferHistoryData.fer_drafter_deadline || null,
        fer_filer_assgn: ferHistoryData.fer_filer_assgn || null,
        fer_filer_deadline: ferHistoryData.fer_filer_deadline || null
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating FER history:', error);
      throw error;
    }

    return {
      id: data.id,
      patent_id: '', // Will be populated by the database
      fer_number: 1, // Default value
      date: new Date().toISOString().split('T')[0],
      action: 'Created',
      tracking_id: data.tracking_id,
      fer_drafter_assgn: data.fer_drafter_assgn,
      fer_drafter_deadline: data.fer_drafter_deadline,
      fer_filer_assgn: data.fer_filer_assgn,
      fer_filer_deadline: data.fer_filer_deadline,
      created_at: data.created_at
    };
  } catch (error) {
    console.error('Error in createFERHistory:', error);
    return null;
  }
};

export const fetchFERHistoryByPatentId = async (patentId: string): Promise<FERHistory[]> => {
  try {
    const { data, error } = await supabase
      .from('fer_history')
      .select('*')
      .eq('patent_id', patentId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching FER history:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in fetchFERHistoryByPatentId:', error);
    return [];
  }
};

export const createFEREntry = async (ferEntryData: Omit<FEREntry, 'id' | 'created_at' | 'updated_at'>): Promise<FEREntry | null> => {
  try {
    const { data, error } = await supabase
      .from('fer_entries')
      .insert([ferEntryData])
      .select()
      .single();

    if (error) {
      console.error('Error creating FER entry:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in createFEREntry:', error);
    return null;
  }
};

export const updateFEREntry = async (id: string, ferEntryData: Omit<FEREntry, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('fer_entries')
      .update(ferEntryData)
      .eq('id', id);

    if (error) {
      console.error('Error updating FER entry:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in updateFEREntry:', error);
    return false;
  }
};

export const deleteFEREntry = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('fer_entries')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting FER entry:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteFEREntry:', error);
    return false;
  }
};
