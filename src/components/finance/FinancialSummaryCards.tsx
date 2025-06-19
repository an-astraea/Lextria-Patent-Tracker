
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, TrendingDown, Percent, Receipt, Calculator, Banknote, Wallet } from 'lucide-react';

interface FinancialSummaryCardsProps {
  data: {
    totalProfessionalFees: number;
    totalGst: number;
    totalTds: number;
    totalReimbursement: number;
    totalRevenue: number;
    totalReceived: number;
    outstandingAmount: number;
    collectionRate: number;
  };
}

const FinancialSummaryCards: React.FC<FinancialSummaryCardsProps> = ({ data }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (rate: number) => {
    return `${rate.toFixed(1)}%`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* First Row - Financial Components */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Professional Fees</CardTitle>
          <DollarSign className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            {formatCurrency(data.totalProfessionalFees)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Base service fees
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">GST (18%)</CardTitle>
          <Receipt className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">
            {formatCurrency(data.totalGst)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Goods & Services Tax
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">TDS (10%)</CardTitle>
          <Calculator className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {formatCurrency(data.totalTds)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Tax Deducted at Source
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Reimbursement</CardTitle>
          <Banknote className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">
            {formatCurrency(data.totalReimbursement)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Additional expenses
          </p>
        </CardContent>
      </Card>

      {/* Second Row - Summary Metrics */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(data.totalRevenue)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Total expected income
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Amount Received</CardTitle>
          <Wallet className="h-4 w-4 text-emerald-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-emerald-600">
            {formatCurrency(data.totalReceived)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Actual payments received
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Outstanding Amount</CardTitle>
          <TrendingDown className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {formatCurrency(data.outstandingAmount)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Pending collections
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
          <Percent className="h-4 w-4 text-indigo-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-indigo-600">
            {formatPercentage(data.collectionRate)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Payment success rate
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialSummaryCards;
