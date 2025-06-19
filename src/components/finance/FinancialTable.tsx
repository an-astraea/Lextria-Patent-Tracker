
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Download, Search } from 'lucide-react';
import { Patent } from '@/lib/types';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';

interface FinancialTableProps {
  patents: Patent[];
}

const FinancialTable: React.FC<FinancialTableProps> = ({ patents }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('amount_desc');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'received':
        return <Badge variant="default" className="bg-green-100 text-green-800">Received</Badge>;
      case 'sent':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Sent</Badge>;
      case 'not_sent':
        return <Badge variant="outline" className="bg-orange-100 text-orange-800">Not Sent</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getDaysOverdue = (patent: Patent) => {
    if (patent.payment_status === 'received' || !patent.invoice_sent) return 0;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const updatedDate = new Date(patent.updated_at || patent.created_at);
    if (updatedDate < thirtyDaysAgo) {
      return Math.floor((new Date().getTime() - updatedDate.getTime()) / (1000 * 3600 * 24)) - 30;
    }
    return 0;
  };

  const filteredAndSortedPatents = useMemo(() => {
    let filtered = patents.filter(patent => {
      const matchesSearch = 
        patent.tracking_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patent.client_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patent.patent_title.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || patent.payment_status === statusFilter;
      
      return matchesSearch && matchesStatus && patent.payment_amount > 0;
    });

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'amount_desc':
          return (b.payment_amount || 0) - (a.payment_amount || 0);
        case 'amount_asc':
          return (a.payment_amount || 0) - (b.payment_amount || 0);
        case 'client':
          return a.client_id.localeCompare(b.client_id);
        case 'overdue':
          return getDaysOverdue(b) - getDaysOverdue(a);
        default:
          return 0;
      }
    });

    return filtered;
  }, [patents, searchTerm, statusFilter, sortBy]);

  const exportToExcel = () => {
    const exportData = filteredAndSortedPatents.map(patent => ({
      'Tracking ID': patent.tracking_id,
      'Client ID': patent.client_id,
      'Patent Title': patent.patent_title,
      'Amount Due': patent.payment_amount || 0,
      'Amount Received': patent.payment_received || 0,
      'Outstanding': (patent.payment_amount || 0) - (patent.payment_received || 0),
      'Payment Status': patent.payment_status,
      'Invoice Sent': patent.invoice_sent ? 'Yes' : 'No',
      'Days Overdue': getDaysOverdue(patent),
      'Created Date': patent.created_at ? format(new Date(patent.created_at), 'dd/MM/yyyy') : '',
      'Updated Date': patent.updated_at ? format(new Date(patent.updated_at), 'dd/MM/yyyy') : '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Financial_Report');
    XLSX.writeFile(workbook, `Financial_Report_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle>Financial Details</CardTitle>
          <Button onClick={exportToExcel} size="sm" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export to Excel
          </Button>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by tracking ID, client, or title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="not_sent">Not Sent</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="received">Received</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="amount_desc">Amount (High to Low)</SelectItem>
              <SelectItem value="amount_asc">Amount (Low to High)</SelectItem>
              <SelectItem value="client">Client Name</SelectItem>
              <SelectItem value="overdue">Days Overdue</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tracking ID</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Patent Title</TableHead>
                <TableHead className="text-right">Amount Due</TableHead>
                <TableHead className="text-right">Received</TableHead>
                <TableHead className="text-right">Outstanding</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Invoice</TableHead>
                <TableHead className="text-right">Days Overdue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedPatents.map((patent) => {
                const outstanding = (patent.payment_amount || 0) - (patent.payment_received || 0);
                const daysOverdue = getDaysOverdue(patent);
                
                return (
                  <TableRow key={patent.id}>
                    <TableCell className="font-medium">{patent.tracking_id}</TableCell>
                    <TableCell>{patent.client_id}</TableCell>
                    <TableCell className="max-w-xs truncate" title={patent.patent_title}>
                      {patent.patent_title}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(patent.payment_amount || 0)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(patent.payment_received || 0)}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={outstanding > 0 ? 'text-red-600 font-medium' : 'text-green-600'}>
                        {formatCurrency(outstanding)}
                      </span>
                    </TableCell>
                    <TableCell>{getPaymentStatusBadge(patent.payment_status || 'not_sent')}</TableCell>
                    <TableCell>
                      <Badge variant={patent.invoice_sent ? "default" : "outline"}>
                        {patent.invoice_sent ? 'Sent' : 'Not Sent'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {daysOverdue > 0 ? (
                        <span className="text-red-600 font-medium">{daysOverdue}</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          
          {filteredAndSortedPatents.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No financial records found matching your criteria.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FinancialTable;
