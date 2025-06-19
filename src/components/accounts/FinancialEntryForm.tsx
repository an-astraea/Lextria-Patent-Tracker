
import React, { useState, useEffect } from 'react';
import { Patent } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { updatePatent } from '@/lib/api/patent-api';
import { toast } from 'sonner';
import { Calculator, Save } from 'lucide-react';

interface FinancialEntryFormProps {
  patent: Patent;
}

const FinancialEntryForm: React.FC<FinancialEntryFormProps> = ({ patent }) => {
  const [formData, setFormData] = useState({
    professional_fees: patent.professional_fees || 0,
    reimbursement: patent.reimbursement || 0,
    payment_status: patent.payment_status || 'not_sent',
    payment_received: patent.payment_received || 0,
    invoice_sent: patent.invoice_sent || false,
  });

  const [calculatedAmounts, setCalculatedAmounts] = useState({
    gst_amount: 0,
    tds_amount: 0,
    total_amount: 0,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate GST, TDS, and total amount whenever professional fees or reimbursement change
  useEffect(() => {
    const professionalFees = Number(formData.professional_fees) || 0;
    const reimbursement = Number(formData.reimbursement) || 0;
    
    const gst = professionalFees * 0.18; // 18% GST
    const tds = professionalFees * 0.10; // 10% TDS
    const total = professionalFees + gst + reimbursement - tds;

    setCalculatedAmounts({
      gst_amount: gst,
      tds_amount: tds,
      total_amount: total,
    });
  }, [formData.professional_fees, formData.reimbursement]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const updateData = {
        professional_fees: Number(formData.professional_fees),
        reimbursement: Number(formData.reimbursement),
        payment_status: formData.payment_status,
        payment_received: Number(formData.payment_received),
        invoice_sent: formData.invoice_sent,
      };

      const result = await updatePatent(patent.id, updateData);
      
      if (result.success) {
        toast.success('Financial information updated successfully');
      } else {
        toast.error(result.message || 'Failed to update financial information');
      }
    } catch (error: any) {
      console.error('Error updating financial data:', error);
      toast.error('An error occurred while updating financial information');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Financial Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Input Fields */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="professional_fees">Professional Fees (₹)</Label>
              <Input
                id="professional_fees"
                type="number"
                step="0.01"
                value={formData.professional_fees}
                onChange={(e) => handleInputChange('professional_fees', e.target.value)}
                placeholder="Enter professional fees"
              />
            </div>

            <div>
              <Label htmlFor="reimbursement">Reimbursement (₹)</Label>
              <Input
                id="reimbursement"
                type="number"
                step="0.01"
                value={formData.reimbursement}
                onChange={(e) => handleInputChange('reimbursement', e.target.value)}
                placeholder="Enter reimbursement amount"
              />
            </div>
          </div>

          {/* Auto-calculated Fields */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <h4 className="font-medium text-gray-900">Auto-Calculated Amounts</h4>
            <div className="grid grid-cols-1 gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">GST (18%):</span>
                <span className="font-medium">{formatCurrency(calculatedAmounts.gst_amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">TDS (10%):</span>
                <span className="font-medium text-red-600">-{formatCurrency(calculatedAmounts.tds_amount)}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="font-medium">Total Amount:</span>
                <span className="font-bold text-green-600">{formatCurrency(calculatedAmounts.total_amount)}</span>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="payment_status">Payment Status</Label>
              <Select 
                value={formData.payment_status} 
                onValueChange={(value) => handleInputChange('payment_status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not_sent">Invoice Not Sent</SelectItem>
                  <SelectItem value="sent">Invoice Sent</SelectItem>
                  <SelectItem value="received">Payment Received</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="payment_received">Payment Received (₹)</Label>
              <Input
                id="payment_received"
                type="number"
                step="0.01"
                value={formData.payment_received}
                onChange={(e) => handleInputChange('payment_received', e.target.value)}
                placeholder="Enter received amount"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="invoice_sent"
                checked={formData.invoice_sent}
                onCheckedChange={(checked) => handleInputChange('invoice_sent', checked)}
              />
              <Label htmlFor="invoice_sent">Invoice Sent</Label>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting}
          >
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Updating...' : 'Update Financial Information'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default FinancialEntryForm;
