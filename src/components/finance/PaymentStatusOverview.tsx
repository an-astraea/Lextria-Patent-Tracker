
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Patent } from '@/lib/types';
import { Clock, Send, CheckCircle } from 'lucide-react';

interface PaymentStatusOverviewProps {
  data: {
    not_sent: Patent[];
    sent: Patent[];
    received: Patent[];
  };
}

const PaymentStatusOverview: React.FC<PaymentStatusOverviewProps> = ({ data }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusData = (patents: Patent[]) => {
    const count = patents.length;
    const totalAmount = patents.reduce((sum, patent) => sum + (patent.payment_amount || 0), 0);
    return { count, totalAmount };
  };

  const notSentData = getStatusData(data.not_sent);
  const sentData = getStatusData(data.sent);
  const receivedData = getStatusData(data.received);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Invoices Not Sent</CardTitle>
          <Clock className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">
            {notSentData.count}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {formatCurrency(notSentData.totalAmount)} pending
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Invoices Sent</CardTitle>
          <Send className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            {sentData.count}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {formatCurrency(sentData.totalAmount)} awaiting payment
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Payments Received</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {receivedData.count}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {formatCurrency(receivedData.totalAmount)} collected
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentStatusOverview;
