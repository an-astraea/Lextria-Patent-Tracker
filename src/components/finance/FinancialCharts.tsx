
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Patent } from '@/lib/types';
import { format, startOfMonth, subMonths } from 'date-fns';

interface FinancialChartsProps {
  patents: Patent[];
}

const FinancialCharts: React.FC<FinancialChartsProps> = ({ patents }) => {
  const chartData = useMemo(() => {
    // Monthly revenue trends (last 6 months)
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = startOfMonth(subMonths(new Date(), i));
      const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);
      
      const monthPatents = patents.filter(p => {
        const createdDate = new Date(p.created_at);
        return createdDate >= monthStart && createdDate <= monthEnd;
      });

      monthlyData.push({
        month: format(monthStart, 'MMM yyyy'),
        revenue: monthPatents.reduce((sum, p) => sum + (p.payment_amount || 0), 0),
        received: monthPatents.reduce((sum, p) => sum + (p.payment_received || 0), 0),
        count: monthPatents.length,
      });
    }

    // Payment status pie chart data
    const statusData = [
      { name: 'Not Sent', value: patents.filter(p => p.payment_status === 'not_sent').length, color: '#f59e0b' },
      { name: 'Sent', value: patents.filter(p => p.payment_status === 'sent').length, color: '#3b82f6' },
      { name: 'Received', value: patents.filter(p => p.payment_status === 'received').length, color: '#10b981' },
    ];

    // Client-wise payment analysis (top 5 clients by revenue)
    const clientData = patents.reduce((acc, patent) => {
      const clientId = patent.client_id;
      if (!acc[clientId]) {
        acc[clientId] = {
          client: clientId,
          revenue: 0,
          received: 0,
          count: 0,
        };
      }
      acc[clientId].revenue += patent.payment_amount || 0;
      acc[clientId].received += patent.payment_received || 0;
      acc[clientId].count += 1;
      return acc;
    }, {} as Record<string, any>);

    const topClients = Object.values(clientData)
      .sort((a: any, b: any) => b.revenue - a.revenue)
      .slice(0, 5);

    return { monthlyData, statusData, topClients };
  }, [patents]);

  const chartConfig = {
    revenue: {
      label: "Revenue",
      color: "#3b82f6",
    },
    received: {
      label: "Received",
      color: "#10b981",
    },
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Monthly Revenue Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name="Revenue"
                />
                <Line 
                  type="monotone" 
                  dataKey="received" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  name="Received"
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment Status Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData.statusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {chartData.statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Top Clients by Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData.topClients}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="client" />
                <YAxis tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="revenue" fill="#3b82f6" name="Revenue" />
                <Bar dataKey="received" fill="#10b981" name="Received" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialCharts;
