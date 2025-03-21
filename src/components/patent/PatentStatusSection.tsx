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
  TooltipProvider
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
  
  const [paymentStatus, setPaymentStatus] = useState(patent.payment_status || 'not_sent');
  const [paymentAmount, setPaymentAmount] = useState(patent.payment_amount?.toString() || '0');
  const [paymentReceived, setPaymentReceived] = useState(patent.payment_received?.toString() || '0');
  const [invoiceSent, setInvoiceSent] = useState(patent.invoice_sent || false);

  useEffect(() => {
    setPaymentStatus(patent.payment_status || 'not_sent');
    setPaymentAmount(patent.payment_amount?.toString() || '0');
    setPaymentReceived(patent.payment_received?.toString() || '0');
    setInvoiceSent(patent.invoice_sent || false);
  }, [patent]);

  const handleStatusToggle = async (field: string) => {
    if (!patent) return;
    
    setIsUpdating(true);
    try {
      const currentValue = patent[field as keyof Patent];
      const newValue = typeof currentValue === 'boolean' ? !currentValue : 1;
      
      if (field === 'ps_drafting_status' && newValue === 1 && !patent.idf_received) {
        toast.error('IDF must be received before PS Drafting can be completed');
        setIsUpdating(false);
        return;
      }
      
      if (field === 'cs_drafting_status' && newValue === 1 && !patent.cs_data_received) {
        toast.error('CS Data must be received before CS Drafting can be completed');
        setIsUpdating(false);
        return;
      }
      
      if (field === 'cs_data_received' && newValue === true && !patent.cs_data) {
        toast.error('CS Data must be sent before it can be marked as received');
        setIsUpdating(false);
        return;
      }
      
      await updatePatentStatus(patent.id, field, newValue ? 1 : 0);
      
      if (field === 'ps_drafting_status' && newValue === 1) {
        await updatePatentStatus(patent.id, 'ps_review_draft_status', 1);
      } else if (field === 'ps_filing_status' && newValue === 1) {
        await updatePatentStatus(patent.id, 'ps_review_file_status', 1);
        await updatePatentStatus(patent.id, 'ps_completion_status', 1);
      } else if (field === 'cs_drafting_status' && newValue === 1) {
        await updatePatentStatus(patent.id, 'cs_review_draft_status', 1);
      } else if (field === 'cs_filing_status' && newValue === 1) {
        await updatePatentStatus(patent.id, 'cs_review_file_status', 1);
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
      await updatePatentStatus(patent.id, field, 0);
      
      if (field === 'ps_drafting_status') {
        await updatePatentStatus(patent.id, 'ps_review_draft_status', 0);
        if (patent.ps_filing_status === 1) {
          await updatePatentStatus(patent.id, 'ps_filing_status', 0);
          await updatePatentStatus(patent.id, 'ps_review_file_status', 0);
          await updatePatentStatus(patent.id, 'ps_completion_status', 0);
        }
      } else if (field === 'ps_filing_status') {
        await updatePatentStatus(patent.id, 'ps_review_file_status', 0);
        await updatePatentStatus(patent.id, 'ps_completion_status', 0);
      } else if (field === 'cs_drafting_status') {
        await updatePatentStatus(patent.id, 'cs_review_draft_status', 0);
        if (patent.cs_filing_status === 1) {
          await updatePatentStatus(patent.id, 'cs_filing_status', 0);
          await updatePatentStatus(patent.id, 'cs_review_file_status', 0);
          await updatePatentStatus(patent.id, 'cs_completion_status', 0);
        }
      } else if (field === 'cs_filing_status') {
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

  const canEditStatus = userRole === 'admin' || userRole === 'filer';
  const canEditPayment = userRole === 'admin' || userRole === 'filer';

  const isPSDrafterAssigned = () => {
    if (!patent) return false;
    
    return (patent.ps_drafter_assgn && patent.ps_drafter_assgn.trim() !== '');
  };

  const isCSDrafterAssigned = () => {
    if (!patent) return false;
    
    return (patent.cs_drafter_assgn && patent.cs_drafter_assgn.trim() !== '');
  };

  const isPSFilerAssigned = () => {
    if (!patent) return false;
    
    return (patent.ps_filer_assgn && patent.ps_filer_assgn.trim() !== '');
  };

  const isCSFilerAssigned = () => {
    if (!patent) return false;
    
    return (patent.cs_filer_assgn && patent.cs_filer_assgn.trim() !== '');
  };

  const canWorkOnPSDrafting = () => {
    if (!patent) return false;
    
    return patent.idf_received === true;
  };

  const canWorkOnCSDrafting = () => {
    if (!patent) return false;
    
    return patent.cs_data === true && patent.cs_data_received === true;
  };

  const patentStatuses = [
    { label: 'Withdrawn', field: 'withdrawn', value: patent.withdrawn },
    { label: 'IDF Sent', field: 'idf_sent', value: patent.idf_sent },
    { label: 'IDF Received', field: 'idf_received', value: patent.idf_received },
    { label: 'CS Data Sent', field: 'cs_data', value: patent.cs_data },
    { label: 'CS Data Received', field: 'cs_data_received', value: patent.cs_data_received },
    { label: 'Sent CS for Confirmation', field: 'pending_cs_confirmation', value: patent.pending_cs_confirmation },
    { label: 'CS Confirmed', field: 'cs_confirmed', value: patent.cs_confirmed },
    { label: 'Sent PS for Confirmation', field: 'pending_ps_confirmation', value: patent.pending_ps_confirmation },
    { label: 'PS Confirmed', field: 'ps_confirmed', value: patent.ps_confirmed },
    { label: 'Completed', field: 'completed', value: patent.completed }
  ];

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

  const canStartPSDrafting = patent.idf_received === true;
  const canStartCSDrafting = patent.cs_data_received === true && patent.cs_data === true;

  const getPSDraftingTooltip = () => {
    if (!canStartPSDrafting) {
      return "IDF must be received before PS Drafting can be completed";
    }
    return "";
  };

  const getCSDraftingTooltip = () => {
    if (!patent.cs_data) {
      return "CS Data must be sent before CS Drafting can be completed";
    }
    
    if (!patent.cs_data_received) {
      return "CS Data must be received before CS Drafting can be completed";
    }
    
    return "";
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Patent Status</CardTitle>
          <CardDescription>Current status of each stage in the patent process</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4 space-y-3 bg-white">
              <div className="font-medium">PS Drafting Status</div>
              <div className="flex gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span>
                        <Button 
                          variant={patent.ps_drafting_status === 1 ? "default" : "outline"} 
                          size="sm"
                          onClick={() => handleStatusToggle('ps_drafting_status')}
                          disabled={isUpdating || !canEditStatus || !canStartPSDrafting}
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
                </TooltipProvider>
                {canEditStatus && patent.ps_drafting_status === 1 && (
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
                <User className="h-3 w-3" /> 
                Assigned to: {isPSDrafterAssigned() ? patent.ps_drafter_assgn : 'Not assigned'}
                {isPSDrafterAssigned() && !canWorkOnPSDrafting() && (
                  <span className="text-amber-500 text-xs"> (Waiting for IDF)</span>
                )}
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

            <div className="border rounded-lg p-4 space-y-3 bg-white">
              <div className="font-medium">PS Filing Status</div>
              <div className="flex gap-2">
                <Button 
                  variant={patent.ps_filing_status === 1 ? "default" : "outline"} 
                  size="sm"
                  onClick={() => handleStatusToggle('ps_filing_status')}
                  disabled={isUpdating || !canEditStatus || patent.ps_drafting_status !== 1}
                  className="text-xs px-3 py-1 h-7"
                >
                  {patent.ps_filing_status === 1 ? (
                    <><Check className="h-3.5 w-3.5 mr-1" /> Completed</>
                  ) : (
                    'Mark Complete'
                  )}
                </Button>
                {canEditStatus && patent.ps_filing_status === 1 && (
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
                <User className="h-3 w-3" /> 
                Assigned to: {isPSFilerAssigned() ? patent.ps_filer_assgn : 'Not assigned'}
                {isPSFilerAssigned() && !canWorkOnPSDrafting() && (
                  <span className="text-amber-500 text-xs"> (Waiting for IDF)</span>
                )}
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

            <div className="border rounded-lg p-4 space-y-3 bg-white">
              <div className="font-medium">CS Drafting Status</div>
              <div className="flex gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span>
                        <Button 
                          variant={patent.cs_drafting_status === 1 ? "default" : "outline"} 
                          size="sm"
                          onClick={() => handleStatusToggle('cs_drafting_status')}
                          disabled={isUpdating || !canEditStatus || !canStartCSDrafting}
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
                </TooltipProvider>
                {canEditStatus && patent.cs_drafting_status === 1 && (
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
                <User className="h-3 w-3" /> 
                Assigned to: {isCSDrafterAssigned() ? patent.cs_drafter_assgn : 'Not assigned'}
                {isCSDrafterAssigned() && !canWorkOnCSDrafting() && (
                  <span className="text-amber-500 text-xs"> (Waiting for CS Data)</span>
                )}
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

            <div className="border rounded-lg p-4 space-y-3 bg-white">
              <div className="font-medium">CS Filing Status</div>
              <div className="flex gap-2">
                <Button 
                  variant={patent.cs_filing_status === 1 ? "default" : "outline"} 
                  size="sm"
                  onClick={() => handleStatusToggle('cs_filing_status')}
                  disabled={isUpdating || !canEditStatus || patent.cs_drafting_status !== 1}
                  className="text-xs px-3 py-1 h-7"
                >
                  {patent.cs_filing_status === 1 ? (
                    <><Check className="h-3.5 w-3.5 mr-1" /> Completed</>
                  ) : (
                    'Mark Complete'
                  )}
                </Button>
                {canEditStatus && patent.cs_filing_status === 1 && (
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
                <User className="h-3 w-3" /> 
                Assigned to: {isCSFilerAssigned() ? patent.cs_filer_assgn : 'Not assigned'}
                {isCSFilerAssigned() && !canWorkOnCSDrafting() && (
                  <span className="text-amber-500 text-xs"> (Waiting for CS Data)</span>
                )}
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

          {(userRole === 'admin' || userRole === 'filer') && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-700 font-medium">Note:</p>
              <p className="text-sm text-gray-600">
                You can update any status by clicking the buttons next to each status. 
                Note the following workflow rules:
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

