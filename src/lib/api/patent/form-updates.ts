import { supabase } from "@/integrations/supabase/client";

/**
 * Updates form fields for a patent
 * @param patentId - ID of the patent to update
 * @param formData - Object containing form field values
 * @returns Object with success status and message
 */
export const updatePatentForms = async (patentId: string, formData: Record<string, boolean>) => {
  try {
    // Convert boolean values to database format if needed
    const formDataForDb: Record<string, boolean | number> = {};
    
    Object.entries(formData).forEach(([key, value]) => {
      // Keep the original boolean values
      formDataForDb[key] = value;
    });
    
    const { data, error } = await supabase
      .from('patents')
      .update(formDataForDb)
      .eq('id', patentId)
      .select();
    
    if (error) {
      console.error('Error updating patent forms:', error);
      return { success: false, message: error.message };
    }
    
    return { success: true, message: 'Patent forms updated successfully' };
  } catch (error: any) {
    console.error('Error in updatePatentForms:', error);
    return { success: false, message: error.message || 'An unexpected error occurred' };
  }
};
