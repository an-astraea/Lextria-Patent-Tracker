
import React, { useState, useEffect } from 'react';
import { Patent } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { updatePatent } from '@/lib/api/patent-api';
import { toast } from 'sonner';
import { Calculator, Save, DollarSign, CheckCircle } from 'lucide-react';
import LoadingState from '@/components/common/LoadingState';

interface FinancialEntryFormProps {
  patent: Patent;
}

const FinancialEntryForm: React.FC<FinancialEntryFormProps> = ({ patent }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState({
    professional_fees: patent.professional_fees || 0,
    reimbursement: patent.reimbursement || 0,
    invoice_status: patent.invoice_status || 'not_sent',
    payment_status: patent.payment_status || 'not_sent',
    payment_received: patent.payment_received || 0,
    date_of_receipt: patent.date_of_receipt || '',
  });

  useEffect(() => {
    setFormData({
      professional_fees: patent.professional_fees || 0,
      reimbursement: patent.reimbursement || 0,
      invoice_status: patent.invoice_status || 'not_sent',
      payment_status: patent.payment_status || 'not_sent',
      payment_received: patent.payment_received || 0,
      date_of_receipt: patent.date_of_receipt || '',
    });
  }, [patent]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  // Calculate amounts in real-time
  const gstAmount = Number(formData.professional_fees) * 0.18;
  const tdsAmount = Number(formData.professional_fees) * 0.10;
  const invoiceAmount = Number(formData.professional_fees) + gstAmount + Number(formData.reimbursement);
  const expectedAmount = invoiceAmount - tdsAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const updateData = {
        professional_fees: Number(formData.professional_fees),
        reimbursement: Number(formData.reimbursement),
        gst_amount: gstAmount,
        tds_amount: tdsAmount,
        payment_amount: invoiceAmount,
        expected_amount: expectedAmount,
        invoice_status: formData.invoice_status,
        payment_status: formData.payment_status,
        payment_received: Number(formData.payment_received),
        date_of_receipt: formData.date_of_receipt || null,
        // Also update the legacy invoice_sent field for compatibility
        invoice_sent: formData.invoice_status === 'sent',
      };

      const result = await updatePatent(patent.id, updateData);
      
      if (result.success) {
        toast.success('Financial information updated successfully');
        setIsUpdating(true);
        
        // Show loading for 2 seconds before refresh
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        toast.error(result.message || 'Failed to update financial information');
      }
    } catch (error) {
      console.error('Error updating financial information:', error);
      toast.error('An error occurred while updating financial information');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state after successful update
  if (isUpdating) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-center space-y-4">
            <CheckCircle className="h-12 w-12 text-green-500" />
            <h3 className="text-lg font-semibold">Update Successful!</h3>
            <p className="text-gray-600 text-center">Financial information has been updated successfully.</p>
            <LoadingState size="md" text="Refreshing data..." />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Financial Entry
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Financial Amounts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Professional Fees (PF)</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.professional_fees}
                onChange={(e) => handleInputChange('professional_fees', e.target.value)}
                placeholder="Enter professional fees"
              />
            </div>
            <div>
              <Label>Reimbursement</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.reimbursement}
                onChange={(e) => handleInputChange('reimbursement', e.target.value)}
                placeholder="Enter reimbursement amount"
              />
            </div>
          </div>

          {/* Calculated Amounts Display */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <h4 className="font-medium flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Calculated Amounts
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span>GST (18%):</span>
                <span>{formatCurrency(gstAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span>TDS (10%):</span>
                <span className="text-red-600">-{formatCurrency(tdsAmount)}</span>
              </div>
              <div className="flex justify-between font-medium border-t pt-2">
                <span>Invoice Amount:</span>
                <span className="text-blue-600">{formatCurrency(invoiceAmount)}</span>
              </div>
              <div className="flex justify-between font-medium border-t pt-2">
                <span>Expected Amount:</span>
                <span className="text-green-600">{formatCurrency(expectedAmount)}</span>
              </div>
            </div>
          </div>

          {/* Status Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Invoice Status</Label>
              <Select 
                value={formData.invoice_status} 
                onValueChange={(value) => handleInputChange('invoice_status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not_sent">Not Sent</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Payment Status</Label>
              <Select 
                value={formData.payment_status} 
                onValueChange={(value) => handleInputChange('payment_status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not_sent">Not Sent</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                  <SelectItem value="complete">Complete</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Payment Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Amount Received</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.payment_received}
                onChange={(e) => handleInputChange('payment_received', e.target.value)}
                placeholder="Enter amount received"
              />
            </div>
            <div>
              <Label>Date of Receipt</Label>
              <Input
                type="date"
                value={formData.date_of_receipt}
                onChange={(e) => handleInputChange('date_of_receipt', e.target.value)}
              />
            </div>
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Saving...' : 'Save Financial Information'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default FinancialEntryForm;
