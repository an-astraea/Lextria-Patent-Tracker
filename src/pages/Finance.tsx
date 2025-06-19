
import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchPatents } from '@/lib/api/patent-api';
import { Patent } from '@/lib/types';
import PageHeader from '@/components/common/PageHeader';
import LoadingState from '@/components/common/LoadingState';
import FinancialSummaryCards from '@/components/finance/FinancialSummaryCards';
import PaymentStatusOverview from '@/components/finance/PaymentStatusOverview';
import FinancialCharts from '@/components/finance/FinancialCharts';
import FinancialTable from '@/components/finance/FinancialTable';
import ActionItemsSection from '@/components/finance/ActionItemsSection';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Finance: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState('overview');

  const {
    data: patents = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['patents'],
    queryFn: fetchPatents,
  });

  const financialData = useMemo(() => {
    if (!patents.length) return null;

    // Calculate totals using new financial structure
    const totalProfessionalFees = patents.reduce((sum, patent) => sum + (patent.professional_fees || 0), 0);
    const totalGst = patents.reduce((sum, patent) => sum + (patent.gst_amount || 0), 0);
    const totalTds = patents.reduce((sum, patent) => sum + (patent.tds_amount || 0), 0);
    const totalReimbursement = patents.reduce((sum, patent) => sum + (patent.reimbursement || 0), 0);
    const totalRevenue = patents.reduce((sum, patent) => sum + (patent.payment_amount || 0), 0);
    const totalReceived = patents.reduce((sum, patent) => sum + (patent.payment_received || 0), 0);
    const outstandingAmount = totalRevenue - totalReceived;
    const collectionRate = totalRevenue > 0 ? (totalReceived / totalRevenue) * 100 : 0;

    const paymentStatusBreakdown = {
      not_sent: patents.filter(p => p.payment_status === 'not_sent'),
      sent: patents.filter(p => p.payment_status === 'sent'),
      received: patents.filter(p => p.payment_status === 'received'),
    };

    const overduePayments = patents.filter(p => {
      if (p.payment_status === 'received' || !p.invoice_sent) return false;
      // Consider payments overdue if invoice was sent and no payment received after 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return new Date(p.updated_at || p.created_at) < thirtyDaysAgo;
    });

    const pendingInvoices = patents.filter(p => !p.invoice_sent && p.payment_amount > 0);

    return {
      totalProfessionalFees,
      totalGst,
      totalTds,
      totalReimbursement,
      totalRevenue,
      totalReceived,
      outstandingAmount,
      collectionRate,
      paymentStatusBreakdown,
      overduePayments,
      pendingInvoices,
    };
  }, [patents]);

  if (isLoading) return <LoadingState />;
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-600">
          Error loading financial data. Please try again.
        </div>
      </div>
    );
  }

  if (!financialData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <PageHeader title="Financial Dashboard" />
        <div className="text-center text-gray-500 mt-8">
          No financial data available.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <PageHeader title="Financial Dashboard" />

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="actions">Action Items</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <FinancialSummaryCards data={financialData} />
          <PaymentStatusOverview data={financialData.paymentStatusBreakdown} />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <FinancialCharts patents={patents} />
        </TabsContent>

        <TabsContent value="details" className="space-y-6">
          <FinancialTable patents={patents} />
        </TabsContent>

        <TabsContent value="actions" className="space-y-6">
          <ActionItemsSection 
            overduePayments={financialData.overduePayments}
            pendingInvoices={financialData.pendingInvoices}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Finance;
