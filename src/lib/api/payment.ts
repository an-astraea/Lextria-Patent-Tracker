
import { supabase } from "@/integrations/supabase/client";

/**
 * Updates payment information for a patent
 * @param patentId - ID of the patent
 * @param paymentData - Payment data to update
 * @returns Object with success status and message
 */
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
      return { success: false, message: error.message };
    }
    
    return { success: true, message: 'Patent payment updated successfully' };
  } catch (error: any) {
    console.error('Error updating patent payment:', error);
    return { success: false, message: error.message || 'An unexpected error occurred' };
  }
};
