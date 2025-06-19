
-- Add new financial fields to patents table
ALTER TABLE patents 
ADD COLUMN IF NOT EXISTS expected_amount numeric DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS invoice_status text DEFAULT 'not_sent',
ADD COLUMN IF NOT EXISTS date_of_receipt date;

-- Update existing records to have proper default values
UPDATE patents 
SET 
  expected_amount = COALESCE(payment_amount, 0) - COALESCE(tds_amount, 0),
  invoice_status = CASE 
    WHEN invoice_sent = true THEN 'sent' 
    ELSE 'not_sent' 
  END
WHERE expected_amount IS NULL OR invoice_status IS NULL;
