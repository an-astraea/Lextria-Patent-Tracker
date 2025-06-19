
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Clock, Send } from 'lucide-react';
import { Patent } from '@/lib/types';
import { format } from 'date-fns';

interface ActionItemsSectionProps {
  overduePayments: Patent[];
  pendingInvoices: Patent[];
}

const ActionItemsSection: React.FC<ActionItemsSectionProps> = ({ 
  overduePayments, 
  pendingInvoices 
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getDaysOverdue = (patent: Patent) => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const updatedDate = new Date(patent.updated_at || patent.created_at);
    return Math.floor((new Date().getTime() - updatedDate.getTime()) / (1000 * 3600 * 24)) - 30;
  };

  const partialPayments = overduePayments.filter(p => 
    (p.payment_received || 0) > 0 && (p.payment_received || 0) < (p.payment_amount || 0)
  );

  return (
    <div className="space-y-6">
      {/* Overdue Payments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Overdue Payments ({overduePayments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {overduePayments.length > 0 ? (
            <div className="space-y-3">
              {overduePayments.slice(0, 10).map((patent) => (
                <div key={patent.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{patent.tracking_id}</div>
                    <div className="text-sm text-gray-600">{patent.client_id} - {patent.patent_title}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Due: {formatCurrency(patent.payment_amount || 0)} | 
                      Received: {formatCurrency(patent.payment_received || 0)}
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="destructive">
                      {getDaysOverdue(patent)} days overdue
                    </Badge>
                    <div className="text-sm text-red-600 font-medium mt-1">
                      {formatCurrency((patent.payment_amount || 0) - (patent.payment_received || 0))}
                    </div>
                  </div>
                </div>
              ))}
              {overduePayments.length > 10 && (
                <div className="text-center text-gray-500 text-sm">
                  And {overduePayments.length - 10} more overdue payments...
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              No overdue payments. Great work!
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Invoices */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5 text-orange-500" />
            Pending Invoices ({pendingInvoices.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingInvoices.length > 0 ? (
            <div className="space-y-3">
              {pendingInvoices.slice(0, 10).map((patent) => (
                <div key={patent.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{patent.tracking_id}</div>
                    <div className="text-sm text-gray-600">{patent.client_id} - {patent.patent_title}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Created: {patent.created_at ? format(new Date(patent.created_at), 'dd/MM/yyyy') : 'Unknown'}
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="bg-orange-100 text-orange-800">
                      Invoice Pending
                    </Badge>
                    <div className="text-sm text-orange-600 font-medium mt-1">
                      {formatCurrency(patent.payment_amount || 0)}
                    </div>
                  </div>
                </div>
              ))}
              {pendingInvoices.length > 10 && (
                <div className="text-center text-gray-500 text-sm">
                  And {pendingInvoices.length - 10} more pending invoices...
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              All invoices have been sent!
            </div>
          )}
        </CardContent>
      </Card>

      {/* Partial Payments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-500" />
            Partial Payments Follow-up ({partialPayments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {partialPayments.length > 0 ? (
            <div className="space-y-3">
              {partialPayments.slice(0, 10).map((patent) => (
                <div key={patent.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{patent.tracking_id}</div>
                    <div className="text-sm text-gray-600">{patent.client_id} - {patent.patent_title}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Partial payment received on: {patent.updated_at ? format(new Date(patent.updated_at), 'dd/MM/yyyy') : 'Unknown'}
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      Partial Payment
                    </Badge>
                    <div className="text-sm mt-1">
                      <span className="text-blue-600">Received: {formatCurrency(patent.payment_received || 0)}</span>
                      <br />
                      <span className="text-red-600">Pending: {formatCurrency((patent.payment_amount || 0) - (patent.payment_received || 0))}</span>
                    </div>
                  </div>
                </div>
              ))}
              {partialPayments.length > 10 && (
                <div className="text-center text-gray-500 text-sm">
                  And {partialPayments.length - 10} more partial payments...
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              No partial payments requiring follow-up.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ActionItemsSection;
