
import React, { useState } from 'react';
import { Patent } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { updatePatent } from '@/lib/api/patent-api';
import { toast } from 'sonner';
import { CreditCard, Edit, Save, X } from 'lucide-react';

interface PaymentStatusSectionProps {
  patent: Patent;
  userRole?: string;
  refreshPatentData: () => void;
}

const PaymentStatusSection: React.FC<PaymentStatusSectionProps> = ({
  patent,
  userRole,
  refreshPatentData,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    professional_fees: patent.professional_fees || 0,
    reimbursement: patent.reimbursement || 0,
    invoice_status: patent.invoice_status || 'not_sent',
    payment_status: patent.payment_status || 'not_sent',
    payment_received: patent.payment_received || 0,
    date_of_receipt: patent.date_of_receipt || '',
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'complete':
        return 'bg-green-100 text-green-800';
      case 'partial':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-blue-100 text-blue-800';
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      const gst = Number(formData.professional_fees) * 0.18;
      const tds = Number(formData.professional_fees) * 0.10;
      const invoiceAmount = Number(formData.professional_fees) + gst + Number(formData.reimbursement);
      const expectedAmount = invoiceAmount - tds;

      const updateData = {
        professional_fees: Number(formData.professional_fees),
        reimbursement: Number(formData.reimbursement),
        gst_amount: gst,
        tds_amount: tds,
        payment_amount: invoiceAmount,
        expected_amount: expectedAmount,
        invoice_status: formData.invoice_status,
        payment_status: formData.payment_status,
        payment_received: Number(formData.payment_received),
        date_of_receipt: formData.date_of_receipt || null,
      };

      const result = await updatePatent(patent.id, updateData);
      
      if (result.success) {
        toast.success('Payment information updated successfully');
        setIsEditing(false);
        refreshPatentData();
      } else {
        toast.error(result.message || 'Failed to update payment information');
      }
    } catch (error) {
      console.error('Error updating payment information:', error);
      toast.error('An error occurred while updating payment information');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      professional_fees: patent.professional_fees || 0,
      reimbursement: patent.reimbursement || 0,
      invoice_status: patent.invoice_status || 'not_sent',
      payment_status: patent.payment_status || 'not_sent',
      payment_received: patent.payment_received || 0,
      date_of_receipt: patent.date_of_receipt || '',
    });
    setIsEditing(false);
  };

  // Calculate amounts for display
  const gstAmount = (patent.professional_fees || 0) * 0.18;
  const tdsAmount = (patent.professional_fees || 0) * 0.10;
  const invoiceAmount = (patent.professional_fees || 0) + gstAmount + (patent.reimbursement || 0);
  const expectedAmount = invoiceAmount - tdsAmount;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Payment Status
        </CardTitle>
        {userRole === 'admin' && !isEditing && (
          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {isEditing && userRole === 'admin' ? (
          // Edit Mode
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Professional Fees (PF)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.professional_fees}
                  onChange={(e) => handleInputChange('professional_fees', e.target.value)}
                />
              </div>
              <div>
                <Label>Reimbursement</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.reimbursement}
                  onChange={(e) => handleInputChange('reimbursement', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Invoice Status</Label>
                <Select value={formData.invoice_status} onValueChange={(value) => handleInputChange('invoice_status', value)}>
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
                <Select value={formData.payment_status} onValueChange={(value) => handleInputChange('payment_status', value)}>
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Amount Received</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.payment_received}
                  onChange={(e) => handleInputChange('payment_received', e.target.value)}
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

            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={isSubmitting}>
                <Save className="h-4 w-4 mr-2" />
                {isSubmitting ? 'Saving...' : 'Save'}
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          // View Mode
          <div className="space-y-4">
            {/* Financial Breakdown */}
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <h4 className="font-medium">Financial Breakdown</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span>Professional Fees (PF):</span>
                  <span>{formatCurrency(patent.professional_fees || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Reimbursement:</span>
                  <span>{formatCurrency(patent.reimbursement || 0)}</span>
                </div>
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
                  <span>Expected to Receive:</span>
                  <span className="text-green-600">{formatCurrency(expectedAmount)}</span>
                </div>
              </div>
            </div>

            {/* Status Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Invoice Status</Label>
                <div className="mt-1">
                  <Badge className={getStatusBadgeColor(patent.invoice_status || 'not_sent')}>
                    {patent.invoice_status?.replace('_', ' ').toUpperCase() || 'NOT SENT'}
                  </Badge>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Payment Status</Label>
                <div className="mt-1">
                  <Badge className={getStatusBadgeColor(patent.payment_status || 'not_sent')}>
                    {patent.payment_status?.replace('_', ' ').toUpperCase() || 'NOT SENT'}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Payment Details */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Amount Received</Label>
                <p className="text-lg font-semibold text-green-600">
                  {formatCurrency(patent.payment_received || 0)}
                </p>
              </div>
              {patent.date_of_receipt && (
                <div>
                  <Label className="text-sm font-medium">Date of Receipt</Label>
                  <p className="text-sm text-gray-600">
                    {new Date(patent.date_of_receipt).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>

            {/* Outstanding Amount */}
            {(patent.payment_received || 0) < expectedAmount && (
              <div className="bg-yellow-50 p-3 rounded-lg">
                <Label className="text-sm font-medium text-yellow-800">Outstanding Amount</Label>
                <p className="text-lg font-semibold text-yellow-700">
                  {formatCurrency(expectedAmount - (patent.payment_received || 0))}
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentStatusSection;
