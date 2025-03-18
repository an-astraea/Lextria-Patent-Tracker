
import { supabase } from "@/integrations/supabase/client";

/**
 * Creates a new inventor
 * @param inventorData - Inventor data
 * @returns Object with success status, message, and created inventor
 */
export const createInventor = async (inventorData: { tracking_id: string; inventor_name: string; inventor_addr: string }) => {
  try {
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
      return { success: false, message: error.message, inventor: null };
    }

    return { 
      success: true, 
      message: 'Inventor created successfully', 
      inventor: data && data.length > 0 ? data[0] : null 
    };
  } catch (error: any) {
    console.error('Error creating inventor:', error);
    return { success: false, message: error.message || 'An unexpected error occurred', inventor: null };
  }
};
