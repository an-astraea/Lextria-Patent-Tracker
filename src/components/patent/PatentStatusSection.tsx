
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/StatusBadge";
import { Patent } from "@/lib/types";
import { updatePatentStatus, updatePatentPayment } from "@/lib/api";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface PatentStatusSectionProps {
  patent: Patent;
  userRole: string;
  refreshPatentData: () => Promise<void>;
}

const PatentStatusSection: React.FC<PatentStatusSectionProps> = ({
  patent,
  userRole,
  refreshPatentData
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUpdatingPayment, setIsUpdatingPayment] = useState(false);
  
  // For payment status
  const [paymentStatus, setPaymentStatus] = useState(patent.payment_status || 'not_sent');
  const [paymentAmount, setPaymentAmount] = useState(patent.payment_amount?.toString() || '0');
  const [paymentReceived, setPaymentReceived] = useState(patent.payment_received?.toString() || '0');
  const [invoiceSent, setInvoiceSent] = useState(patent.invoice_sent || false);

  const handleStatusToggle = async (field: string) => {
    if (!patent) return;
    
    setIsUpdating(true);
    try {
      // Toggle the current status
      const currentValue = patent[field as keyof Patent];
      const newValue = typeof currentValue === 'boolean' ? !currentValue : true;
      
      await updatePatentStatus(patent.id, { [field]: newValue });
      toast.success(`Status updated successfully`);
      await refreshPatentData();
    } catch (error) {
      console.error(`Error updating ${field}:`, error);
      toast.error(`Failed to update status`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePaymentUpdate = async () => {
    if (!patent) return;
    
    setIsUpdatingPayment(true);
    try {
      const paymentData = {
        payment_status: paymentStatus,
        payment_amount: parseFloat(paymentAmount) || 0,
        payment_received: parseFloat(paymentReceived) || 0,
        invoice_sent: invoiceSent
      };

      await updatePatentPayment(patent.id, paymentData);
      toast.success('Payment information updated successfully');
      await refreshPatentData();
    } catch (error) {
      console.error('Error updating payment info:', error);
      toast.error('Failed to update payment information');
    } finally {
      setIsUpdatingPayment(false);
    }
  };

  // Define status labels and their corresponding field names
  const patentStatuses = [
    { label: 'Withdrawn', field: 'withdrawn', value: patent.withdrawn },
    { label: 'IDF Sent', field: 'idf_sent', value: patent.idf_sent },
    { label: 'IDF Received', field: 'idf_received', value: patent.idf_received },
    { label: 'CS Data Sent', field: 'cs_data', value: patent.cs_data },
    { label: 'CS Data Received', field: 'cs_data_received', value: patent.cs_data_received },
    { label: 'Completed', field: 'completed', value: patent.completed }
  ];

  // Generate payment status display
  const getPaymentStatusDisplay = () => {
    if (!patent.invoice_sent) {
      return 'notSent';
    }
    
    if (patent.payment_received && patent.payment_amount) {
      if (parseFloat(patent.payment_received.toString()) >= parseFloat(patent.payment_amount.toString())) {
        return 'fullPayment';
      } else if (parseFloat(patent.payment_received.toString()) > 0) {
        return 'partialPayment';
      }
    }
    
    return 'sent';
  };

  const getPaymentStatusLabel = () => {
    if (!patent.invoice_sent) {
      return 'Invoice Not Sent';
    }
    
    if (patent.payment_received && patent.payment_amount) {
      if (parseFloat(patent.payment_received.toString()) >= parseFloat(patent.payment_amount.toString())) {
        return 'Payment Fully Received';
      } else if (parseFloat(patent.payment_received.toString()) > 0) {
        return `Payment Partially Received (${patent.payment_received}/${patent.payment_amount})`;
      }
    }
    
    return 'Invoice Sent, Payment Not Received';
  };

  const canEditPayment = userRole === 'admin';

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Patent Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {patentStatuses.map((status) => (
              <div key={status.field} className="flex items-center justify-between gap-2 p-2 border rounded-md">
                <div className="flex items-center">
                  <StatusBadge 
                    status={status.value ? 'completed' : 'notStarted'} 
                    label={status.label}
                  />
                </div>
                {userRole === 'admin' && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleStatusToggle(status.field)}
                    disabled={isUpdating}
                  >
                    {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : (status.value ? 'Unmark' : 'Mark')}
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Payment Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between gap-2 p-2 border rounded-md">
              <StatusBadge 
                status={getPaymentStatusDisplay()} 
                label={getPaymentStatusLabel()}
              />
            </div>

            {canEditPayment && (
              <div className="space-y-4 border p-4 rounded-md">
                <h3 className="text-sm font-medium">Update Payment Information</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Invoice Status</label>
                    <Select 
                      value={invoiceSent ? 'sent' : 'not_sent'} 
                      onValueChange={(value) => setInvoiceSent(value === 'sent')}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="not_sent">Not Sent</SelectItem>
                        <SelectItem value="sent">Sent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Payment Status</label>
                    <Select 
                      value={paymentStatus} 
                      onValueChange={setPaymentStatus}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="not_sent">Not Sent</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="partial">Partial</SelectItem>
                        <SelectItem value="complete">Complete</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Total Amount</label>
                    <Input 
                      type="number" 
                      value={paymentAmount} 
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      placeholder="Total payment amount"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Amount Received</label>
                    <Input 
                      type="number" 
                      value={paymentReceived} 
                      onChange={(e) => setPaymentReceived(e.target.value)}
                      placeholder="Payment received"
                    />
                  </div>
                </div>

                <Button 
                  onClick={handlePaymentUpdate} 
                  disabled={isUpdatingPayment}
                  className="mt-4"
                >
                  {isUpdatingPayment ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : 'Update Payment Information'}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PatentStatusSection;
