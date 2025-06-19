
-- Add new financial columns to the patents table
ALTER TABLE public.patents 
ADD COLUMN professional_fees NUMERIC DEFAULT 0.00,
ADD COLUMN gst_amount NUMERIC DEFAULT 0.00,
ADD COLUMN tds_amount NUMERIC DEFAULT 0.00,
ADD COLUMN reimbursement NUMERIC DEFAULT 0.00;

-- Create a trigger function to auto-calculate GST and TDS
CREATE OR REPLACE FUNCTION calculate_financial_components()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-calculate GST (18% of professional fees)
  IF NEW.professional_fees IS NOT NULL THEN
    NEW.gst_amount := NEW.professional_fees * 0.18;
  END IF;
  
  -- Auto-calculate TDS (10% of professional fees)
  IF NEW.professional_fees IS NOT NULL THEN
    NEW.tds_amount := NEW.professional_fees * 0.10;
  END IF;
  
  -- Update total payment_amount (professional_fees + gst + reimbursement - tds)
  NEW.payment_amount := COALESCE(NEW.professional_fees, 0) + 
                       COALESCE(NEW.gst_amount, 0) + 
                       COALESCE(NEW.reimbursement, 0) - 
                       COALESCE(NEW.tds_amount, 0);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-calculate financial components
CREATE TRIGGER calculate_financial_components_trigger
  BEFORE INSERT OR UPDATE ON public.patents
  FOR EACH ROW
  EXECUTE FUNCTION calculate_financial_components();
