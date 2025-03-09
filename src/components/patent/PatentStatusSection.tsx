
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/StatusBadge";
import { Patent } from "@/lib/types";
import { updatePatentStatus, updatePatentPayment } from "@/lib/api";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Check, User, Calendar, AlertCircle, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { 
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

  useEffect(() => {
    // Update state when patent prop changes
    setPaymentStatus(patent.payment_status || 'not_sent');
    setPaymentAmount(patent.payment_amount?.toString() || '0');
    setPaymentReceived(patent.payment_received?.toString() || '0');
    setInvoiceSent(patent.invoice_sent || false);
  }, [patent]);

  const handleStatusToggle = async (field: string) => {
    if (!patent) return;
    
    setIsUpdating(true);
    try {
      // Toggle the current status
      const currentValue = patent[field as keyof Patent];
      const newValue = typeof currentValue === 'boolean' ? !currentValue : 1;
      
      // Special case handling for PS Drafting - requires IDF received
      if (field === 'ps_drafting_status' && newValue === 1 && !patent.idf_received) {
        toast.error('IDF must be received before PS Drafting can be completed');
        setIsUpdating(false);
        return;
      }
      
      // Special case handling for CS Drafting - requires CS data received
      if (field === 'cs_drafting_status' && newValue === 1 && !patent.cs_data_received) {
        toast.error('CS Data must be received before CS Drafting can be completed');
        setIsUpdating(false);
        return;
      }
      
      // Update status
      await updatePatentStatus(patent.id, field, newValue ? 1 : 0);
      
      // Additional updates for completion statuses
      if (field === 'ps_drafting_status' && newValue === 1) {
        // When PS drafting is completed, set review draft status to 1
        await updatePatentStatus(patent.id, 'ps_review_draft_status', 1);
      } else if (field === 'ps_filing_status' && newValue === 1) {
        // When PS filing is completed, set review file status to 1
        await updatePatentStatus(patent.id, 'ps_review_file_status', 1);
        // Also update PS completion status
        await updatePatentStatus(patent.id, 'ps_completion_status', 1);
      } else if (field === 'cs_drafting_status' && newValue === 1) {
        // When CS drafting is completed, set review draft status to 1
        await updatePatentStatus(patent.id, 'cs_review_draft_status', 1);
      } else if (field === 'cs_filing_status' && newValue === 1) {
        // When CS filing is completed, set review file status to 1
        await updatePatentStatus(patent.id, 'cs_review_file_status', 1);
        // Also update CS completion status
        await updatePatentStatus(patent.id, 'cs_completion_status', 1);
      }
      
      toast.success(`Status updated successfully`);
      await refreshPatentData();
    } catch (error) {
      console.error(`Error updating ${field}:`, error);
      toast.error(`Failed to update status`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleResetStatus = async (field: string) => {
    if (!patent) return;
    
    setIsUpdating(true);
    try {
      // Reset the status to 0
      await updatePatentStatus(patent.id, field, 0);
      
      // Additional resets for related statuses
      if (field === 'ps_drafting_status') {
        // When PS drafting is reset, also reset review draft status
        await updatePatentStatus(patent.id, 'ps_review_draft_status', 0);
        // Also reset PS filing status and completion status if they were set
        if (patent.ps_filing_status === 1) {
          await updatePatentStatus(patent.id, 'ps_filing_status', 0);
          await updatePatentStatus(patent.id, 'ps_review_file_status', 0);
          await updatePatentStatus(patent.id, 'ps_completion_status', 0);
        }
      } else if (field === 'ps_filing_status') {
        // When PS filing is reset, also reset review file status and completion status
        await updatePatentStatus(patent.id, 'ps_review_file_status', 0);
        await updatePatentStatus(patent.id, 'ps_completion_status', 0);
      } else if (field === 'cs_drafting_status') {
        // When CS drafting is reset, also reset review draft status
        await updatePatentStatus(patent.id, 'cs_review_draft_status', 0);
        // Also reset CS filing status and completion status if they were set
        if (patent.cs_filing_status === 1) {
          await updatePatentStatus(patent.id, 'cs_filing_status', 0);
          await updatePatentStatus(patent.id, 'cs_review_file_status', 0);
          await updatePatentStatus(patent.id, 'cs_completion_status', 0);
        }
      } else if (field === 'cs_filing_status') {
        // When CS filing is reset, also reset review file status and completion status
        await updatePatentStatus(patent.id, 'cs_review_file_status', 0);
        await updatePatentStatus(patent.id, 'cs_completion_status', 0);
      }
      
      toast.success(`Status reset successfully`);
      await refreshPatentData();
    } catch (error) {
      console.error(`Error resetting ${field}:`, error);
      toast.error(`Failed to reset status`);
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

  // Check workflow conditions
  const canStartPSDrafting = patent.idf_received === true;
  const canStartCSDrafting = patent.cs_data_received === true;

  // Button tooltip content based on workflow conditions
  const getPSDraftingTooltip = () => {
    if (!canStartPSDrafting) {
      return "IDF must be received before PS Drafting can be completed";
    }
    return "";
  };

  const getCSDraftingTooltip = () => {
    if (!canStartCSDrafting) {
      return "CS Data must be received before CS Drafting can be completed";
    }
    return "";
  };

  return (
    <div className="space-y-6">
      {/* Patent Status Boxes - New Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Patent Status</CardTitle>
          <CardDescription>Current status of each stage in the patent process</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* PS Drafting Status */}
            <div className="border rounded-lg p-4 space-y-3 bg-white">
              <div className="font-medium">PS Drafting Status</div>
              <div className="flex gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>
                      <Button 
                        variant={patent.ps_drafting_status === 1 ? "default" : "outline"} 
                        size="sm"
                        onClick={() => handleStatusToggle('ps_drafting_status')}
                        disabled={isUpdating || userRole !== 'admin' || !canStartPSDrafting}
                        className="text-xs px-3 py-1 h-7"
                      >
                        {patent.ps_drafting_status === 1 ? (
                          <><Check className="h-3.5 w-3.5 mr-1" /> Completed</>
                        ) : (
                          'Mark Complete'
                        )}
                      </Button>
                    </span>
                  </TooltipTrigger>
                  {getPSDraftingTooltip() && (
                    <TooltipContent>
                      <p>{getPSDraftingTooltip()}</p>
                    </TooltipContent>
                  )}
                </Tooltip>
                {userRole === 'admin' && patent.ps_drafting_status === 1 && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleResetStatus('ps_drafting_status')}
                    disabled={isUpdating}
                    className="text-xs px-3 py-1 h-7"
                  >
                    <X className="h-3.5 w-3.5 mr-1" /> Reset
                  </Button>
                )}
                {!canStartPSDrafting && (
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                )}
              </div>
              <div className="text-sm text-gray-600 flex items-center gap-1">
                <User className="h-3 w-3" /> Assigned to: {patent.ps_drafter_assgn || 'Not assigned'}
              </div>
              <div className="text-sm text-gray-600 flex items-center gap-1">
                <Calendar className="h-3 w-3" /> Deadline: {patent.ps_drafter_deadline || 'No deadline'}
              </div>
              {patent.ps_review_draft_status === 1 && (
                <div className="text-xs px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 w-fit">
                  Under Review
                </div>
              )}
            </div>

            {/* PS Filing Status */}
            <div className="border rounded-lg p-4 space-y-3 bg-white">
              <div className="font-medium">PS Filing Status</div>
              <div className="flex gap-2">
                <Button 
                  variant={patent.ps_filing_status === 1 ? "default" : "outline"} 
                  size="sm"
                  onClick={() => handleStatusToggle('ps_filing_status')}
                  disabled={isUpdating || userRole !== 'admin' || patent.ps_drafting_status !== 1}
                  className="text-xs px-3 py-1 h-7"
                >
                  {patent.ps_filing_status === 1 ? (
                    <><Check className="h-3.5 w-3.5 mr-1" /> Completed</>
                  ) : (
                    'Mark Complete'
                  )}
                </Button>
                {userRole === 'admin' && patent.ps_filing_status === 1 && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleResetStatus('ps_filing_status')}
                    disabled={isUpdating}
                    className="text-xs px-3 py-1 h-7"
                  >
                    <X className="h-3.5 w-3.5 mr-1" /> Reset
                  </Button>
                )}
                {patent.ps_filing_status === 1 && (
                  <Check className="h-5 w-5 text-green-600" />
                )}
              </div>
              <div className="text-sm text-gray-600 flex items-center gap-1">
                <User className="h-3 w-3" /> Assigned to: {patent.ps_filer_assgn || 'Not assigned'}
              </div>
              <div className="text-sm text-gray-600 flex items-center gap-1">
                <Calendar className="h-3 w-3" /> Deadline: {patent.ps_filer_deadline || 'No deadline'}
              </div>
              {patent.ps_review_file_status === 1 && (
                <div className="text-xs px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 w-fit">
                  Under Review
                </div>
              )}
            </div>

            {/* PS Completion Status */}
            <div className="border rounded-lg p-4 space-y-3 bg-white">
              <div className="font-medium">PS Completion Status</div>
              <div className="flex gap-2">
                <Button 
                  variant={patent.ps_completion_status === 1 ? "default" : "outline"} 
                  size="sm"
                  disabled={true}
                  className="text-xs px-3 py-1 h-7"
                >
                  {patent.ps_completion_status === 1 ? (
                    <><Check className="h-3.5 w-3.5 mr-1" /> Completed</>
                  ) : (
                    'Pending'
                  )}
                </Button>
                {patent.ps_completion_status === 1 && (
                  <Check className="h-5 w-5 text-green-600" />
                )}
              </div>
              <div className="text-xs text-gray-600 italic mt-1">
                Automatically updated when PS Filing is completed and approved
              </div>
            </div>

            {/* CS Drafting Status */}
            <div className="border rounded-lg p-4 space-y-3 bg-white">
              <div className="font-medium">CS Drafting Status</div>
              <div className="flex gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>
                      <Button 
                        variant={patent.cs_drafting_status === 1 ? "default" : "outline"} 
                        size="sm"
                        onClick={() => handleStatusToggle('cs_drafting_status')}
                        disabled={isUpdating || userRole !== 'admin' || !canStartCSDrafting}
                        className="text-xs px-3 py-1 h-7"
                      >
                        {patent.cs_drafting_status === 1 ? (
                          <><Check className="h-3.5 w-3.5 mr-1" /> Completed</>
                        ) : (
                          'Mark Complete'
                        )}
                      </Button>
                    </span>
                  </TooltipTrigger>
                  {getCSDraftingTooltip() && (
                    <TooltipContent>
                      <p>{getCSDraftingTooltip()}</p>
                    </TooltipContent>
                  )}
                </Tooltip>
                {userRole === 'admin' && patent.cs_drafting_status === 1 && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleResetStatus('cs_drafting_status')}
                    disabled={isUpdating}
                    className="text-xs px-3 py-1 h-7"
                  >
                    <X className="h-3.5 w-3.5 mr-1" /> Reset
                  </Button>
                )}
                {!canStartCSDrafting && (
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                )}
              </div>
              <div className="text-sm text-gray-600 flex items-center gap-1">
                <User className="h-3 w-3" /> Assigned to: {patent.cs_drafter_assgn || 'Not assigned'}
              </div>
              <div className="text-sm text-gray-600 flex items-center gap-1">
                <Calendar className="h-3 w-3" /> Deadline: {patent.cs_drafter_deadline || 'No deadline'}
              </div>
              {patent.cs_review_draft_status === 1 && (
                <div className="text-xs px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 w-fit">
                  Under Review
                </div>
              )}
            </div>

            {/* CS Filing Status */}
            <div className="border rounded-lg p-4 space-y-3 bg-white">
              <div className="font-medium">CS Filing Status</div>
              <div className="flex gap-2">
                <Button 
                  variant={patent.cs_filing_status === 1 ? "default" : "outline"} 
                  size="sm"
                  onClick={() => handleStatusToggle('cs_filing_status')}
                  disabled={isUpdating || userRole !== 'admin' || patent.cs_drafting_status !== 1}
                  className="text-xs px-3 py-1 h-7"
                >
                  {patent.cs_filing_status === 1 ? (
                    <><Check className="h-3.5 w-3.5 mr-1" /> Completed</>
                  ) : (
                    'Mark Complete'
                  )}
                </Button>
                {userRole === 'admin' && patent.cs_filing_status === 1 && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleResetStatus('cs_filing_status')}
                    disabled={isUpdating}
                    className="text-xs px-3 py-1 h-7"
                  >
                    <X className="h-3.5 w-3.5 mr-1" /> Reset
                  </Button>
                )}
                {patent.cs_filing_status === 1 && (
                  <Check className="h-5 w-5 text-green-600" />
                )}
              </div>
              <div className="text-sm text-gray-600 flex items-center gap-1">
                <User className="h-3 w-3" /> Assigned to: {patent.cs_filer_assgn || 'Not assigned'}
              </div>
              <div className="text-sm text-gray-600 flex items-center gap-1">
                <Calendar className="h-3 w-3" /> Deadline: {patent.cs_filer_deadline || 'No deadline'}
              </div>
              {patent.cs_review_file_status === 1 && (
                <div className="text-xs px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 w-fit">
                  Under Review
                </div>
              )}
            </div>

            {/* CS Completion Status */}
            <div className="border rounded-lg p-4 space-y-3 bg-white">
              <div className="font-medium">CS Completion Status</div>
              <div className="flex gap-2">
                <Button 
                  variant={patent.cs_completion_status === 1 ? "default" : "outline"} 
                  size="sm"
                  disabled={true}
                  className="text-xs px-3 py-1 h-7"
                >
                  {patent.cs_completion_status === 1 ? (
                    <><Check className="h-3.5 w-3.5 mr-1" /> Completed</>
                  ) : (
                    'Pending'
                  )}
                </Button>
                {patent.cs_completion_status === 1 && (
                  <Check className="h-5 w-5 text-green-600" />
                )}
              </div>
              <div className="text-xs text-gray-600 italic mt-1">
                Automatically updated when CS Filing is completed and approved
              </div>
            </div>

            {/* FER Status */}
            <div className="border rounded-lg p-4 space-y-3 bg-white">
              <div className="font-medium">FER Status</div>
              <div className="flex gap-2">
                <Button 
                  variant={patent.fer_status === 1 ? "default" : "outline"} 
                  size="sm"
                  onClick={() => handleStatusToggle('fer_status')}
                  disabled={isUpdating || userRole !== 'admin'}
                  className="text-xs px-3 py-1 h-7"
                >
                  {patent.fer_status === 1 ? (
                    <><Check className="h-3.5 w-3.5 mr-1" /> Active</>
                  ) : (
                    'Activate'
                  )}
                </Button>
                {userRole === 'admin' && patent.fer_status === 1 && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleResetStatus('fer_status')}
                    disabled={isUpdating}
                    className="text-xs px-3 py-1 h-7"
                  >
                    <X className="h-3.5 w-3.5 mr-1" /> Reset
                  </Button>
                )}
                {patent.fer_status === 1 && (
                  <Check className="h-5 w-5 text-green-600" />
                )}
              </div>
            </div>
          </div>

          {userRole === 'admin' && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-700 font-medium">Admin Note:</p>
              <p className="text-sm text-gray-600">
                You can manually update any status by clicking the buttons next to each status. 
                This allows you to override the workflow when necessary. Note the following workflow rules:
              </p>
              <ul className="list-disc pl-5 text-sm text-gray-600 mt-2 space-y-1">
                <li>PS Drafting requires IDF to be received first</li>
                <li>PS Filing requires PS Drafting to be completed</li>
                <li>CS Drafting requires CS Data to be received</li>
                <li>CS Filing requires CS Drafting to be completed</li>
                <li>The patent is considered completed only when Admin marks it as Completed</li>
                <li>If a patent is marked as Withdrawn, it will be moved to the Withdrawn tab</li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Original status boxes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">General Status</CardTitle>
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
                    {isUpdating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : status.value ? (
                      <><X className="h-3.5 w-3.5 mr-1" /> Unmark</>
                    ) : (
                      <><Check className="h-3.5 w-3.5 mr-1" /> Mark</>
                    )}
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payment status section */}
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
