
import { supabase } from "@/integrations/supabase/client";

// Function to update patent payment information
export const updatePatentPayment = async (
  patentId: string,
  paymentData: {
    payment_status?: string;
    payment_amount?: number;
    payment_received?: number;
    invoice_sent?: boolean;
  }
) => {
  try {
    const { error } = await supabase
      .from("patents")
      .update(paymentData)
      .eq("id", patentId);

    if (error) {
      console.error("Error updating patent payment:", error);
      return { success: false, message: error.message };
    }

    return { success: true, message: "Payment information updated successfully" };
  } catch (error: any) {
    console.error("Error in updatePatentPayment:", error);
    return { success: false, message: error.message || "An unexpected error occurred" };
  }
};
