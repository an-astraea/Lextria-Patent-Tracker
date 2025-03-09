
import React, { useState } from 'react';
import { Patent, PaymentStatusSectionProps } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const PaymentStatusSection: React.FC<PaymentStatusSectionProps> = ({ 
  patent, 
  isAdmin = false, 
  userRole = '',
  refreshPatentData 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(patent.payment_status || 'Not Started');
  const [paymentAmount, setPaymentAmount] = useState(patent.payment_amount?.toString() || '');
  const [paymentReceived, setPaymentReceived] = useState(patent.payment_received?.toString() || '');

  const handleSave = async () => {
    try {
      // In a real implementation, this would make an API call to update the patent
      toast.success('Payment status updated successfully');
      setIsEditing(false);
      
      if (refreshPatentData) {
        await refreshPatentData();
      }
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast.error('Failed to update payment status');
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center">
          <DollarSign className="mr-2 h-5 w-5 text-muted-foreground" />
          Payment Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isEditing && isAdmin ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="paymentStatus">Payment Status</Label>
              <Select 
                value={paymentStatus} 
                onValueChange={setPaymentStatus}
              >
                <SelectTrigger id="paymentStatus">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Not Started">Not Started</SelectItem>
                  <SelectItem value="Invoice Sent">Invoice Sent</SelectItem>
                  <SelectItem value="Partial Payment">Partial Payment</SelectItem>
                  <SelectItem value="Paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="paymentAmount">Payment Amount</Label>
              <Input 
                id="paymentAmount" 
                value={paymentAmount} 
                onChange={(e) => setPaymentAmount(e.target.value)} 
                type="number"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="paymentReceived">Payment Received</Label>
              <Input 
                id="paymentReceived" 
                value={paymentReceived} 
                onChange={(e) => setPaymentReceived(e.target.value)} 
                type="number"
              />
            </div>
            
            <div className="flex space-x-2 pt-2">
              <Button onClick={handleSave}>Save</Button>
              <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
            </div>
          </>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-1 text-sm">
              <span className="text-muted-foreground">Invoice Sent:</span>
              <span>{patent.invoice_sent ? 'Yes' : 'No'}</span>
              
              <span className="text-muted-foreground">Payment Status:</span>
              <span>{patent.payment_status || 'Not Started'}</span>
              
              <span className="text-muted-foreground">Payment Amount:</span>
              <span>{patent.payment_amount ? `$${patent.payment_amount}` : 'Not Set'}</span>
              
              <span className="text-muted-foreground">Payment Received:</span>
              <span>{patent.payment_received ? `$${patent.payment_received}` : 'No'}</span>
            </div>
            
            {isAdmin && (
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2" 
                onClick={() => setIsEditing(true)}
              >
                Edit Payment Info
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentStatusSection;
