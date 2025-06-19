
import React from 'react';
import { Patent } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, PieChart, Users, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface StatsCardsProps {
  patents: Patent[];
}

const StatsCards: React.FC<StatsCardsProps> = ({ patents }) => {
  
  const getDetailedStats = () => {
    if (patents.length === 0) {
      return {
        completed: 0,
        drafting: 0,
        review: 0,
        pendingConfirmation: 0,
        pendingInformation: 0,
        total: 0
      };
    }
    
    let completed = 0;
    let drafting = 0;
    let review = 0;
    let pendingConfirmation = 0;
    let pendingInformation = 0;

    patents.forEach(patent => {
      // Check if patent is fully completed
      const psDone = patent.ps_completion_status === 1;
      const csDone = patent.cs_completion_status === 1;
      const ferDone = patent.fer_status === 0 || patent.fer_completion_status === 1;
      
      if (psDone && csDone && ferDone) {
        completed++;
        return;
      }

      // Check for pending confirmation status
      if (patent.pending_ps_confirmation || patent.pending_cs_confirmation) {
        pendingConfirmation++;
        return;
      }

      // Check for pending information (IDF or CS data)
      if ((patent.idf_sent && !patent.idf_received) || (patent.cs_data && !patent.cs_data_received)) {
        pendingInformation++;
        return;
      }

      // Check for review status
      if ((patent.ps_drafting_status === 1 && patent.ps_review_draft_status === 0) ||
          (patent.ps_filing_status === 1 && patent.ps_review_file_status === 0) ||
          (patent.cs_drafting_status === 1 && patent.cs_review_draft_status === 0) ||
          (patent.cs_filing_status === 1 && patent.cs_review_file_status === 0) ||
          (patent.fer_drafter_status === 1 && patent.fer_review_draft_status === 0) ||
          (patent.fer_filing_status === 1 && patent.fer_review_file_status === 0)) {
        review++;
        return;
      }

      // Everything else is considered drafting
      drafting++;
    });

    return {
      completed,
      drafting,
      review,
      pendingConfirmation,
      pendingInformation,
      total: patents.length
    };
  };

  const stats = getDetailedStats();

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Completed</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Fully completed patents
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Drafting</CardTitle>
          <FileText className="h-4 w-4 text-yellow-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600">{stats.drafting}</div>
          <p className="text-xs text-muted-foreground mt-1">
            PS/CS drafting in progress
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Review</CardTitle>
          <PieChart className="h-4 w-4 text-gray-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-600">{stats.review}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Pending admin review
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Confirmation</CardTitle>
          <AlertCircle className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">{stats.pendingConfirmation}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Awaiting client confirmation
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Information</CardTitle>
          <Clock className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">{stats.pendingInformation}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Awaiting IDF/CS data
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total</CardTitle>
          <Users className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Total patents for client
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsCards;
