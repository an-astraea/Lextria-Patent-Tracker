
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { updatePatentStatus, updatePatentPayment } from '@/lib/api';
import { Patent, PaymentStatusSectionProps } from '@/lib/types';
import StatusBadge from '../StatusBadge';

const PaymentStatusSection: React.FC<PaymentStatusSectionProps> = ({ 
  patent, 
  onUpdate,
  isAdmin = false,
  userRole,
  refreshPatentData
}) => {
  const [status, setStatus] = useState<string>(String(patent.payment_status || '0'));
  const [amount, setAmount] = useState<string>(String(patent.payment_amount || '0'));
  const [received, setReceived] = useState<string>(String(patent.payment_received || '0'));
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const getStatusLabel = (status: string | number) => {
    switch (status) {
      case 0:
      case '0':
      case 'not_sent': return 'Invoice Not Sent';
      case 1:
      case '1':
      case 'sent': return 'Invoice Sent';
      case 2:
      case '2':
      case 'partially_paid': return 'Partially Paid';
      case 3:
      case '3':
      case 'fully_paid': return 'Fully Paid';
      default: return 'Unknown';
    }
  };
  
  const getStatusVariant = (status: string | number) => {
    switch (status) {
      case 0:
      case '0':
      case 'not_sent': return 'outline';
      case 1:
      case '1':
      case 'sent': return 'secondary';
      case 2:
      case '2':
      case 'partially_paid': return 'warning';
      case 3:
      case '3':
      case 'fully_paid': return 'success';
      default: return 'outline';
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAdmin && userRole !== 'admin') {
      toast.error('Only admins can update payment status');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Convert string values to appropriate types for the API
      const statusStr = status;
      const amountNum = parseFloat(amount);
      const receivedNum = parseFloat(received);
      
      // First update the payment status
      const statusResult = await updatePatentStatus(patent.id, 'payment_status', statusStr as any);
      
      if (!statusResult.success) {
        toast.error('Failed to update payment status');
        return;
      }
      
      // Then update the payment details
      const paymentResult = await updatePatentPayment(patent.id, {
        payment_status: statusStr,
        payment_amount: amountNum,
        payment_received: receivedNum
      });
      
      if (paymentResult.success) {
        toast.success('Payment status updated');
        if (refreshPatentData) {
          refreshPatentData();
        } else if (onUpdate) {
          onUpdate();
        }
      } else {
        toast.error('Failed to update payment details');
      }
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast.error('An error occurred while updating payment status');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const calculatePercentage = () => {
    const amountNum = parseFloat(amount);
    const receivedNum = parseFloat(received);
    
    if (isNaN(amountNum) || amountNum === 0) return 0;
    return Math.round((receivedNum / amountNum) * 100);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Payment Status</span>
          <StatusBadge 
            status={getStatusLabel(patent.payment_status || 0)} 
            variant={getStatusVariant(patent.payment_status || 0)}
          />
        </CardTitle>
        <CardDescription>Track payment status and amounts</CardDescription>
      </CardHeader>
      <CardContent>
        {isAdmin ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Payment Status</label>
              <Select 
                value={status} 
                onValueChange={setStatus}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not_sent">Invoice Not Sent</SelectItem>
                  <SelectItem value="sent">Invoice Sent</SelectItem>
                  <SelectItem value="partially_paid">Partially Paid</SelectItem>
                  <SelectItem value="fully_paid">Fully Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Total Amount</label>
                <Input 
                  type="number" 
                  value={amount} 
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  disabled={isSubmitting}
                  min="0"
                  step="0.01"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Amount Received</label>
                <Input 
                  type="number" 
                  value={received} 
                  onChange={(e) => setReceived(e.target.value)}
                  placeholder="0.00"
                  disabled={isSubmitting}
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : 'Update Payment Status'}
            </Button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Amount</p>
                <p className="text-xl font-bold">
                  {patent.payment_amount ? new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'INR'
                  }).format(patent.payment_amount) : 'Not set'}
                </p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Amount Received</p>
                <p className="text-xl font-bold">
                  {patent.payment_received ? new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'INR'
                  }).format(patent.payment_received) : 'Not set'}
                </p>
              </div>
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Progress</p>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-green-600 h-2.5 rounded-full" 
                  style={{ width: `${calculatePercentage()}%` }}
                ></div>
              </div>
              <p className="text-xs text-right mt-1 text-gray-500">
                {calculatePercentage()}% complete
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentStatusSection;
