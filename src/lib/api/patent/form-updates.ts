
import { supabase } from "@/integrations/supabase/client";

// Update patent forms
export const updatePatentForms = async (patentId: string, formData: Record<string, boolean>) => {
  try {
    const { data, error } = await supabase
      .from('patents')
      .update(formData)
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
