
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Patent } from '@/lib/types';
import { updatePatentStatus, updatePatentPayment } from '@/lib/api';
import { toast } from 'sonner';
import { Loader2, IndianRupee } from 'lucide-react';

interface PaymentStatusSectionProps {
  patent: Patent;
  userRole: string;
  refreshPatentData: () => Promise<void>;
}

const PaymentStatusSection = ({ patent, userRole, refreshPatentData }: PaymentStatusSectionProps) => {
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState(patent.payment_amount?.toString() || '0');
  const [paymentReceived, setPaymentReceived] = useState(patent.payment_received?.toString() || '0');
  const [paymentStatus, setPaymentStatus] = useState(patent.payment_status || 'not_sent');
  
  const isAdmin = userRole === 'admin';
  
  const handleInvoiceToggle = async (checked: boolean) => {
    if (!isAdmin) {
      toast.error("Only administrators can change payment settings");
      return;
    }
    
    setIsUpdating('invoice_sent');
    try {
      const success = await updatePatentStatus(patent.id, 'invoice_sent', checked ? 1 : 0);
      if (success) {
        toast.success(`Invoice status updated successfully`);
        refreshPatentData();
      }
    } catch (error) {
      console.error('Error updating invoice status:', error);
      toast.error('Failed to update invoice status');
    } finally {
      setIsUpdating(null);
    }
  };
  
  const handlePaymentStatusChange = async (status: string) => {
    if (!isAdmin) {
      toast.error("Only administrators can change payment settings");
      return;
    }
    
    setIsUpdating('payment_status');
    try {
      // Update the payment status in database
      const success = await updatePatentStatus(patent.id, 'payment_status', status);
      if (success) {
        setPaymentStatus(status);
        toast.success(`Payment status updated successfully`);
        refreshPatentData();
      }
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast.error('Failed to update payment status');
    } finally {
      setIsUpdating(null);
    }
  };
  
  const handlePaymentAmountUpdate = async () => {
    if (!isAdmin) {
      toast.error("Only administrators can change payment settings");
      return;
    }
    
    setIsUpdating('payment_amount');
    try {
      const amount = parseFloat(paymentAmount);
      const received = parseFloat(paymentReceived);
      
      if (isNaN(amount)) {
        toast.error("Payment amount must be a valid number");
        return;
      }
      
      if (isNaN(received)) {
        toast.error("Payment received must be a valid number");
        return;
      }
      
      if (received > amount) {
        toast.error("Payment received cannot exceed total amount");
        return;
      }
      
      // Update both amount and received in one call
      const success = await updatePatentPayment(patent.id, amount, received);
      if (success) {
        toast.success(`Payment amounts updated successfully`);
        
        // Determine and update payment status based on amounts
        let newStatus = 'not_sent';
        if (patent.invoice_sent) {
          if (received === 0) {
            newStatus = 'invoice_sent';
          } else if (received < amount) {
            newStatus = 'partially_paid';
          } else if (received === amount) {
            newStatus = 'fully_paid';
          }
          await updatePatentStatus(patent.id, 'payment_status', newStatus);
        }
        
        refreshPatentData();
      }
    } catch (error) {
      console.error('Error updating payment amounts:', error);
      toast.error('Failed to update payment amounts');
    } finally {
      setIsUpdating(null);
    }
  };
  
  // Calculate payment completion percentage
  const paymentPercentage = 
    patent.payment_amount && patent.payment_amount > 0 
      ? Math.round((patent.payment_received || 0) / patent.payment_amount * 100) 
      : 0;
  
  // Get a display label for the payment status
  const getPaymentStatusLabel = (status: string) => {
    switch (status) {
      case 'not_sent': return 'Not Sent';
      case 'invoice_sent': return 'Invoice Sent';
      case 'partially_paid': return 'Partially Paid';
      case 'fully_paid': return 'Fully Paid';
      default: return status;
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Status</CardTitle>
        <CardDescription>Track invoice and payment status for this patent</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between py-2 space-x-2">
          <div className="space-y-0.5">
            <Label htmlFor="invoice_sent">Invoice Sent</Label>
            <p className="text-xs text-muted-foreground">Mark when the invoice has been sent to the client</p>
          </div>
          <div className="flex items-center">
            {isUpdating === 'invoice_sent' ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            <Switch
              id="invoice_sent"
              checked={patent.invoice_sent || false}
              onCheckedChange={handleInvoiceToggle}
              disabled={!isAdmin || !!isUpdating}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="payment_status">Payment Status</Label>
          <Select 
            value={paymentStatus} 
            onValueChange={handlePaymentStatusChange}
            disabled={!isAdmin || !!isUpdating}
          >
            <SelectTrigger id="payment_status" className="w-full">
              <SelectValue placeholder="Select payment status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="not_sent">Not Sent</SelectItem>
              <SelectItem value="invoice_sent">Invoice Sent</SelectItem>
              <SelectItem value="partially_paid">Partially Paid</SelectItem>
              <SelectItem value="fully_paid">Fully Paid</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="payment_amount">Total Amount</Label>
              <div className="relative">
                <IndianRupee className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="payment_amount"
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  disabled={!isAdmin || !!isUpdating}
                  className="pl-8"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="payment_received">Amount Received</Label>
              <div className="relative">
                <IndianRupee className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="payment_received"
                  type="number"
                  value={paymentReceived}
                  onChange={(e) => setPaymentReceived(e.target.value)}
                  disabled={!isAdmin || !!isUpdating}
                  className="pl-8"
                />
              </div>
            </div>
          </div>
          
          {isAdmin && (
            <Button 
              onClick={handlePaymentAmountUpdate} 
              disabled={!!isUpdating}
              size="sm"
              className="w-full"
            >
              {isUpdating === 'payment_amount' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Payment Information'
              )}
            </Button>
          )}
        </div>
        
        {/* Payment status display */}
        <div className="mt-4 p-4 bg-slate-50 rounded-md">
          <div className="flex justify-between mb-2">
            <span className="font-medium">Payment Status:</span>
            <span className="text-right">{getPaymentStatusLabel(patent.payment_status || 'not_sent')}</span>
          </div>
          
          <div className="flex justify-between mb-2">
            <span className="font-medium">Amount:</span>
            <span className="text-right">₹{patent.payment_amount?.toFixed(2) || '0.00'}</span>
          </div>
          
          <div className="flex justify-between mb-2">
            <span className="font-medium">Received:</span>
            <span className="text-right">₹{patent.payment_received?.toFixed(2) || '0.00'}</span>
          </div>
          
          <div className="mt-3">
            <div className="flex justify-between mb-1 text-sm">
              <span>Completion: {paymentPercentage}%</span>
              <span>{patent.payment_received || 0} of {patent.payment_amount || 0}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-green-600 h-2.5 rounded-full" 
                style={{ width: `${paymentPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>
        
        {!isAdmin && (
          <div className="p-3 bg-slate-100 border border-slate-200 rounded text-sm">
            <p>Note: Payment information can only be updated by administrators.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentStatusSection;
