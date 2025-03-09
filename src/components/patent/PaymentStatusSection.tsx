
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { updatePatentPayment } from '@/lib/api';
import { Patent, PaymentStatusSectionProps } from '@/lib/types';

const PaymentStatusSection: React.FC<PaymentStatusSectionProps> = ({ 
  patent, 
  onUpdate, 
  isAdmin = false,
  userRole,
  refreshPatentData
}) => {
  const [paymentAmount, setPaymentAmount] = useState(patent.payment_amount?.toString() || '0');
  const [paymentReceived, setPaymentReceived] = useState(patent.payment_received?.toString() || '0');
  const [paymentStatus, setPaymentStatus] = useState(patent.payment_status || 'not_sent');
  const [invoiceSent, setInvoiceSent] = useState(patent.invoice_sent || false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePaymentUpdate = async () => {
    if (!isAdmin) return;
    
    try {
      setIsSubmitting(true);
      
      const response = await updatePatmentPayment(patent.id, {
        payment_status: paymentStatus,
        payment_amount: parseFloat(paymentAmount) || 0,
        payment_received: parseFloat(paymentReceived) || 0,
        invoice_sent: invoiceSent
      });
      
      if (response.success) {
        toast.success('Payment information updated successfully');
        if (refreshPatentData) {
          await refreshPatentData();
        }
        if (onUpdate) {
          onUpdate();
        }
      } else {
        toast.error('Failed to update payment information');
      }
    } catch (error) {
      console.error('Error updating payment:', error);
      toast.error('An error occurred while updating payment information');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPaymentStatusLabel = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-500">Paid</Badge>;
      case 'partial':
        return <Badge className="bg-yellow-500">Partial</Badge>;
      case 'pending':
        return <Badge className="bg-blue-500">Pending</Badge>;
      case 'not_sent':
      default:
        return <Badge variant="outline">Not Sent</Badge>;
    }
  };

  const getPaymentProgress = () => {
    const amount = parseFloat(paymentAmount) || 0;
    const received = parseFloat(paymentReceived) || 0;
    
    if (amount === 0) return 0;
    return Math.min(100, (received / amount) * 100);
  };

  return (
    <Card className="bg-white shadow-md rounded-lg overflow-hidden">
      <CardHeader className="px-6 py-4">
        <CardTitle className="text-lg font-semibold text-gray-800">Payment Status</CardTitle>
        <CardDescription className="text-sm text-gray-500">Manage payment information</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-medium text-gray-700">Status:</span>
            {getPaymentStatusLabel(patent.payment_status || 'not_sent')}
          </div>
          
          <div className="flex items-center justify-between">
            <span className="font-medium text-gray-700">Invoice Sent:</span>
            <Badge variant={patent.invoice_sent ? "default" : "outline"}>
              {patent.invoice_sent ? 'Yes' : 'No'}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="font-medium text-gray-700">Amount:</span>
            <span>{patent.payment_amount ? `$${patent.payment_amount}` : 'Not set'}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="font-medium text-gray-700">Received:</span>
            <span>{patent.payment_received ? `$${patent.payment_received}` : '$0'}</span>
          </div>
          
          {isAdmin && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <h4 className="font-medium text-gray-700 mb-3">Update Payment Information</h4>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="payment-amount">Amount ($)</Label>
                    <Input
                      id="payment-amount"
                      type="number"
                      min="0"
                      step="0.01"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="payment-received">Received ($)</Label>
                    <Input
                      id="payment-received"
                      type="number"
                      min="0"
                      step="0.01"
                      value={paymentReceived}
                      onChange={(e) => setPaymentReceived(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="payment-status">Payment Status</Label>
                  <select 
                    id="payment-status"
                    className="w-full p-2 border border-gray-300 rounded"
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value)}
                  >
                    <option value="not_sent">Not Sent</option>
                    <option value="pending">Pending</option>
                    <option value="partial">Partial</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="invoice-sent"
                    checked={invoiceSent}
                    onCheckedChange={setInvoiceSent}
                  />
                  <Label htmlFor="invoice-sent">Invoice Sent</Label>
                </div>
                
                <Button
                  onClick={handlePaymentUpdate}
                  disabled={isSubmitting}
                  className="w-full mt-2"
                >
                  {isSubmitting ? 'Updating...' : 'Update Payment Information'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Fix a typo in the function name used above
const updatePatmentPayment = (id: string, paymentData: any) => {
  return updatePatentPayment(id, paymentData);
};

export default PaymentStatusSection;
