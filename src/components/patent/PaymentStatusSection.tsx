
import React from 'react';
import { Patent, PaymentStatusSectionProps } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign } from 'lucide-react';

const PaymentStatusSection: React.FC<PaymentStatusSectionProps> = ({ 
  patent, 
  isAdmin = false, 
  userRole = '',
  refreshPatentData 
}) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center">
          <DollarSign className="mr-2 h-5 w-5 text-muted-foreground" />
          Payment Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
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
      </CardContent>
    </Card>
  );
};

export default PaymentStatusSection;
