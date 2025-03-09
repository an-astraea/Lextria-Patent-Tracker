
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Patent, PaymentStatusSectionProps } from '@/lib/types';
import { updatePatentStatus, updatePatentPayment } from '@/lib/api';
import { toast } from 'sonner';
import { DollarSign, Receipt, CreditCard } from 'lucide-react';

const PaymentStatusSection: React.FC<PaymentStatusSectionProps> = ({
  patent,
  onUpdate,
  isAdmin = false,
  userRole,
  refreshPatentData
}) => {
  const [invoiceSent, setInvoiceSent] = useState(patent.invoice_sent || false);
  const [paymentStatus, setPaymentStatus] = useState(patent.payment_status || 'not_sent');
  const [paymentAmount, setPaymentAmount] = useState(patent.payment_amount?.toString() || '');
  const [receivedAmount, setReceivedAmount] = useState(patent.payment_received?.toString() || '');
  const [updating, setUpdating] = useState(false);

  const isAdminUser = userRole === 'admin' || isAdmin;

  const handleToggleInvoice = async () => {
    setUpdating(true);
    try {
      const result = await updatePatentStatus(patent.id, 'invoice_sent', !invoiceSent);
      if (result.success) {
        setInvoiceSent(!invoiceSent);
        toast.success(`Invoice marked as ${!invoiceSent ? 'sent' : 'not sent'}`);
        if (onUpdate) onUpdate();
        if (refreshPatentData) refreshPatentData();
      }
    } catch (error) {
      console.error('Error updating invoice status:', error);
      toast.error('Failed to update invoice status');
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdatePayment = async () => {
    setUpdating(true);
    try {
      const paymentData = {
        payment_status: paymentStatus,
        payment_amount: parseFloat(paymentAmount) || 0,
        payment_received: parseFloat(receivedAmount) || 0
      };
      
      const result = await updatePatentPayment(patent.id, paymentData);
      if (result.success) {
        toast.success('Payment details updated');
        if (onUpdate) onUpdate();
        if (refreshPatentData) refreshPatentData();
      }
    } catch (error) {
      console.error('Error updating payment details:', error);
      toast.error('Failed to update payment details');
    } finally {
      setUpdating(false);
    }
  };

  const renderPaymentStatus = () => {
    switch (paymentStatus) {
      case 'not_sent':
        return <Badge variant="outline" className="bg-gray-100">Payment Not Initiated</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-amber-100 text-amber-800">Payment Pending</Badge>;
      case 'partial':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Partial Payment</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Payment Completed</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-100">Unknown</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Payment Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm font-medium">Invoice Status</p>
            <Badge variant={invoiceSent ? "success" : "secondary"}>
              {invoiceSent ? 'Invoice Sent' : 'Invoice Not Sent'}
            </Badge>
          </div>
          {isAdminUser && (
            <div className="flex items-center space-x-2">
              <Switch
                checked={invoiceSent}
                onCheckedChange={handleToggleInvoice}
                disabled={updating}
              />
              <Label htmlFor="invoice-sent">{invoiceSent ? 'Sent' : 'Not Sent'}</Label>
            </div>
          )}
        </div>

        <div>
          <p className="text-sm font-medium mb-1">Payment Status</p>
          {renderPaymentStatus()}
        </div>

        {(patent.payment_amount || isAdminUser) && (
          <div className="flex justify-between gap-4">
            <div className="w-1/2">
              <p className="text-sm font-medium mb-1">Amount</p>
              <p className="font-semibold">
                ₹{patent.payment_amount ? patent.payment_amount.toLocaleString() : '0'}
              </p>
            </div>
            <div className="w-1/2">
              <p className="text-sm font-medium mb-1">Received</p>
              <p className="font-semibold">
                ₹{patent.payment_received ? patent.payment_received.toLocaleString() : '0'}
              </p>
            </div>
          </div>
        )}

        {isAdminUser && (
          <div className="space-y-4 pt-4 border-t">
            <h4 className="font-medium">Update Payment Details</h4>
            <div className="space-y-2">
              <Label htmlFor="payment-status">Payment Status</Label>
              <Select
                value={paymentStatus}
                onValueChange={setPaymentStatus}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not_sent">Not Initiated</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="partial">Partial Payment</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment-amount">Total Amount (₹)</Label>
              <Input
                id="payment-amount"
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder="Enter amount"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="received-amount">Received Amount (₹)</Label>
              <Input
                id="received-amount"
                type="number"
                value={receivedAmount}
                onChange={(e) => setReceivedAmount(e.target.value)}
                placeholder="Enter received amount"
              />
            </div>

            <Button
              className="w-full"
              onClick={handleUpdatePayment}
              disabled={updating}
            >
              Update Payment Details
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentStatusSection;
